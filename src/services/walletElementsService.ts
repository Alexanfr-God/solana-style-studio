
import { supabase } from '@/integrations/supabase/client';
import { FLAGS } from '@/config/featureFlags';

export interface WalletElement {
  id: string;
  name: string;
  selector: string;
  screen: string;
  type: string;
  description: string;
  customizable: boolean;
  position?: string;
  parent_element?: string;
  category?: string;
  asset_library_path?: string;
  z_index?: number;
}

export interface ElementCategory {
  id: string;
  name: string;
  description: string;
  customization_types: any;
  default_library_path: string;
  icon_color: string;
  sort_order: number;
  is_active: boolean;
}

export interface ElementStatistics {
  total: number;
  hierarchical: number;
  topLevel: number;
  maxZIndex: number;
}

// Ранний возврат если флаг отключен
const checkFeatureEnabled = () => {
  if (!FLAGS.ICON_LIB_ENABLED) {
    console.log('🚫 Icon library disabled - returning empty data');
    return false;
  }
  return true;
};

export const walletElementsService = {
  // Получить все элементы кошелька
  async getAllElements(): Promise<{ success: boolean; elements: WalletElement[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, elements: [] };
    }

    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .order('screen', { ascending: true });

      if (error) {
        console.error('❌ Error fetching wallet elements:', error);
        return { success: false, elements: [] };
      }

      return { success: true, elements: data || [] };
    } catch (error) {
      console.error('❌ Exception in getAllElements:', error);
      return { success: false, elements: [] };
    }
  },

  // Получить кастомизируемые элементы
  async getCustomizableElements(): Promise<{ success: boolean; elements: WalletElement[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, elements: [] };
    }

    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('customizable', true)
        .order('screen', { ascending: true });

      if (error) {
        console.error('❌ Error fetching customizable elements:', error);
        return { success: false, elements: [] };
      }

      return { success: true, elements: data || [] };
    } catch (error) {
      console.error('❌ Exception in getCustomizableElements:', error);
      return { success: false, elements: [] };
    }
  },

  // Получить категории элементов
  async getElementCategories(): Promise<{ success: boolean; categories: ElementCategory[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, categories: [] };
    }

    try {
      const { data, error } = await supabase
        .from('element_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('❌ Error fetching element categories:', error);
        return { success: false, categories: [] };
      }

      return { success: true, categories: data || [] };
    } catch (error) {
      console.error('❌ Exception in getElementCategories:', error);
      return { success: false, categories: [] };
    }
  },

  // Получить элементы по экрану
  async getElementsByScreen(screen: string): Promise<{ success: boolean; elements: WalletElement[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, elements: [] };
    }

    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screen)
        .order('position', { ascending: true });

      if (error) {
        console.error('❌ Error fetching elements by screen:', error);
        return { success: false, elements: [] };
      }

      return { success: true, elements: data || [] };
    } catch (error) {
      console.error('❌ Exception in getElementsByScreen:', error);
      return { success: false, elements: [] };
    }
  },

  // Получить элементы по категории
  async getElementsByCategory(category: string): Promise<{ success: boolean; elements: WalletElement[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, elements: [] };
    }

    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching elements by category:', error);
        return { success: false, elements: [] };
      }

      return { success: true, elements: data || [] };
    } catch (error) {
      console.error('❌ Exception in getElementsByCategory:', error);
      return { success: false, elements: [] };
    }
  },

  // Получить элементы по родительскому элементу
  async getElementsByParent(parentId: string): Promise<{ success: boolean; elements: WalletElement[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, elements: [] };
    }

    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('parent_element', parentId)
        .order('z_index', { ascending: true });

      if (error) {
        console.error('❌ Error fetching elements by parent:', error);
        return { success: false, elements: [] };
      }

      return { success: true, elements: data || [] };
    } catch (error) {
      console.error('❌ Exception in getElementsByParent:', error);
      return { success: false, elements: [] };
    }
  },

  // Получить элементы по z-index для экрана
  async getElementsByZIndex(screen: string): Promise<{ success: boolean; elements: WalletElement[] }> {
    if (!checkFeatureEnabled()) {
      return { success: true, elements: [] };
    }

    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screen)
        .not('z_index', 'is', null)
        .order('z_index', { ascending: true });

      if (error) {
        console.error('❌ Error fetching elements by z-index:', error);
        return { success: false, elements: [] };
      }

      return { success: true, elements: data || [] };
    } catch (error) {
      console.error('❌ Exception in getElementsByZIndex:', error);
      return { success: false, elements: [] };
    }
  },

  // Получить статистику элементов
  async getStatistics(): Promise<{ success: boolean; statistics: ElementStatistics | null }> {
    if (!checkFeatureEnabled()) {
      return { 
        success: true, 
        statistics: { total: 0, hierarchical: 0, topLevel: 0, maxZIndex: 0 } 
      };
    }

    try {
      const { data: allElements, error } = await supabase
        .from('wallet_elements')
        .select('*');

      if (error) {
        console.error('❌ Error fetching statistics:', error);
        return { success: false, statistics: null };
      }

      const elements = allElements || [];
      const hierarchical = elements.filter(el => el.parent_element).length;
      const topLevel = elements.filter(el => !el.parent_element).length;
      const maxZIndex = Math.max(...elements.map(el => el.z_index || 0));

      const statistics: ElementStatistics = {
        total: elements.length,
        hierarchical,
        topLevel,
        maxZIndex
      };

      return { success: true, statistics };
    } catch (error) {
      console.error('❌ Exception in getStatistics:', error);
      return { success: false, statistics: null };
    }
  }
};

export default walletElementsService;
