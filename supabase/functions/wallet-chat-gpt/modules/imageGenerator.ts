// ====== Enhanced modules/imageGenerator.ts ======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createPromptBuilder } from '../utils/prompt-builder.ts';
import { createStorageManager } from '../utils/storage-manager.ts';

export interface ImageGenerationRequest {
  prompt: string;
  style?: 'vector' | 'realistic' | 'cartoon' | 'poster' | 'nft' | 'cyberpunk' | 'minimal';
  type?: 'background' | 'avatar' | 'banner' | 'nft' | 'icon' | 'wallpaper';
  dimensions?: { width: number; height: number };
  generator: 'leonardo' | 'replicate';
  options?: {
    enhancePrompt?: boolean;
    learnFromExamples?: boolean;
    optimizeForWallet?: boolean;
    highQuality?: boolean;
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  };
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  generationId?: string;
  error?: string;
  metadata: {
    generatedAt: string;
    originalPrompt: string;
    enhancedPrompt?: string;
    generator: string;
    style: string;
    type: string;
    dimensions: { width: number; height: number };
    optimizations: string[];
    processingTime?: number;
    quality: 'standard' | 'high' | 'premium';
  };
}

export interface LearnedStyle {
  id: string;
  prompt: string;
  style: string;
  mood: string;
  colors: any;
  character: string;
  composition: string;
  score: number;
}

// ========== LEARNED STYLES SYSTEM ==========
export class StyleLearningSystem {
  private supabase: any;
  private learnedStyles: Map<string, LearnedStyle> = new Map();
  private cacheTimeout: number = 30 * 60 * 1000; // 30 minutes
  private lastCacheUpdate: number = 0;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Загрузка примеров из Supabase с улучшенным кешированием
   */
  async loadLearnedStyles(): Promise<Map<string, LearnedStyle>> {
    const now = Date.now();
    
    if (this.learnedStyles.size > 0 && (now - this.lastCacheUpdate) < this.cacheTimeout) {
      console.log('📊 Using cached learned styles');
      return this.learnedStyles;
    }

    try {
      console.log('📚 Loading learned styles from Supabase...');
      
      // Загружаем из базы данных
      const { data: stylesData, error } = await this.supabase
        .from('learned_styles')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (stylesData && !error) {
        stylesData.forEach((style: any) => {
          this.learnedStyles.set(style.id, style);
        });
        console.log(`✅ Loaded ${stylesData.length} styles from database`);
      }

      // Дополнительно загружаем из storage (примеры poster-001 до poster-020)
      await this.loadStorageExamples();
      
      this.lastCacheUpdate = now;
      console.log(`📊 Total learned styles: ${this.learnedStyles.size}`);
      
      return this.learnedStyles;
      
    } catch (error) {
      console.error('❌ Error loading learned styles:', error);
      return this.learnedStyles;
    }
  }

