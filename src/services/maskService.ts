
import { Mask, MaskLayerType } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Generate a mask using our edge function
export const generateMask = async (prompt: string, layerType: MaskLayerType, imageUrl?: string | null): Promise<Mask> => {
  console.log(`Generating mask with prompt: ${prompt} for layer: ${layerType}`);
  if (imageUrl) {
    console.log(`Using image URL: ${imageUrl}`);
  }
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
      body: {
        prompt,
        image_url: imageUrl, // This should now be a public URL from Supabase Storage
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
    
    // Check if error is related to image URLs
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('image_url') || errorMessage.includes('blob:')) {
      throw new Error("Invalid image URL. Make sure the image is fully uploaded before generating.");
    }
    
    throw error;
  }
};

// In a real implementation, you would add this function to save the mask
export const saveMask = async (mask: Mask) => {
  console.log("Saving mask:", mask);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
};
