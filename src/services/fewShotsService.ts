/**
 * Few-shots, COT, and RUG Service
 * Loads and manages AI learning materials from Supabase Storage
 */

export interface FewShotExample {
  input: {
    walletType: string;
    screenType: string;
    imageDescription: string;
    dominantColors: string[];
    styleType: string;
    moodProfile: string;
  };
  expectedPrompt: string;
  expectedVariables?: Record<string, string>;
  modifications?: {
    opacity?: number;
    blur?: string;
    contrast?: string;
  };
}

export interface ThemeDefinition {
  themeName: string;
  description: string;
  colorPalette: Record<string, string>;
  characteristics: {
    mood: string[];
    visualElements: string[];
    atmosphere: string;
    complexity: string;
  };
  backgroundPrompts: Record<string, string>;
  elementStyles: Record<string, any>;
  restrictions: string[];
  accessibility: {
    contrastRatio: number;
    colorBlindSafe: boolean;
    readabilityScore: string;
  };
}

export class FewShotsService {
  private static instance: FewShotsService;
  private cache: Map<string, any> = new Map();
  private baseUrl = '/ai-fewshots';

  static getInstance(): FewShotsService {
    if (!FewShotsService.instance) {
      FewShotsService.instance = new FewShotsService();
    }
    return FewShotsService.instance;
  }

  async loadFewShots(category: string): Promise<FewShotExample[]> {
    const cacheKey = `fewshots_${category}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/prompts/${category}_examples.json`);
      if (!response.ok) {
        throw new Error(`Failed to load few-shots for ${category}: ${response.statusText}`);
      }
      
      const examples = await response.json();
      this.cache.set(cacheKey, examples);
      