  /**
   * Загрузка примеров из storage
   */
  private async loadStorageExamples(): Promise<void> {
    try {
      for (let i = 1; i <= 20; i++) {
        const posterId = `poster-${String(i).padStart(3, '0')}`;
        
        try {
          const { data, error } = await this.supabase.storage
            .from('ai-examples-json')
            .download(`${posterId}/metadata.json`);
          
          if (data && !error) {
            const metadata = JSON.parse(await data.text());
            const style: LearnedStyle = {
              id: posterId,
              prompt: metadata.description || '',
              style: metadata.background?.style || '',
              mood: metadata.background?.mood || '',
              colors: metadata.background?.colors || {},
              character: metadata.character || '',
              composition: metadata.composition || '',
              score: metadata.score || 8.0
            };
            
            this.learnedStyles.set(posterId, style);
          }
        } catch (e) {
          console.warn(`⚠️ Failed to load ${posterId}:`, e.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error loading storage examples:', error);
    }
  }

  /**
   * Поиск наиболее подходящего стиля
   */
  findBestMatchingStyle(prompt: string, type: string = 'poster'): LearnedStyle | null {
    const styles = Array.from(this.learnedStyles.values());
    if (styles.length === 0) return null;

    const lowerPrompt = prompt.toLowerCase();
    let bestMatch: LearnedStyle | null = null;
    let bestScore = 0;

    styles.forEach(style => {
      let score = 0;

      // Проверяем совпадение персонажа (высокий приоритет)
      if (style.character && lowerPrompt.includes(style.character.toLowerCase())) {
        score += 15;
      }

      // Проверяем совпадение стиля
      if (style.style) {
        const styleWords = style.style.toLowerCase().split(' ');
        styleWords.forEach(word => {
          if (word.length > 3 && lowerPrompt.includes(word)) {
            score += 3;
          }
        });
      }

      // Проверяем настроение
      if (style.mood && lowerPrompt.includes(style.mood.toLowerCase())) {
        score += 5;
      }

      // Проверяем тип контента
      if (type === 'poster' && style.id.includes('poster')) {
        score += 2;
      }

      // Учитываем общий рейтинг стиля
      score += style.score * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = style;
      }
    });

    console.log(`🎯 Best matching style: ${bestMatch?.id} (score: ${bestScore})`);
    return bestScore > 5 ? bestMatch : null;
  }

  /**
   * Сохранение нового изученного стиля
   */
  async saveLearnedStyle(style: Omit<LearnedStyle, 'id'>): Promise<string> {
    try {
      const id = `learned_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullStyle: LearnedStyle = { ...style, id };

      const { error } = await this.supabase
        .from('learned_styles')
        .insert(fullStyle);

      if (!error) {
        this.learnedStyles.set(id, fullStyle);
        console.log(`✅ Saved new learned style: ${id}`);
      }

      return id;
    } catch (error) {
      console.error('❌ Error saving learned style:', error);
      throw error;
    }
  }
}

// ========== ADVANCED PROMPT ENHANCEMENT ==========
export class AdvancedPromptEnhancer {
  private promptBuilder: any;
  private styleLearning: StyleLearningSystem;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.promptBuilder = createPromptBuilder();
    this.styleLearning = new StyleLearningSystem(supabaseUrl, supabaseKey);
  }

  /**
   * Улучшение промпта с использованием изученных стилей
   */
  async enhancePrompt(
    request: ImageGenerationRequest
  ): Promise<{ enhanced: string; optimizations: string[] }> {
    console.log('🎨 Enhancing prompt with advanced techniques...');
    
    const optimizations: string[] = [];
    let enhanced = request.prompt;

    // 1. Применяем изученные стили
    if (request.options?.learnFromExamples) {
      await this.styleLearning.loadLearnedStyles();
      const matchedStyle = this.styleLearning.findBestMatchingStyle(request.prompt, request.type);
      
      if (matchedStyle) {
        enhanced = this.applyLearnedStyle(enhanced, matchedStyle);
        optimizations.push(`Applied learned style: ${matchedStyle.id}`);
      }
    }

    // 2. Оптимизация под тип изображения
    enhanced = this.optimizeForImageType(enhanced, request.type || 'background');
    optimizations.push(`Optimized for type: ${request.type}`);

    // 3. Стилистические улучшения
    enhanced = this.applyStyleEnhancements(enhanced, request.style || 'vector');
    optimizations.push(`Applied style: ${request.style}`);

    // 4. Оптимизация под генератор
    enhanced = this.optimizeForGenerator(enhanced, request.generator);
    optimizations.push(`Optimized for: ${request.generator}`);

    // 5. Качественные модификаторы
    if (request.options?.highQuality) {
      enhanced = this.addQualityModifiers(enhanced, request.generator);
      optimizations.push('Added quality modifiers');
    }

    // 6. Оптимизация под кошелек
    if (request.options?.optimizeForWallet) {
      enhanced = this.optimizeForWallet(enhanced);
      optimizations.push('Optimized for wallet interface');
    }

    console.log('✨ Enhanced prompt:', enhanced);
    console.log('🔧 Applied optimizations:', optimizations);

    return { enhanced, optimizations };
  }

  private applyLearnedStyle(prompt: string, style: LearnedStyle): string {
    let enhanced = prompt;

    if (style.style) {
      enhanced += `, ${style.style}`;
    }

    if (style.mood) {
      enhanced += `, ${style.mood} mood`;
    }

    if (style.colors && typeof style.colors === 'object') {
      const colorDesc = Object.entries(style.colors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      enhanced += `, color scheme: ${colorDesc}`;
    }

    if (style.composition) {
      enhanced += `, ${style.composition}`;
    }

    return enhanced;
  }

  private optimizeForImageType(prompt: string, type: string): string {
    const typeOptimizations = {
      'background': 'seamless background pattern, tileable design, suitable for UI background',
      'avatar': 'profile picture style, centered composition, clear subject focus, portrait orientation',
      'banner': 'wide banner format, horizontal composition, eye-catching design, marketing style',
      'nft': 'NFT artwork style, unique collectible design, high artistic value, premium quality',
      'icon': 'simple icon design, minimalist style, clear symbols, scalable vector graphics',
      'wallpaper': 'desktop wallpaper style, high resolution, immersive design, panoramic view'
    };

    return `${prompt}, ${typeOptimizations[type] || typeOptimizations.background}`;
  }

  private applyStyleEnhancements(prompt: string, style: string): string {
    const styleEnhancements = {
      'vector': 'vector art style, clean lines, bold colors, geometric shapes, scalable design',
      'realistic': 'photorealistic style, detailed textures, natural lighting, high definition',
      'cartoon': 'cartoon illustration style, exaggerated features, vibrant colors, playful design',
      'poster': 'poster art style, bold typography, striking composition, commercial design',
      'cyberpunk': 'cyberpunk aesthetic, neon colors, futuristic elements, high-tech design',
      'minimal': 'minimalist design, clean composition, subtle colors, elegant simplicity'
    };

    return `${prompt}, ${styleEnhancements[style] || styleEnhancements.vector}`;
  }

  private optimizeForGenerator(prompt: string, generator: 'leonardo' | 'replicate'): string {
    if (generator === 'leonardo') {
      return `${prompt}, professional digital art, high quality rendering, detailed illustration, masterpiece quality`;
    } else {
      return `${prompt}, flux model optimized, high fidelity generation, detailed artwork`;
    }
  }

  private addQualityModifiers(prompt: string, generator: string): string {
    const qualityModifiers = generator === 'leonardo' 
      ? '8k resolution, ultra detailed, professional quality, trending on artstation, award winning'
      : 'high quality, detailed, professional artwork, sharp focus, vibrant colors';
    
    return `${prompt}, ${qualityModifiers}`;
  }

  private optimizeForWallet(prompt: string): string {
    return `${prompt}, suitable for wallet interface, UI/UX optimized, clean design, user-friendly, professional appearance`;
  }
}

// ========== LEONARDO.AI ENHANCED INTEGRATION ==========
export class LeonardoGenerator {
  private supabase: any;
  private storageManager: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.storageManager = createStorageManager(supabaseUrl, supabaseKey);
  }

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    console.log('🎨 Leonardo.ai generation with enhanced features...');

    try {
      const leonardoApiKey = Deno.env.get('LEONARDO_API_KEY');
      if (!leonardoApiKey) {
        throw new Error('Leonardo API key not configured');
      }

      // Enhance prompt if requested
      const enhancer = new AdvancedPromptEnhancer('', '');
      const { enhanced: enhancedPrompt, optimizations } = request.options?.enhancePrompt 
        ? await enhancer.enhancePrompt(request)
        : { enhanced: request.prompt, optimizations: [] };

      // Prepare generation request with correct parameters
      const requestBody = this.buildLeonardoRequest(request, enhancedPrompt);
      
      console.log('📤 Calling Leonardo.ai API with optimized parameters...');
      console.log('🎯 Enhanced prompt:', enhancedPrompt);

      // Step 1: Create generation
      const generationResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${leonardoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!generationResponse.ok) {
        const errorText = await generationResponse.text();
        console.error('❌ Leonardo API error:', errorText);
        throw new Error(`Leonardo API error (${generationResponse.status}): ${errorText}`);
      }

      const generationData = await generationResponse.json();
      const generationId = generationData.sdGenerationJob?.generationId;
      
      if (!generationId) {
        throw new Error('Failed to get generation ID from Leonardo API');
      }

      console.log('🔄 Generation started, ID:', generationId);

      // Step 2: Enhanced polling with exponential backoff
      const imageUrl = await this.pollForCompletion(generationId, leonardoApiKey);
      
      const processingTime = Date.now() - startTime;

      // Step 3: Save to database if successful
      await this.storageManager.saveGeneratedImage(
        imageUrl,
        enhancedPrompt,
        'leonardo',
        {
          originalPrompt: request.prompt,
          style: request.style,
          type: request.type,
          dimensions: request.dimensions,
          optimizations,
          processingTime,
          generationId
        }
      );

      const result: ImageGenerationResult = {
        success: true,
        imageUrl,
        generationId,
        metadata: {
          generatedAt: new Date().toISOString(),
          originalPrompt: request.prompt,
          enhancedPrompt,
          generator: 'leonardo',
          style: request.style || 'vector',
          type: request.type || 'background',
          dimensions: request.dimensions || { width: 1024, height: 1024 },
          optimizations,
          processingTime,
          quality: request.options?.highQuality ? 'premium' : 'high'
        }
      };

      console.log('🎉 Leonardo.ai generation completed successfully!');
      return result;

    } catch (error) {
      console.error('💥 Leonardo generation error:', error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          generatedAt: new Date().toISOString(),
          originalPrompt: request.prompt,
          generator: 'leonardo',
          style: request.style || 'vector',
          type: request.type || 'background',
          dimensions: request.dimensions || { width: 1024, height: 1024 },
          optimizations: [],
          quality: 'standard'
        }
      };
    }
  }

  private buildLeonardoRequest(request: ImageGenerationRequest, enhancedPrompt: string): any {
    const dimensions = request.dimensions || { width: 1024, height: 1024 };
    
    const requestBody: any = {
      alchemy: true,
      height: dimensions.height,
      modelId: this.selectOptimalModel(request),
      num_images: 1,
      presetStyle: this.selectPresetStyle(request.style),
      prompt: enhancedPrompt,
      width: dimensions.width,
      public: false
    };

    // Add optional parameters based on request
    if (request.options?.highQuality) {
      requestBody.photoReal = true;
      requestBody.photoRealVersion = "v2";
    }

    if (request.style === 'realistic') {
      requestBody.modelId = "1e60896f-3c26-4296-8ecc-53e2afecc132"; // Leonardo Diffusion XL
    }

    return requestBody;
  }

  private selectOptimalModel(request: ImageGenerationRequest): string {
    const models = {
      'vector': "6ac8733c-de4d-4726-9c09-5c682cb35c44", // Leonardo Creative
      'realistic': "1e60896f-3c26-4296-8ecc-53e2afecc132", // Leonardo Diffusion XL
      'cartoon': "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Leonardo Kino XL
      'poster': "6ac8733c-de4d-4726-9c09-5c682cb35c44", // Leonardo Creative
      'cyberpunk': "291be633-cb24-434f-898f-e662799936ad", // Leonardo Select
      'minimal': "6ac8733c-de4d-4726-9c09-5c682cb35c44"  // Leonardo Creative
    };

    return models[request.style || 'vector'] || models.vector;
  }

  private selectPresetStyle(style?: string): string {
    const presets = {
      'vector': 'ILLUSTRATION',
      'realistic': 'CINEMATIC',
      'cartoon': 'ANIME',
      'poster': 'DYNAMIC',
      'cyberpunk': 'FUTURISTIC',
      'minimal': 'MINIMALISTIC'
    };

    return presets[style || 'vector'] || 'DYNAMIC';
  }

  private async pollForCompletion(generationId: string, apiKey: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max
    
    while (attempts < maxAttempts) {
      const delay = this.calculateDelay(attempts);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`⏳ Checking status... (${attempts + 1}/${maxAttempts})`);
      
      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      
      if (!statusResponse.ok) {
        console.warn('⚠️ Status check failed, retrying...');
        attempts++;
        continue;
      }
      
      const statusData = await statusResponse.json();
      const generation = statusData.generations_by_pk;
      
      if (!generation) {
        attempts++;
        continue;
      }
      
      console.log(`📊 Status: ${generation.status}`);
      
      if (generation.status === 'COMPLETE') {
        if (generation.generated_images?.[0]?.url) {
          return generation.generated_images[0].url;
        } else {
          throw new Error('No images in completed generation');
        }
      } else if (generation.status === 'FAILED') {
        throw new Error(`Generation failed: ${generation.failureReason || 'Unknown error'}`);
      }
      
      attempts++;
    }
    
    throw new Error('Generation timeout - took too long to complete');
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 3000; // 3 seconds
    const maxDelay = 15000; // 15 seconds max
    const exponential = Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay);
    const jitter = Math.random() * 1000; // Add up to 1 second jitter
    return exponential + jitter;
  }
}

// ========== REPLICATE ENHANCED INTEGRATION ==========
export class ReplicateGenerator {
  private supabase: any;
  private storageManager: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.storageManager = createStorageManager(supabaseUrl, supabaseKey);
  }

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    const startTime = Date.now();
    console.log('🎨 Replicate generation with enhanced features...');

    try {
      const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
      if (!replicateApiKey) {
        throw new Error('Replicate API key not configured');
      }

      // Enhance prompt if requested
      const enhancer = new AdvancedPromptEnhancer('', '');
      const { enhanced: enhancedPrompt, optimizations } = request.options?.enhancePrompt 
        ? await enhancer.enhancePrompt(request)
        : { enhanced: request.prompt, optimizations: [] };

      console.log('📤 Calling Replicate API with optimized parameters...');
      console.log('🎯 Enhanced prompt:', enhancedPrompt);

      const input = this.buildReplicateInput(request, enhancedPrompt);
      
      // Create prediction
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: this.selectOptimalModel(request),
          input
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${errorData.detail || response.statusText}`);
      }

      const prediction = await response.json();
      console.log('🔄 Prediction started, ID:', prediction.id);

      // Wait for completion with enhanced polling
      const imageUrl = await this.pollForCompletion(prediction.id, replicateApiKey);
      
      const processingTime = Date.now() - startTime;

      // Save to database
      await this.storageManager.saveGeneratedImage(
        imageUrl,
        enhancedPrompt,
        'replicate',
        {
          originalPrompt: request.prompt,
          style: request.style,
          type: request.type,
          dimensions: request.dimensions,
          optimizations,
          processingTime,
          predictionId: prediction.id
        }
      );

      const result: ImageGenerationResult = {
        success: true,
        imageUrl,
        generationId: prediction.id,
        metadata: {
          generatedAt: new Date().toISOString(),
          originalPrompt: request.prompt,
          enhancedPrompt,
          generator: 'replicate',
          style: request.style || 'vector',
          type: request.type || 'background',
          dimensions: request.dimensions || { width: 1024, height: 1024 },
          optimizations,
          processingTime,
          quality: request.options?.highQuality ? 'premium' : 'high'
        }
      };

      console.log('🎉 Replicate generation completed successfully!');
      return result;

    } catch (error) {
      console.error('💥 Replicate generation error:', error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          generatedAt: new Date().toISOString(),
          originalPrompt: request.prompt,
          generator: 'replicate',
          style: request.style || 'vector',
          type: request.type || 'background',
          dimensions: request.dimensions || { width: 1024, height: 1024 },
          optimizations: [],
          quality: 'standard'
        }
      };
    }
  }

  private buildReplicateInput(request: ImageGenerationRequest, enhancedPrompt: string): any {
    const dimensions = request.dimensions || { width: 1024, height: 1024 };
    
    const input: any = {
      prompt: enhancedPrompt,
      width: dimensions.width,
      height: dimensions.height,
      num_outputs: 1,
      aspect_ratio: request.options?.aspectRatio || "1:1",
      output_format: "webp",
      output_quality: request.options?.highQuality ? 95 : 80
    };

    // Model-specific parameters
    const model = this.selectOptimalModel(request);
    
    if (model.includes('flux')) {
      input.go_fast = !request.options?.highQuality;
      input.megapixels = request.options?.highQuality ? "2" : "1";
      input.num_inference_steps = request.options?.highQuality ? 8 : 4;
    } else if (model.includes('sdxl')) {
      input.guidance_scale = 7.5;
      input.num_inference_steps = request.options?.highQuality ? 50 : 30;
      input.scheduler = "K_EULER";
    }

    return input;
  }

  private selectOptimalModel(request: ImageGenerationRequest): string {
    const models = {
      'vector': "black-forest-labs/flux-schnell",
      'realistic': "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      'cartoon': "black-forest-labs/flux-schnell",
      'poster': "black-forest-labs/flux-dev",
      'cyberpunk': "black-forest-labs/flux-dev",
      'minimal': "black-forest-labs/flux-schnell"
    };

    return models[request.style || 'vector'] || models.vector;
  }

  private async pollForCompletion(predictionId: string, apiKey: string): Promise<string> {
    let attempts = 0;
    const maxAttempts = 120;
    
    while (attempts < maxAttempts) {
      const delay = Math.min(2000 + (attempts * 1000), 10000); // 2-10 seconds
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`⏳ Checking status... (${attempts + 1}/${maxAttempts})`);
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        }
      });
      
      if (!statusResponse.ok) {
        console.warn('⚠️ Status check failed, retrying...');
        attempts++;
        continue;
      }
      
      const prediction = await statusResponse.json();
      console.log(`📊 Status: ${prediction.status}`);
      
      if (prediction.status === 'succeeded') {
        const imageUrl = prediction.output?.[0];
        if (!imageUrl) {
          throw new Error('No image URL in prediction output');
        }
        return imageUrl;
      } else if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
      } else if (prediction.status === 'canceled') {
        throw new Error('Prediction was canceled');
      }
      
      attempts++;
    }
    
    throw new Error('Prediction timeout - took too long to complete');
  }
}

