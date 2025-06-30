// ====== Enhanced utils/json-parser.ts ======
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

// ====== Enhanced utils/prompt-builder.ts ======
import type { WalletContext, WalletElement } from '../types/wallet.ts';
import type { StyleAnalysisResponse } from '../types/responses.ts';

export interface PromptConfig {
  type: 'customization' | 'analysis' | 'generation' | 'chat' | 'tutorial';
  context: WalletContext;
  userRequest: string;
  imageUrl?: string;
  targetElement?: string;
  stylePreferences?: any;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export interface WowEffectConfig {
  effectType: 'cyberpunk' | 'luxury' | 'neon' | 'cosmic' | 'minimal' | 'retro' | 'gaming' | 'professional';
  intensity: 'subtle' | 'medium' | 'dramatic' | 'extreme';
  targetElements: string[];
  preserveUsability: boolean;
  nftReady: boolean;
}

/**
 * Advanced Prompt Builder with context awareness and optimization
 */
export class AdvancedPromptBuilder {
  private static effectDefinitions = {
    cyberpunk: {
      colors: ['#00ff41', '#ff0080', '#0080ff', '#ffff00', '#00ffff'],
      description: 'futuristic cyberpunk aesthetic with matrix-style elements',
      effects: 'neon glows, digital grid overlays, holographic effects, electric animations',
      mood: 'futuristic, high-tech, mysterious, edgy',
      typography: 'monospace, tech-inspired fonts',
      patterns: 'circuit boards, binary code, digital noise'
    },
    luxury: {
      colors: ['#ffd700', '#c9b037', '#000000', '#ffffff', '#8b4513'],
      description: 'premium luxury design with sophisticated elegance',
      effects: 'metallic gradients, subtle shadows, refined animations, premium textures',
      mood: 'sophisticated, exclusive, elegant, premium',
      typography: 'serif fonts, elegant script, refined sans-serif',
      patterns: 'marble textures, gold leaf, premium materials'
    },
    neon: {
      colors: ['#ff006e', '#00f5ff', '#39ff14', '#ff073a', '#bf00ff'],
      description: 'vibrant neon aesthetic with electric energy',
      effects: 'bright neon glows, electric animations, pulsing effects, color cycling',
      mood: 'energetic, vibrant, electric, bold',
      typography: 'bold sans-serif, impact fonts, glowing text',
      patterns: 'neon tube lighting, electric patterns, grid systems'
    },
    cosmic: {
      colors: ['#4c1d95', '#7c3aed', '#a855f7', '#c084fc', '#1e1b4b'],
      description: 'cosmic space theme with stellar grandeur',
      effects: 'stellar gradients, particle effects, cosmic animations, nebula patterns',
      mood: 'mysterious, vast, inspirational, cosmic',
      typography: 'futuristic fonts, space-age design',
      patterns: 'star fields, nebulae, galaxy spirals, cosmic dust'
    },
    minimal: {
      colors: ['#f8fafc', '#64748b', '#1e293b', '#0f172a', '#374151'],
      description: 'ultra-clean minimal design with perfect balance',
      effects: 'subtle shadows, smooth transitions, clean lines, micro-interactions',
      mood: 'clean, focused, sophisticated, modern',
      typography: 'clean sans-serif, geometric fonts, perfect hierarchy',
      patterns: 'geometric shapes, clean grids, negative space'
    },
    retro: {
      colors: ['#ff6b35', '#f7931e', '#ffcd3c', '#c5d86d', '#8b5a3c'],
      description: 'nostalgic 80s aesthetic with vintage charm',
      effects: 'retro gradients, vintage animations, nostalgic feel, chromatic aberration',
      mood: 'nostalgic, warm, playful, vintage',
      typography: 'retro fonts, 80s-style typography, bold headers',
      patterns: 'retro patterns, vintage textures, 80s graphics'
    },
    gaming: {
      colors: ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff'],
      description: 'high-energy gaming aesthetic with competitive edge',
      effects: 'RGB lighting, gaming animations, competitive feel, action elements',
      mood: 'competitive, energetic, dynamic, intense',
      typography: 'gaming fonts, bold typography, action-oriented',
      patterns: 'gaming patterns, tech elements, competitive styling'
    },
    professional: {
      colors: ['#1e40af', '#374151', '#f3f4f6', '#111827', '#6b7280'],
      description: 'professional business aesthetic with trustworthy appeal',
      effects: 'corporate gradients, professional animations, trust-building elements',
      mood: 'trustworthy, professional, reliable, corporate',
      typography: 'corporate fonts, professional hierarchy',
      patterns: 'business patterns, corporate elements, professional styling'
    }
  };

