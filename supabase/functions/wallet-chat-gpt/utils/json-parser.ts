// Enhanced JSON parsing utilities with multi-format support

import { EnhancedStyleChanges, GPTResponse } from '../types/responses.ts';
import { StyleChanges } from '../types/styles.ts';
import { WowEffect } from '../types/wallet.ts';

// Main parsing function that handles all formats
export function parseGPTResponse(response: string): GPTResponse {
  console.log('🔍 Parsing GPT response...');
  
  // First, separate human response from JSON
  const { humanResponse, jsonContent } = separateResponseParts(response);
  
  // Parse the JSON content
  const parsedData = parseJSONContent(jsonContent || response);
  
  // Build complete response
  return {
    success: !!parsedData,
    response: humanResponse || generateFallbackHumanResponse(parsedData),
    styleChanges: parsedData,
    mode: detectResponseMode(parsedData),
    wowEffects: extractWowEffectsFromResponse(parsedData),
    metadata: {
      timestamp: new Date().toISOString(),
      hasHumanResponse: !!humanResponse,
      parsingStrategy: parsedData ? 'success' : 'fallback'
    }
  };
}

// Separate human response from JSON
function separateResponseParts(response: string): { humanResponse: string, jsonContent: string } {
  // Look for JSON code block
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  
  if (jsonMatch) {
    // Extract human response (everything before JSON)
    const jsonStartIndex = response.indexOf('```json');
    const humanResponse = response.substring(0, jsonStartIndex).trim();
    
    return {
      humanResponse,
      jsonContent: jsonMatch[1]
    };
  }
  
  // Try to find JSON object directly
  const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    const jsonStartIndex = response.indexOf(jsonObjectMatch[0]);
    const humanResponse = response.substring(0, jsonStartIndex).trim();
    
    return {
      humanResponse,
      jsonContent: jsonObjectMatch[0]
    };
  }
  
  return { humanResponse: '', jsonContent: response };
}

// Parse JSON content with multiple strategies
function parseJSONContent(content: string): EnhancedStyleChanges | null {
  const strategies = [
    parseEnhancedFormat,
    parseLegacyFormat,
    parseDirectJSON,
    parseFromText,
    generateFallbackStructure
  ];
  
  for (const strategy of strategies) {
    try {
      const result = strategy(content);
      if (result && validateParsedContent(result)) {
        console.log(`✅ Successfully parsed using ${strategy.name}`);
        return normalizeToEnhancedFormat(result);
      }
    } catch (error) {
      console.log(`❌ Strategy ${strategy.name} failed:`, error.message);
      continue;
    }
  }
  
  console.error('❌ All parsing strategies failed');
  return null;
}

// Strategy 1: Parse enhanced format
function parseEnhancedFormat(content: string): any {
  const parsed = JSON.parse(content);
  
  if (parsed.analysis && parsed.elements && parsed.metadata) {
    return parsed;
  }
  
  throw new Error('Not enhanced format');
}

// Strategy 2: Parse legacy format
function parseLegacyFormat(content: string): any {
  const parsed = JSON.parse(content);
  
  if (parsed.styleChanges) {
    return convertLegacyToEnhanced(parsed.styleChanges);
  }
  
  if (parsed.layer && parsed.changes) {
    return convertLegacyToEnhanced(parsed);
  }
  
  throw new Error('Not legacy format');
}

// Strategy 3: Parse direct JSON
function parseDirectJSON(content: string): any {
  try {
    const parsed = JSON.parse(content);
    
    // Check if it has any style-related properties
    if (parsed.colors || parsed.typography || parsed.effects || parsed.style) {
      return {
        analysis: 'Direct style configuration',
        elements: {
          colors: parsed.colors || extractColors(parsed),
          typography: parsed.typography || extractTypography(parsed),
          effects: parsed.effects || []
        },
        metadata: {
          style_reasoning: 'Parsed from direct JSON',
          nft_ready: true
        }
      };
    }
  } catch (e) {
    // Not valid JSON
  }
  
  throw new Error('Not direct JSON');
}

