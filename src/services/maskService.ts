
import { Mask, MaskLayerType } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Generate a mask using our new edge function
export const generateMask = async (prompt: string, layerType: MaskLayerType, imageUrl?: string | null): Promise<Mask> => {
  console.log(`Generating mask with prompt: ${prompt} for layer: ${layerType}`);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
      body: {
        prompt: prompt,
        image_url: imageUrl,
        layer: layerType,
        user_id: user?.id
      }
    });
    
    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Failed to generate mask: ' + error.message);
    }
    
    console.log('Generated mask data:', data);
    
    // Map the API response to our Mask format
    const generatedMask: Mask = {
      imageUrl: data.mask_image_url,
      layout: {
        top: data.layout_json.layout.top,
        bottom: data.layout_json.layout.bottom,
        left: data.layout_json.layout.left,
        right: data.layout_json.layout.right,
        core: data.layout_json.layout.core
      },
      theme: data.prompt_used.split(' ').slice(0, 3).join(' '),
      style: data.layout_json.style,
      colorPalette: data.layout_json.color_palette,
      safeZone: data.layout_json.safe_zone
    };
    
    return generatedMask;
  } catch (error) {
    console.error('Error generating mask:', error);
    toast.error("Failed to generate mask. Please try again.");
    
    // Return a fallback mask in case of error
    return {
      imageUrl: "https://solana-style-studio.vercel.app/placeholder-mask.png",
      layout: {
        top: "Character ears and hair",
        bottom: "Character hands holding wallet",
        left: null,
        right: null,
        core: "untouched"
      },
      theme: "Character-based",
      style: "cartoon",
      colorPalette: ["#f4d03f", "#222222", "#ffffff"],
      safeZone: {
        x: "20%",
        y: "20%",
        width: "60%",
        height: "60%"
      }
    };
  }
};

// In a real implementation, you would add this function to save the mask
export const saveMask = async (mask: Mask) => {
  console.log("Saving mask:", mask);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};
