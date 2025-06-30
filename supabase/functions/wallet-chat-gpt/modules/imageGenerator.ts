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
      const modelId = '6bef9f1b-29cb-40c7-b9df-32b51c15c618'; // Stable Diffusion v1.5

      const enhancedPrompt = request.options?.enhancePrompt
        ? this.buildEnhancedPrompt(request.prompt, request.style, [], {})
        : { prompt: request.prompt };

      const payload = {
        prompt: enhancedPrompt.prompt,
        modelId: modelId,
        width: request.dimensions.width,
        height: request.dimensions.height,
        num_images: 1,
        num_samples: 1,
        public: false
      };

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
        throw new Error(`Leonardo API error: ${errorData.error}`);
      }

      const data = await response.json();
      const imageUrl = data.generations_by_id[0].generated_images[0].url;

      console.log('✅ Leonardo.ai generation successful');

      return {
        success: true,
        imageUrl: imageUrl,
        status: 'completed',
        metadata: {
          prompt: enhancedPrompt.prompt,
          model: 'leonardo',
          dimensions: request.dimensions
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

  private async generateWithReplicate(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      console.log('⚛️ Generating with Replicate...');

      const apiKey = Deno.env.get('REPLICATE_API_KEY');
      if (!apiKey) {
        throw new Error('Replicate API key not configured');
      }

      const apiUrl = 'https://api.replicate.com/v1/predictions';
      const modelVersion = 'stability-ai/sdxl:39fa3c9c749c1d315e59ca36a9110754f8b32eecff50713ef061c352a3894a2d';

      const enhancedPrompt = request.options?.enhancePrompt
        ? this.buildEnhancedPrompt(request.prompt, request.style, [], {})
        : { prompt: request.prompt };

      const payload = {
        version: modelVersion,
        input: {
          prompt: enhancedPrompt.prompt,
          width: request.dimensions.width,
          height: request.dimensions.height,
          num_outputs: 1,
          guidance_scale: 7.5,
          scheduler: "K_EULER_ANCESTRAL",
          num_inference_steps: 30
        }
      };

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
        throw new Error(`Replicate API error: ${errorData.detail}`);
      }

      const data = await response.json();
      const predictionUrl = data.urls.get;

      // Poll the prediction status until completed
      let imageUrl = null;
      while (!imageUrl) {
        const predictionResponse = await fetch(predictionUrl, {
          headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!predictionResponse.ok) {
          const errorData = await predictionResponse.json();
          throw new Error(`Replicate prediction error: ${errorData.detail}`);
        }

        const predictionData = await predictionResponse.json();
        if (predictionData.status === 'succeeded') {
          imageUrl = predictionData.output[0];
        } else if (predictionData.status === 'failed') {
          throw new Error(`Replicate prediction failed: ${predictionData.error}`);
        } else {
          // Wait for 2 seconds before polling again
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      console.log('✅ Replicate generation successful');

      return {
        success: true,
        imageUrl: imageUrl,
        status: 'completed',
        metadata: {
          prompt: enhancedPrompt.prompt,
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

  /**
   * Enhanced prompt building with style integration
   */
  private buildEnhancedPrompt(
    basePrompt: string,
    style: string,
    examples: any[],
    chosenStyle?: any
  ): any {
    return this.promptBuilder.buildImagePrompt(
      basePrompt,
      style,
      examples,
      { 
        quality: 'high',
        dimensions: '1:1',
        chosenStyle
      }
    );
  }
}

/**
 * Factory function to create image generation manager
 */
export function createImageGenerationManager(supabaseUrl: string, supabaseKey: string): ImageGenerationManager {
  return new ImageGenerationManager(supabaseUrl, supabaseKey);
}

/**
 * Helper functions to generate images with Leonardo and Replicate
 */
export async function generateImageWithLeonardo(prompt: string, supabase: any): Promise<ImageGenerationResponse> {
  const apiKey = Deno.env.get('LEONARDO_API_KEY');
  if (!apiKey) {
    console.error('Leonardo API key not configured');
    return { success: false, error: 'Leonardo API key not configured', status: 'failed' };
  }

  const apiUrl = 'https://cloud.leonardo.ai/api/rest/v1/generations';
  const modelId = '6bef9f1b-29cb-40c7-b9df-32b51c15c618'; // Stable Diffusion v1.5

  const payload = {
    prompt: prompt,
    modelId: modelId,
    width: 1024,
    height: 1024,
    num_images: 1,
    num_samples: 1,
    public: false
  };

  try {
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
	  console.log("Leonardo API response:", data);
    const imageUrl = data.generations_by_id[0].generated_images[0].url;

    return { success: true, imageUrl: imageUrl, status: 'completed' };
  } catch (error) {
    console.error('Error generating image with Leonardo:', error);
    return { success: false, error: error.message, status: 'failed' };
  }
}

export async function generateImageWithReplicate(prompt: string, supabase: any): Promise<ImageGenerationResponse> {
  const apiKey = Deno.env.get('REPLICATE_API_KEY');
  if (!apiKey) {
    console.error('Replicate API key not configured');
    return { success: false, error: 'Replicate API key not configured', status: 'failed' };
  }

  const apiUrl = 'https://api.replicate.com/v1/predictions';
  const modelVersion = 'stability-ai/sdxl:39fa3c9c749c1d315e59ca36a9110754f8b32eecff50713ef061c352a3894a2d';

  const payload = {
    version: modelVersion,
    input: {
      prompt: prompt,
      width: 1024,
      height: 1024,
      num_outputs: 1,
      guidance_scale: 7.5,
      scheduler: "K_EULER_ANCESTRAL",
      num_inference_steps: 30
    }
  };

  try {
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
    const predictionUrl = data.urls.get;

    // Poll the prediction status until completed
    let imageUrl = null;
    while (!imageUrl) {
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
      if (predictionData.status === 'succeeded') {
        imageUrl = predictionData.output[0];
      } else if (predictionData.status === 'failed') {
        console.error('Replicate prediction failed:', predictionData);
        return { success: false, error: `Replicate prediction failed: ${predictionData.error}`, status: 'failed' };
      } else {
        // Wait for 2 seconds before polling again
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { success: true, imageUrl: imageUrl, status: 'completed' };
  } catch (error) {
    console.error('Error generating image with Replicate:', error);
    return { success: false, error: error.message, status: 'failed' };
  }
}