// ========== MAIN GENERATOR FUNCTIONS ==========

export async function generateImageWithLeonardo(
  prompt: string, 
  supabase: any, 
  options: Partial<ImageGenerationRequest> = {}
): Promise<ImageGenerationResult> {
  const generator = new LeonardoGenerator('', '');
  
  const request: ImageGenerationRequest = {
    prompt,
    generator: 'leonardo',
    style: options.style || 'vector',
    type: options.type || 'background',
    dimensions: options.dimensions || { width: 1024, height: 1024 },
    options: {
      enhancePrompt: true,
      learnFromExamples: true,
      optimizeForWallet: true,
      highQuality: false,
      ...options.options
    }
  };

  return await generator.generate(request);
}

export async function generateImageWithReplicate(
  prompt: string, 
  supabase: any, 
  options: Partial<ImageGenerationRequest> = {}
): Promise<ImageGenerationResult> {
  const generator = new ReplicateGenerator('', '');
  
  const request: ImageGenerationRequest = {
    prompt,
    generator: 'replicate',
    style: options.style || 'vector',
    type: options.type || 'background',
    dimensions: options.dimensions || { width: 1024, height: 1024 },
    options: {
      enhancePrompt: true,
      learnFromExamples: true,
      optimizeForWallet: true,
      highQuality: false,
      ...options.options
    }
  };

  return await generator.generate(request);
}