  /**
   * Build advanced wallet system prompt with full context
   */
  static buildAdvancedWalletSystemPrompt(
    config: PromptConfig,
    designExamples: any[] = [],
    chosenStyle?: any
  ): string {
    const basePrompt = this.getBaseSystemPrompt(config.complexity);
    const contextPrompt = this.buildContextPrompt(config);
    const examplesPrompt = this.buildExamplesPrompt(designExamples, chosenStyle);
    const constraintsPrompt = this.buildConstraintsPrompt(config);

    return `${basePrompt}

${contextPrompt}

${examplesPrompt}

${constraintsPrompt}

CRITICAL INSTRUCTIONS:
- Always respond with the enhanced JSON format shown above
- Include detailed reasoning in the analysis section
- Ensure all colors have proper contrast ratios (WCAG AA minimum)
- Consider the wallet type capabilities and limitations
- Provide actionable style changes that improve user experience
- Include accessibility considerations in your recommendations`;
  }

  /**
   * Build wow effect prompt with advanced specifications
   */
  static buildWowEffectPrompt(config: WowEffectConfig, walletContext: WalletContext): string {
    const effect = this.effectDefinitions[config.effectType];
    const intensityModifiers = {
      subtle: 'gentle and refined with understated elegance',
      medium: 'noticeable and appealing with balanced impact',
      dramatic: 'bold and striking with high visual impact',
      extreme: 'maximum impact with cutting-edge visual effects'
    };

    const intensitySpecs = {
      subtle: { opacity: '0.3-0.6', glow: '2-5px', animation: 'slow', contrast: 'low' },
      medium: { opacity: '0.6-0.8', glow: '5-10px', animation: 'medium', contrast: 'medium' },
      dramatic: { opacity: '0.8-0.95', glow: '10-20px', animation: 'fast', contrast: 'high' },
      extreme: { opacity: '0.95-1.0', glow: '20-40px', animation: 'very fast', contrast: 'maximum' }
    };

    const specs = intensitySpecs[config.intensity];
    const intensityDescription = intensityModifiers[config.intensity];

    return `Create a WOW-EFFECT ${effect.description} for ${walletContext.walletType} wallet that will make users absolutely amazed.

🎨 EFFECT SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Style: ${config.effectType.toUpperCase()}
Intensity: ${config.intensity.toUpperCase()} (${intensityDescription})
Target: ${config.targetElements.join(', ')}
Colors: ${effect.colors.join(' • ')}
Effects: ${effect.effects}
Mood: ${effect.mood}
Typography: ${effect.typography}
Patterns: ${effect.patterns}


🔧 TECHNICAL SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Opacity Range: ${specs.opacity}
• Glow Effects: ${specs.glow}
• Animation Speed: ${specs.animation}
• Contrast Level: ${specs.contrast}
• Preserve Usability: ${config.preserveUsability ? 'YES' : 'NO'}
• NFT Ready: ${config.nftReady ? 'YES' : 'NO'}

🎯 DESIGN REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Create ${intensityDescription} visual impact that generates genuine WOW reactions
2. Ensure excellent contrast and readability (WCAG AA minimum)
3. Maintain wallet functionality and intuitive navigation
4. Apply cohesive color harmony using ${effect.colors.length} primary colors
5. Include appropriate visual effects: ${effect.effects}
6. Incorporate ${effect.mood} emotional appeal
7. Use ${effect.typography} for text elements
8. Add ${effect.patterns} background elements
${config.nftReady ? '9. Make it NFT-marketplace ready with premium finish' : ''}
${config.preserveUsability ? '10. Prioritize usability over visual effects' : '10. Maximize visual impact within usability bounds'}

🔍 CURRENT WALLET STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Background: ${walletContext.currentStyle?.backgroundColor || '#1a1a1a'}
• Primary: ${walletContext.currentStyle?.primaryColor || '#9945ff'}
• Accent: ${walletContext.currentStyle?.accentColor || '#00d4ff'}
• Theme: ${walletContext.currentStyle?.theme || 'dark'}
• Animation Preference: ${walletContext.currentStyle?.animations?.enabled ? 'ENABLED' : 'DISABLED'}

🚀 TRANSFORMATION GOAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transform this ${walletContext.walletType} wallet into a ${intensityDescription} ${config.effectType} masterpiece that will:
✨ Generate immediate WOW reactions from users
🎨 Showcase cutting-edge Web3 design excellence
💎 Feel premium and exclusive
🔥 Stand out in any portfolio or marketplace
⚡ Demonstrate advanced customization capabilities

CRITICAL: Return the complete enhanced JSON format with all sections filled out for maximum impact!`;
  }

