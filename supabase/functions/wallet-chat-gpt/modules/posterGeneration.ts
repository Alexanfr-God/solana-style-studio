// ====== Enhanced modules/posterGeneration.ts ======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createImageGenerationManager, type ImageGenerationRequest } from './imageGenerator.ts';
import { createStyleAnalyzer, type StyleAnalysis } from './styleAnalyzer.ts';
import { createStorageManager } from '../utils/storage-manager.ts';
import { createPromptBuilder } from '../utils/prompt-builder.ts';
import { JSONParser } from '../utils/json-parser.ts';

export interface PosterConfig {
  type: 'nft' | 'social' | 'banner' | 'avatar' | 'wallpaper' | 'trading_card' | 'profile_header';
  dimensions: { width: number; height: number };
  style: 'superhero' | 'political' | 'sports' | 'cartoon' | 'cyberpunk' | 'minimal' | 'retro' | 'professional';
  elements: PosterElement[];
  colors: string[];
  text?: PosterText;
  character?: string;
  mood: 'powerful' | 'playful' | 'serious' | 'epic' | 'elegant' | 'aggressive' | 'calming';
  composition: 'centered' | 'rule_of_thirds' | 'dynamic' | 'portrait' | 'landscape';
  quality: 'standard' | 'high' | 'premium';
}

export interface PosterElement {
  type: 'character' | 'background' | 'effects' | 'text' | 'logo' | 'pattern';
  content: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'background';
  importance: 'primary' | 'secondary' | 'accent';
}

export interface PosterText {
  main?: string;
  subtitle?: string;
  tagline?: string;
  position: 'top' | 'bottom' | 'overlay' | 'side';
  style: 'bold' | 'elegant' | 'modern' | 'retro';
}

export interface PosterResult {
  success: boolean;
  imageUrl?: string;
  config: PosterConfig;
  metadata: {
    generatedAt: string;
    generator: string;
    style: string;
    dimensions: { width: number; height: number };
    processingTime: number;
    enhancedPrompt: string;
    reasoning: string[];
    optimizations: string[];
  };
  error?: string;
}

// ========== ADVANCED COT (Chain of Thought) SYSTEM ==========
export class COTReasoningEngine {
  private reasoningSteps: Map<string, string[]> = new Map();

  constructor() {
    this.initializeReasoningTemplates();
  }

  /**
   * Применение цепочки рассуждений для постера
   */
  applyChainOfThought(config: PosterConfig, userRequest: string): {
    reasoning: string[];
    insights: any;
    optimizations: string[];
  } {
    console.log('🧠 Applying Chain of Thought reasoning...');
    
    const reasoning: string[] = [];
    const insights: any = {};
    const optimizations: string[] = [];

    // Step 1: Understand Request
    const requestAnalysis = this.analyzeRequest(userRequest, config);
    reasoning.push(`REQUEST ANALYSIS: ${requestAnalysis.summary}`);
    insights.requestAnalysis = requestAnalysis;

    // Step 2: Style & Composition Planning
    const styleAnalysis = this.analyzeStyleRequirements(config);
    reasoning.push(`STYLE PLANNING: ${styleAnalysis.summary}`);
    insights.styleAnalysis = styleAnalysis;

    // Step 3: Technical Requirements
    const technicalAnalysis = this.analyzeTechnicalRequirements(config);
    reasoning.push(`TECHNICAL REQUIREMENTS: ${technicalAnalysis.summary}`);
    insights.technicalAnalysis = technicalAnalysis;

    // Step 4: Optimization Opportunities
    const optimizationAnalysis = this.identifyOptimizations(config, insights);
    reasoning.push(`OPTIMIZATIONS: ${optimizationAnalysis.summary}`);
    optimizations.push(...optimizationAnalysis.optimizations);

    console.log('✅ COT reasoning completed with', reasoning.length, 'steps');
    return { reasoning, insights, optimizations };
  }

