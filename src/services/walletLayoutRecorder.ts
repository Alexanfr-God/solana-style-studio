
import { supabase } from '@/integrations/supabase/client';

export interface LayoutElement {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; width: number; height: number };
  styles: Record<string, any>;
  isCustomizable: boolean;
}

export interface WalletLayout {
  id: string;
  walletType: string;
  screenType: string;
  elements: LayoutElement[];
  metadata: {
    recordedAt: string;
    version: string;
    deviceType: string;
  };
}

export interface LayoutRecordingResult {
  success: boolean;
  layout?: WalletLayout;
  error?: string;
}

class WalletLayoutRecorder {
  /**
   * Записать текущий макет кошелька
   */
  async recordLayout(walletType: string, screenType: string): Promise<LayoutRecordingResult> {
    try {
      console.log('📐 Recording wallet layout...', { walletType, screenType });

      // Получаем элементы из таблицы wallet_elements
      const { data: elementsData, error: elementsError } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('screen', screenType);

      if (elementsError) {
        throw new Error(`Failed to load elements: ${elementsError.message}`);
      }

      // Преобразуем в формат LayoutElement
      const elements: LayoutElement[] = (elementsData || []).map(element => ({
        id: element.id,
        name: element.name,
        type: element.type,
        position: { x: 0, y: 0, width: 100, height: 30 }, // Базовые размеры
        styles: {},
        isCustomizable: element.customizable
      }));

      const layout: WalletLayout = {
        id: `${walletType}-${screenType}-${Date.now()}`,
        walletType,
        screenType,
        elements,
        metadata: {
          recordedAt: new Date().toISOString(),
          version: '1.0',
          deviceType: 'desktop'
        }
      };

      console.log('✅ Layout recorded successfully', {
        elementsCount: elements.length,
        customizableCount: elements.filter(e => e.isCustomizable).length
      });

      return {
        success: true,
        layout
      };

    } catch (error) {
      console.error('💥 Error recording layout:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Сохранить макет в локальное хранилище
   */
  async saveLayoutLocally(layout: WalletLayout): Promise<boolean> {
    try {
      const layouts = this.getStoredLayouts();
      layouts[layout.id] = layout;
      
      localStorage.setItem('wallet_layouts', JSON.stringify(layouts));
      console.log('💾 Layout saved locally:', layout.id);
      
      return true;
    } catch (error) {
      console.error('💥 Error saving layout locally:', error);
      return false;
    }
  }

  /**
   * Получить сохраненные макеты
   */
  getStoredLayouts(): Record<string, WalletLayout> {
    try {
      const stored = localStorage.getItem('wallet_layouts');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('💥 Error getting stored layouts:', error);
      return {};
    }
  }

  /**
   * Загрузить макет по ID
   */
  async loadLayout(layoutId: string): Promise<WalletLayout | null> {
    try {
      const layouts = this.getStoredLayouts();
      return layouts[layoutId] || null;
    } catch (error) {
      console.error('💥 Error loading layout:', error);
      return null;
    }
  }

  /**
   * Получить все макеты для определенного типа кошелька
   */
  async getLayoutsByWalletType(walletType: string): Promise<WalletLayout[]> {
    try {
      const layouts = this.getStoredLayouts();
      return Object.values(layouts).filter(layout => layout.walletType === walletType);
    } catch (error) {
      console.error('💥 Error getting layouts by wallet type:', error);
      return [];
    }
  }

  /**
   * Удалить макет
   */
  async deleteLayout(layoutId: string): Promise<boolean> {
    try {
      const layouts = this.getStoredLayouts();
      delete layouts[layoutId];
      
      localStorage.setItem('wallet_layouts', JSON.stringify(layouts));
      console.log('🗑️ Layout deleted:', layoutId);
      
      return true;
    } catch (error) {
      console.error('💥 Error deleting layout:', error);
      return false;
    }
  }

  /**
   * Записать и сохранить макет автоматически
   */
  async recordAndSave(walletType: string, screenType: string): Promise<LayoutRecordingResult> {
    const result = await this.recordLayout(walletType, screenType);
    
    if (result.success && result.layout) {
      await this.saveLayoutLocally(result.layout);
    }
    
    return result;
  }

  /**
   * Получить статистику записанных макетов
   */
  getLayoutStatistics() {
    const layouts = this.getStoredLayouts();
    const layoutArray = Object.values(layouts);
    
    const walletTypes = [...new Set(layoutArray.map(l => l.walletType))];
    const screenTypes = [...new Set(layoutArray.map(l => l.screenType))];
    
    return {
      total: layoutArray.length,
      walletTypes: walletTypes.length,
      screenTypes: screenTypes.length,
      byWalletType: walletTypes.reduce((acc, type) => {
        acc[type] = layoutArray.filter(l => l.walletType === type).length;
        return acc;
      }, {} as Record<string, number>),
      byScreenType: screenTypes.reduce((acc, type) => {
        acc[type] = layoutArray.filter(l => l.screenType === type).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Создаем экземпляр сервиса
export const walletLayoutRecorder = new WalletLayoutRecorder();

// Экспортируем типы
export type { LayoutElement, WalletLayout, LayoutRecordingResult };