  /**
   * Build user message with context and optimization
   */
  static buildUserMessage(
    content: string, 
    options: {
      walletElement?: string;
      imageUrl?: string;
      context?: WalletContext;
      priority?: 'low' | 'medium' | 'high';
      styleHints?: string[];
    } = {}
  ): string {
    let message = content;

    // Add element context
    if (options.walletElement) {
      message = `I want to customize the "${options.walletElement}" element. ${content}`;
    }

    // Add image context
    if (options.imageUrl) {
      message += '\n\n🖼️ IMAGE ANALYSIS REQUEST:\nI uploaded an image for style inspiration. Please analyze the colors, mood, and design elements, then suggest how to apply similar styling to my wallet interface. Focus on extracting the color palette and visual mood.';
    }

    // Add wallet context
    if (options.context) {
      message += `\n\n📱 WALLET CONTEXT:\n• Type: ${options.context.walletType}\n• Active Screen: ${options.context.activeScreen}\n• Current Theme: ${options.context.currentStyle?.theme}`;
    }

    // Add style hints
    if (options.styleHints && options.styleHints.length > 0) {
      message += `\n\n💡 STYLE PREFERENCES:\n${options.styleHints.map(hint => `• ${hint}`).join('\n')}`;
    }

    // Add priority context
    if (options.priority) {
      const priorityTexts = {
        low: 'This is a minor adjustment request.',
        medium: 'This is a standard customization request.',
        high: 'This is a high-priority customization that should have significant visual impact.'
      };
      message += `\n\n⭐ PRIORITY: ${priorityTexts[options.priority]}`;
    }

    return message;
  }

  /**
   * Build image analysis prompt
   */
  static buildImageAnalysisPrompt(imageUrl: string, context: WalletContext): string {
    return `🖼️ ADVANCED IMAGE STYLE ANALYSIS

Please analyze this image and extract comprehensive styling information for Web3 wallet customization.

📋 ANALYSIS REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🎨 COLOR PALETTE EXTRACTION:
   • Primary colors (3-5 dominant colors)
   • Secondary/accent colors
   • Background tones
   • Text contrast colors
   • Emotional color temperature (warm/cool)

2. 🎭 MOOD & ATMOSPHERE:
   • Overall emotional feel
   • Energy level (calm/energetic)
   • Style category (modern/retro/futuristic/etc)
   • Target audience impression

3. 🏗️ DESIGN ELEMENTS:
   • Typography style suggestions
   • Layout patterns
   • Visual hierarchy cues
   • Spacing and proportions

4. 💎 WEB3 ADAPTATION:
   • How to translate this style to ${context.walletType} wallet
   • Which wallet elements would benefit most
   • Accessibility considerations
   • NFT/crypto market appeal

🎯 TARGET APPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wallet Type: ${context.walletType}
• Current Theme: ${context.currentStyle?.theme || 'dark'}
• Active Screen: ${context.activeScreen}
• User Preferences: ${context.userPreferences?.theme || 'not specified'}

Please provide the complete enhanced JSON response with extracted colors, suggested styling, and implementation recommendations.`;
  }