  private analyzeRequest(request: string, config: PosterConfig): any {
    const character = this.extractCharacter(request);
    const emotion = this.extractEmotion(request);
    const context = this.extractContext(request);

    return {
      summary: `Creating ${config.type} poster featuring ${character || 'character'} with ${emotion} emotion in ${context} context`,
      character,
      emotion,
      context,
      complexity: request.length > 50 ? 'complex' : 'simple'
    };
  }

  private analyzeStyleRequirements(config: PosterConfig): any {
    const template = POSTER_STYLE_TEMPLATES[config.style] || POSTER_STYLE_TEMPLATES.cartoon;
    
    return {
      summary: `Using ${config.style} template with ${config.composition} composition and ${config.mood} mood`,
      template,
      colorHarmony: this.analyzeColorHarmony(config.colors),
      visualHierarchy: this.planVisualHierarchy(config.elements)
    };
  }

  private analyzeTechnicalRequirements(config: PosterConfig): any {
    const aspectRatio = config.dimensions.width / config.dimensions.height;
    const pixelDensity = config.dimensions.width * config.dimensions.height;
    
    return {
      summary: `${config.dimensions.width}x${config.dimensions.height} (${aspectRatio.toFixed(2)}:1) at ${config.quality} quality`,
      aspectRatio,
      pixelDensity,
      recommendedGenerator: pixelDensity > 1000000 ? 'leonardo' : 'replicate',
      qualitySettings: this.getQualitySettings(config.quality)
    };
  }

  private identifyOptimizations(config: PosterConfig, insights: any): any {
    const optimizations: string[] = [];
    
    // Character-specific optimizations
    if (insights.requestAnalysis.character) {
      optimizations.push('Character-specific pose and expression optimization');
    }

    // Style-specific optimizations
    if (config.style === 'cyberpunk' || config.style === 'retro') {
      optimizations.push('Enhanced color saturation and glow effects');
    }

    // Quality-specific optimizations
    if (config.quality === 'premium') {
      optimizations.push('Ultra-high detail rendering and professional finishing');
    }

    // Composition optimizations
    if (config.composition === 'dynamic') {
      optimizations.push('Dynamic angle and energy line enhancements');
    }

    return {
      summary: `Identified ${optimizations.length} optimization opportunities`,
      optimizations
    };
  }

  private extractCharacter(request: string): string | null {
    const characters = {
      'trump': 'Donald Trump',
      'superman': 'Superman',
      'batman': 'Batman',
      'messi': 'Lionel Messi',
      'ronaldo': 'Cristiano Ronaldo',
      'terminator': 'Terminator',
      'spiderman': 'Spider-Man'
    };

    const lowerRequest = request.toLowerCase();
    for (const [key, value] of Object.entries(characters)) {
      if (lowerRequest.includes(key)) {
        return value;
      }
    }
    
    return null;
  }

  private extractEmotion(request: string): string {
    const emotions = ['powerful', 'playful', 'serious', 'epic', 'elegant', 'aggressive', 'calming'];
    const lowerRequest = request.toLowerCase();
    
    for (const emotion of emotions) {
      if (lowerRequest.includes(emotion)) {
        return emotion;
      }
    }
    
    return 'confident';
  }

  private extractContext(request: string): string {
    const contexts = {
      'wallet': 'cryptocurrency wallet background',
      'nft': 'NFT marketplace showcase',
      'social': 'social media post',
      'gaming': 'gaming profile',
      'professional': 'business presentation'
    };

    const lowerRequest = request.toLowerCase();
    for (const [key, value] of Object.entries(contexts)) {
      if (lowerRequest.includes(key)) {
        return value;
      }
    }
    
    return 'general purpose';
  }

  private analyzeColorHarmony(colors: string[]): string {
    if (colors.length <= 2) return 'monochromatic';
    if (colors.length === 3) return 'triadic';
    return 'complex';
  }