// Strategy 4: Parse from text
function parseFromText(content: string): any {
  const extracted = {
    analysis: 'Extracted from text response',
    actions: [],
    elements: {
      colors: {},
      typography: {},
      effects: []
    },
    metadata: {
      style_reasoning: 'Parsed from natural language',
      nft_ready: true
    }
  };
  
  // Extract colors
  const colorPatterns = {
    primary: /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\s*(?:\(primary\))?/i,
    secondary: /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\s*(?:\(secondary\))?/i,
    accent: /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\s*(?:\(accent\))?/i,
    background: /background:\s*#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/i,
    text: /text:\s*#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/i
  };
  
  let foundColors = false;
  Object.entries(colorPatterns).forEach(([key, pattern]) => {
    const match = content.match(pattern);
    if (match) {
      extracted.elements.colors[key] = `#${match[1]}`;
      foundColors = true;
    }
  });
  
  // Extract fonts
  const fontPattern = /font(?:-family)?:\s*["']?([^"';,]+)["']?/gi;
  const fontMatches = content.matchAll(fontPattern);
  for (const match of fontMatches) {
    extracted.elements.typography.body = match[1].trim();
    extracted.elements.typography.header = match[1].trim();
  }
  
  // Extract effects
  const effectKeywords = ['glow', 'gradient', 'animation', 'shadow', 'blur', 'transition'];
  effectKeywords.forEach(keyword => {
    if (content.toLowerCase().includes(keyword)) {
      extracted.elements.effects.push({
        type: keyword,
        detected: true
      });
    }
  });
  
  if (foundColors || extracted.elements.typography.body || extracted.elements.effects.length > 0) {
    return extracted;
  }
  
  throw new Error('No style information found in text');
}

// Strategy 5: Generate fallback structure
function generateFallbackStructure(content: string): any {
  console.log('⚠️ Using fallback structure generation');
  
  return {
    analysis: 'Applied default styling',
    actions: ['Applied fallback styles'],
    elements: {
      colors: {
        primary: '#9945ff',
        secondary: '#ab4aba',
        accent: '#00d4ff',
        background: '#1a1a1a',
        text: '#ffffff'
      },
      typography: {
        header: 'Inter',
        body: 'Inter'
      }
    },
    metadata: {
      style_reasoning: 'Default wallet styling applied',
      nft_ready: true,
      fallback: true
    }
  };
}

// Convert legacy format to enhanced format
function convertLegacyToEnhanced(legacy: any): EnhancedStyleChanges {
  return {
    analysis: legacy.reasoning || 'Converted from legacy format',
    actions: ['Converted legacy styles'],
    elements: {
      colors: {
        primary: legacy.changes?.primaryColor || legacy.changes?.accentColor,
        secondary: legacy.changes?.secondaryColor,
        accent: legacy.changes?.accentColor,
        background: legacy.changes?.backgroundColor,
        text: legacy.changes?.textColor || legacy.changes?.color
      },
      typography: {
        header: legacy.changes?.fontFamily || legacy.changes?.font,
        body: legacy.changes?.fontFamily || legacy.changes?.font
      },
      components: {
        buttons: legacy.changes?.buttonColor ? {
          default: {
            base: {
              backgroundColor: legacy.changes.buttonColor,
              color: legacy.changes.buttonTextColor
            }
          }
        } : undefined
      }
    },
    metadata: {
      style_reasoning: legacy.reasoning || 'Legacy style conversion',
      nft_ready: true,
      converted_from: 'legacy'
    }
  };
}

// Normalize any format to enhanced format
function normalizeToEnhancedFormat(data: any): EnhancedStyleChanges {
  if (data.analysis && data.elements && data.metadata) {
    return data as EnhancedStyleChanges;
  }
  
  return convertLegacyToEnhanced(data);
}

// Validate parsed content
function validateParsedContent(content: any): boolean {
  if (!content) return false;
  
  // Must have some style information
  const hasColors = content.elements?.colors && Object.keys(content.elements.colors).length > 0;
  const hasTypography = content.elements?.typography && Object.keys(content.elements.typography).length > 0;
  const hasEffects = content.elements?.effects && content.elements.effects.length > 0;
  const hasComponents = content.elements?.components && Object.keys(content.elements.components).length > 0;
  
  return hasColors || hasTypography || hasEffects || hasComponents;
}