  /**
   * Build comparison prompt for A/B testing
   */
  static buildComparisonPrompt(styleA: any, styleB: any, context: WalletContext): string {
    return `🔄 WALLET STYLE COMPARISON & OPTIMIZATION

Compare these two wallet styling approaches and provide recommendations:

📊 STYLE A ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(styleA, null, 2)}

📊 STYLE B ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(styleB, null, 2)}

🎯 COMPARISON CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visual Appeal (1-10)
2. Accessibility Score (WCAG compliance)
3. Brand Consistency
4. User Experience Impact
5. Web3/Crypto Market Appeal
6. Technical Implementation Complexity
7. Cross-Device Compatibility
8. Performance Implications

Please provide a detailed comparison with scores, pros/cons, and a recommended hybrid approach that combines the best of both styles.`;
  }

  /**
   * Private helper methods
   */
  private static getBaseSystemPrompt(complexity: 'beginner' | 'intermediate' | 'advanced'): string {
    const prompts = {
      beginner: `You are a friendly Web3 wallet design assistant. Help users create beautiful wallet customizations with simple, clear explanations.`,
      intermediate: `You are an expert Web3 wallet design AI. Provide detailed styling recommendations with professional insights and technical guidance.`,
      advanced: `You are an elite Web3 wallet design AI with deep expertise in UI/UX, color theory, accessibility, and cutting-edge design trends.`
    };

    return `${prompts[complexity]}

🎯 RESPONSE FORMAT REQUIREMENT:
You MUST respond with this enhanced JSON structure:

\`\`\`json
{
  "analysis": {
    "userIntent": "clear description of what user wants to achieve",
    "identifiedElements": ["list", "of", "affected", "elements"],
    "styleDirection": "overall style approach being taken",
    "confidenceScore": 0.0-1.0,
    "reasoningSteps": ["step 1", "step 2", "step 3"]
  },
  "actions": [{
    "type": "color_change|font_change|layout_change|component_update|animation_add",
    "target": "specific element or global",
    "description": "what this action accomplishes",
    "impact": "low|medium|high",
    "reversible": true|false
  }],
  "elements": {
    "colors": {
      "primary": {"value": "#hex", "accessibility": {"contrastRatio": 4.5, "wcagLevel": "AA"}},
      "background": {"value": "#hex", "accessibility": {"contrastRatio": 1.0, "wcagLevel": "AA"}},
      "text": {"value": "#hex", "accessibility": {"contrastRatio": 7.0, "wcagLevel": "AA"}},
      "accent": {"value": "#hex", "accessibility": {"contrastRatio": 4.5, "wcagLevel": "AA"}}
    },
    "typography": {
      "fontFamilies": {
        "primary": {"family": "font name", "weights": [400, 600], "source": "google|system"}
      }
    }
  },
  "metadata": {
    "styleReasoning": "detailed explanation of design choices",
    "nftReady": true|false,
    "accessibilityScore": 1-10,
    "appliedOptimizations": ["list", "of", "optimizations"],
    "qualityMetrics": {
      "accessibility": {"score": 1-10, "issues": [], "improvements": []},
      "performance": {"score": 1-10},
      "design": {"consistency": 1-10, "harmony": 1-10, "usability": 1-10},
      "overall": 1-10
    }
  }
}
\`\`\``;
  }

