
import { supabase } from '@/integrations/supabase/client';

// Options for mask generation
export interface MaskGenerationOptions {
  prompt: string;
  layer?: string;
  referenceImageUrl?: string | null;
  useBackupStrategy?: boolean;
}

// Default set of fallback masks to use when AI generation fails
const FALLBACK_MASKS = {
  abstract: '/external-masks/abstract-mask.png',
  cat: '/external-masks/cats-mask.png',
  crypto: '/external-masks/crypto-mask.png',
  cyber: '/external-masks/cyber-mask.png',
  pepe: '/external-masks/pepe-mask.png',
};

/**
 * Selects the most appropriate fallback mask based on prompt keywords
 */
function selectFallbackMask(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('cat') || promptLower.includes('kitten') || promptLower.includes('kitty')) {
    return FALLBACK_MASKS.cat;
  } else if (promptLower.includes('crypto') || promptLower.includes('bitcoin') || promptLower.includes('blockchain')) {
    return FALLBACK_MASKS.crypto;
  } else if (promptLower.includes('cyber') || promptLower.includes('tech') || promptLower.includes('digital')) {
    return FALLBACK_MASKS.cyber;
  } else if (promptLower.includes('pepe') || promptLower.includes('frog')) {
    return FALLBACK_MASKS.pepe;
  } else {
    return FALLBACK_MASKS.abstract;
  }
}

/**
 * Generates a mask for wallet customization with improved error handling
 * and fallback mechanism to ensure the user always gets a visual result
 */
export async function generateMask(
  prompt: string,
  layer: string = 'login',
  referenceImageUrl: string | null = null,
  useBackupStrategy: boolean = false
): Promise<{ imageUrl: string; layoutJson: any }> {
  try {
    console.log('Generating mask with:', { prompt, layer, referenceImageUrl, useBackupStrategy });
    
    // Create safe zone definition
    const safeZone = {
      x: 0,
      y: 0,
      width: 320,
      height: 569
    };

    // If backup strategy is enabled, skip the API call and use fallback directly
    // This allows quick testing and resolution of generation issues
    if (useBackupStrategy) {
      console.log('Using backup strategy - skipping API call');
      return createFallbackResponse(prompt);
    }

    // Call the Supabase function with multiple retry logic
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
          body: {
            prompt,
            layer,
            referenceImageUrl,
            safeZone,
            hd_quality: true // Try to use HD quality as it sometimes helps
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
          return createFallbackResponse(prompt);
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
        return createFallbackResponse(prompt);
      }
    }
    
    // This should never be reached due to the while loop, but TypeScript requires a return
    return createFallbackResponse(prompt);
    
  } catch (error) {
    console.error('Error in maskService.generateMask:', error);
    return createFallbackResponse(prompt);
  }
}

/**
 * Creates a consistent fallback response when mask generation fails
 */
function createFallbackResponse(prompt: string): { imageUrl: string; layoutJson: any } {
  const fallbackMaskUrl = selectFallbackMask(prompt);
  
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
      style: prompt.includes('minimalist') ? "minimalist" : "abstract",
      color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
    }
  };
}
