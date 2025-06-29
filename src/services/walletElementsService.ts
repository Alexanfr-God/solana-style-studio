import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface WalletElement {
  id: string;
  name: string;
  type: string;
  screen: string;
  description: string;
  customizable: boolean;
  position?: string;
  selector?: string;
  parent_element?: string;
  z_index?: number;
  responsive_settings?: any;
  custom_props: Json[];
  created_at: string;
  updated_at: string;
}

export interface WalletElementsResponse {
  success: boolean;
  elements?: WalletElement[];
  error?: string;
  count?: number;
}

export interface GroupedElements {
  [screen: string]: {
    screen: string;
    elements: WalletElement[];
    counts: {
      total: number;
      customizable: number;
      byType: { [type: string]: number };
    };
    hierarchy: {
      [elementId: string]: WalletElement[];
    };
  };
}

class WalletElementsService {
  
  /**
   * Get all wallet elements with enhanced hierarchy support
   */
  async getAllElements(): Promise<WalletElementsResponse> {
    try {
      console.log('📊 Fetching all wallet elements with hierarchy...');

      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .order('screen', { ascending: true })
        .order('z_index', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching wallet elements:', error);
        throw new Error(`Failed to fetch elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        parent_element: item.parent_element || undefined,
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {},
        custom_props: item.custom_props as Json[],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log('✅ Wallet elements fetched successfully:', {
        count: elements.length,
        screens: [...new Set(elements.map(e => e.screen))].length,
        hierarchical: elements.filter(e => e.parent_element).length
      });

      return {
        success: true,
        elements,
        count: elements.length
      };

    } catch (error) {
      console.error('💥 Error in getAllElements:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all elements grouped by screen with hierarchy
   */
  async getAllGrouped(): Promise<{ success: boolean; grouped: GroupedElements; screens: string[]; error?: string }> {
    try {
      const response = await this.getAllElements();
      
      if (!response.success || !response.elements) {
        return {
          success: false,
          grouped: {},
          screens: [],
          error: response.error
        };
      }

      const grouped: GroupedElements = {};
      const screens: string[] = [];

      response.elements.forEach(element => {
        if (!grouped[element.screen]) {
          grouped[element.screen] = {
            screen: element.screen,
            elements: [],
            counts: {
              total: 0,
              customizable: 0,
              byType: {}
            },
            hierarchy: {}
          };
          screens.push(element.screen);
        }

        grouped[element.screen].elements.push(element);
        grouped[element.screen].counts.total++;

        if (element.customizable) {
          grouped[element.screen].counts.customizable++;
        }

        if (!grouped[element.screen].counts.byType[element.type]) {
          grouped[element.screen].counts.byType[element.type] = 0;
        }
        grouped[element.screen].counts.byType[element.type]++;

        // Build hierarchy
        if (element.parent_element) {
          if (!grouped[element.screen].hierarchy[element.parent_element]) {
            grouped[element.screen].hierarchy[element.parent_element] = [];
          }
          grouped[element.screen].hierarchy[element.parent_element].push(element);
        }
      });

      return {
        success: true,
        grouped,
        screens
      };
    } catch (error) {
      console.error('💥 Error in getAllGrouped:', error);
      return {
        success: false,
        grouped: {},
        screens: [],
        error: error.message
      };
    }
  }

  /**
   * Get statistics about wallet elements
   */
  async getStatistics(): Promise<{ success: boolean; statistics?: any; error?: string }> {
    try {
      const response = await this.getAllElements();
      
      if (!response.success || !response.elements) {
        return {
          success: false,
          error: response.error
        };
      }

      const elements = response.elements;
      const screens = [...new Set(elements.map(e => e.screen))];
      const types = [...new Set(elements.map(e => e.type))];
      const customizable = elements.filter(e => e.customizable).length;
      const hierarchical = elements.filter(e => e.parent_element).length;
      const topLevel = elements.filter(e => !e.parent_element).length;

      const statistics = {
        total: elements.length,
        customizable,
        customizationPercentage: Math.round((customizable / elements.length) * 100),
        hierarchical,
        topLevel,
        maxZIndex: Math.max(...elements.map(e => e.z_index || 0)),
        screens: {
          count: screens.length,
          list: screens,
          details: screens.reduce((acc, screen) => {
            const screenElements = elements.filter(e => e.screen === screen);
            acc[screen] = {
              total: screenElements.length,
              customizable: screenElements.filter(e => e.customizable).length,
              hierarchical: screenElements.filter(e => e.parent_element).length
            };
            return acc;
          }, {} as Record<string, any>)
        },
        types: {
          count: types.length,
          list: types,
          details: types.reduce((acc, type) => {
            const typeElements = elements.filter(e => e.type === type);
            acc[type] = {
              total: typeElements.length,
              customizable: typeElements.filter(e => e.customizable).length
            };
            return acc;
          }, {} as Record<string, any>)
        }
      };

      return {
        success: true,
        statistics
      };
    } catch (error) {
      console.error('💥 Error in getStatistics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get elements by screen
   */
  async getElementsByScreen(screen: string): Promise<WalletElementsResponse> {
    try {
      console.log('📊 Fetching elements for screen:', screen);

      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screen)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching elements by screen:', error);
        throw new Error(`Failed to fetch elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        parent_element: item.parent_element || undefined,
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {},
        custom_props: item.custom_props as Json[],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log(`✅ Elements for screen "${screen}" fetched:`, elements.length);

      return {
        success: true,
        elements,
        count: elements.length
      };

    } catch (error) {
      console.error('💥 Error in getElementsByScreen:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get customizable elements only
   */
  async getCustomizableElements(): Promise<WalletElementsResponse> {
    try {
      console.log('📊 Fetching customizable elements...');

      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('customizable', true)
        .order('screen', { ascending: true });

      if (error) {
        console.error('❌ Error fetching customizable elements:', error);
        throw new Error(`Failed to fetch elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        parent_element: item.parent_element || undefined,
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {},
        custom_props: item.custom_props as Json[],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log('✅ Customizable elements fetched:', elements.length);

      return {
        success: true,
        elements,
        count: elements.length
      };

    } catch (error) {
      console.error('💥 Error in getCustomizableElements:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search elements by query
   */
  async searchElements(query: string): Promise<WalletElement[]> {
    try {
      console.log('🔍 Searching elements with query:', query);

      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,type.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error searching elements:', error);
        throw new Error(`Failed to search elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        parent_element: item.parent_element || undefined,
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {},
        custom_props: item.custom_props as Json[],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log(`✅ Search completed, found ${elements.length} elements`);
      return elements;

    } catch (error) {
      console.error('💥 Error in searchElements:', error);
      return [];
    }
  }

  /**
   * Update element with new fields support
   */
  async updateElement(id: string, updates: Partial<WalletElement>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📝 Updating element:', id);

      const { error } = await supabase
        .from('wallet_elements')
        .update({
          name: updates.name,
          description: updates.description,
          customizable: updates.customizable,
          position: updates.position,
          selector: updates.selector,
          parent_element: updates.parent_element,
          z_index: updates.z_index,
          responsive_settings: updates.responsive_settings,
          custom_props: updates.custom_props as Json[]
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating element:', error);
        throw new Error(`Failed to update element: ${error.message}`);
      }

      console.log('✅ Element updated successfully');
      return { success: true };

    } catch (error) {
      console.error('💥 Error in updateElement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create element with hierarchy support
   */
  async createElement(element: Omit<WalletElement, 'created_at' | 'updated_at'>): Promise<{ success: boolean; element?: WalletElement; error?: string }> {
    try {
      console.log('➕ Creating new element:', element.name);

      const { data, error } = await supabase
        .from('wallet_elements')
        .insert({
          id: element.id,
          name: element.name,
          type: element.type,
          screen: element.screen,
          description: element.description,
          customizable: element.customizable,
          position: element.position,
          selector: element.selector,
          parent_element: element.parent_element,
          z_index: element.z_index || 0,
          responsive_settings: element.responsive_settings || {},
          custom_props: element.custom_props as Json[]
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating element:', error);
        throw new Error(`Failed to create element: ${error.message}`);
      }

      const newElement: WalletElement = {
        id: data.id,
        name: data.name,
        type: data.type,
        screen: data.screen,
        description: data.description,
        customizable: data.customizable,
        position: data.position || undefined,
        selector: data.selector || undefined,
        parent_element: data.parent_element || undefined,
        z_index: data.z_index || 0,
        responsive_settings: data.responsive_settings || {},
        custom_props: data.custom_props as Json[],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      console.log('✅ Element created successfully:', newElement.id);
      return { success: true, element: newElement };

    } catch (error) {
      console.error('💥 Error in createElement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get hierarchy tree for elements
   */
  buildHierarchyTree(elements: WalletElement[]): { [elementId: string]: WalletElement[] } {
    const hierarchy: { [elementId: string]: WalletElement[] } = {};
    
    elements.forEach(element => {
      if (element.parent_element) {
        if (!hierarchy[element.parent_element]) {
          hierarchy[element.parent_element] = [];
        }
        hierarchy[element.parent_element].push(element);
      }
    });

    // Sort children by z_index
    Object.keys(hierarchy).forEach(parentId => {
      hierarchy[parentId].sort((a, b) => (b.z_index || 0) - (a.z_index || 0));
    });

    return hierarchy;
  }

  /**
   * Get elements by parent with hierarchy
   */
  async getElementsByParent(parentId: string): Promise<WalletElementsResponse> {
    try {
      console.log('👨‍👧‍👦 Fetching child elements for parent:', parentId);

      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('parent_element', parentId)
        .order('z_index', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching child elements:', error);
        throw new Error(`Failed to fetch child elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        parent_element: item.parent_element || undefined,
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {},
        custom_props: item.custom_props as Json[],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log(`✅ Child elements for parent "${parentId}" fetched:`, elements.length);

      return {
        success: true,
        elements,
        count: elements.length
      };

    } catch (error) {
      console.error('💥 Error in getElementsByParent:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get elements sorted by z-index
   */
  async getElementsByZIndex(screen?: string): Promise<WalletElementsResponse> {
    try {
      console.log('🔢 Fetching elements sorted by z-index...');

      let query = supabase
        .from('wallet_elements')
        .select('*')
        .order('z_index', { ascending: false })
        .order('name', { ascending: true });

      if (screen) {
        query = query.eq('screen', screen);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching elements by z-index:', error);
        throw new Error(`Failed to fetch elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        parent_element: item.parent_element || undefined,
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {},
        custom_props: item.custom_props as Json[],
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log(`✅ Elements sorted by z-index fetched:`, elements.length);

      return {
        success: true,
        elements,
        count: elements.length
      };

    } catch (error) {
      console.error('💥 Error in getElementsByZIndex:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export service instance
export const walletElementsService = new WalletElementsService();