  private planVisualHierarchy(elements: PosterElement[]): any {
    const primary = elements.filter(e => e.importance === 'primary');
    const secondary = elements.filter(e => e.importance === 'secondary');
    const accent = elements.filter(e => e.importance === 'accent');

    return {
      primary: primary.length,
      secondary: secondary.length,
      accent: accent.length,
      balance: primary.length === 1 ? 'focused' : 'distributed'
    };
  }

  private getQualitySettings(quality: string): any {
    const settings = {
      'standard': { resolution: '1024x1024', detail: 'normal', effects: 'basic' },
      'high': { resolution: '1536x1536', detail: 'high', effects: 'enhanced' },
      'premium': { resolution: '2048x2048', detail: 'ultra', effects: 'maximum' }
    };

    return settings[quality] || settings.standard;
  }

  private initializeReasoningTemplates(): void {
    // Pre-defined reasoning templates for different scenarios
    this.reasoningSteps.set('superhero', [
      'Analyze heroic pose requirements',
      'Plan dynamic composition with energy',
      'Design color scheme for impact',
      'Add atmospheric effects'
    ]);

    this.reasoningSteps.set('political', [
      'Consider dignified portrayal',
      'Plan patriotic elements',
      'Design formal composition',
      'Add authority indicators'
    ]);
  }
}

// ========== RUG (Rules, Understanding, Generation) DESIGN SYSTEM ==========
export class RUGDesignSystem {
  private designRules: Map<string, any> = new Map();

  constructor() {
    this.initializeDesignRules();
  }

  /**
   * Применение правил дизайна RUG
   */
  applyDesignRules(config: PosterConfig, insights: any): {
    rules: string[];
    enhancements: string[];
    constraints: string[];
  } {
    console.log('📏 Applying RUG design rules...');

    const rules: string[] = [];
    const enhancements: string[] = [];
    const constraints: string[] = [];

    // Character Rules
    const characterRules = this.getCharacterRules(config, insights);
    rules.push(...characterRules.rules);
    enhancements.push(...characterRules.enhancements);

    // Color Rules
    const colorRules = this.getColorRules(config);
    rules.push(...colorRules.rules);
    enhancements.push(...colorRules.enhancements);

    // Composition Rules
    const compositionRules = this.getCompositionRules(config);
    rules.push(...compositionRules.rules);
    constraints.push(...compositionRules.constraints);

    // Style-specific Rules
    const styleRules = this.getStyleSpecificRules(config);
    rules.push(...styleRules.rules);
    enhancements.push(...styleRules.enhancements);

    console.log('✅ Applied', rules.length, 'design rules');
    return { rules, enhancements, constraints };
  }

  private getCharacterRules(config: PosterConfig, insights: any): any {
    const rules = [
      'Bold, confident pose with strong silhouette',
      'Exaggerated features for visual impact',
      'Clean vector illustration style',
      'Strong facial expressions'
    ];

    const enhancements = [];
    
    if (insights.requestAnalysis?.character) {
      enhancements.push('Character-specific pose optimization');
      enhancements.push('Authentic facial features and expression');
    }

    if (config.mood === 'powerful') {
      enhancements.push('Dynamic power pose with chest out');
      enhancements.push('Low angle view for heroic effect');
    }

    return { rules, enhancements };
  }

  private getColorRules(config: PosterConfig): any {
    const rules = [
      'Maximum 4-5 main colors for clarity',
      'High contrast between character and background',
      'Bold, saturated colors for impact'
    ];

    const enhancements = [];
    
    if (config.colors.length > 0) {
      enhancements.push('Custom color palette integration');
      enhancements.push('Color harmony optimization');
    }

    if (config.style === 'cyberpunk') {
      enhancements.push('Neon color enhancement');
      enhancements.push('Glow and emission effects');
    }

    return { rules, enhancements };
  }

