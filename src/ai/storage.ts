
// Supabase Storage для загрузки сгенерированных изображений

import { supabase } from '@/integrations/supabase/client';

export async function uploadToStorage(blob: Blob, path: string): Promise<string> {
  console.log('📤 [STORAGE] Starting upload:', { path, size: blob.size, type: blob.type });
  
  try {
    // Ensure we have a clean path
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Upload to the generated-images bucket (public bucket)
    const { data, error } = await supabase.storage
      .from('generated-images')
      .upload(cleanPath, blob, {
        cacheControl: '3600',
        upsert: true // Allow overwriting
      });

    if (error) {
      console.error('❌ [STORAGE] Upload error:', error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    console.log('✅ [STORAGE] Upload successful:', data.path);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(data.path);

    if (!urlData?.publicUrl) {
      console.error('❌ [STORAGE] Failed to get public URL');
      throw new Error('Failed to get public URL');
    }

    const publicUrl = urlData.publicUrl;
    console.log('🔗 [STORAGE] uploaded path=', data.path, 'url=', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ [STORAGE] Error in uploadToStorage:', error);
    throw error;
  }
}

export async function downloadAndUpload(imageUrl: string, targetPath: string): Promise<string> {
  console.log('📥 [STORAGE] Downloading external image:', imageUrl);
  
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const blob = await response.blob();
    console.log('📦 [STORAGE] Downloaded blob size:', blob.size);
    
    return await uploadToStorage(blob, targetPath);
  } catch (error) {
    console.error('❌ [STORAGE] Error in downloadAndUpload:', error);
    throw error;
  }
}
