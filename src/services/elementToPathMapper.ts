/**
 * Element-to-Path Mapper Service
 * Maps UI elements from wallet_elements table to their JSON paths in theme structure
 * This enables AI to understand which JSON properties control which visual elements
 */

import { supabase } from '@/integrations/supabase/client';

export interface ElementMapping {
  id: string;
  name: string;
  type: string;
  screen: string;
  position?: string;
  description: string;
  category?: string;
  jsonPath?: string;
  customizable: boolean;
}

export interface ElementContext {
  element: ElementMapping;
  pathInfo: {
    jsonPath: string;
    pathType: 'component' | 'style' | 'asset' | 'icon';
    expectedValueType: string;
  };
}

/**
 * Get all customizable elements for a specific screen/layer
 */
export async function getElementsForScreen(screen: string): Promise<ElementMapping[]> {
  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .eq('screen', screen)
    .eq('customizable', true)
    .order('name');

  if (error) {
    console.error('[ElementMapper] Error fetching elements:', error);
    return [];
  }

  return data as ElementMapping[];
}

/**
 * Find elements by name or description (fuzzy search for AI)
 */
export async function findElementByQuery(query: string): Promise<ElementMapping[]> {
  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('customizable', true)
    .limit(10);

  if (error) {
    console.error('[ElementMapper] Error searching elements:', error);
    return [];
  }

  return data as ElementMapping[];
}

/**
 * Get JSON path for a specific element by ID
 */
export async function getPathForElement(elementId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('wallet_elements')
    .select('json_path')
    .eq('id', elementId)
    .single();

  if (error) {
    console.error('[ElementMapper] Error fetching path:', error);
    return null;
  }

  return data?.json_path || null;
}

/**
 * Get all elements with their JSON paths (only mapped elements)
 */
export async function getAllMappedElements(): Promise<ElementMapping[]> {
  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .not('json_path', 'is', null)
    .eq('customizable', true)
    .order('screen', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('[ElementMapper] Error fetching mapped elements:', error);
    return [];
  }

  return data as ElementMapping[];
}

/**
 * Format element context for AI prompt
 * This creates a structured description that AI can use to understand the UI
 */
export function formatElementContextForAI(elements: ElementMapping[]): string {
  if (elements.length === 0) {
    return 'No element mappings available yet.';
  }

  const byScreen = elements.reduce((acc, el) => {
    if (!acc[el.screen]) acc[el.screen] = [];
    acc[el.screen].push(el);
    return acc;
  }, {} as Record<string, ElementMapping[]>);

  let context = '# UI Elements Registry\n\n';
  context += 'Available customizable elements and their JSON paths:\n\n';

  Object.entries(byScreen).forEach(([screen, screenElements]) => {
    context += `## ${screen.toUpperCase()} Screen\n\n`;
    
    screenElements.forEach(el => {
      context += `### ${el.name}\n`;
      context += `- **ID**: ${el.id}\n`;
      context += `- **Type**: ${el.type}\n`;
      context += `- **Description**: ${el.description}\n`;
      
      if (el.position) {
        context += `- **Position**: ${el.position}\n`;
      }
      
      if (el.jsonPath) {
        context += `- **JSON Path**: \`${el.jsonPath}\`\n`;
        context += `- **Example**: To modify this element, use patch operation on path: ${el.jsonPath}\n`;
      } else {
        context += `- **JSON Path**: Not mapped yet\n`;
      }
      
      context += '\n';
    });
  });

  return context;
}

/**
 * Determine the type of path (component/style/asset/icon)
 */
export function inferPathType(jsonPath: string): 'component' | 'style' | 'asset' | 'icon' {
  if (jsonPath.includes('/styles/')) return 'style';
  if (jsonPath.includes('/assets/')) return 'asset';
  if (jsonPath.includes('/icons/') || jsonPath.includes('Icon')) return 'icon';
  return 'component';
}

/**
 * Get element context with path information for AI
 */
export async function getElementContext(elementId: string): Promise<ElementContext | null> {
  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .eq('id', elementId)
    .single();

  if (error || !data) {
    console.error('[ElementMapper] Error fetching element context:', error);
    return null;
  }

  const element = data as ElementMapping;
  
  if (!element.jsonPath) {
    console.warn('[ElementMapper] Element has no JSON path mapping:', elementId);
    return null;
  }

  const pathType = inferPathType(element.jsonPath);
  
  return {
    element,
    pathInfo: {
      jsonPath: element.jsonPath,
      pathType,
      expectedValueType: pathType === 'style' ? 'string (color/css)' : 'object or string'
    }
  };
}

/**
 * Update json_path for an element (admin function)
 */
export async function updateElementPath(elementId: string, jsonPath: string): Promise<boolean> {
  const { error } = await supabase
    .from('wallet_elements')
    .update({ json_path: jsonPath })
    .eq('id', elementId);

  if (error) {
    console.error('[ElementMapper] Error updating path:', error);
    return false;
  }

  console.log('[ElementMapper] ✅ Updated path for element:', elementId, '→', jsonPath);
  return true;
}

/**
 * Get mapping coverage statistics
 */
export async function getMappingStats(): Promise<{
  total: number;
  mapped: number;
  unmapped: number;
  coveragePercent: number;
  byScreen: Record<string, { total: number; mapped: number }>;
}> {
  const { data: allElements, error: allError } = await supabase
    .from('wallet_elements')
    .select('screen, json_path')
    .eq('customizable', true);

  if (allError || !allElements) {
    return {
      total: 0,
      mapped: 0,
      unmapped: 0,
      coveragePercent: 0,
      byScreen: {}
    };
  }

  const total = allElements.length;
  const mapped = allElements.filter(el => el.json_path).length;
  const unmapped = total - mapped;
  const coveragePercent = total > 0 ? Math.round((mapped / total) * 100) : 0;

  const byScreen: Record<string, { total: number; mapped: number }> = {};
  
  allElements.forEach(el => {
    if (!byScreen[el.screen]) {
      byScreen[el.screen] = { total: 0, mapped: 0 };
    }
    byScreen[el.screen].total++;
    if (el.json_path) byScreen[el.screen].mapped++;
  });

  return {
    total,
    mapped,
    unmapped,
    coveragePercent,
    byScreen
  };
}
