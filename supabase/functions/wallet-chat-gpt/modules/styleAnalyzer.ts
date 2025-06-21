
// Style analysis and processing
import type { StyleChanges } from '../types/styles.ts';

export function analyzeStyleFromResponse(response: string): StyleChanges | null {
  try {
    // Extract style information from GPT response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.styleChanges) {
        return parsed.styleChanges;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Style analysis error:', error);
    return null;
  }
}

export function validateStyleChanges(changes: any): boolean {
  // Basic validation of style changes structure
  return changes && 
         typeof changes.layer === 'string' && 
         typeof changes.target === 'string' && 
         changes.changes && 
         typeof changes.changes === 'object';
}
