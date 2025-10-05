import { supabase } from '@/integrations/supabase/client';
import { setByPath } from '@/ai/findPath';

interface ElementMapping {
  id: string;
  name: string;
  selector: string;
  json_path: string | null;
  screen: string;
  type: string;
}

class JsonBridgeService {
  private static instance: JsonBridgeService;
  private elementsCache: Map<string, ElementMapping> = new Map();

  static getInstance(): JsonBridgeService {
    if (!JsonBridgeService.instance) {
      JsonBridgeService.instance = new JsonBridgeService();
    }
    return JsonBridgeService.instance;
  }

  async loadElementMappings(screen?: string): Promise<void> {
    console.log('🔗 Loading element mappings from database...');
    
    let query = supabase
      .from('wallet_elements')
      .select('*')
      .not('json_path', 'is', null);

    if (screen) {
      query = query.eq('screen', screen);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to load mappings:', error);
      return;
    }

    this.elementsCache.clear();
    data?.forEach(element => {
      this.elementsCache.set(element.id, element as ElementMapping);
      
      // Also cache by selector for quick DOM lookups
      if (element.selector) {
        this.elementsCache.set(element.selector, element as ElementMapping);
      }
    });

    console.log(`✅ Loaded ${this.elementsCache.size / 2} element mappings`);
  }

  getElementMapping(elementIdOrSelector: string): ElementMapping | null {
    return this.elementsCache.get(elementIdOrSelector) || null;
  }

  getAllMappings(): ElementMapping[] {
    const mappings: ElementMapping[] = [];
    const seen = new Set<string>();
    
    this.elementsCache.forEach((mapping) => {
      if (!seen.has(mapping.id)) {
        mappings.push(mapping);
        seen.add(mapping.id);
      }
    });
    
    console.log(`[JsonBridge] getAllMappings: returning ${mappings.length} unique mappings`);
    return mappings;
  }

  findMappingByDomElement(domElement: HTMLElement): ElementMapping | null {
    // Try to find by data-element-id first
    const elementId = domElement.getAttribute('data-element-id');
    if (elementId) {
      const mapping = this.elementsCache.get(elementId);
      if (mapping) return mapping;
    }

    // Try to find by CSS selectors
    const selectors = this.extractSelectorsFromElement(domElement);
    for (const selector of selectors) {
      const mapping = this.elementsCache.get(selector);
      if (mapping) return mapping;
    }

    // Try parent elements (up to 3 levels)
    let parent = domElement.parentElement;
    let depth = 0;
    while (parent && depth < 3) {
      const parentId = parent.getAttribute('data-element-id');
      if (parentId) {
        const mapping = this.elementsCache.get(parentId);
        if (mapping) return mapping;
      }

      const parentSelectors = this.extractSelectorsFromElement(parent);
      for (const selector of parentSelectors) {
        const mapping = this.elementsCache.get(selector);
        if (mapping) return mapping;
      }

      parent = parent.parentElement;
      depth++;
    }

    return null;
  }

  private extractSelectorsFromElement(element: HTMLElement): string[] {
    const selectors: string[] = [];
    
    // CSS classes
    element.classList.forEach(cls => {
      selectors.push(`.${cls}`);
    });
    
    // ID
    if (element.id) {
      selectors.push(`#${element.id}`);
    }
    
    // data-element-id
    const dataId = element.getAttribute('data-element-id');
    if (dataId) {
      selectors.push(`[data-element-id="${dataId}"]`);
    }
    
    return selectors;
  }

  async updateThemeValue(
    jsonPath: string, 
    value: any, 
    userId: string
  ): Promise<boolean> {
    try {
      console.log('🔗 Updating theme via JSON Bridge:', { jsonPath, value, userId });

      // Get current theme
      const { data: themeData, error: fetchError } = await supabase
        .from('user_themes')
        .select('theme_data')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ Failed to fetch theme:', fetchError);
        return false;
      }

      const theme = themeData.theme_data;
      
      // Update theme using path
      setByPath(theme, jsonPath, value);

      // Save updated theme
      const { error: updateError } = await supabase
        .from('user_themes')
        .update({ 
          theme_data: theme,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Failed to update theme:', updateError);
        return false;
      }

      console.log('✅ Theme updated successfully via JSON Bridge');
      
      // Dispatch custom event to notify Runtime Engine
      window.dispatchEvent(new CustomEvent('theme-updated', { 
        detail: { jsonPath, value, theme } 
      }));

      return true;
    } catch (error) {
      console.error('❌ JSON Bridge error:', error);
      return false;
    }
  }

  async updateMultipleValues(
    updates: Array<{ jsonPath: string; value: any }>,
    userId: string
  ): Promise<boolean> {
    try {
      console.log('🔗 Batch updating theme:', updates.length, 'changes');

      const { data: themeData, error: fetchError } = await supabase
        .from('user_themes')
        .select('theme_data')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('❌ Failed to fetch theme:', fetchError);
        return false;
      }

      const theme = themeData.theme_data;
      
      // Apply all updates
      updates.forEach(({ jsonPath, value }) => {
        setByPath(theme, jsonPath, value);
      });

      // Save updated theme
      const { error: updateError } = await supabase
        .from('user_themes')
        .update({ 
          theme_data: theme,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Failed to update theme:', updateError);
        return false;
      }

      console.log('✅ Batch theme update successful');
      
      window.dispatchEvent(new CustomEvent('theme-updated', { 
        detail: { updates, theme } 
      }));

      return true;
    } catch (error) {
      console.error('❌ Batch update error:', error);
      return false;
    }
  }
}

export const jsonBridge = JsonBridgeService.getInstance();