  private getCompositionRules(config: PosterConfig): any {
    const rules = [
      'Clear visual hierarchy',
      'Dynamic diagonal lines or radiating patterns',
      'Depth through layering'
    ];

    const constraints = [
      'Leave breathing room around edges',
      'Ensure scalability and crop flexibility',
      'Maintain character visibility at small sizes'
    ];

    return { rules, constraints };
  }

  private getStyleSpecificRules(config: PosterConfig): any {
    const styleRules = this.designRules.get(config.style) || this.designRules.get('default');
    
    return {
      rules: styleRules.rules || [],
      enhancements: styleRules.enhancements || []
    };
  }

  private initializeDesignRules(): void {
    this.designRules.set('superhero', {
      rules: [
        'Heroic pose with chest out',
        'Cape or flowing elements',
        'Power energy effects',
        'Bold primary colors'
      ],
      enhancements: [
        'Dynamic lighting effects',
        'Energy aura and speed lines',
        'Dramatic sky background'
      ]
    });

    this.designRules.set('cyberpunk', {
      rules: [
        'Neon color schemes',
        'Futuristic elements',
        'High tech background',
        'Glowing effects'
      ],
      enhancements: [
        'Digital glitch effects',
        'Holographic elements',
        'Circuit board patterns'
      ]
    });

    this.designRules.set('default', {
      rules: [
        'Clear visual focus',
        'Balanced composition',
        'Professional quality'
      ],
      enhancements: [
        'Enhanced detail work',
        'Professional finishing'
      ]
    });
  }
}

// ========== POSTER STYLE TEMPLATES ==========
const POSTER_STYLE_TEMPLATES = {
  superhero: {
    composition: "heroic pose with chest out, slight low angle view, dynamic stance",
    background: "radiating light beams, energy effects, dramatic sky, city skyline silhouette",
    colors: "bold primary colors (red, blue, gold), high contrast, vibrant saturation",
    effects: "speed lines, energy aura, dramatic lighting, lens flare, power emissions",
    mood: "powerful, inspiring, larger than life, heroic",
    technical: "vector illustration, bold outlines, cel shading, clean details"
  },
  
  political: {
    composition: "dignified portrait, formal pose, authoritative stance, flag elements",
    background: "flag motifs, stars, patriotic elements, formal backdrop",
    colors: "red white blue palette, gold accents, high saturation, professional tones",
    effects: "subtle glow, sharp shadows, professional lighting, dignified atmosphere",
    mood: "authoritative, patriotic, confident, presidential",
    technical: "realistic illustration, clean lines, professional finish"
  },
  
  sports: {
    composition: "victory pose, action moment, emotional expression, celebration stance",
    background: "stadium lights, crowd silhouette, team colors, sports venue",
    colors: "team colors, bright highlights, dynamic contrast, energetic palette",
    effects: "motion blur, light rays, confetti, energy trails, celebration effects",
    mood: "triumphant, energetic, celebratory, victorious",
    technical: "dynamic illustration, action lines, bold colors"
  },
  
  cartoon: {
    composition: "exaggerated proportions, dynamic pose, big expressions, playful stance",
    background: "abstract shapes, comic book patterns, colorful elements",
    colors: "vibrant saturated colors, complementary schemes, playful palette",
    effects: "halftone dots, action lines, comic bubbles, cartoon shading",
    mood: "fun, energetic, playful, entertaining",
    technical: "cartoon vector style, bold outlines, flat colors"
  },

  cyberpunk: {
    composition: "futuristic pose, tech elements, neon environment, urban setting",
    background: "neon cityscape, digital grid, holographic elements, cyber environment",
    colors: "neon colors (cyan, magenta, yellow), dark base, high contrast",
    effects: "glow effects, digital glitch, holographic elements, neon lighting",
    mood: "futuristic, high-tech, mysterious, powerful",
    technical: "digital art style, glow effects, sharp contrasts"
  },

  minimal: {
    composition: "clean geometric layout, simple pose, elegant positioning",
    background: "simple gradients, geometric shapes, minimal elements",
    colors: "limited palette, muted tones, sophisticated colors",
    effects: "subtle shadows, clean lighting, minimal effects",
    mood: "elegant, sophisticated, modern, clean",
    technical: "vector minimalism, clean lines, subtle details"
  },

  retro: {
    composition: "vintage-inspired pose, classic elements, nostalgic styling",
    background: "retro patterns, vintage elements, classic design motifs",
    colors: "vintage color schemes, muted tones, classic combinations",
    effects: "vintage texture, classic shading, retro styling",
    mood: "nostalgic, classic, timeless, vintage",
    technical: "retro illustration style, vintage finishing"
  }
};

