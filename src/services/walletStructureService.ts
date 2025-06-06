
import { supabase } from '@/integrations/supabase/client';

export interface WalletStructureResponse {
  success: boolean;
  structure: any;
  metadata: {
    totalElements: number;
    version: string;
    timestamp: string;
  };
}

export class WalletStructureService {
  private static structure: any = null;
  private static isLoading = false;

  /**
   * Получить полную структуру кошелька для AI агентов
   */
  static async getWalletStructure(): Promise<WalletStructureResponse> {
    try {
      if (this.structure) {
        console.log('🔄 Using cached wallet structure');
        return this.structure;
      }

      if (this.isLoading) {
        console.log('⏳ Structure already loading, waiting...');
        // Ждем загрузки
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getWalletStructure();
      }

      this.isLoading = true;
      console.log('📡 Fetching wallet structure from API...');

      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'GET'
      });

      if (error) {
        console.error('❌ Error fetching wallet structure:', error);
        throw new Error(`Failed to fetch wallet structure: ${error.message}`);
      }

      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      this.structure = data;
      this.isLoading = false;

      console.log(`✅ Wallet structure loaded successfully!`);
      console.log(`📊 Total customizable elements: ${data.metadata.totalElements}`);
      console.log(`🎯 Ready for AI Agents integration!`);

      // Сделать структуру глобально доступной
      if (typeof window !== 'undefined') {
        (window as any).walletStructure = data;
        (window as any).applyCustomTheme = this.applyCustomTheme;
        console.log('🌐 Wallet structure made globally available on window.walletStructure');
      }

      return data;

    } catch (error) {
      this.isLoading = false;
      console.error('💥 Failed to load wallet structure:', error);
      throw error;
    }
  }

  /**
   * Применить кастомную тему (заготовка для AI агентов)
   */
  static async applyCustomTheme(theme: any): Promise<void> {
    try {
      console.log('🎨 Theme ready for application:', theme);
      
      // В будущем здесь будет реальное применение темы
      // Пока просто логируем для подготовки к AI агентам
      
      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'POST',
        body: {
          theme,
          userId: 'current-user', // В будущем получать из auth
          action: 'apply-theme'
        }
      });

      if (error) {
        console.error('❌ Error applying theme:', error);
        throw new Error(`Failed to apply theme: ${error.message}`);
      }

      console.log('✅ Theme application response:', data);
      
    } catch (error) {
      console.error('💥 Failed to apply theme:', error);
      throw error;
    }
  }

  /**
   * Получить примеры готовых тем
   */
  static async getExampleThemes(): Promise<any> {
    const structure = await this.getWalletStructure();
    return structure.structure.exampleThemes;
  }

  /**
   * Получить инструкции для AI агентов
   */
  static async getAIAgentsInstructions(): Promise<any> {
    const structure = await this.getWalletStructure();
    return structure.structure.aiAgentsInstructions;
  }

  /**
   * Проверить здоровье API
   */
  static async healthCheck(): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('wallet-customization-structure/health', {
        method: 'GET'
      });

      if (error) {
        throw new Error(`Health check failed: ${error.message}`);
      }

      console.log('✅ Wallet Structure API health check passed:', data);
      return data;

    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  /**
   * Экспорт структуры для отладки
   */
  static async exportForDebug(): Promise<any> {
    const structure = await this.getWalletStructure();
    return {
      structure: structure.structure,
      metadata: structure.metadata,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    };
  }
}

// Автоматическая инициализация при загрузке модуля
if (typeof window !== 'undefined') {
  // Инициализируем структуру при загрузке страницы
  WalletStructureService.getWalletStructure().catch(error => {
    console.warn('⚠️ Failed to auto-initialize wallet structure:', error);
  });
}

export default WalletStructureService;
