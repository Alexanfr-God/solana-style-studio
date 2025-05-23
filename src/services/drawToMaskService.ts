
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Analyzes a user drawing and generates a polished mask for wallet customization
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🎨 === STARTING COMPOSITE MASK GENERATION ===');
    console.log('Drawing size:', drawingImageBase64.length);
    
    // Create composite image with wallet + drawing
    const compositeImageBase64 = await createCompositeImage(drawingImageBase64);
    console.log('📸 Composite image created');
    
    // Create safe zone definition - for 1024x1024 square canvas with centered wallet
    const safeZone = {
      x: (1024 - 320) / 2,
      y: (1024 - 569) / 2,
      width: 320,
      height: 569
    };
    
    console.log('Wallet safe zone:', safeZone);
    
    // Call the Supabase function with retries
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const requestPayload = {
          compositeImage: compositeImageBase64,
          safeZone,
          hd_quality: true
        };
        
        console.log('Sending composite request to Supabase function...');
        const startTime = Date.now();
        
        const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
          body: requestPayload
        });

        const endTime = Date.now();
        console.log(`⏱️ Request completed in ${endTime - startTime}ms`);

        if (error) {
          console.error(`❌ Error on attempt ${attempts}:`, error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          if (attempts < maxAttempts) {
            console.log('🔄 Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error(`Failed to generate mask: ${error.message}`);
        }

        console.log('📦 Raw response data:', JSON.stringify(data, null, 2));

        if (!data || !data.mask_image_url) {
          console.error(`❌ Invalid response data on attempt ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('🔄 Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          return createFallbackResponse();
        }

        const imageUrl = data.mask_image_url;
        console.log('🖼️ Generated image URL:', imageUrl);
        
        const result = {
          imageUrl: imageUrl,
          layoutJson: data.layout_json || {}
        };

        console.log('✅ === SUCCESSFUL COMPOSITE MASK GENERATION ===');
        console.log('Final result:', result);
        
        // Show success notification
        toast.success('AI mask successfully generated!', {
          description: 'Your drawing has been enhanced and transformed into a decorative mask'
        });
        
        return result;
      } catch (attemptError) {
        console.error(`❌ Error during attempt ${attempts}:`, attemptError);
        if (attempts < maxAttempts) {
          console.log('🔄 Retrying after error...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        console.log('💀 All attempts failed, using fallback');
        toast.error('AI generation error. Using backup mask.');
        return createFallbackResponse();
      }
    }
    
    return createFallbackResponse();
    
  } catch (error) {
    console.error('💥 === MASK GENERATION FAILURE ===');
    console.error('Error in drawToMaskService.generateMaskFromDrawing:', error);
    toast.error('Failed to generate mask. Please try again.');
    return createFallbackResponse();
  }
}

/**
 * Creates a composite image by combining the wallet interface with the user's drawing
 */
async function createCompositeImage(drawingImageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('🖼️ Creating composite image...');
      
      // Create canvas for composite
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      // Set background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Load the drawing image
      const drawingImg = new Image();
      drawingImg.onload = () => {
        try {
          // Draw the user's drawing
          ctx.drawImage(drawingImg, 0, 0, 1024, 1024);
          
          // Capture the wallet interface
          const walletElement = document.querySelector('.wallet-preview') as HTMLElement;
          if (!walletElement) {
            console.warn('⚠️ Wallet element not found, proceeding with drawing only');
            const result = canvas.toDataURL('image/png');
            resolve(result);
            return;
          }
          
          // Use html2canvas to capture the wallet
          import('html2canvas').then(html2canvas => {
            html2canvas.default(walletElement, {
              backgroundColor: null,
              useCORS: true,
              scale: 1,
              width: 320,
              height: 569
            }).then(walletCanvas => {
              // Draw wallet in the center
              const centerX = (1024 - 320) / 2;
              const centerY = (1024 - 569) / 2;
              ctx.drawImage(walletCanvas, centerX, centerY, 320, 569);
              
              console.log('✅ Composite image created successfully');
              const result = canvas.toDataURL('image/png');
              resolve(result);
            }).catch(error => {
              console.error('Error capturing wallet:', error);
              // Proceed with just the drawing
              const result = canvas.toDataURL('image/png');
              resolve(result);
            });
          });
        } catch (error) {
          console.error('Error processing composite image:', error);
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