// ========== UNIFIED IMAGE GENERATION MANAGER ==========
export class ImageGenerationManager {
  private leonardoGenerator: LeonardoGenerator;
  private replicateGenerator: ReplicateGenerator;
  private styleLearning: StyleLearningSystem;
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.leonardoGenerator = new LeonardoGenerator(supabaseUrl, supabaseKey);
    this.replicateGenerator = new ReplicateGenerator(supabaseUrl, supabaseKey);
    this.styleLearning = new StyleLearningSystem(supabaseUrl, supabaseKey);
  }

  /**
   * Генерация изображения с автоматическим выбором лучшего генератора
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    console.log('🎨 Starting unified image generation...');
    
    try {
      // Выбираем оптимальный генератор для запроса
      const optimalGenerator = this.selectOptimalGenerator(request);
      console.log(`🎯 Selected generator: ${optimalGenerator}`);
      
      // Обновляем запрос с выбранным генератором
      const updatedRequest = { ...request, generator: optimalGenerator };
      
      // Генерируем изображение
      let result: ImageGenerationResult;
      
      if (optimalGenerator === 'leonardo') {
        result = await this.leonardoGenerator.generate(updatedRequest);
      } else {
        result = await this.replicateGenerator.generate(updatedRequest);
      }
      
      // Если основной генератор не сработал, пробуем альтернативный
      if (!result.success && request.generator !== optimalGenerator) {
        console.log('⚠️ Primary generator failed, trying fallback...');
        
        const fallbackGenerator = optimalGenerator === 'leonardo' ? 'replicate' : 'leonardo';
        const fallbackRequest = { ...request, generator: fallbackGenerator };
        
        if (fallbackGenerator === 'leonardo') {
          result = await this.leonardoGenerator.generate(fallbackRequest);
        } else {
          result = await this.replicateGenerator.generate(fallbackRequest);
        }
        
        if (result.success) {
          result.metadata.optimizations.push('Used fallback generator');
        }
      }
      
      // Сохраняем результат для обучения системы
      if (result.success) {
        await this.saveGenerationForLearning(request, result);
      }
      
      return result;
      
    } catch (error) {
      console.error('💥 Image generation manager error:', error);
      
      return {
        success: false,
        error: error.message,
        metadata: {
          generatedAt: new Date().toISOString(),
          originalPrompt: request.prompt,
          generator: request.generator,
          style: request.style || 'vector',
          type: request.type || 'background',
          dimensions: request.dimensions || { width: 1024, height: 1024 },
          optimizations: [],
          quality: 'standard'
        }
      };
    }
  }

  /**
   * Массовая генерация изображений
   */
  async generateBatch(
    requests: ImageGenerationRequest[]
  ): Promise<ImageGenerationResult[]> {
    console.log(`🔄 Starting batch generation of ${requests.length} images...`);
    
    const results: ImageGenerationResult[] = [];
    
    // Генерируем по одному для контроля ресурсов
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      console.log(`📸 Generating image ${i + 1}/${requests.length}...`);
      
      try {
        const result = await this.generateImage(request);
        results.push(result);
        
        // Небольшая пауза между генерациями
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to generate image ${i + 1}:`, error);
        results.push({
          success: false,
          error: error.message,
          metadata: {
            generatedAt: new Date().toISOString(),
            originalPrompt: request.prompt,
            generator: request.generator,
            style: request.style || 'vector',
            type: request.type || 'background',
            dimensions: request.dimensions || { width: 1024, height: 1024 },
            optimizations: [],
            quality: 'standard'
          }
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Batch completed: ${successCount}/${requests.length} successful`);
    
    return results;
  }

  /**
   * Выбор оптимального генератора для запроса
   */
  private selectOptimalGenerator(request: ImageGenerationRequest): 'leonardo' | 'replicate' {
    // Если генератор явно указан, используем его
    if (request.generator) {
      return request.generator;
    }
    
    // Логика выбора на основе типа и стиля
    const preferences = {
      // Leonardo лучше для детализированных изображений
      leonardo: ['realistic', 'poster', 'nft'],
      // Replicate быстрее для простых стилей
      replicate: ['vector', 'cartoon', 'minimal', 'cyberpunk']
    };
    
    if (preferences.leonardo.includes(request.style || '')) {
      return 'leonardo';
    }
    
    if (preferences.replicate.includes(request.style || '')) {
      return 'replicate';
    }
    
    // По умолчанию Leonardo для высокого качества
    return request.options?.highQuality ? 'leonardo' : 'replicate';
  }

  /**
   * Сохранение результата для обучения системы
   */
  private async saveGenerationForLearning(
    request: ImageGenerationRequest,
    result: ImageGenerationResult
  ): Promise<void> {
    try {
      if (!result.success || !result.imageUrl) return;
      
      // Создаем запись для обучения
      const learnedStyle = {
        prompt: result.metadata.enhancedPrompt || request.prompt,
        style: request.style || 'vector',
        mood: this.extractMoodFromPrompt(request.prompt),
        colors: this.extractColorsFromPrompt(request.prompt),
        character: this.extractCharacterFromPrompt(request.prompt),
        composition: this.extractCompositionFromPrompt(request.prompt),
        score: this.calculateQualityScore(result)
      };
      
      await this.styleLearning.saveLearnedStyle(learnedStyle);
      
    } catch (error) {
      console.warn('⚠️ Failed to save for learning:', error);
    }
  }

  private extractMoodFromPrompt(prompt: string): string {
    const moodKeywords = {
      'heroic': ['hero', 'powerful', 'strong', 'mighty'],
      'elegant': ['elegant', 'sophisticated', 'refined'],
      'playful': ['fun', 'playful', 'colorful', 'bright'],
      'serious': ['serious', 'formal', 'professional'],
      'mysterious': ['dark', 'mysterious', 'shadow']
    };
    
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return mood;
      }
    }
    
    return 'neutral';
  }

  private extractColorsFromPrompt(prompt: string): any {
    const colorMatches = prompt.match(/#[0-9a-fA-F]{6}|red|blue|green|yellow|purple|orange|pink|black|white|gold|silver/gi);
    
    if (colorMatches) {
      return {
        primary: colorMatches[0],
        secondary: colorMatches[1] || colorMatches[0],
        accent: colorMatches[2] || colorMatches[0]
      };
    }
    
    return {};
  }

  private extractCharacterFromPrompt(prompt: string): string {
    const characters = ['trump', 'superman', 'batman', 'messi', 'terminator', 'spiderman'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const character of characters) {
      if (lowerPrompt.includes(character)) {
        return character;
      }
    }
    
    return '';
  }

  private extractCompositionFromPrompt(prompt: string): string {
    const compositions = {
      'centered': ['center', 'centered', 'middle'],
      'dynamic': ['dynamic', 'action', 'movement'],
      'portrait': ['portrait', 'face', 'headshot'],
      'landscape': ['landscape', 'wide', 'panoramic']
    };
    
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [comp, keywords] of Object.entries(compositions)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return comp;
      }
    }
    
    return 'balanced';
  }

  private calculateQualityScore(result: ImageGenerationResult): number {
    let score = 7.0; // Base score
    
    // Добавляем баллы за успешную генерацию
    if (result.success) score += 1.0;
    
    // Учитываем время обработки
    if (result.metadata.processingTime && result.metadata.processingTime < 60000) {
      score += 0.5; // Быстрая генерация
    }
    
    // Учитываем качество
    if (result.metadata.quality === 'premium') score += 1.0;
    else if (result.metadata.quality === 'high') score += 0.5;
    
    // Учитываем количество оптимизаций
    if (result.metadata.optimizations.length > 3) score += 0.5;
    
    return Math.min(score, 10.0);
  }

  /**
   * Получение статистики генераций
   */
  async getGenerationStats(): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('generated_images')
        .select('model, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        leonardo: data?.filter(item => item.model === 'leonardo').length || 0,
        replicate: data?.filter(item => item.model === 'replicate').length || 0,
        lastWeek: data?.length || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Error getting generation stats:', error);
      return { total: 0, leonardo: 0, replicate: 0, lastWeek: 0 };
    }
  }
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Создание CSS для оптимизации слоев
 */