  private static buildContextPrompt(config: PromptConfig): string {
    return `🔍 CURRENT WALLET CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wallet Type: ${config.context.walletType}
• Active Layer: ${config.context.activeLayer}
• Active Screen: ${config.context.activeScreen}
• Current Theme: ${config.context.currentStyle?.theme || 'not set'}
• Animation Preference: ${config.context.currentStyle?.animations?.enabled ? 'enabled' : 'disabled'}
• User Level: ${config.complexity}
• Available Elements: ${config.context.availableElements?.length || 0} elements
• Customizable Screens: ${config.context.customizableScreens?.length || 0} screens

📱 CURRENT STYLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(config.context.currentStyle, null, 2)}`;
  }

  private static buildExamplesPrompt(designExamples: any[], chosenStyle?: any): string {
    if (designExamples.length === 0) {
      return '📚 DESIGN EXAMPLES: No premium examples loaded';
    }

    let prompt = `📚 DESIGN EXAMPLES AVAILABLE: ${designExamples.length} premium styles loaded\n`;
    
    if (chosenStyle) {
      prompt += `🎯 SELECTED STYLE REFERENCE: ${chosenStyle.id}\n`;
      prompt += `Style Details: ${JSON.stringify(chosenStyle, null, 2)}\n`;
    }

    prompt += `\nExample Styles Available: ${designExamples.map(ex => ex.id || 'unnamed').join(', ')}`;
    return prompt;
  }

  private static buildConstraintsPrompt(config: PromptConfig): string {
    const walletConstraints = {
      phantom: ['Supports custom CSS', 'Limited animation options', 'Good color customization'],
      metamask: ['Basic theming only', 'Limited customization', 'Focus on accessibility'],
      solflare: ['Good customization support', 'Responsive design friendly'],
      backpack: ['Modern customization features', 'Animation support', 'Gaming-friendly']
    };

    const constraints = walletConstraints[config.context.walletType as keyof typeof walletConstraints] || ['Standard customization support'];

    return `⚠️ TECHNICAL CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wallet Limitations: ${constraints.join(', ')}
• Accessibility Required: WCAG AA minimum
• Performance: Keep animations lightweight
• Compatibility: Support major browsers
• User Experience: Maintain intuitive navigation`;
  }

  /**
   * Get available wow effects with detailed information
   */
  static getAvailableWowEffects(): Array<{
    id: string;
    name: string;
    description: string;
    preview: string[];
    intensity: string[];
    bestFor: string[];
    performance: 'low' | 'medium' | 'high';
  }> {
    return [
      {
        id: 'cyberpunk',
        name: 'Cyberpunk Matrix',
        description: 'Futuristic neon with matrix-style glows and digital effects',
        preview: ['#00ff41', '#ff0080', '#0080ff'],
        intensity: ['medium', 'dramatic', 'extreme'],
        bestFor: ['Gaming wallets', 'Tech enthusiasts', 'NFT traders'],
        performance: 'medium'
      },
      {
        id: 'luxury',
        name: 'Premium Gold',
        description: 'Elegant luxury with gold accents and sophisticated styling',
        preview: ['#ffd700', '#c9b037', '#000000'],
        intensity: ['subtle', 'medium', 'dramatic'],
        bestFor: ['High-value portfolios', 'Premium users', 'Business wallets'],
        performance: 'low'
      },
      {
        id: 'neon',
        name: 'Electric Neon',
        description: 'Vibrant electric colors with pulsing glow effects',
        preview: ['#ff006e', '#00f5ff', '#39ff14'],
        intensity: ['medium', 'dramatic', 'extreme'],
        bestFor: ['Party themes', 'Creative users', 'Social trading'],
        performance: 'high'
      },
      {
        id: 'cosmic',
        name: 'Cosmic Space',
        description: 'Deep space theme with stellar gradients and cosmic effects',
        preview: ['#4c1d95', '#7c3aed', '#a855f7'],
        intensity: ['subtle', 'medium', 'dramatic'],
        bestFor: ['Long-term holders', 'Meditation apps', 'Cosmic themes'],
        performance: 'medium'
      },
      {
        id: 'minimal',
        name: 'Ultra Minimal',
        description: 'Clean and sophisticated simplicity with perfect balance',
        preview: ['#f8fafc', '#64748b', '#1e293b'],
        intensity: ['subtle', 'medium'],
        bestFor: ['Professional use', 'Focus apps', 'Clean design lovers'],
        performance: 'low'
      },
      {
        id: 'retro',
        name: 'Retro 80s',
        description: 'Nostalgic 80s aesthetic with vintage colors and effects',
        preview: ['#ff6b35', '#f7931e', '#ffcd3c'],
        intensity: ['medium', 'dramatic'],
        bestFor: ['Retro enthusiasts', 'Gaming themes', 'Nostalgic users'],
        performance: 'medium'
      },
      {
        id: 'gaming',
        name: 'Gaming RGB',
        description: 'High-energy gaming aesthetic with RGB lighting effects',
        preview: ['#00ff00', '#ff0000', '#0000ff'],
        intensity: ['dramatic', 'extreme'],
        bestFor: ['Gamers', 'Streamers', 'Competitive users'],
        performance: 'high'
      },
      {
        id: 'professional',
        name: 'Corporate Pro',
        description: 'Professional business aesthetic with trustworthy appeal',
        preview: ['#1e40af', '#374151', '#f3f4f6'],
        intensity: ['subtle', 'medium'],
        bestFor: ['Business users', 'Corporate wallets', 'Professional traders'],
        performance: 'low'
      }
    ];
  }