// ========== ENHANCED PROMPT BUILDER ==========
export class PosterPromptBuilder {
  private cotEngine: COTReasoningEngine;
  private rugSystem: RUGDesignSystem;
  private promptBuilder: any;

  constructor() {
    this.cotEngine = new COTReasoningEngine();
    this.rugSystem = new RUGDesignSystem();
    this.promptBuilder = createPromptBuilder();
  }

  /**
   * Построение улучшенного промпта для постера
   */
  buildEnhancedPrompt(
    config: PosterConfig,
    userRequest: string,
    generator: 'leonardo' | 'replicate'
  ): {
    prompt: string;
    reasoning: string[];
    optimizations: string[];
    metadata: any;
  } {
    console.log('🎨 Building enhanced poster prompt...');

    // Apply COT reasoning
    const cotResult = this.cotEngine.applyChainOfThought(config, userRequest);
    
    // Apply RUG design rules
    const rugResult = this.rugSystem.applyDesignRules(config, cotResult.insights);
    
    // Get style template
    const template = POSTER_STYLE_TEMPLATES[config.style] || POSTER_STYLE_TEMPLATES.cartoon;
    
    // Build comprehensive prompt
    const prompt = this.constructPrompt(config, template, rugResult, generator);
    
    const metadata = {
      cotApplied: true,
      rugApplied: true,
      template: config.style,
      generator,
      insights: cotResult.insights,
      rules: rugResult.rules.length,
      enhancements: rugResult.enhancements.length
    };

    return {
      prompt,
      reasoning: cotResult.reasoning,
      optimizations: [...cotResult.optimizations, ...rugResult.enhancements],
      metadata
    };
  }

  private constructPrompt(
    config: PosterConfig,
    template: any,
    rugResult: any,
    generator: string
  ): string {
    // Base character and composition
    let prompt = this.buildCharacterDescription(config);
    prompt += `, ${template.composition}`;
    
    // Add style and mood
    prompt += `, ${template.mood} mood`;
    prompt += `, ${template.technical}`;
    
    // Add background and effects
    prompt += `, ${template.background}`;
    prompt += `, ${template.effects}`;
    
    // Add color specifications
    prompt += `, ${template.colors}`;
    
    // Add text if specified
    if (config.text) {
      prompt += this.buildTextDescription(config.text);
    }
    
    // Add quality and technical specifications
    prompt += this.buildQualitySpecs(config, generator);
    
    // Add composition and layout specs
    prompt += this.buildLayoutSpecs(config);
    
    // Generator-specific optimizations
    prompt += this.addGeneratorOptimizations(generator, config);

    return prompt;
  }

  private buildCharacterDescription(config: PosterConfig): string {
    const characterElement = config.elements.find(e => e.type === 'character');
    
    if (characterElement && config.character) {
      return `Professional poster illustration of ${config.character}`;
    } else if (characterElement) {
      return `Professional poster illustration featuring ${characterElement.content}`;
    } else {
      return `Professional poster design`;
    }
  }