export function getLayerOptimizationCSS(generator: string, layerId: string): string {
  const baseCSS = `
    .wallet-layer-${layerId} {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
    }
  `;

  if (generator === 'replicate') {
    return baseCSS + `
      .wallet-layer-${layerId} img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }
    `;
  } else {
    return baseCSS + `
      .wallet-layer-${layerId} {
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: local;
      }
    `;
  }
}

/**
 * Валидация запроса на генерацию
 */
export function validateGenerationRequest(request: ImageGenerationRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!request.prompt || request.prompt.trim().length === 0) {
    errors.push('Prompt is required and cannot be empty');
  }

  if (request.prompt && request.prompt.length > 2000) {
    errors.push('Prompt is too long (max 2000 characters)');
  }

  if (request.dimensions) {
    if (request.dimensions.width < 256 || request.dimensions.width > 2048) {
      errors.push('Width must be between 256 and 2048 pixels');
    }
    if (request.dimensions.height < 256 || request.dimensions.height > 2048) {
      errors.push('Height must be between 256 and 2048 pixels');
    }
  }

  const validStyles = ['vector', 'realistic', 'cartoon', 'poster', 'nft', 'cyberpunk', 'minimal'];
  if (request.style && !validStyles.includes(request.style)) {
    errors.push(`Invalid style. Must be one of: ${validStyles.join(', ')}`);
  }

  const validTypes = ['background', 'avatar', 'banner', 'nft', 'icon', 'wallpaper'];
  if (request.type && !validTypes.includes(request.type)) {
    errors.push(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  const validGenerators = ['leonardo', 'replicate'];
  if (!validGenerators.includes(request.generator)) {
    errors.push(`Invalid generator. Must be one of: ${validGenerators.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Создание предустановленных запросов для тестирования
 */
export const PRESET_GENERATION_REQUESTS: { [key: string]: ImageGenerationRequest } = {
  'crypto_hero': {
    prompt: 'Cryptocurrency superhero with bitcoin logo, powerful pose, digital art style',
    style: 'poster',
    type: 'avatar',
    generator: 'leonardo',
    dimensions: { width: 1024, height: 1024 },
    options: {
      enhancePrompt: true,
      learnFromExamples: true,
      optimizeForWallet: true,
      highQuality: true
    }
  },
  
  'neon_background': {
    prompt: 'Futuristic neon grid background, cyberpunk aesthetic, dark theme',
    style: 'cyberpunk',
    type: 'background',
    generator: 'replicate',
    dimensions: { width: 1920, height: 1080 },
    options: {
      enhancePrompt: true,
      optimizeForWallet: true,
      aspectRatio: '16:9'
    }
  },
  
  'minimal_icon': {
    prompt: 'Clean geometric wallet icon, minimalist design, professional',
    style: 'minimal',
    type: 'icon',
    generator: 'leonardo',
    dimensions: { width: 512, height: 512 },
    options: {
      enhancePrompt: true,
      optimizeForWallet: true
    }
  },
  
  'nft_artwork': {
    prompt: 'Unique digital collectible art piece, abstract composition, vibrant colors',
    style: 'nft',
    type: 'nft',
    generator: 'leonardo',
    dimensions: { width: 1080, height: 1080 },
    options: {
      enhancePrompt: true,
      learnFromExamples: true,
      highQuality: true
    }
  }
};

// ========== FACTORY FUNCTIONS ==========

export function createImageGenerationManager(supabaseUrl: string, supabaseKey: string) {
  return new ImageGenerationManager(supabaseUrl, supabaseKey);
}

export function createLeonardoGenerator(supabaseUrl: string, supabaseKey: string) {
  return new LeonardoGenerator(supabaseUrl, supabaseKey);
}

export function createReplicateGenerator(supabaseUrl: string, supabaseKey: string) {
  return new ReplicateGenerator(supabaseUrl, supabaseKey);
}

export function createStyleLearningSystem(supabaseUrl: string, supabaseKey: string) {
  return new StyleLearningSystem(supabaseUrl, supabaseKey);
}
