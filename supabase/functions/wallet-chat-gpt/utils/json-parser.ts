// Fixed JSON parsing utilities for consistent format
import type { EnhancedStyleChanges } from '../types/responses.ts';

export function fixedStyleExtraction(response: string): any {
  console.log('🔍 Parsing GPT response:', response.substring(0, 200));
  
  try {
    // Strategy 1: Look for new format
    const newFormatMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (newFormatMatch) {
      const parsed = JSON.parse(newFormatMatch[1]);
      
      // Convert new format to old format
      if (parsed.elements) {
        console.log('✅ Found new format, converting...');
        return {
          layer: 'wallet',
          target: 'global',
          changes: {
            backgroundColor: parsed.elements.colors?.primary || '#1a1a1a',
            accentColor: parsed.elements.colors?.accent || '#9945ff',
            textColor: parsed.elements.colors?.text || '#ffffff',
            buttonColor: parsed.elements.colors?.primary || '#9945ff'
          },
          reasoning: parsed.analysis || 'Style applied from GPT response'
        };
      }
      
      // If old format, return as is
      if (parsed.styleChanges) {
        console.log('✅ Found old format');
        return parsed.styleChanges;
      }
    }
    
    // Strategy 2: Direct JSON parsing
    try {
      const directJson = JSON.parse(response);
      if (directJson.styleChanges) {
        console.log('✅ Found direct old format');
        return directJson.styleChanges;
      }
      if (directJson.elements) {
        console.log('✅ Found direct new format, converting...');
        return {
          layer: 'wallet',
          target: 'global',
          changes: {
            backgroundColor: directJson.elements.colors?.primary || '#1a1a1a',
            accentColor: directJson.elements.colors?.accent || '#9945ff',
            textColor: directJson.elements.colors?.text || '#ffffff',
            buttonColor: directJson.elements.colors?.primary || '#9945ff'
          },
          reasoning: directJson.analysis || 'Style applied from GPT response'
        };
      }
    } catch (e) {
      // Not direct JSON, continue with fallback
    }
    
    // Strategy 3: Fallback
    console.log('⚠️ Using fallback styles');
    return {
      layer: 'wallet',
      target: 'global', 
      changes: {
        backgroundColor: '#1a1a1a',
        accentColor: '#9945ff',
        textColor: '#ffffff'
      },
      reasoning: 'Fallback styles applied'
    };
    
  } catch (error) {
    console.error('❌ JSON parsing error:', error);
    return null;
  }
}

// Legacy support function
export function extractAdvancedStyleChanges(response: string, walletContext: any): EnhancedStyleChanges | any {
  return fixedStyleExtraction(response);
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
