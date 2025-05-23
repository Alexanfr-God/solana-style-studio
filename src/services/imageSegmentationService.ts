
import { pipeline, env } from '@huggingface/transformers';
import { toast } from 'sonner';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

/**
 * Resizes image if needed to fit within MAX_IMAGE_DIMENSION
 */
function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

/**
 * Creates a mask from user drawing using AI segmentation
 */
export async function createMaskFromDrawing(drawingImageBase64: string): Promise<string> {
  try {
    console.log('🎯 Starting AI-based mask creation...');
    
    // Load the segmentation model
    toast.info('Loading AI model for segmentation...');
    
    const segmenter = await pipeline(
      'image-segmentation', 
      'Xenova/segformer-b0-finetuned-ade-512-512',
      { device: 'webgpu' }
    );
    
    console.log('✅ Segmentation model loaded');
    toast.info('Analyzing your drawing...');
    
    // Create image element from base64
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = drawingImageBase64;
    });
    
    // Create canvas and resize if needed
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    const wasResized = resizeImageIfNeeded(canvas, ctx, img);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Convert to data URL for processing
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    // Run segmentation
    const result = await segmenter(imageData);
    console.log('🔍 Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid segmentation result');
    }
    
    toast.info('Creating transparent mask...');
    
    // Create the final mask with transparency
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error('Could not get mask canvas context');
    
    // Start with transparent background
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Find the best segmentation mask (likely the largest non-background segment)
    let bestMask = null;
    let maxSize = 0;
    
    for (const segment of result) {
      if (segment.label !== 'background' && segment.mask) {
        const maskSize = segment.mask.data.reduce((sum: number, val: number) => sum + val, 0);
        if (maskSize > maxSize) {
          maxSize = maskSize;
          bestMask = segment.mask;
        }
      }
    }
    
    if (!bestMask) {
      console.warn('No suitable mask found, using first available mask');
      bestMask = result[0].mask;
    }
    
    // Create mask image data
    const maskImageData = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
    
    // Define safe zone (wallet area) - center of the image
    const safeZone = {
      x: Math.floor((maskCanvas.width - 320) / 2),
      y: Math.floor((maskCanvas.height - 569) / 2),
      width: 320,
      height: 569
    };
    
    // Apply the mask with safe zone protection
    for (let i = 0; i < bestMask.data.length; i++) {
      const x = i % maskCanvas.width;
      const y = Math.floor(i / maskCanvas.width);
      
      // Check if pixel is in safe zone
      const inSafeZone = x >= safeZone.x && 
                        x < safeZone.x + safeZone.width && 
                        y >= safeZone.y && 
                        y < safeZone.y + safeZone.height;
      
      const pixelIndex = i * 4;
      
      if (inSafeZone) {
        // Safe zone: completely transparent
        maskImageData.data[pixelIndex] = 0;     // R
        maskImageData.data[pixelIndex + 1] = 0; // G
        maskImageData.data[pixelIndex + 2] = 0; // B
        maskImageData.data[pixelIndex + 3] = 0; // A (transparent)
      } else {
        // Outside safe zone: use mask value for decorative elements
        const maskValue = bestMask.data[i];
        if (maskValue > 0.3) { // Threshold for mask presence
          // Draw decorative element
          maskImageData.data[pixelIndex] = 255;     // R (white)
          maskImageData.data[pixelIndex + 1] = 255; // G (white)
          maskImageData.data[pixelIndex + 2] = 255; // B (white)
          maskImageData.data[pixelIndex + 3] = Math.round(maskValue * 255); // A (based on mask strength)
        } else {
          // Transparent background
          maskImageData.data[pixelIndex] = 0;
          maskImageData.data[pixelIndex + 1] = 0;
          maskImageData.data[pixelIndex + 2] = 0;
          maskImageData.data[pixelIndex + 3] = 0;
        }
      }
    }
    
    maskCtx.putImageData(maskImageData, 0, 0);
    
    // Convert to data URL
    const finalMaskUrl = maskCanvas.toDataURL('image/png');
    
    console.log('✅ AI mask creation completed');
    toast.success('Mask successfully created with AI!');
    
    return finalMaskUrl;
    
  } catch (error) {
    console.error('❌ Error in AI mask creation:', error);
    toast.error('Error creating mask. Please try again.');
    throw error;
  }
}

/**
 * Enhanced mask creation with style transfer using Replicate API
 */
export async function createStylizedMask(
  drawingImageBase64: string,
  stylePrompt: string = "decorative frame"
): Promise<string> {
  try {
    console.log('🎨 Starting stylized mask creation...');
    
    // First create the base mask using segmentation
    const baseMask = await createMaskFromDrawing(drawingImageBase64);
    
    // TODO: Integrate with Replicate API for style transfer
    // For now, return the base mask
    return baseMask;
    
  } catch (error) {
    console.error('❌ Error in stylized mask creation:', error);
    // Fallback to basic mask creation
    return createMaskFromDrawing(drawingImageBase64);
  }
}
