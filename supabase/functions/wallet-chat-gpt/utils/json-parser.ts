
// JSON parsing utilities
export function extractAdvancedStyleChanges(response: string, walletContext: any): any {
  try {
    // Try to find JSON block in response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1];
      const parsed = JSON.parse(jsonString);
      if (parsed.styleChanges) {
        return parsed.styleChanges;
      }
    }

    // Fallback: look for style-related keywords and extract colors
    const colorRegex = /#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g;
    const colors = response.match(colorRegex);
    
    if (colors && colors.length > 0) {
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: colors[0],
          accentColor: colors[1] || colors[0],
          textColor: response.toLowerCase().includes('dark') ? '#ffffff' : '#000000',
        },
        reasoning: 'Auto-extracted from color analysis'
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error parsing style changes:', error);
    return null;
  }
}
