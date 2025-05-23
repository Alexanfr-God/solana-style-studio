
import { supabase } from '@/integrations/supabase/client';

export interface MaskGenerationOptionsV3 {
  prompt: string;
  layer?: string;
  referenceImageUrl?: string | null;
  selectedStyle?: string;
  useBackupStrategy?: boolean;
  debugMode?: boolean;
}

export interface MaskGenerationResponseV3 {
  imageUrl: string;
  metadata: {
    prompt: string;
    style: string;
    layout: {
      top: string | null;
      bottom: string | null;
      left: string | null;
      right: string | null;
      core: string;
    };
    color_palette: string[];
  };
  debugInfo?: {
    promptUsed?: string;
    inputType?: string;
    debugData?: any;
  };
}

// Default fallback masks for V3
const V3_FALLBACK_MASKS = {
  abstract: '/external-masks/abstract-mask.png',
  cat: '/external-masks/cats-mask.png',
  crypto: '/external-masks/crypto-mask.png',
  cyber: '/external-masks/cyber-mask.png',
  pepe: '/external-masks/pepe-mask.png',
};

function selectV3FallbackMask(prompt: string, selectedStyle?: string): string {
  const promptLower = prompt.toLowerCase();
  const styleLower = selectedStyle?.toLowerCase() || '';
  
  if (promptLower.includes('cat') || promptLower.includes('kitten') || styleLower.includes('cat')) {
    return V3_FALLBACK_MASKS.cat;
  } else if (promptLower.includes('crypto') || promptLower.includes('bitcoin') || styleLower.includes('crypto')) {
    return V3_FALLBACK_MASKS.crypto;
  } else if (promptLower.includes('cyber') || promptLower.includes('tech') || styleLower.includes('cyber')) {
    return V3_FALLBACK_MASKS.cyber;
  } else if (promptLower.includes('pepe') || promptLower.includes('frog')) {
    return V3_FALLBACK_MASKS.pepe;
  } else {
    return V3_FALLBACK_MASKS.abstract;
  }
}

function createV3FallbackResponse(prompt: string, selectedStyle?: string): MaskGenerationResponseV3 {
  const fallbackMaskUrl = selectV3FallbackMask(prompt, selectedStyle);
  
  console.log('Using V3 fallback mask:', fallbackMaskUrl);
  
  return {
    imageUrl: fallbackMaskUrl,
    metadata: {
      prompt,
      style: selectedStyle || 'modern',
      layout: {
        top: "Decorative elements (V3 fallback)",
        bottom: "Additional decorative elements (V3 fallback)",
        left: null,
        right: null,
        core: "untouched"
      },
      color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
    }
  };
}

/**
 * V3-specific mask generation using the new architecture
 */
export async function generateWalletMaskV3(
  options: MaskGenerationOptionsV3
): Promise<MaskGenerationResponseV3> {
  const {
    prompt,
    layer = 'login',
    referenceImageUrl = null,
    selectedStyle = 'modern',
    useBackupStrategy = false,
    debugMode = false
  } = options;

  try {
    console.log('V3 mask generation with options:', options);
    
    // If backup strategy is enabled, skip the API call and use fallback directly
    if (useBackupStrategy) {
      console.log('Using V3 backup strategy - skipping API call');
      return createV3FallbackResponse(prompt, selectedStyle);
    }

    // Call the V3-specific Supabase edge function
    const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
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
      console.error('V3 mask generation error:', error);
      throw new Error(`Failed to generate V3 mask: ${error.message}`);
    }

    if (!data || !data.mask_image_url) {
      console.error('Invalid V3 response data:', data);
      return createV3FallbackResponse(prompt, selectedStyle);
    }

    console.log('V3 mask generation successful:', data.mask_image_url);
    
    const result: MaskGenerationResponseV3 = {
      imageUrl: data.mask_image_url,
      metadata: data.metadata || {
        prompt,
        style: selectedStyle,
        layout: {
          top: null,
          bottom: null,
          left: null,
          right: null,
          core: "untouched"
        },
        color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
      },
      debugInfo: debugMode ? {
        promptUsed: data.prompt_used,
        inputType: data.input_type,
        debugData: data.debug_info
      } : undefined
    };

    if (debugMode) {
      console.log('V3 generation debug info:', result.debugInfo);
    }

    return result;
    
  } catch (error) {
    console.error('Error in V3 maskService.generateWalletMaskV3:', error);
    return createV3FallbackResponse(prompt, selectedStyle);
  }
}
