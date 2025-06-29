// ====== Enhanced modules/walletElementsManager.ts ======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface WalletElement {
  id: string;
  screen: string;
  name: string;
  type: 'button' | 'background' | 'text' | 'icon' | 'input' | 'card' | 'navigation' | 'header' | 'footer' | 'sidebar';
  description: string;
  customizable: boolean;
  custom_props: CustomProperty[];
  position: string | null;
  selector: string | null;
  parent_element?: string | null;
  z_index?: number;
  responsive_settings?: any;
  created_at: string;
  updated_at: string;
}

export interface CustomProperty {
  name: string;
  type: 'color' | 'size' | 'font' | 'spacing' | 'border' | 'shadow' | 'animation' | 'gradient';
  value: string;
  default: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
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

export interface ElementsStatistics {
  total: number;
  customizable: number;
  customizationPercentage: number;
  screens: {
    list: string[];
    count: number;
  };
  types: {
    list: string[];
    count: number;
  };
  complexity: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

export class WalletElementsManager {
  private supabase: any;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Загрузить все элементы кошелька из таблицы с кешированием
   */
  async loadAllElements(forceRefresh: boolean = false): Promise<WalletElement[]> {
    const cacheKey = 'all_elements';
    
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log('📊 Using cached wallet elements');
        return cached.data;
      }
    }

    console.log('📊 Loading wallet elements from database...');
    
