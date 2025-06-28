
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
  custom_props: Json[]; // Changed from string[] to Json[]
  created_at: string;
  updated_at: string;
}

export interface WalletElementsResponse {
  success: boolean;
  elements?: WalletElement[];
  error?: string;
  count?: number;
}

class WalletElementsService {
  /**
   * Get all wallet elements
   */
  async getAllElements(): Promise<WalletElementsResponse> {
    try {
      console.log('📊 Fetching all wallet elements...');

      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .order('screen', { ascending: true });

      if (error) {
        console.error('❌ Error fetching wallet elements:', error);
        throw new Error(`Failed to fetch elements: ${error.message}`);
      }

      // Transform data to match WalletElement interface
      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        custom_props: item.custom_props as Json[], // Proper type casting
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log('✅ Wallet elements fetched successfully:', {
        count: elements.length,
        screens: [...new Set(elements.map(e => e.screen))].length
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

      // Transform data to match WalletElement interface
      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        custom_props: item.custom_props as Json[], // Proper type casting
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

      // Transform data to match WalletElement interface
      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        custom_props: item.custom_props as Json[], // Proper type casting
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
  async searchElements(query: string): Promise<WalletElementsResponse> {
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

      // Transform data to match WalletElement interface
      const elements: WalletElement[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        screen: item.screen,
        description: item.description,
        customizable: item.customizable,
        position: item.position || undefined,
        selector: item.selector || undefined,
        custom_props: item.custom_props as Json[], // Proper type casting
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log(`✅ Search completed, found ${elements.length} elements`);

      return {
        success: true,
        elements,
        count: elements.length
      };

    } catch (error) {
      console.error('💥 Error in searchElements:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get element statistics
   */
  async getElementStatistics(): Promise<any> {
    try {
      const allElements = await this.getAllElements();
      
      if (!allElements.success || !allElements.elements) {
        return {
          total: 0,
          customizable: 0,
          screens: 0,
          types: 0
        };
      }

      const elements = allElements.elements;
      const screens = [...new Set(elements.map(e => e.screen))];
      const types = [...new Set(elements.map(e => e.type))];
      const customizable = elements.filter(e => e.customizable).length;

      return {
        total: elements.length,
        customizable,
        customizationPercentage: Math.round((customizable / elements.length) * 100),
        screens: screens.length,
        types: types.length,
        screenBreakdown: screens.reduce((acc, screen) => {
          acc[screen] = elements.filter(e => e.screen === screen).length;
          return acc;
        }, {} as Record<string, number>),
        typeBreakdown: types.reduce((acc, type) => {
          acc[type] = elements.filter(e => e.type === type).length;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('💥 Error getting element statistics:', error);
      return {
        total: 0,
        customizable: 0,
        screens: 0,
        types: 0
      };
    }
  }

  /**
   * Update element
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
          custom_props: updates.custom_props as Json[] // Proper type casting
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
}

// Create and export service instance
export const walletElementsService = new WalletElementsService();

// Export types
export type { WalletElement, WalletElementsResponse };
