
import { supabase } from '@/integrations/supabase/client';

export interface WalletElement {
  id: string;
  screen: string;
  name: string;
  type: string;
  description: string;
  customizable: boolean;
  custom_props: string[];
  position: string | null;
  selector: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalletElementsResponse {
  success: boolean;
  elements: WalletElement[];
  count: number;
  [key: string]: any;
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

class WalletElementsService {
  /**
   * Получить все элементы с фильтрами
   */
  async getElements(filters?: {
    screen?: string;
    type?: string;
    customizable?: boolean;
  }): Promise<WalletElementsResponse> {
    try {
      let query = supabase
        .from('wallet_elements')
        .select('*')
        .order('screen, position, name');

      if (filters?.screen) {
        query = query.eq('screen', filters.screen);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.customizable !== undefined) {
        query = query.eq('customizable', filters.customizable);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch elements: ${error.message}`);
      }

      // Преобразуем Json в string[] для custom_props
      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      return {
        success: true,
        elements,
        count: elements.length,
        filters
      };
    } catch (error) {
      console.error('Error fetching wallet elements:', error);
      throw error;
    }
  }

  /**
   * Получить все элементы, сгруппированные по экранам
   */
  async getAllGrouped(): Promise<{
    success: boolean;
    grouped: GroupedElements;
    screens: string[];
    totalElements: number;
    customizableElements: number;
    metadata: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .order('screen, position, name');

      if (error) {
        throw new Error(error.message);
      }

      // Преобразуем данные
      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      // Группируем элементы по экранам
      const grouped = elements.reduce((acc: any, element: WalletElement) => {
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

      const screens = Object.keys(grouped);
      const totalElements = elements.length;
      const customizableElements = elements.filter(el => el.customizable).length;

      return {
        success: true,
        grouped,
        screens,
        totalElements,
        customizableElements,
        metadata: {
          screenCount: screens.length,
          averageElementsPerScreen: Math.round(totalElements / screens.length),
          customizationPercentage: Math.round((customizableElements / totalElements) * 100)
        }
      };
    } catch (error) {
      console.error('Error fetching grouped wallet elements:', error);
      throw error;
    }
  }

  /**
   * Получить элементы конкретного экрана
   */
  async getByScreen(screen: string): Promise<{
    success: boolean;
    screen: string;
    elements: WalletElement[];
    byPosition: { [position: string]: WalletElement[] };
    count: number;
    customizableCount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screen)
        .order('position, name');

      if (error) {
        throw new Error(`Failed to fetch elements for screen ${screen}: ${error.message}`);
      }

      const elements: WalletElement[] = (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      // Группируем по позиции
      const byPosition = elements.reduce((acc: any, element: WalletElement) => {
        const pos = element.position || 'unspecified';
        if (!acc[pos]) {
          acc[pos] = [];
        }
        acc[pos].push(element);
        return acc;
      }, {});

      return {
        success: true,
        screen,
        elements,
        byPosition,
        count: elements.length,
        customizableCount: elements.filter(el => el.customizable).length
      };
    } catch (error) {
      console.error(`Error fetching elements for screen ${screen}:`, error);
      throw error;
    }
  }

  /**
   * Получить только кастомизируемые элементы
   */
  async getCustomizable(): Promise<WalletElementsResponse> {
    return this.getElements({ customizable: true });
  }

  /**
   * Получить статистику элементов
   */
  async getStatistics(): Promise<{
    success: boolean;
    statistics: {
      total: number;
      customizable: number;
      customizationPercentage: number;
      screens: {
        list: string[];
        count: number;
        details: { [screen: string]: any };
      };
      types: {
        list: string[];
        count: number;
        details: { [type: string]: any };
      };
      positions: {
        list: string[];
        distribution: { [position: string]: number };
      };
    };
  }> {
    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch elements for statistics: ${error.message}`);
      }

      if (!data) {
        return {
          success: true,
          statistics: {
            total: 0,
            customizable: 0,
            customizationPercentage: 0,
            screens: { list: [], count: 0, details: {} },
            types: { list: [], count: 0, details: {} },
            positions: { list: [], distribution: {} }
          }
        };
      }

      const elements: WalletElement[] = data.map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));

      // Вычисляем статистику
      const screens = [...new Set(elements.map(el => el.screen))];
      const types = [...new Set(elements.map(el => el.type))];
      const customizable = elements.filter(el => el.customizable).length;

      const screenStats = screens.reduce((acc: any, screen) => {
        const screenElements = elements.filter(el => el.screen === screen);
        acc[screen] = {
          total: screenElements.length,
          customizable: screenElements.filter(el => el.customizable).length,
          types: [...new Set(screenElements.map(el => el.type))]
        };
        return acc;
      }, {});

      const typeStats = types.reduce((acc: any, type) => {
        const typeElements = elements.filter(el => el.type === type);
        acc[type] = {
          total: typeElements.length,
          customizable: typeElements.filter(el => el.customizable).length,
          screens: [...new Set(typeElements.map(el => el.screen))]
        };
        return acc;
      }, {});

      return {
        success: true,
        statistics: {
          total: elements.length,
          customizable,
          customizationPercentage: Math.round((customizable / elements.length) * 100),
          screens: {
            list: screens,
            count: screens.length,
            details: screenStats
          },
          types: {
            list: types,
            count: types.length,
            details: typeStats
          },
          positions: {
            list: [...new Set(elements.map(el => el.position).filter(Boolean))],
            distribution: elements.reduce((acc: any, el) => {
              const pos = el.position || 'unspecified';
              acc[pos] = (acc[pos] || 0) + 1;
              return acc;
            }, {})
          }
        }
      };
    } catch (error) {
      console.error('Error fetching wallet elements statistics:', error);
      throw error;
    }
  }

  /**
   * Получить элементы по типу
   */
  async getByType(type: string): Promise<WalletElementsResponse> {
    return this.getElements({ type });
  }

  /**
   * Получить элементы конкретной позиции на экране
   */
  async getByPosition(screen: string, position: string): Promise<WalletElement[]> {
    const screenData = await this.getByScreen(screen);
    return screenData.byPosition[position] || [];
  }

  /**
   * Поиск элементов по названию или описанию
   */
  async searchElements(query: string): Promise<WalletElement[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('screen, name');

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(item => ({
        ...item,
        custom_props: Array.isArray(item.custom_props) ? item.custom_props : []
      }));
    } catch (error) {
      console.error('Error searching wallet elements:', error);
      throw error;
    }
  }
}

// Создаем экземпляр сервиса
export const walletElementsService = new WalletElementsService();
