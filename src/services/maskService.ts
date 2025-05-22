import { supabase } from '@/integrations/supabase/client';

// Updated generateMask function to handle failures more gracefully
export async function generateMask(
  prompt: string,
  layer: string = 'login',
  referenceImageUrl: string | null = null
): Promise<{ imageUrl: string; layoutJson: any }> {
  try {
    // Create safe zone definition
    const safeZone = {
      x: 0,
      y: 0,
      width: 320,
      height: 569
    };

    console.log('Generating mask with:', { prompt, layer, referenceImageUrl, safeZone });

    // Call the Supabase function to generate the mask
    const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
      body: {
        prompt,
        layer,
        referenceImageUrl,
        safeZone
      }
    });

    if (error) {
      console.error('Error generating mask:', error);
      throw new Error(`Failed to generate mask: ${error.message}`);
    }

    if (!data || !data.mask_image_url) {
      console.error('Invalid response data:', data);
      
      // Return a fallback mask when the API doesn't return a proper image
      return {
        imageUrl: '/external-masks/abstract-mask.png',
        layoutJson: {
          layout: {
            top: "Decorative elements",
            bottom: "Additional decorative elements",
            left: null,
            right: null,
            core: "untouched"
          },
          style: "abstract",
          color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
        }
      };
    }

    console.log('Mask generation successful:', data.mask_image_url);
    
    return {
      imageUrl: data.mask_image_url,
      layoutJson: data.layout_json
    };
  } catch (error) {
    console.error('Error in maskService.generateMask:', error);
    
    // Return a fallback mask on error
    return {
      imageUrl: '/external-masks/abstract-mask.png',
      layoutJson: {
        layout: {
          top: "Fallback decorative elements",
          bottom: "Fallback decorative elements",
          left: null,
          right: null,
          core: "untouched"
        },
        style: "abstract fallback",
        color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
      }
    };
  }
}