      console.log(`✅ Loaded ${examples.length} few-shot examples for ${category}`);
      return examples;
    } catch (error) {
      console.error(`❌ Failed to load few-shots for ${category}:`, error);
      return [];
    }
  }

  async loadCOTGuidelines(): Promise<string> {
    const cacheKey = 'cot_guidelines';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/guidelines/cot_reasoning_steps.md`);
      if (!response.ok) {
        throw new Error(`Failed to load COT guidelines: ${response.statusText}`);
      }
      
      const guidelines = await response.text();
      this.cache.set(cacheKey, guidelines);
      
      console.log('✅ Loaded COT reasoning guidelines');
      return guidelines;
    } catch (error) {
      console.error('❌ Failed to load COT guidelines:', error);
      return '';
    }
  }

  async loadRUGRules(): Promise<string> {
    const cacheKey = 'rug_rules';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/guidelines/rug_design_rules.md`);
      if (!response.ok) {
        throw new Error(`Failed to load RUG rules: ${response.statusText}`);
      }
      
      const rules = await response.text();
      this.cache.set(cacheKey, rules);
      
      console.log('✅ Loaded RUG design rules');
      return rules;
    } catch (error) {
      console.error('❌ Failed to load RUG rules:', error);
      return '';
    }
  }

  async loadSafeZoneGuidelines(): Promise<string> {
    const cacheKey = 'safe_zone_guidelines';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/guidelines/safe_zone_guidelines.md`);
      if (!response.ok) {
        throw new Error(`Failed to load safe zone guidelines: ${response.statusText}`);
      }
      
      const guidelines = await response.text();
      this.cache.set(cacheKey, guidelines);
      
      console.log('✅ Loaded safe zone guidelines');
      return guidelines;
    } catch (error) {
      console.error('❌ Failed to load safe zone guidelines:', error);
      return '';
    }
  }

  async loadTheme(themeName: string): Promise<ThemeDefinition | null> {
    const cacheKey = `theme_${themeName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/styles/${themeName}_theme.json`);
      if (!response.ok) {
        throw new Error(`Failed to load theme ${themeName}: ${response.statusText}`);
      }
      
      const theme = await response.json();
      this.cache.set(cacheKey, theme);
      
      console.log(`✅ Loaded theme: ${themeName}`);
      return theme;
    } catch (error) {
      console.error(`❌ Failed to load theme ${themeName}:`, error);
      return null;
    }
  }

  async findBestFewShotExample(
    walletType: string,
    screenType: string,
    imageAnalysis: any
  ): Promise<FewShotExample | null> {
    const category = screenType === 'login' ? 'loginScreen' : 'walletScreen';
    const examples = await this.loadFewShots(category);
    
    if (examples.length === 0) return null;

    // Score examples based on similarity to current context
    const scoredExamples = examples.map(example => {
      let score = 0;
      
      // Wallet type match
      if (example.input.walletType === walletType) score += 3;
      
      // Style type match
      if (example.input.styleType === imageAnalysis?.styleType) score += 2;
      
      // Mood profile match
      if (example.input.moodProfile === imageAnalysis?.moodProfile) score += 2;
      
      // Color similarity (basic check)
      const exampleColors = example.input.dominantColors;
      const analysisColors = imageAnalysis?.dominantColors || [];
      const colorMatches = exampleColors.filter(color => 
        analysisColors.some(c => Math.abs(parseInt(color.slice(1), 16) - parseInt(c.slice(1), 16)) < 100000)
      ).length;
      score += colorMatches;
      
      return { example, score };
    });

    // Return the best matching example
    const bestMatch = scoredExamples.sort((a, b) => b.score - a.score)[0];
    
    console.log(`🎯 Found best few-shot example with score: ${bestMatch.score}`);
    return bestMatch.example;
  }

  async buildEnhancedPrompt(
    basePrompt: string,
    walletType: string,
    screenType: string,
    imageAnalysis: any
  ): Promise<string> {
    try {
      // Load all the learning materials
      const [cotGuidelines, rugRules, safeZoneGuidelines, bestExample] = await Promise.all([
        this.loadCOTGuidelines(),
        this.loadRUGRules(),
        this.loadSafeZoneGuidelines(),
        this.findBestFewShotExample(walletType, screenType, imageAnalysis)
      ]);

      // Build the enhanced prompt
      let enhancedPrompt = basePrompt + '\n\n';

      // Add COT reasoning steps
      if (cotGuidelines) {
        enhancedPrompt += '**Reasoning Guidelines:**\n';
        enhancedPrompt += 'Follow these step-by-step reasoning processes:\n';
        enhancedPrompt += cotGuidelines.split('\n').slice(0, 20).join('\n') + '\n\n';
      }

      // Add critical restrictions from RUG
      if (rugRules) {
        enhancedPrompt += '**Critical Design Rules:**\n';
        const criticalRules = rugRules.split('## CRITICAL RESTRICTIONS')[1]?.split('## DESIGN GUIDELINES')[0];
        if (criticalRules) {
          enhancedPrompt += criticalRules.trim() + '\n\n';
        }
      }

      // Add safe zone requirements
      if (safeZoneGuidelines) {
        enhancedPrompt += '**Safe Zone Requirements:**\n';
        enhancedPrompt += `For ${walletType} ${screenType} screen, ensure these areas remain clear:\n`;
        const universalRules = safeZoneGuidelines.split('## Universal Safe Zone Rules')[1]?.split('## Screen-Specific')[0];
        if (universalRules) {
          enhancedPrompt += universalRules.slice(0, 500) + '\n\n';
        }
      }

      // Add few-shot example if found
      if (bestExample) {
        enhancedPrompt += '**Reference Example:**\n';
        enhancedPrompt += `Input: ${JSON.stringify(bestExample.input, null, 2)}\n`;
        enhancedPrompt += `Expected Result: ${bestExample.expectedPrompt}\n\n`;
      }

      // Add context-specific instructions
      enhancedPrompt += '**Current Context:**\n';
      enhancedPrompt += `Wallet Type: ${walletType}\n`;
      enhancedPrompt += `Screen Type: ${screenType}\n`;
      enhancedPrompt += `Image Analysis: ${JSON.stringify(imageAnalysis, null, 2)}\n\n`;

      enhancedPrompt += '**Final Instructions:**\n';
      enhancedPrompt += 'Create a design that honors the input image style while strictly following all rules and guidelines above. ';
      enhancedPrompt += 'Ensure functionality is never compromised for aesthetics.';

      console.log(`📝 Built enhanced prompt (${enhancedPrompt.length} characters)`);
      return enhancedPrompt;

    } catch (error) {
      console.error('❌ Failed to build enhanced prompt:', error);
      return basePrompt; // Fallback to original prompt
    }
  }

  // Method to add new successful examples to the learning base
  async addSuccessfulExample(
    category: string,
    example: FewShotExample,
    qualityScore: number
  ): Promise<void> {
    if (qualityScore < 0.8) {
      console.log('📉 Example quality too low, not adding to few-shots');
      return;
    }

    try {
      // In a real implementation, this would update the storage files
      // For now, just log the successful example
      console.log(`📚 Would add successful example to ${category}:`, {
        input: example.input,
        qualityScore,
        timestamp: new Date().toISOString()
      });

      // TODO: Implement storage update logic
      // This could involve:
      // 1. Reading current examples
      // 2. Adding the new example
      // 3. Saving back to storage
      // 4. Clearing cache for the category

    } catch (error) {
      console.error('❌ Failed to add successful example:', error);
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cleared few-shots cache');
  }
}

// Export singleton instance
export const fewShotsService = FewShotsService.getInstance();