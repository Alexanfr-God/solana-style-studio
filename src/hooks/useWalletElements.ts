
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
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
  json_path?: string;
}

export interface ElementCategory {
  id: string;
  name: string;
  description: string;
  customization_types: Json | null;
  default_library_path: string;
  icon_color: string;
  sort_order: number;
  is_active: boolean;
}

// Helper-функция для безопасного преобразования Json в string[]
const parseCustomizationTypes = (types: Json | null): string[] => {
  if (Array.isArray(types)) {
    return types as string[];
  }
  return [];
};

export const useWalletElements = () => {
  const [elements, setElements] = useState<WalletElement[]>([]);
  const [categories, setCategories] = useState<ElementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ранний возврат если флаг отключен
  if (!FLAGS.ICON_LIB_ENABLED) {
    return {
      elements: [],
      categories: [],
      loading: false,
      error: null,
      getElementsByCategory: () => [],
      getCategoryById: () => undefined,
      getCategoryCustomizationTypes: () => [],
      parseCustomizationTypes
    };
  }

  useEffect(() => {
    const loadWalletElements = async () => {
      try {
        console.log('🔄 Loading wallet elements and categories from Supabase...');
        
        // Загружаем элементы с новыми полями
        const { data: elementsData, error: elementsError } = await supabase
          .from('wallet_elements')
          .select('*')
          .eq('customizable', true)
          .order('screen', { ascending: true });

        if (elementsError) {
          console.error('❌ Error loading wallet elements:', elementsError);
          setError(elementsError.message);
          return;
        }

        // Загружаем категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('element_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (categoriesError) {
          console.error('❌ Error loading element categories:', categoriesError);
          setError(categoriesError.message);
          return;
        }

        console.log('✅ Loaded wallet elements:', elementsData);
        console.log('✅ Loaded element categories:', categoriesData);
        
        setElements(elementsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('❌ Exception loading wallet data:', err);
        setError('Failed to load wallet elements and categories');
      } finally {
        setLoading(false);
      }
    };

    loadWalletElements();
  }, []);

  const getElementsByCategory = (categoryId: string) => {
    return elements.filter(element => element.category === categoryId);
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(category => category.id === categoryId);
  };

  const getCategoryCustomizationTypes = (categoryId: string): string[] => {
    const category = getCategoryById(categoryId);
    return category ? parseCustomizationTypes(category.customization_types) : [];
  };

  return { 
    elements, 
    categories, 
    loading, 
    error, 
    getElementsByCategory, 
    getCategoryById,
    getCategoryCustomizationTypes,
    parseCustomizationTypes
  };
};
