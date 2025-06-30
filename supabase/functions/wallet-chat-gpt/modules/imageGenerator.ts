import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createAdvancedPromptBuilder } from '../utils/prompt-builder.ts';
import { AdvancedJSONParser } from '../utils/json-parser.ts';

export interface ImageGenerationRequest {
  prompt: string;
  style: string;
  type: string;
  dimensions: { width: number; height: number };
  generator: 'leonardo' | 'replicate';
  options?: {
    enhancePrompt?: boolean;
    learnFromExamples?: boolean;
    optimizeForWallet?: boolean;
    highQuality?: boolean;
    aspectRatio?: string;
  };
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  status: string;
  data?: any;
  metadata?: any;
}

export class ImageGenerationManager {
  private supabase: any;
  private promptBuilder: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.promptBuilder = createAdvancedPromptBuilder();
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log(`🖼️ Generating image with ${request.generator}...`);
      console.log(`📝 Prompt: "${request.prompt}"`);

      if (request.generator === 'leonardo') {
        return await this.generateWithLeonardo(request);
      } else if (request.generator === 'replicate') {
        return await this.generateWithReplicate(request);
      } else {
        throw new Error(`Unsupported image generator: ${request.generator}`);
      }
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  private async generateWithLeonardo(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log('🎨 Generating with Leonardo.ai...');

      const apiKey = Deno.env.get('LEONARDO_API_KEY');
      if (!apiKey) {
        throw new Error('Leonardo API key not configured');
      }

      const apiUrl = 'https://cloud.leonardo.ai/api/rest/v1/generations';
      // ✅ ИСПРАВЛЕНИЕ: Обновленный modelId из официального примера
      const modelId = '1dd50843-d653-4516-a8e3-f0238ee453ff'; // Updated model ID

      const enhancedPrompt = this.enhancePromptForWallet(request.prompt, 'leonardo');

      // ✅ ИСПРАВЛЕНИЕ: Убираем num_samples, добавляем современные параметры
      const payload = {
        modelId: modelId,
        prompt: enhancedPrompt,
        num_images: 1, // ✅ Правильный параметр вместо num_samples
        width: 1024,   // Оптимальный размер для wallet
        height: 1024,
        enhancePrompt: true, // ✅ Автоматическое улучшение промпта
        ultra: true,    // ✅ Высокое качество генерации
        public: false
      };

      console.log('📤 Leonardo API payload (FIXED):', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Leonardo API error response:', errorData);
        throw new Error(`Leonardo API error: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ Leonardo API success response:', data);
      
      // ✅ ИСПРАВЛЕНИЕ: Улучшенная обработка ответа
      let imageUrl = null;
      if (data.sdGenerationJob?.generationId) {
        // Need to poll for result
        const generationId = data.sdGenerationJob.generationId;
        imageUrl = await this.pollLeonardoGeneration(generationId, apiKey);
      } else if (data.generations_by_pk?.generated_images?.[0]?.url) {
        imageUrl = data.generations_by_pk.generated_images[0].url;
      }

      if (!imageUrl) {
        throw new Error('No image URL found in Leonardo response');
      }

      return {
        success: true,
        imageUrl: imageUrl,
        status: 'completed',
        data: { imageUrl }, // Ensure imageUrl is in data for extraction
        metadata: {
          prompt: enhancedPrompt,
          model: 'leonardo',
          dimensions: request.dimensions,
          enhanced: true,
          ultra: true
        }
      };
    } catch (error) {
      console.error('❌ Leonardo.ai generation failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  private async pollLeonardoGeneration(generationId: string, apiKey: string): Promise<string | null> {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`Leonardo polling error: ${response.statusText}`);
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }

        const data = await response.json();
        console.log(`🔄 Leonardo polling attempt ${attempts + 1} (ИСПРАВЛЕН):`, data);

        if (data.generations_by_pk?.generated_images?.[0]?.url) {
          return data.generations_by_pk.generated_images[0].url;
        }

        if (data.generations_by_pk?.status === 'FAILED') {
          throw new Error('Leonardo generation failed');
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('Error polling Leonardo generation:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Leonardo generation timed out');
  }

  private async generateWithReplicate(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log('⚛️ Generating with Replicate...');

      const apiKey = Deno.env.get('REPLICATE_API_KEY');
      if (!apiKey) {
        throw new Error('Replicate API key not configured');
      }

      const apiUrl = 'https://api.replicate.com/v1/predictions';
      const modelVersion = 'black-forest-labs/flux-schnell';

      const enhancedPrompt = this.enhancePromptForWallet(request.prompt, 'replicate');

      const payload = {
        version: modelVersion,
        input: {
          prompt: enhancedPrompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      };

      console.log('📤 Replicate API payload:', payload);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Replicate API error response:', errorData);
        throw new Error(`Replicate API error: ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ Replicate API initial response:', data);
      
      // Poll for completion
      const imageUrl = await this.pollReplicateGeneration(data.urls.get, apiKey);

      return {
        success: true,
        imageUrl: imageUrl,
        status: 'completed',
        data: { imageUrl }, // Ensure imageUrl is in data for extraction
        metadata: {
          prompt: enhancedPrompt,
          model: 'replicate',
          dimensions: request.dimensions
        }
      };
    } catch (error) {
      console.error('❌ Replicate generation failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  private async pollReplicateGeneration(getUrl: string, apiKey: string): Promise<string> {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(getUrl, {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to poll prediction status: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`🔄 Replicate polling attempt ${attempts + 1}:`, data);

        if (data.status === 'succeeded' && data.output && data.output.length > 0) {
          return data.output[0];
        }

        if (data.status === 'failed') {
          throw new Error(`Replicate generation failed: ${data.error}`);
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error('❌ Error polling Replicate generation:', error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Replicate generation timed out');
  }

  /**
   * Enhanced prompt building with wallet-specific context
   */
  private enhancePromptForWallet(basePrompt: string, generator: string): string {
    const walletContext = "digital wallet interface background, mobile app design, clean and modern, suitable for cryptocurrency wallet, professional quality";
    
    if (generator === 'leonardo') {
      return `${basePrompt}, ${walletContext}, high quality, detailed, artistic, vibrant colors, 4k resolution`;
    } else if (generator === 'replicate') {
      return `${basePrompt}, ${walletContext}, modern digital art style, clean composition, suitable for mobile interface`;
    }
    
    return `${basePrompt}, ${walletContext}`;
  }
}

/**
 * Factory function to create image generation manager
 */
export function createImageGenerationManager(supabaseUrl: string, supabaseKey: string): ImageGenerationManager {
  return new ImageGenerationManager(supabaseUrl, supabaseKey);
}

/**
 * ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ: Leonardo генерация БЕЗ num_samples ошибки
 */
export async function generateImageWithLeonardo(prompt: string, supabase: any): Promise<ImageGenerationResponse> {
  const apiKey = Deno.env.get('LEONARDO_API_KEY');
  if (!apiKey) {
    console.error('Leonardo API key not configured');
    return { success: false, error: 'Leonardo API key not configured', status: 'failed' };
  }

  const apiUrl = 'https://cloud.leonardo.ai/api/rest/v1/generations';
  // ✅ ИСПРАВЛЕНИЕ: Обновленный modelId
  const modelId = '1dd50843-d653-4516-a8e3-f0238ee453ff';

  // Enhance prompt for wallet background
  const enhancedPrompt = `${prompt}, digital wallet interface background, mobile app design, clean and modern, suitable for cryptocurrency wallet, high quality, detailed, artistic, vibrant colors, 4k resolution`;

  // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убираем num_samples!
  const payload = {
    modelId: modelId,
    prompt: enhancedPrompt,
    num_images: 1,      // ✅ Правильный параметр
    width: 1024,
    height: 1024,
    enhancePrompt: true, // ✅ Автоматическое улучшение промпта
    ultra: true,        // ✅ Высокое качество
    public: false
    // ❌ УБИРАЕМ: num_samples: 1 - этого параметра НЕТ в Leonardo API!
  };

  try {
    console.log('📤 Leonardo payload (ИСПРАВЛЕН):', payload);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Leonardo API error:', errorData);
      return { success: false, error: `Leonardo API error: ${errorData.error}`, status: 'failed' };
    }

    const data = await response.json();
    console.log("✅ Leonardo API response (ИСПРАВЛЕН):", data);
    
    // ✅ УЛУЧШЕННАЯ обработка разных форматов ответа
    let imageUrl = null;
    if (data.sdGenerationJob?.generationId) {
      // Poll for result
      imageUrl = await pollLeonardoGeneration(data.sdGenerationJob.generationId, apiKey);
    } else if (data.generations_by_pk?.generated_images?.[0]?.url) {
      imageUrl = data.generations_by_pk.generated_images[0].url;
    }

    if (!imageUrl) {
      return { success: false, error: 'No image URL found in Leonardo response', status: 'failed' };
    }

    return { 
      success: true, 
      imageUrl: imageUrl, 
      status: 'completed',
      data: { imageUrl } // ВАЖНО: добавляем imageUrl в data для правильного извлечения
    };
  } catch (error) {
    console.error('Error generating image with Leonardo:', error);
    return { success: false, error: error.message, status: 'failed' };
  }
}

// ✅ ИСПРАВЛЕНИЕ: Улучшенная функция polling
async function pollLeonardoGeneration(generationId: string, apiKey: string): Promise<string | null> {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Leonardo polling error: ${response.statusText}`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      const data = await response.json();
      console.log(`🔄 Leonardo polling attempt ${attempts + 1} (ИСПРАВЛЕН):`, data);

      if (data.generations_by_pk?.generated_images?.[0]?.url) {
        return data.generations_by_pk.generated_images[0].url;
      }

      if (data.generations_by_pk?.status === 'FAILED') {
        throw new Error('Leonardo generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    } catch (error) {
      console.error('Error polling Leonardo generation:', error);
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Leonardo generation timed out');
}

export async function generateImageWithReplicate(prompt: string, supabase: any): Promise<ImageGenerationResponse> {
  const apiKey = Deno.env.get('REPLICATE_API_KEY');
  if (!apiKey) {
    console.error('Replicate API key not configured');
    return { success: false, error: 'Replicate API key not configured', status: 'failed' };
  }

  const apiUrl = 'https://api.replicate.com/v1/predictions';
  const modelVersion = 'black-forest-labs/flux-schnell';

  // Enhance prompt for wallet background
  const enhancedPrompt = `${prompt}, digital wallet interface background, mobile app design, clean and modern, suitable for cryptocurrency wallet, modern digital art style, clean composition, suitable for mobile interface`;

  const payload = {
    version: modelVersion,
    input: {
      prompt: enhancedPrompt,
      go_fast: true,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 80,
      num_inference_steps: 4
    }
  };

  try {
    console.log('📤 Replicate payload:', payload);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      return { success: false, error: `Replicate API error: ${errorData.detail}`, status: 'failed' };
    }

    const data = await response.json();
    console.log("✅ Replicate API response:", data);
    
    const predictionUrl = data.urls.get;

    // Poll the prediction status until completed
    let imageUrl = null;
    const maxAttempts = 30;
    let attempts = 0;
    
    while (!imageUrl && attempts < maxAttempts) {
      const predictionResponse = await fetch(predictionUrl, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!predictionResponse.ok) {
        const errorData = await predictionResponse.json();
        console.error('Replicate prediction error:', errorData);
        return { success: false, error: `Replicate prediction error: ${errorData.detail}`, status: 'failed' };
      }

      const predictionData = await predictionResponse.json();
      console.log(`🔄 Replicate polling attempt ${attempts + 1}:`, predictionData);
      
      if (predictionData.status === 'succeeded') {
        imageUrl = predictionData.output[0];
      } else if (predictionData.status === 'failed') {
        console.error('Replicate prediction failed:', predictionData);
        return { success: false, error: `Replicate prediction failed: ${predictionData.error}`, status: 'failed' };
      } else {
        // Wait for 2 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    if (!imageUrl) {
      return { success: false, error: 'Replicate generation timed out', status: 'failed' };
    }

    return { 
      success: true, 
      imageUrl: imageUrl, 
      status: 'completed',
      data: { imageUrl } // ВАЖНО: добавляем imageUrl в data для правильного извлечения
    };
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    return { success: false, error: error.message, status: 'failed' };
  }
}
