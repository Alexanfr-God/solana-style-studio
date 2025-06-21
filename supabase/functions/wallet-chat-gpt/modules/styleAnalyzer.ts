
// Enhanced style analysis and processing for new format
import type { EnhancedStyleChanges } from '../types/responses.ts';

export function analyzeEnhancedStyleFromResponse(response: string): EnhancedStyleChanges | null {
  try {
    // Extract enhanced JSON structure from GPT response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.analysis && parsed.actions && parsed.elements && parsed.metadata) {
        return parsed as EnhancedStyleChanges;
      }
    }
    
    // Try direct JSON parsing
    try {
      const directJson = JSON.parse(response);
      if (directJson.analysis && directJson.actions && directJson.elements) {
        return directJson as EnhancedStyleChanges;
      }
    } catch (e) {
      // Not direct JSON
    }
    
    return null;
  } catch (error) {
    console.error('❌ Enhanced style analysis error:', error);
    return null;
  }
}

export function validateEnhancedStyleChanges(changes: any): boolean {
  // Enhanced validation for new structure
  return changes && 
         typeof changes.analysis === 'string' && 
         Array.isArray(changes.actions) && 
         changes.elements && 
         typeof changes.elements === 'object' &&
         changes.metadata &&
         typeof changes.metadata.style_reasoning === 'string' &&
         typeof changes.metadata.nft_ready === 'boolean';
}

// Legacy function for backward compatibility
export function analyzeStyleFromResponse(response: string): any | null {
  const enhanced = analyzeEnhancedStyleFromResponse(response);
  if (enhanced) {
    // Convert to legacy format if needed
    return {
      layer: 'wallet',
      target: 'global',
      changes: {
        backgroundColor: enhanced.elements.colors?.background,
        textColor: enhanced.elements.colors?.text,
        accentColor: enhanced.elements.colors?.accent,
        primaryColor: enhanced.elements.colors?.primary,
        fontFamily: enhanced.elements.typography?.header,
      },
      reasoning: enhanced.metadata.style_reasoning
    };
  }
  return null;
}

export function validateStyleChanges(changes: any): boolean {
  // Basic validation of style changes structure
  return changes && 
         typeof changes.layer === 'string' && 
         typeof changes.target === 'string' && 
         changes.changes && 
         typeof changes.changes === 'object';
}
