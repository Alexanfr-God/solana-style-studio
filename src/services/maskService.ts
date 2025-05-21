
import { Mask, MaskLayerType } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Analyze uploaded image using AI to determine its content (for better mask generation)
const analyzeImage = async (imageUrl: string): Promise<string> => {
  try {
    // Call the edge function for image analysis
    const { data, error } = await supabase.functions.invoke('analyze-image', {
      body: { image_url: imageUrl }
    });
    
    if (error) {
      console.error('Image analysis error:', error);
      return "Unknown image content";
    }
    
    return data.description || "Unknown image content";
  } catch (error) {
    console.error('Error analyzing image:', error);
    return "Unknown image content";
  }
};

// Generate a mask using our edge function
export const generateMask = async (prompt: string, layerType: MaskLayerType, imageUrl?: string | null): Promise<Mask> => {
  console.log(`Generating mask with prompt: ${prompt} for layer: ${layerType}`);
  
  let enhancedPrompt = prompt;
  
  try {
    // If image URL is provided, analyze it to enhance the prompt
    if (imageUrl) {
      console.log(`Using image URL: ${imageUrl}`);
      // We could analyze the image here to enhance the prompt, but for now we'll just use it directly
    }
    
    // Always make sure the prompt contains the safe zone instructions
    if (!enhancedPrompt.includes("central rectangle") && !enhancedPrompt.includes("safe zone")) {
      enhancedPrompt += " - Create a decorative mask AROUND a wallet. Leave the central rectangle (320x569px) completely transparent and clear.";
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
      body: {
        prompt: enhancedPrompt,
        image_url: imageUrl, // This should now be a public URL from Supabase Storage
        layer: layerType,
        user_id: user?.id,
        use_safe_zone: true, // New parameter to enforce safe zone
        mask_version: 'v3' // Specify that we're using the V3 mask format
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

// Save a mask to the user's collection
export const saveMask = async (mask: Mask, name: string): Promise<{ id: string; success: boolean }> => {
  try {
    console.log("Saving mask:", mask);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Save the mask to the database
    const { data, error } = await supabase
      .from('wallet_masks')
      .insert({
        name,
        user_id: user.id,
        image_url: mask.imageUrl,
        layout_json: {
          layout: mask.layout,
          style: mask.style,
          color_palette: mask.colorPalette,
          safe_zone: mask.safeZone
        },
        prompt_used: mask.theme,
        is_v3: true
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving mask:', error);
      throw new Error('Failed to save mask: ' + error.message);
    }
    
    return { id: data.id, success: true };
  } catch (error) {
    console.error('Error saving mask:', error);
    throw error;
  }
};

// Get masks for the current user
export const getUserMasks = async (): Promise<Mask[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // Get masks from the database
    const { data, error } = await supabase
      .from('wallet_masks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting masks:', error);
      throw new Error('Failed to get masks: ' + error.message);
    }
    
    // Map database records to Mask objects
    return data.map(record => ({
      id: record.id,
      imageUrl: record.image_url,
      layout: record.layout_json.layout,
      theme: record.prompt_used,
      style: record.layout_json.style,
      colorPalette: record.layout_json.color_palette,
      safeZone: record.layout_json.safe_zone,
      name: record.name
    }));
  } catch (error) {
    console.error('Error getting masks:', error);
    return [];
  }
};
