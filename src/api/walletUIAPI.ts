
import { supabase } from '@/integrations/supabase/client';
import { WALLET_ELEMENTS_REGISTRY } from '@/components/wallet/WalletElementsRegistry';

export interface WalletAPIElement {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  selector: string;
  properties: {
    customizable: boolean;
    interactive: boolean;
    safeZone?: any;
    position?: any;
  };
  styles?: {
    defaultStyles: Record<string, any>;
    customizableProperties: string[];
  };
}

export interface WalletAPISchema {
  walletType: string;
  version: string;
  totalElements: number;
  categories: string[];
  screens: string[];
  elements: WalletAPIElement[];
  metadata: {
    lastUpdated: string;
    apiVersion: string;
    compatibility: string[];
  };
}

// Helper interfaces for type safety
interface DatabaseElementProperties {
  category?: string;
  description?: string;
  customizable?: boolean;
}

interface DatabaseElementPosition {
  selector?: string;
}

export class WalletUIAPI {
  private static instance: WalletUIAPI;
  
  static getInstance(): WalletUIAPI {
    if (!WalletUIAPI.instance) {
      WalletUIAPI.instance = new WalletUIAPI();
    }
    return WalletUIAPI.instance;
  }

  /**
   * Анализирует кошелек и возвращает полную схему UI элементов
   */
  async analyzeWallet(walletType: string = 'phantom'): Promise<WalletAPISchema> {
    try {
      console.log(`🔍 WalletUIAPI: Analyzing wallet type: ${walletType}`);

      // Загружаем данные из базы данных
      const { data: dbElements, error } = await supabase
        .from('wallet_element_registry')
        .select('*')
        .eq('wallet_type', walletType);

      let elements: WalletAPIElement[] = [];

      if (error || !dbElements || dbElements.length === 0) {
        console.warn('⚠️ Database elements not available, using local registry');
        // Fallback to local registry
        elements = WALLET_ELEMENTS_REGISTRY.map(element => ({
          id: element.id,
          name: element.name,
          type: element.category.toLowerCase(),
          category: element.category,
          description: element.description,
          selector: element.selector,
          properties: {
            customizable: element.customizable,
            interactive: ['button', 'dropdown', 'nav-item'].includes(element.name.toLowerCase()),
            safeZone: this.generateSafeZone(element)
          }
        }));
      } else {
        // Преобразуем данные из базы с правильной типизацией
        elements = dbElements.map(element => {
          // Безопасно парсим JSON поля
          const properties = element.properties as DatabaseElementProperties || {};
          const position = element.position as DatabaseElementPosition || {};
          
          return {
            id: element.id,
            name: element.element_name,
            type: element.element_type,
            category: properties.category || 'Other',
            description: properties.description || '',
            selector: position.selector || '',
            properties: {
              customizable: properties.customizable || false,
              interactive: element.is_interactive,
              safeZone: element.safe_zone,
              position: element.position
            }
          };
        });
      }

      const categories = [...new Set(elements.map(e => e.category))];
      
      const schema: WalletAPISchema = {
        walletType,
        version: '1.0.0',
        totalElements: elements.length,
        categories,
        screens: ['home', 'send', 'receive', 'buy', 'swap', 'apps', 'history', 'search'],
        elements,
        metadata: {
          lastUpdated: new Date().toISOString(),
          apiVersion: '1.0.0',
          compatibility: ['WalletAlivePlayground', 'PhantomWallet']
        }
      };

      console.log(`✅ WalletUIAPI: Generated schema with ${elements.length} elements`);
      return schema;

    } catch (error) {
      console.error('❌ WalletUIAPI: Error analyzing wallet:', error);
      throw error;
    }
  }

  /**
   * Применяет стили к элементам кошелька
   */
  async applyStyles(elementId: string, styles: Record<string, any>): Promise<{
    success: boolean;
    changes: any;
    warnings?: string[];
  }> {
    try {
      console.log(`🎨 WalletUIAPI: Applying styles to element: ${elementId}`, styles);

      // Валидация безопасной зоны
      const validation = this.validateStyleChanges(elementId, styles);
      
      if (!validation.valid) {
        return {
          success: false,
          changes: null,
          warnings: validation.warnings
        };
      }

      // Применяем стили (здесь будет интеграция с системой стилей)
      const changes = {
        elementId,
        styles,
        appliedAt: new Date().toISOString()
      };

      return {
        success: true,
        changes,
        warnings: validation.warnings
      };

    } catch (error) {
      console.error('❌ WalletUIAPI: Error applying styles:', error);
      throw error;
    }
  }

  /**
   * Экспортирует схему кошелька в JSON формат для GitHub
   */
  async exportToGitHub(walletType: string = 'phantom'): Promise<{
    schema: WalletAPISchema;
    jsonString: string;
    filename: string;
  }> {
    const schema = await this.analyzeWallet(walletType);
    const jsonString = JSON.stringify(schema, null, 2);
    const filename = `${walletType}-wallet-schema-v${schema.version}.json`;

    return {
      schema,
      jsonString,
      filename
    };
  }

  /**
   * Создает документацию API для партнеров
   */
  generateAPIDocumentation(schema: WalletAPISchema): string {
    let doc = `# Wallet UI API Documentation\n\n`;
    doc += `**Wallet Type:** ${schema.walletType}\n`;
    doc += `**Version:** ${schema.version}\n`;
    doc += `**Total Elements:** ${schema.totalElements}\n`;
    doc += `**Last Updated:** ${schema.metadata.lastUpdated}\n\n`;

    doc += `## Categories\n\n`;
    schema.categories.forEach(category => {
      const categoryElements = schema.elements.filter(e => e.category === category);
      doc += `### ${category} (${categoryElements.length} elements)\n\n`;
      
      categoryElements.forEach(element => {
        doc += `#### ${element.name}\n`;
        doc += `- **Type:** ${element.type}\n`;
        doc += `- **Selector:** \`${element.selector}\`\n`;
        doc += `- **Description:** ${element.description}\n`;
        doc += `- **Customizable:** ${element.properties.customizable ? '✅' : '❌'}\n`;
        doc += `- **Interactive:** ${element.properties.interactive ? '✅' : '❌'}\n\n`;
      });
    });

    doc += `## API Endpoints\n\n`;
    doc += `### Analyze Wallet\n`;
    doc += `\`GET /api/wallet/analyze?type=${schema.walletType}\`\n\n`;
    doc += `### Apply Styles\n`;
    doc += `\`POST /api/wallet/styles\`\n\n`;
    doc += `### Export Schema\n`;
    doc += `\`GET /api/wallet/export?type=${schema.walletType}\`\n\n`;

    return doc;
  }

  private generateSafeZone(element: any): any {
    return {
      canCustomize: element.customizable,
      restrictions: element.customizable ? [] : ['preserve-functionality'],
      criticalForFunctionality: !element.customizable
    };
  }

  private validateStyleChanges(elementId: string, styles: Record<string, any>): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Базовая валидация
    if (styles.display === 'none') {
      warnings.push('Hiding elements may break functionality');
    }
    
    if (styles.opacity !== undefined && styles.opacity < 0.5) {
      warnings.push('Low opacity may affect visibility');
    }

    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

// Экспортируем единственный экземпляр
export const walletUIAPI = WalletUIAPI.getInstance();
