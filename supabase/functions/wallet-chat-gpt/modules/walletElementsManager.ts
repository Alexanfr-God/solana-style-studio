
// Модуль для работы с элементами кошелька из таблицы wallet_elements
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface WalletElement {
  id: string;
  screen: string;
  name: string;
  type: string;
  description: string;
  customizable: boolean;
  custom_props: any[];
  position: string | null;
  selector: string | null;
  created_at: string;
  updated_at: string;
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
  };
}

export class WalletElementsManager {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Загрузить все элементы кошелька из таблицы
   */
  async loadAllElements(): Promise<WalletElement[]> {
    console.log('📊 Loading wallet elements from database...');
    
    try {
      const { data, error } = await this.supabase
        .from('wallet_elements')
        .select('*')
        .order('screen, position, name');

      if (error) {
        console.error('❌ Error loading wallet elements:', error);
        throw new Error(`Failed to load wallet elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      console.log(`✅ Loaded ${elements.length} wallet elements`);
      return elements;
    } catch (error) {
      console.error('💥 Error in loadAllElements:', error);
      throw error;
    }
  }

  /**
   * Получить элементы по экрану
   */
  async getElementsByScreen(screen: string): Promise<WalletElement[]> {
    console.log(`📱 Loading elements for screen: ${screen}`);
    
    try {
      const { data, error } = await this.supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screen)
        .order('position, name');

      if (error) {
        throw new Error(`Failed to load elements for screen ${screen}: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      console.log(`✅ Loaded ${elements.length} elements for screen ${screen}`);
      return elements;
    } catch (error) {
      console.error(`💥 Error loading elements for screen ${screen}:`, error);
      throw error;
    }
  }

  /**
   * Получить только кастомизируемые элементы
   */
  async getCustomizableElements(): Promise<WalletElement[]> {
    console.log('🎨 Loading customizable elements...');
    
    try {
      const { data, error } = await this.supabase
        .from('wallet_elements')
        .select('*')
        .eq('customizable', true)
        .order('screen, position, name');

      if (error) {
        throw new Error(`Failed to load customizable elements: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      console.log(`✅ Loaded ${elements.length} customizable elements`);
      return elements;
    } catch (error) {
      console.error('💥 Error loading customizable elements:', error);
      throw error;
    }
  }

  /**
   * Группировать элементы по экранам
   */
  groupElementsByScreen(elements: WalletElement[]): GroupedElements {
    console.log('📊 Grouping elements by screen...');
    
    const grouped = elements.reduce((acc: GroupedElements, element: WalletElement) => {
      if (!acc[element.screen]) {
        acc[element.screen] = {
          screen: element.screen,
          elements: [],
          counts: {
            total: 0,
            customizable: 0,
            byType: {}
          }
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
      
      return acc;
    }, {});

    const screenCount = Object.keys(grouped).length;
    console.log(`✅ Grouped elements into ${screenCount} screens`);
    
    return grouped;
  }

  /**
   * Получить статистику элементов
   */
  getElementsStatistics(elements: WalletElement[]) {
    const screens = [...new Set(elements.map(el => el.screen))];
    const types = [...new Set(elements.map(el => el.type))];
    const customizable = elements.filter(el => el.customizable).length;

    return {
      total: elements.length,
      customizable,
      customizationPercentage: Math.round((customizable / elements.length) * 100),
      screens: {
        list: screens,
        count: screens.length
      },
      types: {
        list: types,
        count: types.length
      }
    };
  }

  /**
   * Поиск элементов по селекторам или именам
   */
  findElementsBySelector(elements: WalletElement[], selector: string): WalletElement[] {
    return elements.filter(el => 
      el.selector?.includes(selector) || 
      el.name.toLowerCase().includes(selector.toLowerCase()) ||
      el.id.includes(selector)
    );
  }

  /**
   * Создать контекст для AI с информацией об элементах
   */
  createAIContext(elements: WalletElement[], screen?: string) {
    const filteredElements = screen 
      ? elements.filter(el => el.screen === screen)
      : elements;

    const grouped = this.groupElementsByScreen(filteredElements);
    const statistics = this.getElementsStatistics(filteredElements);

    return {
      elements: filteredElements,
      grouped,
      statistics,
      customizableElements: filteredElements.filter(el => el.customizable),
      screenSpecific: !!screen,
      targetScreen: screen
    };
  }
}

export function createWalletElementsManager(supabaseUrl: string, supabaseKey: string) {
  return new WalletElementsManager(supabaseUrl, supabaseKey);
}
