
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
      const url = new URL('/wallet-elements', `${supabase.supabaseUrl}/functions/v1/wallet-elements`);
      
      if (filters?.screen) url.searchParams.set('screen', filters.screen);
      if (filters?.type) url.searchParams.set('type', filters.type);
      if (filters?.customizable !== undefined) url.searchParams.set('customizable', String(filters.customizable));

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
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
      const response = await supabase.functions.invoke('wallet-elements', {
        body: { action: 'get-all-grouped' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
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
      const response = await supabase.functions.invoke('wallet-elements', {
        body: { action: 'get-by-screen', screen }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching elements for screen ${screen}:`, error);
      throw error;
    }
  }

  /**
   * Получить только кастомизируемые элементы
   */
  async getCustomizable(): Promise<WalletElementsResponse> {
    try {
      const response = await supabase.functions.invoke('wallet-elements', {
        body: { action: 'get-customizable' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching customizable elements:', error);
      throw error;
    }
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
      const response = await supabase.functions.invoke('wallet-elements', {
        body: { action: 'get-statistics' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
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

      return data || [];
    } catch (error) {
      console.error('Error searching wallet elements:', error);
      throw error;
    }
  }
}

// Создаем экземпляр сервиса
export const walletElementsService = new WalletElementsService();

// Экспортируем типы для использования в других файлах
export type { WalletElement, WalletElementsResponse, GroupedElements };
