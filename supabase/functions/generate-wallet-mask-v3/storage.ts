
// V4 Architecture: Clean storage operations
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { V4_CONFIG } from './utils/constants.ts';

export async function storeProcessedImage(
  imageUrl: string,
  userId: string,
  supabaseUrl: string,
  supabaseKey: string,
  isBackgroundRemoved: boolean = false
): Promise<{ path: string; publicUrl: string }> {
  console.log("💾 V4: Storing processed image");
  
  try {
    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const suffix = isBackgroundRemoved ? 'v4-nobg' : 'v4-generated';
    const fileName = `${suffix}-mask-${timestamp}.png`;
    const filePath = `${userId}/${fileName}`;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-masks')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-masks')
      .getPublicUrl(filePath);
    
    console.log("✅ V4: Image stored successfully");
    return {
      path: filePath,
      publicUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error("❌ V4: Storage error:", error);
    throw error;
  }
}

export async function storeMaskMetadata(
  userId: string,
  maskData: {
    prompt: string;
    style: string;
    imageUrl: string;
    storagePath?: string;
    backgroundRemoved: boolean;
    processingSteps: string[];
  },
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  try {
    console.log("💾 V4: Storing mask metadata");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('ai_mask_results').insert({
      user_id: userId,
      prompt: maskData.prompt,
      style: maskData.style,
      image_url: maskData.imageUrl,
      storage_path: maskData.storagePath,
      layout: { v4_architecture: true, processing_steps: maskData.processingSteps },
      color_palette: ["#V4", "#NOBG", "#CLEAN"],
      safe_zone: V4_CONFIG.SAFE_ZONE,
      transparency_validated: maskData.backgroundRemoved,
      reference_image_url: V4_CONFIG.GUIDE_IMAGE_URL,
      wallet_base_image_url: V4_CONFIG.WALLET_BASE_IMAGE
    });
    
    if (error) {
      console.error("V4: Metadata storage error:", error);
    } else {
      console.log("✅ V4: Metadata stored successfully");
    }
  } catch (error) {
    console.error("❌ V4: Metadata error:", error);
  }
}
