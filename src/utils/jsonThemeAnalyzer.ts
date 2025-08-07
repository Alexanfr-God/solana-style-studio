
export interface JsonThemeElement {
  key: string;
  path: string;
  category: string;
  properties: string[];
  domSelector?: string;
  description?: string;
}

export interface JsonThemeCategory {
  name: string;
  elements: JsonThemeElement[];
  color: string;
}

// Analyze theme JSON and extract all customizable elements
export const analyzeThemeStructure = (theme: any): JsonThemeCategory[] => {
  const categories: Record<string, JsonThemeElement[]> = {
    layout: [],
    text: [],
    buttons: [],
    colors: [],
    inputs: [],
    containers: [],
    icons: []
  };

  const extractElements = (obj: any, path: string = '', parentKey: string = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      const elementKey = parentKey ? `${parentKey}-${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Check if this object has style properties
        const styleProperties = extractStyleProperties(value);
        
        if (styleProperties.length > 0) {
          const category = determineCategory(key, styleProperties);
          categories[category].push({
            key: elementKey,
            path: currentPath,
            category,
            properties: styleProperties,
            domSelector: `[data-element-id="${elementKey}"]`,
            description: generateDescription(key, styleProperties)
          });
        }
        
        // Continue recursively
        extractElements(value, currentPath, elementKey);
      }
    }
  };

  extractElements(theme);

  // Convert to category structure
  return Object.entries(categories).map(([name, elements]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    elements,
    color: getCategoryColor(name)
  }));
};

const extractStyleProperties = (obj: any): string[] => {
  const styleProps = [
    'backgroundColor', 'textColor', 'borderRadius', 'fontSize', 
    'fontFamily', 'fontWeight', 'color', 'border', 'boxShadow',
    'backgroundImage', 'opacity', 'padding', 'margin'
  ];
  
  return Object.keys(obj).filter(key => 
    styleProps.includes(key) || key.includes('Color') || key.includes('Font')
  );
};

const determineCategory = (key: string, properties: string[]): string => {
  if (key.includes('button') || key.includes('Button')) return 'buttons';
  if (key.includes('input') || key.includes('Input')) return 'inputs';
  if (key.includes('icon') || key.includes('Icon')) return 'icons';
  if (key.includes('container') || key.includes('Container')) return 'containers';
  if (properties.some(p => p.includes('text') || p.includes('font'))) return 'text';
  if (properties.some(p => p.includes('background') || p.includes('border'))) return 'layout';
  if (properties.some(p => p.includes('Color'))) return 'colors';
  
  return 'layout';
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    layout: '#FFD700',
    text: '#FFA500', 
    buttons: '#FF6B35',
    colors: '#9B59B6',
    inputs: '#3498DB',
    containers: '#2ECC71',
    icons: '#E74C3C'
  };
  
  return colors[category] || '#FFD700';
};

const generateDescription = (key: string, properties: string[]): string => {
  return `${key} - Customizable: ${properties.join(', ')}`;
};