// Extract colors from any object
function extractColors(obj: any): Record<string, string> {
  const colors: Record<string, string> = {};
  
  const colorKeys = ['primary', 'secondary', 'accent', 'background', 'text', 'bg', 'fg'];
  
  // Deep search for color values
  function searchForColors(item: any, prefix = '') {
    if (typeof item === 'string' && item.match(/^#[0-9a-fA-F]{3,6}$/)) {
      const key = prefix || 'primary';
      colors[key] = item;
    } else if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        const newPrefix = colorKeys.includes(key.toLowerCase()) ? key.toLowerCase() : prefix;
        searchForColors(value, newPrefix);
      });
    }
  }
  
  searchForColors(obj);
  return colors;
}

// Extract typography from any object
function extractTypography(obj: any): Record<string, string> {
  const typography: Record<string, string> = {};
  
  const fontKeys = ['font', 'fontFamily', 'typography', 'typeface'];
  
  function searchForFonts(item: any) {
    if (typeof item === 'string' && !item.startsWith('#') && item.length < 50) {
      // Likely a font name
      if (!typography.body) typography.body = item;
      if (!typography.header) typography.header = item;
    } else if (typeof item === 'object' && item !== null) {
      Object.entries(item).forEach(([key, value]) => {
        if (fontKeys.some(fk => key.toLowerCase().includes(fk))) {
          searchForFonts(value);
        }
      });
    }
  }
  
  searchForFonts(obj);
  return typography;
}

// Extract wow effects from response
function extractWowEffectsFromResponse(data: any): WowEffect[] | undefined {
  if (!data) return undefined;
  
  const effects: WowEffect[] = [];
  
  // Check for direct effects array
  if (data.elements?.effects && Array.isArray(data.elements.effects)) {
    data.elements.effects.forEach((effect: any) => {
      if (typeof effect === 'object' && effect.type) {
        effects.push(normalizeWowEffect(effect));
      }
    });
  }
  
  // Check for wow effects in metadata
  if (data.wowEffects && Array.isArray(data.wowEffects)) {
    data.wowEffects.forEach((effect: any) => {
      effects.push(normalizeWowEffect(effect));
    });
  }
  
  return effects.length > 0 ? effects : undefined;
}

// Normalize wow effect structure
function normalizeWowEffect(effect: any): WowEffect {
  return {
    id: effect.id || `effect-${Date.now()}`,
    type: effect.type || 'animation',
    name: effect.name || effect.type || 'Unknown Effect',
    description: effect.description,
    target: effect.target || '.wallet',
    properties: effect.properties || {},
    duration: effect.duration,
    trigger: effect.trigger || 'load',
    performance: effect.performance || 'medium'
  };
}

// Detect response mode from parsed data
function detectResponseMode(data: any): string {
  if (!data) return 'error';
  
  if (data.wowEffects || data.elements?.effects?.length > 0) {
    return 'wow-analysis';
  }
  
  if (data.metadata?.mode) {
    return data.metadata.mode;
  }
  
  if (data.metadata?.converted_from === 'legacy') {
    return 'analysis';
  }
  
  return 'enhanced-analysis';
}

// Generate fallback human response
function generateFallbackHumanResponse(data: any): string {
  if (!data) {
    return "I'm having trouble understanding your request. Could you please try rephrasing it?";
  }
  
  const responses = [];
  
  if (data.elements?.colors) {
    const colorCount = Object.keys(data.elements.colors).length;
    responses.push(`I've updated ${colorCount} colors in your wallet design.`);
  }
  
  if (data.elements?.typography) {
    responses.push(`Typography has been updated for a more modern look.`);
  }
  
  if (data.elements?.effects && data.elements.effects.length > 0) {
    responses.push(`Added ${data.elements.effects.length} visual effects for that wow factor!`);
  }
  
  if (responses.length === 0) {
    return "I've applied the requested changes to your wallet design.";
  }
  
  return responses.join(' ') + ' How does it look?';
}