  private buildTextDescription(text: PosterText): string {
    let textDesc = '';
    
    if (text.main) {
      textDesc += `, featuring text "${text.main}"`;
    }
    
    if (text.subtitle) {
      textDesc += `, subtitle "${text.subtitle}"`;
    }
    
    textDesc += `, ${text.style} typography style, ${text.position} positioned text`;
    
    return textDesc;
  }

  private buildQualitySpecs(config: PosterConfig, generator: string): string {
    const qualitySpecs = {
      'standard': 'good quality, clean design',
      'high': 'high quality, detailed illustration, professional finish',
      'premium': '8k resolution, ultra detailed, masterpiece quality, award winning design'
    };

    let specs = `, ${qualitySpecs[config.quality] || qualitySpecs.standard}`;
    
    // Add poster-specific quality markers
    specs += `, poster design, commercial quality, print ready`;
    
    // Add format specifications
    specs += `, suitable for ${config.type} format`;
    
    return specs;
  }

  private buildLayoutSpecs(config: PosterConfig): string {
    let layout = `, ${config.composition} composition`;
    
    // Add dimension considerations
    const aspectRatio = config.dimensions.width / config.dimensions.height;
    if (aspectRatio > 1.5) {
      layout += `, wide format layout`;
    } else if (aspectRatio < 0.7) {
      layout += `, tall format layout`;
    } else {
      layout += `, square format layout`;
    }
    
    // Add space considerations for wallet use
    if (config.type === 'nft' || config.type === 'avatar') {
      layout += `, centered subject with clear background space`;
    }
    
    return layout;
  }

  private addGeneratorOptimizations(generator: string, config: PosterConfig): string {
    if (generator === 'leonardo') {
      let opts = `, digital art, professional illustration, trending on artstation`;
      
      if (config.quality === 'premium') {
        opts += `, highly detailed, photorealistic rendering, cinema 4d`;
      }
      
      return opts;
    } else {
      let opts = `, flux model optimized, high fidelity poster art`;
      
      if (config.style === 'cyberpunk') {
        opts += `, neon lighting, sci-fi aesthetic`;
      }
      
      return opts;
    }
  }
}

