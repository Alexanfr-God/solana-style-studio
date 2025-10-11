/**
 * Path Analyzer Service
 * Determines if a json_path points to a property or an object
 * and provides available editing options
 */

export type PathType = 'property' | 'object';

export interface PathAnalysis {
  type: PathType;
  path: string;
  lastSegment: string;
  availableProperties: string[];
  defaultProperty: string;
}

const STYLE_PROPERTIES = [
  'backgroundColor', 'textColor', 'color', 
  'borderColor', 'iconColor', 'borderRadius',
  'fontSize', 'fontWeight', 'padding', 'margin',
  'background', 'placeholderColor'
];

export class PathAnalyzer {
  /**
   * Analyze a JSON path to determine its type
   */
  static analyze(jsonPath: string): PathAnalysis {
    const lastSegment = jsonPath.split('/').pop()?.toLowerCase() || '';
    
    // Property-level path (points directly to a style property)
    if (STYLE_PROPERTIES.map(p => p.toLowerCase()).includes(lastSegment)) {
      return {
        type: 'property',
        path: jsonPath,
        lastSegment,
        availableProperties: [],
        defaultProperty: lastSegment
      };
    }
    
    // Object-level path (points to an element, not a specific property)
    return {
      type: 'object',
      path: jsonPath,
      lastSegment,
      availableProperties: ['backgroundColor', 'textColor', 'borderColor', 'iconColor'],
      defaultProperty: 'backgroundColor'
    };
  }
  
  /**
   * Build a complete property path from base path + property name
   */
  static buildPropertyPath(basePath: string, property: string): string {
    return `${basePath}/${property}`;
  }
}