// Parse style changes for backwards compatibility
export function parseStyleChanges(response: string): StyleChanges | null {
  const gptResponse = parseGPTResponse(response);
  
  if (!gptResponse.styleChanges) {
    return null;
  }
  
  // Convert to legacy StyleChanges format
  return {
    layer: 'wallet',
    target: 'global',
    changes: {
      backgroundColor: gptResponse.styleChanges.elements.colors?.background,
      textColor: gptResponse.styleChanges.elements.colors?.text,
      accentColor: gptResponse.styleChanges.elements.colors?.accent,
      buttonColor: gptResponse.styleChanges.elements.colors?.primary,
      fontFamily: gptResponse.styleChanges.elements.typography?.body,
      borderRadius: gptResponse.styleChanges.elements.spacing?.borderRadius
    },
    reasoning: gptResponse.styleChanges.metadata.style_reasoning
  };
}

// Extract specific style property
export function extractStyleProperty(response: string, property: string): any {
  const parsed = parseGPTResponse(response);
  
  if (!parsed.styleChanges) return null;
  
  // Navigate through the structure to find the property
  const paths = [
    `elements.colors.${property}`,
    `elements.typography.${property}`,
    `elements.spacing.${property}`,
    `elements.effects.${property}`,
    `elements.components.${property}`
  ];
  
  for (const path of paths) {
    const value = getNestedProperty(parsed.styleChanges, path);
    if (value !== undefined) {
      return value;
    }
  }
  
  return null;
}

// Get nested property from object
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

// Validate and fix color values
export function validateColorValue(color: string): string {
  if (!color) return '#000000';
  
  // Remove any extra characters
  color = color.trim();
  
  // Add # if missing
  if (!color.startsWith('#')) {
    color = '#' + color;
  }
  
  // Validate hex format
  if (!/^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$/.test(color)) {
    console.warn(`Invalid color value: ${color}, using fallback`);
    return '#000000';
  }
  
  // Convert 3-digit to 6-digit hex
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  
  return color.toLowerCase();
}

// Extract all colors from response
export function extractAllColors(response: string): Record<string, string> {
  const parsed = parseGPTResponse(response);
  const colors: Record<string, string> = {};
  
  if (parsed.styleChanges?.elements?.colors) {
    Object.entries(parsed.styleChanges.elements.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        colors[key] = validateColorValue(value);
      }
    });
  }
  
  return colors;
}

// Extract all effects from response
export function extractAllEffects(response: string): WowEffect[] {
  const parsed = parseGPTResponse(response);
  return parsed.wowEffects || [];
}

// Create style summary for user
export function createStyleSummary(styleChanges: EnhancedStyleChanges): string {
  const summary = [];
  
  // Colors
  if (styleChanges.elements.colors) {
    const colorCount = Object.keys(styleChanges.elements.colors).filter(k => styleChanges.elements.colors[k]).length;
    if (colorCount > 0) {
      summary.push(`${colorCount} color${colorCount > 1 ? 's' : ''}`);
    }
  }
  
  // Typography
  if (styleChanges.elements.typography?.header || styleChanges.elements.typography?.body) {
    summary.push('typography');
  }
  
  // Effects
  if (styleChanges.elements.effects && styleChanges.elements.effects.length > 0) {
    summary.push(`${styleChanges.elements.effects.length} effect${styleChanges.elements.effects.length > 1 ? 's' : ''}`);
  }
  
  // Components
  if (styleChanges.elements.components) {
    const componentCount = Object.keys(styleChanges.elements.components).length;
    if (componentCount > 0) {
      summary.push(`${componentCount} component${componentCount > 1 ? 's' : ''}`);
    }
  }
  
  if (summary.length === 0) {
    return 'style updates';
  }
  
  return summary.join(', ');
}

// Export utility functions
export {
  parseGPTResponse as default,
  separateResponseParts,
  convertLegacyToEnhanced,
  normalizeWowEffect,
  validateParsedContent
};
