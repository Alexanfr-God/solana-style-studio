// Replicate API через Supabase Edge Function для безопасности и CORS

import { supabase } from '@/integrations/supabase/client';

export interface GenerateOptions {
  prompt: string;
  size?: '1024x1024' | '768x1365' | '1365x768';
  seed?: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  bg: string;
  text: string;
}

export async function generateWallpaper(opts: GenerateOptions): Promise<Blob> {
  console.log('🎨 [REPLICATE] Starting wallpaper generation via Edge Function:', opts);
  
  try {
    // Вызываем Edge Function вместо прямого обращения к Replicate
    const { data, error } = await supabase.functions.invoke('generate-background', {
      body: {
        prompt: opts.prompt,
        size: opts.size || '1024x1024',
        seed: opts.seed
      }
    });

    if (error) {
      console.error('❌ [REPLICATE] Edge Function error:', error);
      throw new Error(`Background generation failed: ${error.message}`);
    }

    if (!data?.success || !data?.imageUrl) {
      console.error('❌ [REPLICATE] Invalid response from Edge Function:', data);
      throw new Error('Invalid response from background generation service');
    }

    console.log('✅ [REPLICATE] Generation completed via Edge Function:', {
      url: data.imageUrl,
      path: data.path,
      size: data.size,
      time: data.generationTime
    });

    // Скачиваем сгенерированное изображение из нашего Storage
    const imageResponse = await fetch(data.imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image from storage');
    }
    
    const blob = await imageResponse.blob();
    console.log('📥 [REPLICATE] Downloaded blob size:', blob.size);
    return blob;
    
  } catch (error) {
    console.error('❌ [REPLICATE] Error in generateWallpaper:', error);
    throw error;
  }
}

export async function extractPaletteFromImage(imageBlob: Blob): Promise<ColorPalette> {
  // TODO: Можно также перенести в Edge Function если понадобится
  return Promise.reject(new Error('extractPaletteFromImage not implemented yet - using local analysis instead'));
}
