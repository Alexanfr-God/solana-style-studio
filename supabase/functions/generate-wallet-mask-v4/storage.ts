
// Clean Supabase storage integration
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export async function storeInSupabaseStorage(
  imageUrl: string,
  userId: string,
  prefix: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ path: string; publicUrl: string }> {
  console.log('💾 Starting V4 storage process...');
  
  try {
    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${prefix}-${timestamp}.png`;
    const filePath = `${userId}/${fileName}`;
    
    console.log(`📁 Storing as: ${filePath}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-masks')
      .upload(filePath, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-masks')
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      publicUrl: urlData.publicUrl
    };

  } catch (error) {
    console.error('❌ Storage error:', error);
    throw error;
  }
}
