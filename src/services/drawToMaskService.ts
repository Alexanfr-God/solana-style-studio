
import { createMaskFromDrawing, createStylizedMask } from './imageSegmentationService';
import { toast } from 'sonner';

/**
 * Enhanced mask generation using AI segmentation instead of DALL-E
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string,
  useStyleTransfer: boolean = false
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🎨 === STARTING ENHANCED AI MASK GENERATION ===');
    console.log('Drawing size:', drawingImageBase64.length);
    console.log('Using style transfer:', useStyleTransfer);
    
    // Use AI segmentation for precise mask creation
    const maskImageUrl = useStyleTransfer 
      ? await createStylizedMask(drawingImageBase64, "decorative wallet frame")
      : await createMaskFromDrawing(drawingImageBase64);
    
    const result = {
      imageUrl: maskImageUrl,
      layoutJson: {
        layout: {
          top: "AI-detected decorative elements from user drawing",
          bottom: "AI-detected decorative elements from user drawing", 
          left: "AI-detected decorative elements from user drawing",
          right: "AI-detected decorative elements from user drawing",
          core: "transparent"
        },
        style: "user-drawing-ai-enhanced",
        color_palette: ["#ffffff", "#000000"], // Will be extracted from actual drawing
        generation_method: useStyleTransfer ? "ai-segmentation-with-style" : "ai-segmentation-only"
      }
    };

    console.log('✅ === SUCCESSFUL AI MASK GENERATION ===');
    console.log('Final result:', result);
    
    toast.success('AI mask successfully created!', {
      description: 'Your drawing has been transformed into a professional mask with transparent center'
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 === AI MASK GENERATION FAILURE ===');
    console.error('Error in AI mask generation:', error);
    
    // Fallback to predefined mask
    toast.error('Error creating AI mask. Using fallback mask.');
    return createFallbackResponse();
  }
}

/**
 * Creates a composite image by combining the wallet interface with the user's drawing
 */
async function createCompositeImage(drawingImageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('🖼️ Creating enhanced composite image...');
      
      // Create canvas for composite - ensure it's exactly 1024x1024
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set transparent background (this is crucial for DALL-E to understand transparency)
      ctx.clearRect(0, 0, 1024, 1024);
      
      // Load the drawing image
      const drawingImg = new Image();
      drawingImg.onload = () => {
        try {
          // Draw the user's drawing on the transparent background
          ctx.drawImage(drawingImg, 0, 0, 1024, 1024);
          
          // Find the wallet element for positioning reference
          const walletElement = document.querySelector('.wallet-preview') as HTMLElement;
          if (!walletElement) {
            console.warn('⚠️ Wallet element not found, proceeding with drawing only');
            const result = canvas.toDataURL('image/png');
            resolve(result);
            return;
          }
          
          // Calculate wallet position in the center
          const centerX = (1024 - 320) / 2;
          const centerY = (1024 - 569) / 2;
          
          // Draw a semi-transparent rectangle to show where the wallet will be
          // This helps DALL-E understand that this area should be avoided
          ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
          ctx.fillRect(centerX, centerY, 320, 569);
          
          // Add border to make the safe zone more visible
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(centerX, centerY, 320, 569);
          
          console.log('✅ Enhanced composite image created successfully');
          const result = canvas.toDataURL('image/png');
          resolve(result);
        } catch (error) {
          console.error('Error processing enhanced composite image:', error);
          reject(error);
        }
      };
      
      drawingImg.onerror = (error) => {
        console.error('Error loading drawing image:', error);
        reject(error);
      };
      
      drawingImg.src = drawingImageBase64;
    } catch (error) {
      console.error('Error in createCompositeImage:', error);
      reject(error);
    }
  });
}

/**
 * Creates a consistent fallback response when mask generation fails
 */
function createFallbackResponse(): { imageUrl: string; layoutJson: any } {
  const fallbackMaskUrl = '/external-masks/abstract-mask.png';
  
  console.log('🚨 Using fallback mask:', fallbackMaskUrl);
  
  return {
    imageUrl: fallbackMaskUrl,
    layoutJson: {
      layout: {
        top: "Decorative elements (fallback)",
        bottom: "Additional decorative elements (fallback)",
        left: null,
        right: null,
        core: "untouched"
      },
      style: "abstract",
      color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
    }
  };
}