  /**
   * Generate prompts for different wallet types
   */
  static getWalletSpecificPrompts(): { [walletType: string]: string } {
    return {
      phantom: `🟣 PHANTOM WALLET OPTIMIZATION:
• Leverage Phantom's excellent color customization support
• Utilize smooth animation capabilities
• Focus on Solana ecosystem branding
• Emphasize clean, modern design principles
• Support both mobile and desktop experiences`,

      metamask: `🦊 METAMASK WALLET OPTIMIZATION:
• Work within MetaMask's theming limitations
• Prioritize accessibility and readability
• Focus on Ethereum ecosystem colors
• Ensure cross-browser compatibility
• Maintain familiar UX patterns`,

      solflare: `☀️ SOLFLARE WALLET OPTIMIZATION:
• Leverage Solflare's responsive design support
• Incorporate Solana-themed elements
• Focus on mobile-first design
• Utilize good customization features
• Emphasize performance and speed`,

      backpack: `🎒 BACKPACK WALLET OPTIMIZATION:
• Take advantage of modern customization features
• Incorporate gaming and social elements
• Use advanced animation support
• Focus on community and social aspects
• Emphasize cutting-edge design trends`
    };
  }
}

// Legacy support functions
export function buildAdvancedWalletSystemPrompt(
  walletContext: any, 
  designExamples: any[], 
  chosenStyle: any
): string {
  const config: PromptConfig = {
    type: 'customization',
    context: walletContext,
    userRequest: '',
    complexity: 'intermediate'
  };
  
  return AdvancedPromptBuilder.buildAdvancedWalletSystemPrompt(config, designExamples, chosenStyle);
}

export function buildUserMessage(
  content: string, 
  walletElement?: string, 
  imageUrl?: string
): string {
  return AdvancedPromptBuilder.buildUserMessage(content, {
    walletElement,
    imageUrl
  });
}

export function buildWowEffectPrompt(
  effectType: string,
  walletContext: any,
  intensity: 'subtle' | 'medium' | 'dramatic' = 'medium'
): string {
  const config: WowEffectConfig = {
    effectType: effectType as any,
    intensity,
    targetElements: ['global'],
    preserveUsability: true,
    nftReady: true
  };
  
  return AdvancedPromptBuilder.buildWowEffectPrompt(config, walletContext);
}

export function getAvailableWowEffects() {
  return AdvancedPromptBuilder.getAvailableWowEffects();
}