// ========== MAIN POSTER GENERATOR CLASS ==========
export class PosterGenerator {
  private supabase: any;
  private imageManager: any;
  private styleAnalyzer: any;
  private storageManager: any;
  private promptBuilder: PosterPromptBuilder;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.imageManager = createImageGenerationManager(supabaseUrl, supabaseKey);
    this.styleAnalyzer = createStyleAnalyzer(supabaseUrl, supabaseKey);
    this.storageManager = createStorageManager(supabaseUrl, supabaseKey);
    this.promptBuilder = new PosterPromptBuilder();
  }

  /**
   * Генерация постера с полным COT & RUG процессом
   */
  async generatePoster(
    config: PosterConfig, 
    userRequest: string,
    options: {
      generator?: 'leonardo' | 'replicate';
      saveToDatabase?: boolean;
      createVariations?: boolean;
    } = {}
  ): Promise<PosterResult> {
    const startTime = Date.now();
    console.log('🎨 Starting enhanced poster generation...');

    try {
      // Select optimal generator
      const generator = options.generator || this.selectOptimalGenerator(config);
      
      // Build enhanced prompt with COT & RUG
      const promptResult = this.promptBuilder.buildEnhancedPrompt(
        config, 
        userRequest, 
        generator
      );

      console.log('🧠 COT Reasoning applied:', promptResult.reasoning.length, 'steps');
      console.log('📏 RUG Optimizations applied:', promptResult.optimizations.length);
      console.log('✨ Final prompt:', promptResult.prompt);

      // Create image generation request
      const imageRequest: ImageGenerationRequest = {
        prompt: promptResult.prompt,
        style: this.mapPosterStyleToImageStyle(config.style),
        type: this.mapPosterTypeToImageType(config.type),
        dimensions: config.dimensions,
        generator,
        options: {
          enhancePrompt: false, // Already enhanced
          learnFromExamples: true,
          optimizeForWallet: config.type === 'avatar' || config.type === 'wallpaper',
          highQuality: config.quality === 'premium',
          aspectRatio: this.calculateAspectRatio(config.dimensions)
        }
      };

      // Generate image
      const imageResult = await this.imageManager.generateImage(imageRequest);
      
      if (!imageResult.success) {
        throw new Error(imageResult.error || 'Image generation failed');
      }

      const processingTime = Date.now() - startTime;

      // Save to database if requested
      if (options.saveToDatabase && imageResult.imageUrl) {
        await this.savePosterToDatabase(config, imageResult, promptResult, userRequest);
      }

      // Create variations if requested
      let variations = [];
      if (options.createVariations && imageResult.success) {
        variations = await this.createPosterVariations(config, promptResult, generator);
      }

      const result: PosterResult = {
        success: true,
        imageUrl: imageResult.imageUrl,
        config,
        metadata: {
          generatedAt: new Date().toISOString(),
          generator,
          style: config.style,
          dimensions: config.dimensions,
          processingTime,
          enhancedPrompt: promptResult.prompt,
          reasoning: promptResult.reasoning,
          optimizations: promptResult.optimizations
        }
      };

      console.log('🎉 Poster generation completed successfully!');
      console.log('⏱️ Total processing time:', processingTime, 'ms');
      
      return result;

    } catch (error) {
      console.error('💥 Poster generation error:', error);
      
      return {
        success: false,
        config,
        error: error.message,
        metadata: {
          generatedAt: new Date().toISOString(),
          generator: options.generator || 'leonardo',
          style: config.style,
          dimensions: config.dimensions,
          processingTime: Date.now() - startTime,
          enhancedPrompt: '',
          reasoning: [],
          optimizations: []
        }
      };
    }
  }

  /**
   * Создание вариаций постера
   */
  async createPosterVariations(
    baseConfig: PosterConfig,
    promptResult: any,
    generator: string
  ): Promise<PosterResult[]> {
    console.log('🎭 Creating poster variations...');

    const variations: PosterConfig[] = [
      // Color variation
      { ...baseConfig, colors: this.generateAlternativeColors(baseConfig.colors) },
      // Mood variation
      { ...baseConfig, mood: this.getAlternativeMood(baseConfig.mood) },
      // Composition variation
      { ...baseConfig, composition: this.getAlternativeComposition(baseConfig.composition) }
    ];

    const results: PosterResult[] = [];

    for (const variation of variations) {
      try {
        const result = await this.generatePoster(variation, 'variation', { 
          generator, 
          saveToDatabase: false 
        });
        results.push(result);
      } catch (error) {
        console.warn('⚠️ Failed to create variation:', error);
      }
    }

    console.log(`✅ Created ${results.length} variations`);
    return results;
  }

  private selectOptimalGenerator(config: PosterConfig): 'leonardo' | 'replicate' {
    // Leonardo better for high quality and realistic styles
    if (config.quality === 'premium' || config.style === 'political') {
      return 'leonardo';
    }
    
    // Replicate better for stylized and fast generation
    if (config.style === 'cartoon' || config.style === 'cyberpunk') {
      return 'replicate';
    }
    
    // Default based on dimensions
    const pixelCount = config.dimensions.width * config.dimensions.height;
    return pixelCount > 1500000 ? 'leonardo' : 'replicate';
  }

  private mapPosterStyleToImageStyle(posterStyle: string): string {
    const mapping = {
      'superhero': 'poster',
      'political': 'realistic',
      'sports': 'poster',
      'cartoon': 'cartoon',
      'cyberpunk': 'cyberpunk',
      'minimal': 'minimal',
      'retro': 'vector',
      'professional': 'realistic'
    };

    return mapping[posterStyle] || 'poster';
  }

  private mapPosterTypeToImageType(posterType: string): string {
    const mapping = {
      'nft': 'nft',
      'social': 'banner',
      'banner':
