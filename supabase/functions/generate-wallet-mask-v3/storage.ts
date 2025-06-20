import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Saves generated image to Supabase storage bucket
 * @param imageUrl URL of the generated image from Replicate
 * @param prompt Original prompt used for generation
 * @returns Public URL of saved image
 */
export async function saveReplicateImageToBucket(
  imageUrl: string, 
  prompt: string
): Promise<string> {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `replicate-${timestamp}.png`;
    const filepath = `generated/${filename}`;

    console.log('Uploading image to bucket:', filepath);

    // Upload to storage bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('generated-images')
      .upload(filepath, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      throw new Error(`Failed to save image: ${storageError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filepath);

    const publicUrl = urlData.publicUrl;
    console.log('Image saved successfully:', publicUrl);

    // Save metadata to database
    try {
      const { error: dbError } = await supabase
        .from('generated_images')
        .insert({
          prompt,
          storage_path: filepath,
          public_url: publicUrl,
          generation_mode: 'replicate',
          metadata: { 
            original_url: imageUrl,
            timestamp,
            size: imageBlob.size
          }
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Don't throw here - image is saved, metadata is optional
      }
    } catch (metaError) {
      console.error('Metadata save error:', metaError);
      // Continue - image is successfully saved
    }

    return publicUrl;
  } catch (error) {
    console.error('Error saving Replicate image to bucket:', error);
    throw error;
  }
}
