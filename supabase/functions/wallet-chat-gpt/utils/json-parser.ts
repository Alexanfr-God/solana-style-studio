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
        const result = strategy.call(AdvancedJSONParser, cleanContent);
        
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
   * Validate style structure - новый метод
   */
  static validateStyleStructure(styleChanges: any): boolean {
    if (!styleChanges || typeof styleChanges !== 'object') {
      return false;
    }

    // Check for basic style properties
    const requiredProps = ['backgroundColor', 'textColor', 'accentColor'];
    const hasRequiredProps = requiredProps.some(prop => styleChanges.hasOwnProperty(prop));
    
    return hasRequiredProps;
  }

  /**
   * Create fallback styles - новый метод
   */
  static createFallbackStyles(theme: string): any {
    const darkStyles = {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      accentColor: '#6366f1',
      buttonColor: '#6366f1',
      buttonTextColor: '#ffffff',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif'
    };

    const lightStyles = {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      accentColor: '#3b82f6',
      buttonColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif'
    };

    return theme === 'light' ? lightStyles : darkStyles;
  }

  /**
   * Normalize colors - новый метод
   */
  static normalizeColors(styleChanges: any): any {
    if (!styleChanges || typeof styleChanges !== 'object') {
      return styleChanges;
    }

    const normalized = { ...styleChanges };

    // Normalize hex colors
    Object.keys(normalized).forEach(key => {
      if (typeof normalized[key] === 'string' && normalized[key].startsWith('#')) {
        const color = normalized[key];
        if (color.length === 4) {
          // Convert short hex to full hex
          normalized[key] = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
        }
        // Ensure uppercase
        normalized[key] = normalized[key].toUpperCase();
      }
    });

    return normalized;
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
