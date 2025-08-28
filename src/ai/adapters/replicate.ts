
// Replicate API для генерации фонов

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

const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

export async function generateWallpaper(opts: GenerateOptions): Promise<Blob> {
  console.log('🎨 [REPLICATE] Starting wallpaper generation:', opts);
  
  if (!REPLICATE_API_KEY) {
    console.error('❌ [REPLICATE] VITE_REPLICATE_API_KEY not set');
    throw new Error('Replicate API key not configured');
  }

  try {
    // Use flux-schnell model for fast background generation
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'f2ab8a5569070ad82329f4819e2448a5478718e68df5fecf462d5808764d91c1', // flux-schnell
        input: {
          prompt: opts.prompt,
          go_fast: true,
          megapixels: '1',
          num_outputs: 1,
          aspect_ratio: opts.size === '1024x1024' ? '1:1' : 
                        opts.size === '768x1365' ? '9:16' : '16:9',
          output_format: 'png',
          output_quality: 90,
          num_inference_steps: 4,
          seed: opts.seed
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [REPLICATE] API error:', response.status, error);
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const prediction = await response.json();
    console.log('🔄 [REPLICATE] Prediction started:', prediction.id);

    // Poll for completion with timeout
    const startTime = Date.now();
    const timeout = 90000; // 90 seconds
    
    while (true) {
      if (Date.now() - startTime > timeout) {
        console.error('⏰ [REPLICATE] Generation timeout');
        throw new Error('Generation took too long — try a simpler prompt');
      }

      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_KEY}`,
        }
      });

      const status = await statusResponse.json();
      console.log('📊 [REPLICATE] Status:', status.status);

      if (status.status === 'succeeded') {
        const imageUrl = status.output[0];
        console.log('✅ [REPLICATE] Generation completed:', imageUrl);
        
        // Download the generated image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to download generated image');
        }
        
        const blob = await imageResponse.blob();
        console.log('📥 [REPLICATE] Downloaded blob size:', blob.size);
        return blob;
      }
      
      if (status.status === 'failed') {
        console.error('❌ [REPLICATE] Generation failed:', status.error);
        throw new Error(`Generation failed: ${status.error || 'Unknown error'}`);
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  } catch (error) {
    console.error('❌ [REPLICATE] Error in generateWallpaper:', error);
    throw error;
  }
}

export async function extractPaletteFromImage(imageBlob: Blob): Promise<ColorPalette> {
  // TODO: Отправить imageBlob в Replicate модель палитры
  // ENV: REPLICATE_API_TOKEN
  
  return Promise.reject(new Error('extractPaletteFromImage not implemented yet - using local analysis instead'));
}
