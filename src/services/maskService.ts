
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  space: '/external-masks/abstract-mask.png', // Using abstract for space themes
  cosmic: '/external-masks/abstract-mask.png', // Using abstract for cosmic themes
  phantom: '/external-masks/abstract-mask.png', // Using abstract for phantom themes
};

/**
 * Selects the most appropriate fallback mask based on prompt keywords
 * Enhanced to handle more theme variations
 */
function selectFallbackMask(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  // Check for specific keywords to select the most appropriate mask
  if (promptLower.includes('cat') || promptLower.includes('kitten') || promptLower.includes('kitty')) {
    return FALLBACK_MASKS.cat;
  } else if (promptLower.includes('crypto') || promptLower.includes('bitcoin') || promptLower.includes('blockchain') || promptLower.includes('token')) {
    return FALLBACK_MASKS.crypto;
  } else if (promptLower.includes('cyber') || promptLower.includes('tech') || promptLower.includes('digital') || promptLower.includes('neon')) {
    return FALLBACK_MASKS.cyber;
  } else if (promptLower.includes('pepe') || promptLower.includes('frog') || promptLower.includes('meme')) {
    return FALLBACK_MASKS.pepe;
  } else if (promptLower.includes('space') || promptLower.includes('galaxy') || promptLower.includes('star')) {
    return FALLBACK_MASKS.space;
  } else if (promptLower.includes('cosmic') || promptLower.includes('universe') || promptLower.includes('nebula')) {
    return FALLBACK_MASKS.cosmic;
  } else if (promptLower.includes('phantom') || promptLower.includes('ghost') || promptLower.includes('wallet')) {
    return FALLBACK_MASKS.phantom;
  } else {
    // Default to abstract for any other theme
    return FALLBACK_MASKS.abstract;
  }
}

/**
 * Simplified function to validate mask URLs
 */
function validateMaskUrl(url: string): boolean {
  return url && (
    url.startsWith('http') || 
    url.startsWith('/') ||
    url.startsWith('data:image')
  );
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
    
    // If user explicitly requests backup strategy, skip API call entirely
    if (useBackupStrategy) {
      console.log('Using backup strategy - skipping API call as requested by user');
      return createFallbackResponse(prompt);
    }

    // Create safe zone definition
    const safeZone = {
      x: 0,
      y: 0,
      width: 320,
      height: 569
    };

    // Call the Supabase function with multiple retry logic
    let attempts = 0;
    const maxAttempts = 3; // Increased retry attempts
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        // Simplify the prompt for DALL-E to reduce complexity
        let simplifiedPrompt = prompt;
        if (simplifiedPrompt.length > 300) {
          simplifiedPrompt = simplifiedPrompt.substring(0, 300);
          console.log('Prompt was too long, truncating to 300 characters');
        }
        
        // Add a brief, clear instruction for the mask
        simplifiedPrompt += ` - Create a decorative frame with space for a wallet UI in the center.`;
        
        // Make API call with error timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
        );
        
        const responsePromise = supabase.functions.invoke('generate-wallet-mask', {
          body: {
            prompt: simplifiedPrompt,
            layer,
            referenceImageUrl,
            safeZone,
            hd_quality: true // Use HD quality for better results
          }
        });
        
        // Race between timeout and actual response
        const { data, error } = await Promise.race([
          responsePromise,
          timeoutPromise.then(() => ({ data: null, error: new Error('Timeout') }))
        ]) as any;

        if (error) {
          console.error(`Error on attempt ${attempts}:`, error);
          if (attempts < maxAttempts) {
            console.log('Retrying after error...');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Increased wait time between retries
            continue;
          }
          throw new Error(`Failed to generate mask: ${error.message}`);
        }

        // Validate the response data
        if (!data || !data.mask_image_url) {
          console.error(`Invalid response data on attempt ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('Retrying due to invalid data...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          return createFallbackResponse(prompt);
        }

        // Validate the image URL format
        if (!validateMaskUrl(data.mask_image_url)) {
          console.error(`Invalid image URL format: ${data.mask_image_url}`);
          return createFallbackResponse(prompt);
        }

        console.log('Mask generation successful:', data.mask_image_url);
        return {
          imageUrl: data.mask_image_url,
          layoutJson: data.layout_json || {}
        };
      } catch (attemptError) {
        console.error(`Error during attempt ${attempts}:`, attemptError);
        
        // Check if we've reached max attempts
        if (attempts < maxAttempts) {
          console.log('Retrying after exception...');
          await new Promise(resolve => setTimeout(resolve, 1500));
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
    
    // Notify the user about the error
    toast.error('Could not generate custom mask. Using a fallback design.');
    
    return createFallbackResponse(prompt);
  }
}

/**
 * Creates a consistent fallback response when mask generation fails
 * Enhanced with better style matching based on prompt
 */
function createFallbackResponse(prompt: string): { imageUrl: string; layoutJson: any } {
  const fallbackMaskUrl = selectFallbackMask(prompt);
  
  console.log('Using fallback mask:', fallbackMaskUrl);
  
  // Generate a more relevant layout JSON based on the prompt
  const promptLower = prompt.toLowerCase();
  let style = "abstract";
  let colorPalette = ["#6c5ce7", "#fd79a8", "#00cec9"];
  
  // Determine style from prompt
  if (promptLower.includes('minimalist') || promptLower.includes('clean')) {
    style = "minimalist";
    colorPalette = ["#2d3436", "#636e72", "#b2bec3"];
  } else if (promptLower.includes('cyber') || promptLower.includes('neon')) {
    style = "cyber";
    colorPalette = ["#00ff00", "#ff00ff", "#00ffff"];
  } else if (promptLower.includes('cosmic') || promptLower.includes('space')) {
    style = "cosmic";
    colorPalette = ["#6c5ce7", "#a29bfe", "#dfe6e9"];
  } else if (promptLower.includes('crypto') || promptLower.includes('blockchain')) {
    style = "crypto";
    colorPalette = ["#f1c40f", "#2980b9", "#e74c3c"];
  }
  
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
      style: style,
      color_palette: colorPalette,
      prompt: prompt // Store the original prompt for reference
    }
  };
}
