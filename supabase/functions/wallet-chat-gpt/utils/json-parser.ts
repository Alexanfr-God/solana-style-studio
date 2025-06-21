
// Enhanced JSON parsing utilities for new response format
import type { EnhancedStyleChanges } from '../types/responses.ts';

export function extractAdvancedStyleChanges(response: string, walletContext: any): EnhancedStyleChanges | any {
  try {
    // Try to find JSON block in response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1];
      const parsed = JSON.parse(jsonString);
      
      // Check if it's the new enhanced format
      if (parsed.analysis && parsed.actions && parsed.elements && parsed.metadata) {
        return parsed as EnhancedStyleChanges;
      }
      
      // Legacy format support
      if (parsed.styleChanges) {
        return parsed.styleChanges;
      }
    }

    // Try to find direct JSON in response (without code blocks)
    try {
      const directJson = JSON.parse(response);
      if (directJson.analysis && directJson.actions && directJson.elements) {
        return directJson as EnhancedStyleChanges;
      }
    } catch (e) {
      // Not direct JSON, continue with fallback
    }

    // Fallback: look for style-related keywords and extract colors
    const colorRegex = /#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g;
    const colors = response.match(colorRegex);
    
    if (colors && colors.length > 0) {
      return {
        analysis: "Auto-extracted from color analysis",
        actions: ["color_extraction"],
        elements: {
          colors: {
            primary: colors[0],
            accent: colors[1] || colors[0],
            text: response.toLowerCase().includes('dark') ? '#ffffff' : '#000000',
          }
        },
        metadata: {
          style_reasoning: 'Auto-extracted from color analysis',
          nft_ready: true
        }
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error parsing enhanced style changes:', error);
    return null;
  }
}

// Legacy support function
export function convertToLegacyFormat(enhancedChanges: EnhancedStyleChanges): any {
  if (!enhancedChanges) return null;
  
  return {
    layer: 'wallet',
    target: 'global',
    changes: {
      backgroundColor: enhancedChanges.elements.colors?.background,
      textColor: enhancedChanges.elements.colors?.text,
      accentColor: enhancedChanges.elements.colors?.accent,
      primaryColor: enhancedChanges.elements.colors?.primary,
      fontFamily: enhancedChanges.elements.typography?.header,
    },
    reasoning: enhancedChanges.metadata.style_reasoning
  };
}
