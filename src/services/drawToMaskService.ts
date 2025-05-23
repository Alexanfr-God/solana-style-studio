
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Analyzes a user drawing and generates a polished mask for wallet customization
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string
): Promise<{ imageUrl: string; layoutJson: any }> {
  try {
    console.log('Generating mask from drawing');
    
    // Create safe zone definition
    const safeZone = {
      x: 0,
      y: 0,
      width: 320,
      height: 569
    };
    
    // Call the Supabase function with retries
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
          body: {
            drawingImage: drawingImageBase64,
            safeZone,
            hd_quality: true
          }
        });

        if (error) {
          console.error(`Error on attempt ${attempts}:`, error);
          if (attempts < maxAttempts) {
            console.log('Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          throw new Error(`Failed to generate mask: ${error.message}`);
        }

        if (!data || !data.mask_image_url) {
          console.error(`Invalid response data on attempt ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          return createFallbackResponse();
        }

        console.log('Mask generation successful:', data.mask_image_url);
        return {
          imageUrl: data.mask_image_url,
          layoutJson: data.layout_json || {}
        };
      } catch (attemptError) {
        console.error(`Error during attempt ${attempts}:`, attemptError);
        if (attempts < maxAttempts) {
          console.log('Retrying after error...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        
        // If all attempts failed, use the fallback
        return createFallbackResponse();
      }
    }
    
    // This should never be reached due to the while loop, but TypeScript requires a return
    return createFallbackResponse();
    
  } catch (error) {
    console.error('Error in drawToMaskService.generateMaskFromDrawing:', error);
    toast.error('Failed to generate mask. Please try again.');
    return createFallbackResponse();
  }
}

/**
 * Creates a consistent fallback response when mask generation fails
 */
function createFallbackResponse(): { imageUrl: string; layoutJson: any } {
  const fallbackMaskUrl = '/external-masks/abstract-mask.png';
  
  console.log('Using fallback mask:', fallbackMaskUrl);
  
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
