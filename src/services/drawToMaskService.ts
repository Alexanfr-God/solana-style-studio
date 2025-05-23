import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Analyzes a user drawing and generates a polished mask for wallet customization
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🎨 === STARTING ENHANCED MASK GENERATION ===');
    console.log('Drawing size:', drawingImageBase64.length);
    
    // Create composite image with wallet + drawing
    const compositeImageBase64 = await createCompositeImage(drawingImageBase64);
    console.log('📸 Composite image created successfully');
    
    // Create safe zone definition - for 1024x1024 square canvas with centered wallet
    const safeZone = {
      x: (1024 - 320) / 2,
      y: (1024 - 569) / 2,
      width: 320,
      height: 569
    };
    
    console.log('Wallet safe zone coordinates:', safeZone);
    
    // Call the enhanced Supabase function
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Enhanced generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const requestPayload = {
          compositeImage: compositeImageBase64,
          safeZone
        };
        
        console.log('Sending enhanced request to Supabase function...');
        const startTime = Date.now();
        
        const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
          body: requestPayload
        });

        const endTime = Date.now();
        console.log(`⏱️ Enhanced request completed in ${endTime - startTime}ms`);

        if (error) {
          console.error(`❌ Error on attempt ${attempts}:`, error);
          if (attempts < maxAttempts) {
            console.log('🔄 Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          throw new Error(`Failed to generate enhanced mask: ${error.message}`);
        }

        console.log('📦 Enhanced response data:', JSON.stringify(data, null, 2));

        if (!data || !data.mask_image_url) {
          console.error(`❌ Invalid enhanced response on attempt ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('🔄 Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          return createFallbackResponse();
        }

        const imageUrl = data.mask_image_url;
        console.log('🖼️ Enhanced mask URL:', imageUrl);
        
        const result = {
          imageUrl: imageUrl,
          layoutJson: data.layout_json || {}
        };

        console.log('✅ === SUCCESSFUL ENHANCED MASK GENERATION ===');
        console.log('Final enhanced result:', result);
        
        // Show enhanced success notification
        toast.success('Enhanced AI mask generated!', {
          description: 'Your drawing has been professionally enhanced with transparent center'
        });
        
        return result;
      } catch (attemptError) {
        console.error(`❌ Error during enhanced attempt ${attempts}:`, attemptError);
        if (attempts < maxAttempts) {
          console.log('🔄 Retrying after enhanced error...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        
        console.log('💀 All enhanced attempts failed, using fallback');
        toast.error('Enhanced AI generation failed. Using backup mask.');
        return createFallbackResponse();
      }
    }
    
    return createFallbackResponse();
    
  } catch (error) {
    console.error('💥 === ENHANCED MASK GENERATION FAILURE ===');
    console.error('Error in enhanced drawToMaskService:', error);
    toast.error('Failed to generate enhanced mask. Please try again.');
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
