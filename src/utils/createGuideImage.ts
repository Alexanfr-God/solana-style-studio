
import { supabase } from '@/integrations/supabase/client';

export const createAndUploadGuideImage = async (): Promise<string> => {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Set canvas size to 1024x1024
    canvas.width = 1024;
    canvas.height = 1024;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw black rectangle at specified coordinates
    // Rectangle: 320x569 at position x=352, y=228
    ctx.fillStyle = '#000000';
    ctx.fillRect(352, 228, 320, 569);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/png');
    });

    // Upload to Supabase Storage
    const fileName = 'mask-guide-v3.png';
    const { data, error } = await supabase.storage
      .from('wallet-base')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('wallet-base')
      .getPublicUrl(fileName);

    console.log('✅ Guide image created and uploaded:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ Failed to create/upload guide image:', error);
    throw error;
  }
};

// Utility to ensure guide image exists
export const ensureGuideImageExists = async (): Promise<string> => {
  const fileName = 'mask-guide-v3.png';
  
  // Check if file already exists
  const { data: listData, error: listError } = await supabase.storage
    .from('wallet-base')
    .list('', {
      search: fileName
    });

  if (listError) {
    console.warn('Could not check for existing guide image:', listError);
  }

  const fileExists = listData?.some(file => file.name === fileName);
  
  if (fileExists) {
    // Return existing URL
    const { data: urlData } = supabase.storage
      .from('wallet-base')
      .getPublicUrl(fileName);
    
    console.log('📋 Using existing guide image:', urlData.publicUrl);
    return urlData.publicUrl;
  }

  // Create and upload new guide image
  return await createAndUploadGuideImage();
};