    try {
      const { data, error } = await this.supabase
        .from('wallet_elements')
        .select('*')
        .order('screen, z_index, position, name');

      if (error) {
        console.error('❌ Error loading wallet elements:', error);
        throw new Error(`Failed to load wallet elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : [],
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {}
      }));

      // Cache the results
      this.cache.set(cacheKey, {
        data: elements,
        timestamp: Date.now()
      });

      console.log(`✅ Loaded ${elements.length} wallet elements`);
      return elements;
    } catch (error) {
      console.error('💥 Error in loadAllElements:', error);
      throw error;
    }
  }

  /**
   * Получить элементы по экрану с расширенной фильтрацией
   */
  async getElementsByScreen(
    screen: string, 
    options: {
      includeNonCustomizable?: boolean;
      typeFilter?: string[];
      parentFilter?: string;
    } = {}
  ): Promise<WalletElement[]> {
    console.log(`📱 Loading elements for screen: ${screen}`);
    
    try {
      let query = this.supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screen);

      if (!options.includeNonCustomizable) {
        query = query.eq('customizable', true);
      }

      if (options.typeFilter && options.typeFilter.length > 0) {
        query = query.in('type', options.typeFilter);
      }

      if (options.parentFilter) {
        query = query.eq('parent_element', options.parentFilter);
      }

      query = query.order('z_index, position, name');

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to load elements for screen ${screen}: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : [],
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {}
      }));

      console.log(`✅ Loaded ${elements.length} elements for screen ${screen}`);
      return elements;
    } catch (error) {
      console.error(`💥 Error loading elements for screen ${screen}:`, error);
      throw error;
    }
  }

  /**
   * Получить только кастомизируемые элементы с расширенной информацией
   */
  async getCustomizableElements(screen?: string): Promise<WalletElement[]> {
    console.log('🎨 Loading customizable elements...');
    
    try {
      let query = this.supabase
        .from('wallet_elements')
        .select('*')
        .eq('customizable', true);

      if (screen) {
        query = query.eq('screen', screen);
      }

      query = query.order('screen, z_index, position, name');

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to load customizable elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : [],
        z_index: item.z_index || 0,
        responsive_settings: item.responsive_settings || {}
      }));

      console.log(`✅ Loaded ${elements.length} customizable elements`);
      return elements;
    } catch (error) {
      console.error('💥 Error loading customizable elements:', error);
      throw error;
    }
  }

  /**
   * Группировать элементы по экранам с иерархией
   */
  groupElementsByScreen(elements: WalletElement[]): GroupedElements {
    console.log('📊 Grouping elements by screen with hierarchy...');
    
    const grouped = elements.reduce((acc: GroupedElements, element: WalletElement) => {
      if (!acc[element.screen]) {
        acc[element.screen] = {
          screen: element.screen,
          elements: [],
          counts: {
            total: 0,
            customizable: 0,
            byType: {}
          },
          hierarchy: {}
        };
      }
      
      acc[element.screen].elements.push(element);
      acc[element.screen].counts.total++;
      
      if (element.customizable) {
        acc[element.screen].counts.customizable++;
      }
      
      if (!acc[element.screen].counts.byType[element.type]) {
        acc[element.screen].counts.byType[element.type] = 0;
      }
      acc[element.screen].counts.byType[element.type]++;

      // Build hierarchy
      if (element.parent_element) {
        if (!acc[element.screen].hierarchy[element.parent_element]) {
          acc[element.screen].hierarchy[element.parent_element] = [];
        }
        acc[element.screen].hierarchy[element.parent_element].push(element);
      }
      
      return acc;
    }, {});

    const screenCount = Object.keys(grouped).length;
    console.log(`✅ Grouped elements into ${screenCount} screens with hierarchy`);
    
    return grouped;
  }

  /**
   * Получить расширенную статистику элементов
   */
  getElementsStatistics(elements: WalletElement[]): ElementsStatistics {
    const screens = [...new Set(elements.map(el => el.screen))];
    const types = [...new Set(elements.map(el => el.type))];
    const customizable = elements.filter(el => el.customizable).length;
    
    // Determine complexity based on total elements and customizable options
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (elements.length > 50 || customizable > 20) {
      complexity = 'high';
    } else if (elements.length > 20 || customizable > 10) {
      complexity = 'medium';
    }

    return {
      total: elements.length,
      customizable,
      customizationPercentage: elements.length > 0 ? Math.round((customizable / elements.length) * 100) : 0,
      screens: {
        list: screens,
        count: screens.length
      },
      types: {
        list: types,
        count: types.length
      },
      complexity,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Расширенный поиск элементов
   */
  findElements(
    elements: WalletElement[], 
    criteria: {
      selector?: string;
      name?: string;
      type?: string;
      screen?: string;
      customizable?: boolean;
      hasParent?: boolean;
    }
  ): WalletElement[] {
    return elements.filter(el => {
      if (criteria.selector && !el.selector?.includes(criteria.selector)) return false;
      if (criteria.name && !el.name.toLowerCase().includes(criteria.name.toLowerCase())) return false;
      if (criteria.type && el.type !== criteria.type) return false;
      if (criteria.screen && el.screen !== criteria.screen) return false;
      if (criteria.customizable !== undefined && el.customizable !== criteria.customizable) return false;
      if (criteria.hasParent !== undefined) {
        const hasParent = !!el.parent_element;
        if (hasParent !== criteria.hasParent) return false;
      }
      return true;
    });
  }

  /**
   * Создать расширенный контекст для AI
   */
  createAIContext(elements: WalletElement[], screen?: string) {
    const filteredElements = screen 
      ? elements.filter(el => el.screen === screen)
      : elements;

    const grouped = this.groupElementsByScreen(filteredElements);
    const statistics = this.getElementsStatistics(filteredElements);
    const customizableElements = filteredElements.filter(el => el.customizable);

    // Create element relationships map
    const relationships = this.buildElementRelationships(filteredElements);

    // Extract customization capabilities
    const customizationCapabilities = this.analyzeCustomizationCapabilities(customizableElements);

    return {
      elements: filteredElements,
      grouped,
      statistics,
      customizableElements,
      relationships,
      customizationCapabilities,
      screenSpecific: !!screen,
      targetScreen: screen,
      totalScreens: statistics.screens.list,
      complexity: statistics.complexity
    };
  }

  /**
   * Построить карту отношений между элементами
   */
  private buildElementRelationships(elements: WalletElement[]): any {
    const relationships = {
      parents: new Map<string, WalletElement[]>(),
      children: new Map<string, WalletElement[]>(),
      siblings: new Map<string, WalletElement[]>()
    };

    elements.forEach(element => {
      if (element.parent_element) {
        // Find parent
        const parent = elements.find(el => el.id === element.parent_element);
        if (parent) {
          if (!relationships.parents.has(element.id)) {
            relationships.parents.set(element.id, []);
          }
          relationships.parents.get(element.id)!.push(parent);

          if (!relationships.children.has(parent.id)) {
            relationships.children.set(parent.id, []);
          }
          relationships.children.get(parent.id)!.push(element);
        }

        // Find siblings
        const siblings = elements.filter(el => 
          el.parent_element === element.parent_element && el.id !== element.id
        );
        if (siblings.length > 0) {
          relationships.siblings.set(element.id, siblings);
        }
      }
    });

    return {
      parents: Object.fromEntries(relationships.parents),
      children: Object.fromEntries(relationships.children),
      siblings: Object.fromEntries(relationships.siblings)
    };
  }

  /**
   * Анализ возможностей кастомизации
   */
  private analyzeCustomizationCapabilities(elements: WalletElement[]): any {
    const capabilities = {
      colors: new Set<string>(),
      sizes: new Set<string>(),
      fonts: new Set<string>(),
      animations: new Set<string>(),
      responsive: false,
      advanced: false
    };

    elements.forEach(element => {
      element.custom_props.forEach(prop => {
        switch (prop.type) {
          case 'color':
            capabilities.colors.add(prop.name);
            break;
          case 'size':
            capabilities.sizes.add(prop.name);
            break;
          case 'font':
            capabilities.fonts.add(prop.name);
            break;
          case 'animation':
            capabilities.animations.add(prop.name);
            break;
        }
      });

      if (element.responsive_settings && Object.keys(element.responsive_settings).length > 0) {
        capabilities.responsive = true;
      }

      if (element.custom_props.length > 5) {
        capabilities.advanced = true;
      }
    });

    return {
      colors: Array.from(capabilities.colors),
      sizes: Array.from(capabilities.sizes),
      fonts: Array.from(capabilities.fonts),
      animations: Array.from(capabilities.animations),
      hasResponsive: capabilities.responsive,
      hasAdvanced: capabilities.advanced,
      totalProperties: elements.reduce((sum, el) => sum + el.custom_props.length, 0)
    };
  }

  /**
   * Обновить элемент в базе данных
   */
  async updateElement(elementId: string, updates: Partial<WalletElement>): Promise<WalletElement> {
    try {
      const { data, error } = await this.supabase
        .from('wallet_elements')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', elementId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update element: ${error.message}`);
      }

      // Clear cache
      this.cache.clear();

      console.log(`✅ Updated element: ${elementId}`);
      return data;
    } catch (error) {
      console.error('❌ Error updating element:', error);
      throw error;
    }
  }

  /**
   * Создать новый элемент
   */
  async createElement(element: Omit<WalletElement, 'id' | 'created_at' | 'updated_at'>): Promise<WalletElement> {
    try {
      const { data, error } = await this.supabase
        .from('wallet_elements')
        .insert({
          ...element,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create element: ${error.message}`);
      }

      // Clear cache
      this.cache.clear();

      console.log(`✅ Created new element: ${data.id}`);
      return data;
    } catch (error) {
      console.error('❌ Error creating element:', error);
      throw error;
    }
  }

  /**
   * Удалить элемент
   */
  async deleteElement(elementId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('wallet_elements')
        .delete()
        .eq('id', elementId);

      if (error) {
        throw new Error(`Failed to delete element: ${error.message}`);
      }

      // Clear cache
      this.cache.clear();

      console.log(`✅ Deleted element: ${elementId}`);
    } catch (error) {
      console.error('❌ Error deleting element:', error);
      throw error;
    }
  }

  /**
   * Очистить кеш
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}

export function createWalletElementsManager(supabaseUrl: string, supabaseKey: string) {
  return new WalletElementsManager(supabaseUrl, supabaseKey);
}

