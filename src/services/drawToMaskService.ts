
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Analyzes a user drawing and generates a polished mask for wallet customization
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🎨 === STARTING MASK GENERATION ===');
    console.log('Drawing size:', drawingImageBase64.length);
    console.log('Drawing preview:', drawingImageBase64.substring(0, 100));
    
    // Create safe zone definition - for 1024x1024 square canvas with centered wallet
    const safeZone = {
      x: (1024 - 320) / 2,
      y: (1024 - 569) / 2,
      width: 320,
      height: 569
    };
    
    console.log('Safe zone:', safeZone);
    
    // Call the Supabase function with retries
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const requestPayload = {
          drawingImage: drawingImageBase64,
          safeZone,
          hd_quality: true
        };
        
        console.log('Sending request to Supabase function...');
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
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          throw new Error(`Failed to generate mask: ${error.message}`);
        }

        console.log('📦 Raw response data:', JSON.stringify(data, null, 2));

        if (!data || !data.mask_image_url) {
          console.error(`❌ Invalid response data on attempt ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('🔄 Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          return createFallbackResponse();
        }

        // Enhanced URL validation
        const imageUrl = data.mask_image_url;
        console.log('🖼️ Generated image URL:', imageUrl);
        console.log('URL type:', typeof imageUrl);
        console.log('URL length:', imageUrl.length);
        console.log('URL starts with:', imageUrl.substring(0, 50));
        
        // Test URL accessibility
        console.log('🔍 Testing URL accessibility...');
        try {
          const testResponse = await fetch(imageUrl, { method: 'HEAD' });
          console.log('URL test response status:', testResponse.status);
          console.log('URL test response headers:', Object.fromEntries(testResponse.headers.entries()));
          
          if (!testResponse.ok) {
            console.warn(`⚠️ URL returned status ${testResponse.status} but proceeding anyway`);
          } else {
            console.log('✅ URL is accessible');
          }
        } catch (urlError) {
          console.error('❌ URL accessibility test failed:', urlError);
          console.log('🤷 Proceeding anyway, might be CORS issue');
        }

        const result = {
          imageUrl: imageUrl,
          layoutJson: data.layout_json || {}
        };

        console.log('✅ === MASK GENERATION SUCCESS ===');
        console.log('Final result:', result);
        console.log('Image URL to be set:', result.imageUrl);
        
        return result;
      } catch (attemptError) {
        console.error(`❌ Error during attempt ${attempts}:`, attemptError);
        console.error('Attempt error stack:', attemptError.stack);
        if (attempts < maxAttempts) {
          console.log('🔄 Retrying after error...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        
        // If all attempts failed, use the fallback
        console.log('💀 All attempts failed, using fallback');
        return createFallbackResponse();
      }
    }
    
    // This should never be reached due to the while loop, but TypeScript requires a return
    return createFallbackResponse();
    
  } catch (error) {
    console.error('💥 === MASK GENERATION FAILURE ===');
    console.error('Error in drawToMaskService.generateMaskFromDrawing:', error);
    console.error('Error stack:', error.stack);
    toast.error('Failed to generate mask. Please try again.');
    return createFallbackResponse();
  }
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
