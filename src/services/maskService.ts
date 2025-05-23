
import { supabase } from '@/integrations/supabase/client';
import { validateSafeZoneTransparency } from './promptBuilder';

// Options for enhanced mask generation
export interface MaskGenerationOptions {
  prompt: string;
  layer?: string;
  referenceImageUrl?: string | null;
  selectedStyle?: string;
  useBackupStrategy?: boolean;
  debugMode?: boolean;
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
 * Selects the most appropriate fallback mask based on prompt keywords and style
 */
function selectFallbackMask(prompt: string, selectedStyle?: string): string {
  const promptLower = prompt.toLowerCase();
  const styleLower = selectedStyle?.toLowerCase() || '';
  
  if (promptLower.includes('cat') || promptLower.includes('kitten') || styleLower.includes('cat')) {
    return FALLBACK_MASKS.cat;
  } else if (promptLower.includes('crypto') || promptLower.includes('bitcoin') || styleLower.includes('crypto')) {
    return FALLBACK_MASKS.crypto;
  } else if (promptLower.includes('cyber') || promptLower.includes('tech') || styleLower.includes('cyber')) {
    return FALLBACK_MASKS.cyber;
  } else if (promptLower.includes('pepe') || promptLower.includes('frog')) {
    return FALLBACK_MASKS.pepe;
  } else if (styleLower.includes('minimalist')) {
    return FALLBACK_MASKS.abstract;
  } else {
    return FALLBACK_MASKS.abstract;
  }
}

/**
 * Creates a consistent fallback response when mask generation fails
 */
function createFallbackResponse(prompt: string, selectedStyle?: string): { imageUrl: string; layoutJson: any } {
  const fallbackMaskUrl = selectFallbackMask(prompt, selectedStyle);
  
  console.log('Using enhanced fallback mask:', fallbackMaskUrl);
  
  return {
    imageUrl: fallbackMaskUrl,
    layoutJson: {
      layout: {
        top: "Decorative elements (enhanced fallback)",
        bottom: "Additional decorative elements (enhanced fallback)",
        left: null,
        right: null,
        core: "untouched"
      },
      style: selectedStyle || (prompt.includes('minimalist') ? "minimalist" : "abstract"),
      color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
    }
  };
}

/**
 * Enhanced mask generation with comprehensive prompt building and validation
 */
export async function generateMask(
  prompt: string,
  layer: string = 'login',
  referenceImageUrl: string | null = null,
  useBackupStrategy: boolean = false,
  selectedStyle?: string,
  debugMode: boolean = false
): Promise<{ imageUrl: string; layoutJson: any; debugInfo?: any }> {
  try {
    console.log('Enhanced mask generation with:', { 
      prompt, 
      layer, 
      referenceImageUrl, 
      useBackupStrategy, 
      selectedStyle,
      debugMode 
    });
    
    // If backup strategy is enabled, skip the API call and use fallback directly
    if (useBackupStrategy) {
      console.log('Using backup strategy - skipping API call');
      return createFallbackResponse(prompt, selectedStyle);
    }

    // Call the enhanced Supabase function
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Enhanced generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
          body: {
            prompt,
            layer,
            image_url: referenceImageUrl,
            selected_style: selectedStyle,
            debug_mode: debugMode,
            hd_quality: true
          }
        });

        if (error) {
          console.error(`Enhanced generation error on attempt ${attempts}:`, error);
          if (attempts < maxAttempts) {
            console.log('Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error(`Failed to generate mask: ${error.message}`);
        }

        if (!data || !data.mask_image_url) {
          console.error(`Invalid enhanced response data on attempt ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('Retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          return createFallbackResponse(prompt, selectedStyle);
        }

        console.log('Enhanced mask generation successful:', data.mask_image_url);
        
        // Validate safe zone transparency if not using fallback
        let validationResult = { isValid: true, opaquePixelPercent: 0 };
        
        if (!data.mask_image_url.includes('/external-masks/')) {
          try {
            console.log('Validating safe zone transparency...');
            validationResult = await validateSafeZoneTransparency(data.mask_image_url);
            
            if (!validationResult.isValid) {
              console.warn(`Safe zone validation failed: ${validationResult.opaquePixelPercent}% opaque pixels`);
              // Could implement retry with enhanced transparency instructions here
            }
          } catch (validationError) {
            console.error('Safe zone validation error:', validationError);
            // Continue with the image even if validation fails
          }
        }

        const result = {
          imageUrl: data.mask_image_url,
          layoutJson: data.layout_json || {},
          debugInfo: debugMode ? {
            promptUsed: data.prompt_used,
            inputType: data.input_type,
            safeZoneValidation: validationResult,
            debugData: data.debug_info
          } : undefined
        };

        if (debugMode) {
          console.log('Enhanced generation debug info:', result.debugInfo);
        }

        return result;
        
      } catch (attemptError) {
        console.error(`Enhanced generation error during attempt ${attempts}:`, attemptError);
        if (attempts < maxAttempts) {
          console.log('Retrying after error...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        return createFallbackResponse(prompt, selectedStyle);
      }
    }
    
    return createFallbackResponse(prompt, selectedStyle);
    
  } catch (error) {
    console.error('Error in enhanced maskService.generateMask:', error);
    return createFallbackResponse(prompt, selectedStyle);
  }
}
