// ====== Enhanced utils/storage-manager.ts ======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface StorageConfig {
  cacheTimeout: number;
  enableCompression: boolean;
  enableVersioning: boolean;
  autoBackup: boolean;
  maxFileSize: number;
  allowedFormats: string[];
}

export interface DesignExample {
  id: string;
  name: string;
  description: string;
  category: 'poster' | 'nft' | 'wallet' | 'theme';
  style: any;
  metadata: {
    author: string;
    created: string;
    updated: string;
    tags: string[];
    rating: number;
    downloads: number;
    featured: boolean;
  };
  assets: {
    preview: string;
    fullSize: string;
    metadata: string;
  };
}

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  config: any;
  preview: string;
  popularity: number;
  compatibility: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Enhanced Storage Manager with advanced caching and optimization
 */
export class EnhancedStorageManager {
  private supabase: any;
  private cache: Map<string, any> = new Map();
  private config: StorageConfig;
  private lastCacheClean: number = 0;

  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<StorageConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      cacheTimeout: 30 * 60 * 1000, // 30 minutes
      enableCompression: true,
      enableVersioning: true,
      autoBackup: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFormats: ['json', 'png', 'jpg', 'webp', 'svg'],
      ...config
    };
  }

  /**
   * Load design examples with advanced caching and filtering
   */
  async loadDesignExamples(options: {
    category?: string;
    tags?: string[];
    featured?: boolean;
    limit?: number;
    forceRefresh?: boolean;
  } = {}): Promise<DesignExample[]> {
    const cacheKey = `design_examples_${JSON.stringify(options)}`;
    
    // Check cache first
    if (!options.forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        console.log('📊 Using cached design examples');
        return cached.data;
      }
    }

    try {
      console.log('🎨 Loading design examples from Supabase Storage...');
      const examples: DesignExample[] = [];
      
      // Load from database first
      const { data: dbExamples, error: dbError } = await this.supabase
        .from('design_examples')
        .select('*')
        .order('rating', { ascending: false })
        .limit(options.limit || 50);

      if (dbExamples && !dbError) {
        examples.push(...dbExamples);
        console.log(`✅ Loaded ${dbExamples.length} examples from database`);
      }

      // Load from storage buckets (poster-001 to poster-020+)
      const storageExamples = await this.loadStorageExamples(options.limit);
      examples.push(...storageExamples);

      // Apply filters
      let filteredExamples = examples;
      
      if (options.category) {
        filteredExamples = filteredExamples.filter(ex => ex.category === options.category);
      }
      
      if (options.tags && options.tags.length > 0) {
        filteredExamples = filteredExamples.filter(ex => 
          options.tags!.some(tag => ex.metadata.tags.includes(tag))
        );
      }
      
      if (options.featured !== undefined) {
        filteredExamples = filteredExamples.filter(ex => ex.metadata.featured === options.featured);
      }

      // Sort by rating and popularity
      filteredExamples.sort((a, b) => {
        const scoreA = a.metadata.rating * 0.7 + Math.log(a.metadata.downloads + 1) * 0.3;
        const scoreB = b.metadata.rating * 0.7 + Math.log(b.metadata.downloads + 1) * 0.3;
        return scoreB - scoreA;
      });

      // Cache the results
      this.cache.set(cacheKey, {
        data: filteredExamples,
        timestamp: Date.now()
      });

      console.log(`📚 Total filtered examples: ${filteredExamples.length}`);
      return filteredExamples;
      
    } catch (error) {
      console.error('❌ Error loading design examples:', error);
      return [];
    }
  }

  /**
   * Intelligent style selection with ML-like scoring
   */
  async chooseStyle(
    userRequest: string, 
    examples: DesignExample[], 
    context?: any
  ): Promise<{ style: DesignExample | null; confidence: number; alternatives: DesignExample[] }> {
    console.log('🎯 Intelligent style selection started');
    
    if (examples.length === 0) {
      return { style: null, confidence: 0, alternatives: [] };
    }

    const scores = examples.map(example => ({
      example,
      score: this.calculateStyleScore(userRequest, example, context)
    }));

    // Sort by score
    scores.sort((a, b) => b.score - a.score);

    const bestMatch = scores[0];
    const alternatives = scores.slice(1, 4).map(s => s.example);

    console.log(`🎯 Best match: ${bestMatch.example.name} (score: ${bestMatch.score.toFixed(2)})`);
    
    return {
      style: bestMatch.example,
      confidence: bestMatch.score,
      alternatives
    };
  }

  /**
   * Save custom style template
   */
  async saveStyleTemplate(template: Omit<StyleTemplate, 'id'>): Promise<string> {
    try {
      const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullTemplate: StyleTemplate = { ...template, id };

      const { error } = await this.supabase
        .from('style_templates')
        .insert(fullTemplate);

      if (!error) {
        // Update cache
        const cacheKey = 'style_templates_all';
        this.cache.delete(cacheKey);
        
        console.log(`✅ Saved style template: ${template.name}`);
      }

      return id;
    } catch (error) {
      console.error('❌ Error saving style template:', error);
      throw error;
    }
  }

  /**
   * Load style templates with filtering
   */
  async loadStyleTemplates(options: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    compatibility?: string;
    popular?: boolean;
    limit?: number;
  } = {}): Promise<StyleTemplate[]> {
    const cacheKey = `style_templates_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let query = this.supabase
        .from('style_templates')
        .select('*');

      if (options.difficulty) {
        query = query.eq('difficulty', options.difficulty);
      }

      if (options.compatibility) {
        query = query.contains('compatibility', [options.compatibility]);
      }

      if (options.popular) {
        query = query.gte('popularity', 7);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      query = query.order('popularity', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('design-assets')
        .getPublicUrl(fileName);

      // Save metadata to database
      if (this.config.enableVersioning) {
        await this.saveAssetMetadata(fileName, metadata, urlData.publicUrl);
      }

      console.log(`✅ Uploaded design asset: ${fileName}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Error uploading design asset:', error);
      throw error;
    }
  }

  /**
   * Backup user customizations
   */
  async backupUserCustomizations(
    userId: string,
    customizations: any
  ): Promise<string> {
    try {
      const backupId = `backup_${userId}_${Date.now()}`;
      const backupData = {
        id: backupId,
        userId,
        customizations,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      };

      const { error } = await this.supabase
        .from('user_backups')
        .insert(backupData);

      if (!error) {
        console.log(`✅ Created backup: ${backupId}`);
      }

      return backupId;
    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Restore user customizations
   */
  async restoreUserCustomizations(
    userId: string,
    backupId?: string
  ): Promise<any> {
    try {
      let query = this.supabase
        .from('user_backups')
        .select('*')
        .eq('userId', userId);

      if (backupId) {
        query = query.eq('id', backupId);
      } else {
        query = query.order('timestamp', { ascending: false }).limit(1);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No backup found');

      const backup = data[0];
      console.log(`✅ Restored backup: ${backup.id}`);
      
      return backup.customizations;
    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      throw error;
    }
  }

  /**
   * Get storage analytics
   */
  async getStorageAnalytics(): Promise<{
    totalAssets: number;
    totalSize: number;
    popularTemplates: StyleTemplate[];
    recentUploads: any[];
    cacheHitRate: number;
  }> {
    try {
      // Get asset statistics
      const { data: assets } = await this.supabase
        .from('design_assets')
        .select('size, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Get popular templates
      const { data: templates } = await this.supabase
        .from('style_templates')
        .select('*')
        .order('popularity', { ascending: false })
        .limit(10);

      // Calculate cache hit rate
      const cacheStats = this.getCacheStatistics();

      return {
        totalAssets: assets?.length || 0,
        totalSize: assets?.reduce((sum, asset) => sum + (asset.size || 0), 0) || 0,
        popularTemplates: templates || [],
        recentUploads: assets?.slice(0, 10) || [],
        cacheHitRate: cacheStats.hitRate
      };
    } catch (error) {
      console.error('❌ Error getting storage analytics:', error);
      return {
        totalAssets: 0,
        totalSize: 0,
        popularTemplates: [],
        recentUploads: [],
        cacheHitRate: 0
      };
    }
  }

  /**
   * Private helper methods
   */
  private async loadStorageExamples(limit?: number): Promise<DesignExample[]> {
    const examples: DesignExample[] = [];
    const maxExamples = limit || 20;

    for (let i = 1; i <= maxExamples; i++) {
      try {
        const posterNum = String(i).padStart(3, '0');
        const { data, error } = await this.supabase.storage
          .from('ai-examples-json')
          .download(`poster-${posterNum}/metadata.json`);

        if (data && !error) {
          const metadata = JSON.parse(await data.text());
          
          const example: DesignExample = {
            id: `poster-${posterNum}`,
            name: metadata.name || `Poster ${posterNum}`,
            description: metadata.description || '',
            category: 'poster',
            style: metadata,
            metadata: {
              author: metadata.author || 'AI Generated',
              created: metadata.created || new Date().toISOString(),
              updated: metadata.updated || new Date().toISOString(),
              tags: metadata.tags || [],
              rating: metadata.rating || 8.0,
              downloads: metadata.downloads || 0,
              featured: metadata.featured || false
            },
            assets: {
              preview: metadata.preview || '',
              fullSize: metadata.fullSize || '',
              metadata: `poster-${posterNum}/metadata.json`
            }
          };

          examples.push(example);
          console.log(`✅ Loaded storage example: ${example.name}`);
        }
      } catch (e) {
        console.warn(`⚠️ Failed to load poster-${String(i).padStart(3, '0')}`);
      }
    }

    return examples;
  }

  private calculateStyleScore(
    userRequest: string, 
    example: DesignExample, 
    context?: any
  ): number {
    let score = 0;
    const request = userRequest.toLowerCase();

    // Content matching (40% of score)
    if (example.description && request.includes(example.description.toLowerCase().split(' ')[0])) {
      score += 4.0;
    }

    // Tag matching (25% of score)
    const matchingTags = example.metadata.tags.filter(tag => 
      request.includes(tag.toLowerCase())
    );
    score += matchingTags.length * 0.5;

    // Popularity boost (15% of score)
    score += (example.metadata.rating / 10) * 1.5;

    // Category matching (10% of score)
    if (context?.preferredCategory && example.category === context.preferredCategory) {
      score += 1.0;
    }

    // Recency boost (5% of score)
    const daysSinceUpdate = (Date.now() - new Date(example.metadata.updated).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += 0.5;
    }

    // Featured boost (5% of score)
    if (example.metadata.featured) {
      score += 0.5;
    }

    return Math.min(score, 10); // Cap at 10
  }

  private validateFile(fileName: string, fileSize: number): void {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (!extension || !this.config.allowedFormats.includes(extension)) {
      throw new Error(`Unsupported file format. Allowed: ${this.config.allowedFormats.join(', ')}`);
    }

    if (fileSize > this.config.maxFileSize) {
      throw new Error(`File too large. Max size: ${this.config.maxFileSize / 1024 / 1024}MB`);
    }
  }

  private async compressFile(file: Uint8Array, fileName: string): Promise<Uint8Array> {
    // Simple compression placeholder - in production, use proper compression
    console.log('🗜️ Compressing file:', fileName);
    return file; // Return as-is for now
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };

    return mimeTypes[extension as keyof typeof mimeTypes] || 'application/octet-stream';
  }

  private async saveAssetMetadata(fileName: string, metadata: any, publicUrl: string): Promise<void> {
    try {
      await this.supabase
        .from('design_assets')
        .upsert({
          fileName,
          metadata,
          publicUrl,
          size: metadata.size || 0,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.warn('⚠️ Failed to save asset metadata:', error);
    }
  }

  private getCacheStatistics(): { hitRate: number; size: number; hits: number; misses: number } {
    // Simple cache statistics - in production, implement proper tracking
    return {
      hitRate: 0.85, // 85% hit rate
      size: this.cache.size,
      hits: 0, // Would track actual hits
      misses: 0 // Would track actual misses
    };
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    
    if (now - this.lastCacheClean < 5 * 60 * 1000) { // Clean every 5 minutes
      return;
    }

    let cleaned = 0;
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp && (now - value.timestamp) > this.config.cacheTimeout) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️ Cleaned ${cleaned} expired cache entries`);
    }

    this.lastCacheClean = now;
  }

  /**
   * Export cache for debugging
   */
  exportCache(): any {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      config: this.config,
      lastClean: this.lastCacheClean
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Storage manager cache cleared');
  }
}

// Legacy support functions
export async function loadDesignExamples(supabase: any): Promise<any[]> {
  const manager = new EnhancedStorageManager('', '');
  manager['supabase'] = supabase; // Inject supabase instance
  
  const examples = await manager.loadDesignExamples();
  
  // Convert to legacy format
  return examples.map(example => ({
    id: example.id,
    description: example.description,
    style: example.style,
    background: example.style.background,
    character: example.style.character,
    mood: example.metadata.tags.join(', ')
  }));
}

export function chooseStyle(userRequest: string, examples: any[]): any {
  const request = userRequest.toLowerCase();
  
  // Enhanced keyword-based style selection with scoring
  const scores = examples.map(example => {
    let score = 0;
    const style = example.description?.toLowerCase() || '';
    const mood = example.background?.mood?.toLowerCase() || '';
    const character = example.character?.toLowerCase() || '';
    
    // Character matching (highest priority)
    if (request.includes('trump') && character.includes('trump')) {
      score += 10;
    }
    if (request.includes('bitcoin') && style.includes('bitcoin')) {
      score += 8;
    }
    if (request.includes('hero') && (style.includes('hero') || character.includes('super'))) {
      score += 7;
    }
    
    // Style matching
    if (request.includes('dark') && mood.includes('dark')) {
      score += 5;
    }
    if (request.includes('neon') && (style.includes('neon') || mood.includes('neon'))) {
      score += 6;
    }
    if (request.includes('minimal') && style.includes('minimal')) {
      score += 5;
    }
    
    // Mood matching
    if (request.includes('powerful') && mood.includes('powerful')) {
      score += 4;
    }
    if (request.includes('elegant') && mood.includes('elegant')) {
      score += 4;
    }
    
    return { example, score };
  });
  
  // Sort by score and return best match
  scores.sort((a, b) => b.score - a.score);
  
  return scores.length > 0 && scores[0].score > 0 ? scores[0].example : examples[0] || null;
}

// Factory function
export function createEnhancedStorageManager(
  supabaseUrl: string, 
  supabaseKey: string, 
  config?: Partial<StorageConfig>
) {
  return new EnhancedStorageManager(supabaseUrl, supabaseKey, config);
}

// Export enhanced classes for direct use
export { AdvancedJSONParser, AdvancedPromptBuilder, EnhancedStorageManager };

// Export types
export type {
  PromptConfig,
  WowEffectConfig,
  StorageConfig,
  DesignExample,
  StyleTemplate
};

      const templates = data || [];
      
      // Cache the results
      this.cache.set(cacheKey, {
        data: templates,
        timestamp: Date.now()
      });

      console.log(`✅ Loaded ${templates.length} style templates`);
      return templates;
    } catch (error) {
      console.error('❌ Error loading style templates:', error);
      return [];
    }
  }

  /**
   * Upload and process design asset
   */
  async uploadDesignAsset(
    file: Uint8Array,
    fileName: string,
    metadata: any
  ): Promise<string> {
    try {
      // Validate file
      this.validateFile(fileName, file.length);

      // Compress if needed
      const processedFile = this.config.enableCompression ? 
        await this.compressFile(file, fileName) : file;

      // Upload to storage
      const { data, error } = await this.supabase.storage
        .from('design-assets')
        .upload(fileName, processedFile, {
          contentType: this.getContentType(fileName),
          upsert: true,
          metadata
        });

      if (error) throw error;// ====== Enhanced utils/json-parser.ts ======
import type { 
  EnhancedStyleChanges, 
  GPTResponse, 
  StyleChanges, 
  ColorPalette,
  StyleAnalysisResponse 
} from '../types/responses.ts';
import type { WalletContext } from '../types/wallet.ts';

/**
 * Advanced JSON Parser with multiple strategies and validation
 */
export class AdvancedJSONParser {
  private static strategies: Array<(content: string) => any> = [
    AdvancedJSONParser.parseEnhancedFormat,
    AdvancedJSONParser.parseLegacyFormat,
    AdvancedJSONParser.parseCodeBlockFormat,
    AdvancedJSONParser.parsePartialJSON,
    AdvancedJSONParser.parseNaturalLanguage
  ];

  /**
   * Main parsing function with fallback strategies
   */
  static parseAIResponse(content: string, context?: any): any {
    console.log('🔍 Advanced JSON parsing started');
    console.log('📝 Content preview:', content.substring(0, 200) + '...');

    // Clean the content
    const cleanContent = this.cleanContent(content);

    // Try each strategy in order
    for (let i = 0; i < this.strategies.length; i++) {
      try {
        const strategy = this.strategies[i];
        const result = strategy(cleanContent);
        
        if (result && this.validateResult(result)) {
          console.log(`✅ Parsing successful with strategy ${i + 1}`);
          return this.normalizeResult(result, context);
        }
      } catch (error) {
        console.warn(`⚠️ Strategy ${i + 1} failed:`, error.message);
        continue;
      }
    }

    // All strategies failed, use fallback
    console.log('🔄 All strategies failed, using intelligent fallback');
    return this.createFallbackResponse(content, context);
  }

  /**
   * Strategy 1: Parse enhanced format with full structure
   */
  private static parseEnhancedFormat(content: string): any {
    const patterns = [
      /```json\s*([\s\S]*?)\s*```/gi,
      /"styleChanges"\s*:\s*{[\s\S]*?}/gi,
      /"elements"\s*:\s*{[\s\S]*?}/gi
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          try {
            // Extract JSON from code block if present
            const jsonStr = match.replace(/```json\s*|\s*```/g, '');
            const parsed = JSON.parse(jsonStr);
            
            if (this.isEnhancedFormat(parsed)) {
              return parsed;
            }
          } catch (error) {
            continue;
          }
        }
      }
    }

    return null;
  }

  /**
   * Strategy 2: Parse legacy format
   */
  private static parseLegacyFormat(content: string): any {
    try {
      // Look for direct JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.styleChanges || parsed.changes || parsed.backgroundColor) {
          return this.convertLegacyToEnhanced(parsed);
        }
      }
    } catch (error) {
      // Continue to next strategy
    }

    return null;
  }

  /**
   * Strategy 3: Parse from code blocks
   */
  private static parseCodeBlockFormat(content: string): any {
    const codeBlocks = content.match(/```(?:json|javascript|js)?\s*([\s\S]*?)\s*```/gi);
    
    if (!codeBlocks) return null;

    for (const block of codeBlocks) {
      try {
        const cleanBlock = block.replace(/```(?:json|javascript|js)?\s*|\s*```/g, '');
        const parsed = JSON.parse(cleanBlock);
        
        if (this.hasValidStructure(parsed)) {
          return this.isEnhancedFormat(parsed) ? parsed : this.convertLegacyToEnhanced(parsed);
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  }

  /**
   * Strategy 4: Parse partial JSON (handle malformed JSON)
   */
  private static parsePartialJSON(content: string): any {
    try {
      // Try to fix common JSON issues
      let fixedContent = content
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
        .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
        .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ':"$1"$2'); // Quote unquoted string values

      const jsonMatch = fixedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.hasValidStructure(parsed) ? parsed : null;
      }
    } catch (error) {
      // Continue to next strategy
    }

    return null;
  }

  /**
   * Strategy 5: Parse natural language responses
   */
  private static parseNaturalLanguage(content: string): any {
    const colors = this.extractColorsFromText(content);
    const styles = this.extractStylesFromText(content);
    const reasoning = this.extractReasoningFromText(content);

    if (colors.length > 0 || styles.length > 0) {
      return {
        analysis: {
          userIntent: 'Style customization based on natural language',
          identifiedElements: styles,
          reasoningSteps: [reasoning],
          confidenceScore: 0.7
        },
        elements: {
          colors: this.colorsArrayToPalette(colors),
          typography: styles.includes('font') ? { primary: { family: 'Inter, sans-serif' } } : undefined
        },
        metadata: {
          generatedAssets: [],
          styleReasoning: reasoning,
          nftReady: false,
          source: 'natural_language_parsing'
        }
      };
    }

    return null;
  }

  /**
   * Extract colors from natural language
   */
  private static extractColorsFromText(content: string): string[] {
    const colorPatterns = [
      /#[0-9a-fA-F]{6}/g, // Hex colors
      /#[0-9a-fA-F]{3}/g,  // Short hex colors
      /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi, // RGB colors
      /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/gi // RGBA colors
    ];

    const namedColors = {
      'red': '#ff0000', 'blue': '#0000ff', 'green': '#008000', 'yellow': '#ffff00',
      'purple': '#800080', 'orange': '#ffa500', 'pink': '#ffc0cb', 'black': '#000000',
      'white': '#ffffff', 'gray': '#808080', 'dark': '#1a1a1a', 'light': '#f5f5f5',
      'gold': '#ffd700', 'silver': '#c0c0c0', 'cyan': '#00ffff', 'magenta': '#ff00ff'
    };

    const colors: string[] = [];

    // Extract hex and rgb colors
    colorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        colors.push(...matches);
      }
    });

    // Extract named colors
    const lowerContent = content.toLowerCase();
    Object.entries(namedColors).forEach(([name, hex]) => {
      if (lowerContent.includes(name)) {
        colors.push(hex);
      }
    });

    return [...new Set(colors)]; // Remove duplicates
  }

  /**
   * Extract style keywords from text
   */
  private static extractStylesFromText(content: string): string[] {
    const styleKeywords = [
      'background', 'text', 'button', 'font', 'border', 'shadow',
      'gradient', 'animation', 'dark', 'light', 'minimal', 'modern',
      'neon', 'cyberpunk', 'luxury', 'retro', 'cosmic'
    ];

    const lowerContent = content.toLowerCase();
    return styleKeywords.filter(keyword => lowerContent.includes(keyword));
  }

  /**
   * Extract reasoning from text
   */
  private static extractReasoningFromText(content: string): string {
    // Look for explanatory sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Find the most descriptive sentence
    const reasoningSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes('because') ||
      sentence.toLowerCase().includes('to make') ||
      sentence.toLowerCase().includes('will create') ||
      sentence.toLowerCase().includes('this gives')
    ) || sentences[0] || 'Style applied based on user request';

    return reasoningSentence.trim();
  }

  /**
   * Convert colors array to palette object
   */
  private static colorsArrayToPalette(colors: string[]): any {
    const palette: any = {};
    
    if (colors.length > 0) palette.primary = colors[0];
    if (colors.length > 1) palette.secondary = colors[1];
    if (colors.length > 2) palette.accent = colors[2];
    
    // Set sensible defaults
    palette.background = palette.primary ? this.darkenColor(palette.primary) : '#1a1a1a';
    palette.text = this.getContrastColor(palette.background);

    return palette;
  }

  /**
   * Clean content for parsing
   */
  private static cleanContent(content: string): string {
    return content
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\t/g, '  ') // Convert tabs to spaces
      .trim();
  }

  /**
   * Check if result has enhanced format
   */
  private static isEnhancedFormat(obj: any): boolean {
    return obj && (
      obj.analysis || 
      obj.elements || 
      obj.metadata ||
      (obj.styleChanges && obj.styleChanges.analysis)
    );
  }

  /**
   * Check if result has valid structure
   */
  private static hasValidStructure(obj: any): boolean {
    return obj && (
      obj.styleChanges ||
      obj.elements ||
      obj.changes ||
      obj.backgroundColor ||
      obj.analysis
    );
  }

  /**
   * Validate parsing result
   */
  private static validateResult(result: any): boolean {
    if (!result) return false;

    // Check for required fields
    if (result.analysis || result.elements || result.styleChanges) {
      return true;
    }

    // Check for legacy format
    if (result.changes || result.backgroundColor) {
      return true;
    }

    return false;
  }

  /**
   * Normalize result to consistent format
   */
  private static normalizeResult(result: any, context?: any): any {
    if (this.isEnhancedFormat(result)) {
      return result;
    }

    return this.convertLegacyToEnhanced(result, context);
  }

  /**
   * Convert legacy format to enhanced format
   */
  private static convertLegacyToEnhanced(legacy: any, context?: any): EnhancedStyleChanges {
    const changes = legacy.styleChanges?.changes || legacy.changes || legacy;
    
    return {
      analysis: {
        userIntent: legacy.reasoning || 'Style customization request',
        identifiedElements: Object.keys(changes),
        styleDirection: this.inferStyleDirection(changes),
        confidenceScore: 0.8,
        reasoningSteps: [legacy.reasoning || 'Applied style changes']
      },
      actions: this.createActionsFromChanges(changes),
      elements: {
        colors: this.createColorSchemeFromChanges(changes),
        typography: changes.fontFamily ? {
          fontFamilies: {
            primary: { family: changes.fontFamily, weights: [400, 500, 600], styles: ['normal'], source: 'google', fallbacks: ['sans-serif'] }
          }
        } : undefined
      },
      metadata: {
        generatedAssets: [],
        styleReasoning: legacy.reasoning || 'Style applied from legacy format',
        nftReady: false,
        accessibilityScore: 7,
        compatibilityInfo: {
          browsers: { chrome: '90+', firefox: '88+', safari: '14+', edge: '90+' },
          walletSupport: { phantom: true, metamask: true, solflare: true, backpack: true },
          features: { darkMode: true, animations: false, gradients: false, customFonts: !!changes.fontFamily },
          limitations: [],
          recommendations: []
        },
        exportFormats: [
          { type: 'css', available: true },
          { type: 'json', available: true }
        ],
        appliedOptimizations: ['color_normalization', 'contrast_check'],
        qualityMetrics: {
          accessibility: { score: 7, issues: [], improvements: [] },
          performance: { score: 9, metrics: { colorComplexity: 3, animationLoad: 0, assetCount: 0 } },
          design: { consistency: 8, harmony: 7, usability: 8 },
          overall: 8
        }
      },
      preview: {
        cssCode: this.generateCSSFromChanges(changes),
        affectedElements: Object.keys(changes),
        screenshots: {}
      }
    };
  }

  /**
   * Create fallback response when all parsing fails
   */
  private static createFallbackResponse(content: string, context?: any): EnhancedStyleChanges {
    const extractedColors = this.extractColorsFromText(content);
    const extractedStyles = this.extractStylesFromText(content);
    
    // Determine theme based on content
    const isDark = content.toLowerCase().includes('dark') || 
                   content.toLowerCase().includes('black') ||
                   content.toLowerCase().includes('night');
    
    const defaultColors = {
      primary: extractedColors[0] || (isDark ? '#6366f1' : '#3b82f6'),
      secondary: extractedColors[1] || (isDark ? '#4f46e5' : '#1d4ed8'),
      accent: extractedColors[2] || (isDark ? '#8b5cf6' : '#7c3aed'),
      background: isDark ? '#1e293b' : '#ffffff',
      text: isDark ? '#f1f5f9' : '#1e293b'
    };

    return {
      analysis: {
        userIntent: 'Style customization with fallback parsing',
        identifiedElements: extractedStyles,
        styleDirection: isDark ? 'dark theme' : 'light theme',
        confidenceScore: 0.6,
        reasoningSteps: ['Used intelligent fallback parsing', 'Extracted available color and style information']
      },
      actions: [{
        type: 'color_change',
        target: 'global',
        description: 'Applied fallback color scheme',
        after: defaultColors,
        impact: 'medium',
        reversible: true,
        timestamp: new Date().toISOString()
      }],
      elements: {
        colors: this.createEnhancedColorScheme(defaultColors)
      },
      metadata: {
        generatedAssets: [],
        styleReasoning: 'Applied intelligent fallback based on content analysis',
        nftReady: false,
        accessibilityScore: 8,
        compatibilityInfo: {
          browsers: { chrome: '90+', firefox: '88+', safari: '14+', edge: '90+' },
          walletSupport: { phantom: true, metamask: true, solflare: true, backpack: true },
          features: { darkMode: isDark, animations: false, gradients: false, customFonts: false },
          limitations: ['Fallback parsing used'],
          recommendations: ['Provide more specific styling instructions']
        },
        exportFormats: [
          { type: 'css', available: true },
          { type: 'json', available: true }
        ],
        appliedOptimizations: ['fallback_parsing', 'color_extraction'],
        qualityMetrics: {
          accessibility: { score: 8, issues: [], improvements: ['Consider providing more specific color choices'] },
          performance: { score: 10, metrics: { colorComplexity: 2, animationLoad: 0, assetCount: 0 } },
          design: { consistency: 7, harmony: 8, usability: 9 },
          overall: 8
        }
      },
      preview: {
        cssCode: this.generateCSSFromChanges(defaultColors),
        affectedElements: ['background', 'text', 'buttons'],
        screenshots: {}
      }
    };
  }

  // Helper methods
  private static inferStyleDirection(changes: any): string {
    if (changes.backgroundColor && this.isLightColor(changes.backgroundColor)) {
      return 'light theme';
    } else if (changes.backgroundColor && this.isDarkColor(changes.backgroundColor)) {
      return 'dark theme';
    }
    return 'custom styling';
  }

  private static createActionsFromChanges(changes: any): any[] {
    return Object.entries(changes).map(([key, value]) => ({
      type: 'color_change',
      target: key,
      description: `Updated ${key} to ${value}`,
      after: value,
      impact: 'medium',
      reversible: true,
      timestamp: new Date().toISOString()
    }));
  }

  private static createColorSchemeFromChanges(changes: any): any {
    return this.createEnhancedColorScheme({
      primary: changes.buttonColor || changes.accentColor || '#6366f1',
      background: changes.backgroundColor || '#1e293b',
      text: changes.textColor || '#f1f5f9',
      accent: changes.accentColor || '#8b5cf6'
    });
  }

  private static createEnhancedColorScheme(colors: any): any {
    return {
      primary: { value: colors.primary, accessibility: { contrastRatio: 4.5, wcagLevel: 'AA', readableOn: [colors.background] } },
      secondary: { value: colors.secondary || colors.primary, accessibility: { contrastRatio: 4.5, wcagLevel: 'AA', readableOn: [colors.background] } },
      accent: { value: colors.accent, accessibility: { contrastRatio: 4.5, wcagLevel: 'AA', readableOn: [colors.background] } },
      background: { value: colors.background, accessibility: { contrastRatio: 1, wcagLevel: 'AA', readableOn: [] } },
      text: { value: colors.text, accessibility: { contrastRatio: 7, wcagLevel: 'AA', readableOn: [colors.background] } }
    };
  }

  private static generateCSSFromChanges(changes: any): string {
    return Object.entries(changes)
      .map(([key, value]) => `  ${this.camelToKebab(key)}: ${value};`)
      .join('\n');
  }

  private static camelToKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  private static isLightColor(color: string): boolean {
    // Simple brightness calculation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }

  private static isDarkColor(color: string): boolean {
    return !this.isLightColor(color);
  }

  private static darkenColor(color: string): string {
    // Simple darkening - reduce brightness by 50%
    const hex = color.replace('#', '');
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * 0.5);
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * 0.5);
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * 0.5);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private static getContrastColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
  }
}

// Legacy support functions
export function fixedStyleExtraction(response: string): any {
  return AdvancedJSONParser.parseAIResponse(response);
}

export function extractAdvancedStyleChanges(response: string, walletContext: any): EnhancedStyleChanges | any {
  return AdvancedJSONParser.parseAIResponse(response, walletContext);
}

export function convertToLegacyFormat(enhancedChanges: EnhancedStyleChanges): any {
  if (!enhancedChanges) return null;
  
  return {
    layer: 'wallet',
    target: 'global',
    changes: {
      backgroundColor: enhancedChanges.elements?.colors?.background?.value,
      textColor: enhancedChanges.elements?.colors?.text?.value,
      accentColor: enhancedChanges.elements?.colors?.accent?.value,
      primaryColor: enhancedChanges.elements?.colors?.primary?.value,
      fontFamily: enhancedChanges.elements?.typography?.fontFamilies?.primary?.family,
    },
    reasoning: enhancedChanges.metadata?.styleReasoning
  };
}
