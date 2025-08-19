
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
  }
};

export default walletElementsService;
