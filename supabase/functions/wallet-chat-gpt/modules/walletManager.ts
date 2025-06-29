// ====== Enhanced modules/walletManager.ts ======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWalletElementsManager, type WalletElement, type ElementsStatistics } from './walletElementsManager.ts';

export interface WalletConfiguration {
  id: string;
  name: string;
  type: string;
  version: string;
  screens: string[];
  features: string[];
  elements: WalletElement[];
  metadata: WalletMetadata;
  capabilities: WalletCapabilities;
  styling: WalletStylingOptions;
}

export interface WalletMetadata {
  totalElements: number;
  customizableElements: number;
  lastUpdated: string;
  version: string;
  complexity: 'low' | 'medium' | 'high';
  fallback?: boolean;
  provider: {
    name: string;
    website?: string;
    supportedNetworks: string[];
  };
}

export interface WalletCapabilities {
  themes: string[];
  customColors: boolean;
  customFonts: boolean;
  animations: boolean;
  responsive: boolean;
  darkMode: boolean;
  accessibility: boolean;
  multiLanguage: boolean;
}

export interface WalletStylingOptions {
  defaultTheme: string;
  colorSchemes: string[];
  fontFamilies: string[];
  borderRadiusOptions: string[];
  spacingOptions: string[];
  animationPresets: string[];
}

export interface WalletAIContext {
  elements: WalletElement[];
  grouped: any;
  statistics: ElementsStatistics;
  customizableElements: WalletElement[];
  relationships: any;
  customizationCapabilities: any;
  walletConfiguration: WalletConfiguration;
  walletType: string;
  supportedFeatures: string[];
  availableScreens: string[];
  complexity: string;
  recommendations: string[];
}

export class WalletManager {
  private supabase: any;
  private elementsManager: any;
  private configCache: Map<string, WalletConfiguration> = new Map();
  private cacheTimeout: number = 10 * 60 * 1000; // 10 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.elementsManager = createWalletElementsManager(supabaseUrl, supabaseKey);
  }

  /**
   * Получить расширенную конфигурацию кошелька
   */
  async getWalletConfiguration(walletType: string, forceRefresh: boolean = false): Promise<WalletConfiguration> {
    console.log(`🔧 Loading wallet configuration for: ${walletType}`);
    
    const cacheKey = `config_${walletType}`;
    
    if (!forceRefresh && this.configCache.has(cacheKey)) {
      const cached = this.configCache.get(cacheKey)!;
      console.log('📊 Using cached wallet configuration');
      return cached;
    }
    
    try {
      // Load all elements from database
      const elements = await this.elementsManager.loadAllElements();
      
      // Filter elements by wallet type if needed (for future multi-wallet support)
      const walletElements = elements; // For now, all elements are universal
      
      // Group elements by screen
      const grouped = this.elementsManager.groupElementsByScreen(walletElements);
      const screens = Object.keys(grouped);
      
      // Extract unique features/types
      const features = [...new Set(walletElements.map(el => el.type))];
      
      // Get wallet-specific configuration
      const walletMetadata = await this.getWalletMetadata(walletType);
      const capabilities = await this.getWalletCapabilities(walletType);
      const stylingOptions = await this.getWalletStylingOptions(walletType);
      
      // Create comprehensive configuration object
      const configuration: WalletConfiguration = {
        id: walletType,
        name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Wallet`,
        type: walletType,
        version: '2.0.0',
        screens,
        features,
        elements: walletElements,
        metadata: {
          totalElements: walletElements.length,
          customizableElements: walletElements.filter(el => el.customizable).length,
          lastUpdated: new Date().toISOString(),
          version: '2.0.0',
          complexity: this.determineComplexity(walletElements),
          provider: walletMetadata.provider
        },
        capabilities,
        styling: stylingOptions
      };

      // Cache the configuration
      this.configCache.set(cacheKey, configuration);

      console.log('✅ Wallet configuration loaded:', {
        wallet: walletType,
        screens: screens.length,
        elements: walletElements.length,
        features: features.length,
        complexity: configuration.metadata.complexity
      });

      return configuration;
      
    } catch (error) {
      console.error('❌ Error loading wallet configuration:', error);
      
      // Enhanced fallback configuration
      const fallbackConfig: WalletConfiguration = {
        id: walletType,
        name: 'Unknown Wallet',
        type: walletType,
        version: '1.0.0',
        screens: ['main'],
        features: ['basic'],
        elements: [],
        metadata: {
          totalElements: 0,
          customizableElements: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          complexity: 'low',
          fallback: true,
          provider: {
            name: 'Unknown',
            supportedNetworks: []
          }
        },
        capabilities: this.getDefaultCapabilities(),
        styling: this.getDefaultStylingOptions()
      };

      return fallbackConfig;
    }
  }

  /**
   * Получить поддерживаемые типы кошельков с расширенной информацией
   */
  async getSupportedWalletTypes(): Promise<Array<{type: string, name: string, features: string[]}>> {
    try {
      // In the future, this could be stored in a separate table
      return [
        {
          type: 'phantom',
          name: 'Phantom Wallet',
          features: ['solana', 'ethereum', 'polygon', 'staking', 'nft']
        },
        {
          type: 'solflare',
          name: 'Solflare Wallet',
          features: ['solana', 'staking', 'dex', 'nft']
        },
        {
          type: 'backpack',
          name: 'Backpack Wallet',
          features: ['solana', 'social', 'gaming', 'nft']
        },
        {
          type: 'metamask',
          name: 'MetaMask Wallet',
          features: ['ethereum', 'polygon', 'bsc', 'defi', 'nft']
        }
      ];
    } catch (error) {
      console.error('❌ Error getting supported wallet types:', error);
      return [{ type: 'phantom', name: 'Phantom Wallet', features: ['basic'] }];
    }
  }

  /**
   * Создать расширенный AI контекст для кошелька
   */
  async createWalletAIContext(walletType: string, activeScreen?: string): Promise<WalletAIContext> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      const context = this.elementsManager.createAIContext(
        configuration.elements,
        activeScreen
      );
      
      // Generate intelligent recommendations
      const recommendations = this.generateRecommendations(configuration, context);
      
      return {
        ...context,
        walletConfiguration: configuration,
        walletType,
        supportedFeatures: configuration.features,
        availableScreens: configuration.screens,
        complexity: configuration.metadata.complexity,
        recommendations
      };
    } catch (error) {
      console.error('❌ Error creating wallet AI context:', error);
      return {
        elements: [],
        grouped: {},
        statistics: {
          total: 0,
          customizable: 0,
          customizationPercentage: 0,
          screens: { count: 0, list: [] },
          types: { count: 0, list: [] },
          complexity: 'low',
          lastUpdated: new Date().toISOString()
        },
        customizableElements: [],
        relationships: {},
        customizationCapabilities: {},
        walletConfiguration: await this.getWalletConfiguration(walletType),
        walletType,
        supportedFeatures: [],
        availableScreens: [],
        complexity: 'low',
        recommendations: [],
        error: error.message
      };
    }
  }

  /**
   * Получить метаданные кошелька
   */
  private async getWalletMetadata(walletType: string): Promise<any> {
    const metadata = {
      phantom: {
        provider: {
          name: 'Phantom',
          website: 'https://phantom.app',
          supportedNetworks: ['solana', 'ethereum', 'polygon']
        }
      },
      solflare: {
        provider: {
          name: 'Solflare',
          website: 'https://solflare.com',
          supportedNetworks: ['solana']
        }
      },
      backpack: {
        provider: {
          name: 'Backpack',
          website: 'https://backpack.app',
          supportedNetworks: ['solana']
        }
      },
      metamask: {
        provider: {
          name: 'MetaMask',
          website: 'https://metamask.io',
          supportedNetworks: ['ethereum', 'polygon', 'bsc', 'arbitrum', 'optimism']
        }
      }
    };

    return metadata[walletType as keyof typeof metadata] || {
      provider: {
        name: 'Unknown',
        supportedNetworks: []
      }
    };
  }

  /**
   * Получить возможности кошелька
   */
  private async getWalletCapabilities(walletType: string): Promise<WalletCapabilities> {
    const capabilities = {
      phantom: {
        themes: ['light', 'dark', 'auto'],
        customColors: true,
        customFonts: true,
        animations: true,
        responsive: true,
        darkMode: true,
        accessibility: true,
        multiLanguage: false
      },
      solflare: {
        themes: ['light', 'dark'],
        customColors: true,
        customFonts: false,
        animations: false,
        responsive: true,
        darkMode: true,
        accessibility: false,
        multiLanguage: false
      },
      backpack: {
        themes: ['dark', 'neon'],
        customColors: true,
        customFonts: true,
        animations: true,
        responsive: true,
        darkMode: true,
        accessibility: false,
        multiLanguage: false
      },
      metamask: {
        themes: ['light', 'dark'],
        customColors: false,
        customFonts: false,
        animations: false,
        responsive: false,
        darkMode: true,
        accessibility: true,
        multiLanguage: true
      }
    };

    return capabilities[walletType as keyof typeof capabilities] || this.getDefaultCapabilities();
  }

  /**
   * Получить опции стилизации
   */
  private async getWalletStylingOptions(walletType: string): Promise<WalletStylingOptions> {
    return {
      defaultTheme: 'dark',
      colorSchemes: ['blue', 'purple', 'green', 'orange', 'red', 'custom'],
      fontFamilies: ['Inter', 'Roboto', 'SF Pro Display', 'Poppins', 'Orbitron'],
      borderRadiusOptions: ['0px', '4px', '8px', '12px', '16px', '24px'],
      spacingOptions: ['compact', 'normal', 'loose'],
      animationPresets: ['none', 'subtle', 'smooth', 'bouncy', 'fast']
    };
  }

  /**
   * Определить сложность кошелька
   */
  private determineComplexity(elements: WalletElement[]): 'low' | 'medium' | 'high' {
    const customizable = elements.filter(el => el.customizable).length;
    const totalProps = elements.reduce((sum, el) => sum + el.custom_props.length, 0);
    
    if (customizable > 30 || totalProps > 100) return 'high';
    if (customizable > 15 || totalProps > 50) return 'medium';
    return 'low';
  }

  /**
   * Генерировать рекомендации для AI
   */
  private generateRecommendations(configuration: WalletConfiguration, context: any): string[] {
    const recommendations: string[] = [];
    
    // Based on complexity
    if (configuration.metadata.complexity === 'high') {
      recommendations.push('Consider using preset themes for easier customization');
      recommendations.push('Focus on key elements like buttons and backgrounds first');
    }
    
    // Based on capabilities
    if (configuration.capabilities.animations) {
      recommendations.push('Try adding smooth animations for better user experience');
    }
    
    if (configuration.capabilities.customColors) {
      recommendations.push('Experiment with color palettes that match your personal style');
    }
    
    // Based on elements
    const hasBackground = context.customizableElements.some((el: WalletElement) => el.type === 'background');
    if (hasBackground) {
      recommendations.push('Start by customizing the background to set the overall mood');
    }
    
    const hasButtons = context.customizableElements.some((el: WalletElement) => el.type === 'button');
    if (hasButtons) {
      recommendations.push('Customize button colors to improve visual hierarchy');
    }
    
    // Screen-specific recommendations
    if (context.screenSpecific && context.targetScreen === 'main') {
      recommendations.push('The main screen is the first impression - make it count!');
    }
    
    return recommendations;
  }

  /**
   * Получить дефолтные возможности
   */
  private getDefaultCapabilities(): WalletCapabilities {
    return {
      themes: ['light', 'dark'],
      customColors: true,
      customFonts: false,
      animations: false,
      responsive: false,
      darkMode: true,
      accessibility: false,
      multiLanguage: false
    };
  }

  /**
   * Получить дефолтные опции стилизации
   */
  private getDefaultStylingOptions(): WalletStylingOptions {
    return {
      defaultTheme: 'dark',
      colorSchemes: ['blue', 'purple', 'custom'],
      fontFamilies: ['Inter', 'Roboto'],
      borderRadiusOptions: ['4px', '8px', '12px'],
      spacingOptions: ['normal'],
      animationPresets: ['none', 'subtle']
    };
  }

  /**
   * Валидация типа кошелька
   */
  async isValidWalletType(walletType: string): Promise<boolean> {
    try {
      const supportedTypes = await this.getSupportedWalletTypes();
      return supportedTypes.some(wallet => wallet.type === walletType.toLowerCase());
    } catch (error) {
      console.error('❌ Error validating wallet type:', error);
      return false;
    }
  }

  /**
   * Получить расширенную статистику кошелька
   */
  async getWalletStatistics(walletType: string): Promise<any> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      const stats = this.elementsManager.getElementsStatistics(configuration.elements);
      
      return {
        ...stats,
        walletType,
        configuration: configuration.metadata,
        capabilities: configuration.capabilities,
        styling: configuration.styling,
        recommendations: this.generateRecommendations(configuration, { customizableElements: configuration.elements.filter(el => el.customizable) })
      };
    } catch (error) {
      console.error('❌ Error getting wallet statistics:', error);
      return {
        total: 0,
        customizable: 0,
        customizationPercentage: 0,
        screens: { count: 0, list: [] },
        types: { count: 0, list: [] },
        walletType,
        complexity: 'low',
        error: error.message
      };
    }
  }

  /**
   * Получить возможности кастомизации по экрану
   */
  async getScreenCustomizationOptions(walletType: string, screen: string): Promise<any> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      const screenElements = configuration.elements.filter(el => el.screen === screen);
      const customizableElements = screenElements.filter(el => el.customizable);
      
      // Analyze what can be customized on this screen
      const colorOptions = new Set<string>();
      const sizeOptions = new Set<string>();
      const fontOptions = new Set<string>();
      
      customizableElements.forEach(element => {
        element.custom_props.forEach(prop => {
          switch (prop.type) {
            case 'color':
              colorOptions.add(prop.name);
              break;
            case 'size':
              sizeOptions.add(prop.name);
              break;
            case 'font':
              fontOptions.add(prop.name);
              break;
          }
        });
      });
      
      return {
        screen,
        totalElements: screenElements.length,
        customizableElements: customizableElements.length,
        options: {
          colors: Array.from(colorOptions),
          sizes: Array.from(sizeOptions),
          fonts: Array.from(fontOptions)
        },
        elements: customizableElements.map(el => ({
          id: el.id,
          name: el.name,
          type: el.type,
          description: el.description,
          customProperties: el.custom_props
        }))
      };
    } catch (error) {
      console.error('❌ Error getting screen customization options:', error);
      throw error;
    }
  }

  /**
   * Предложить улучшения на основе текущей конфигурации
   */
  async suggestImprovements(walletType: string, currentStyles?: any): Promise<string[]> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      const suggestions: string[] = [];
      
      // Analyze current state
      if (!currentStyles || Object.keys(currentStyles).length === 0) {
        suggestions.push('Start with a base color scheme to establish your wallet\'s identity');
        suggestions.push('Choose a consistent font family for better readability');
      }
      
      // Check for missing customizations
      const hasCustomBackground = currentStyles?.backgroundColor;
      const hasCustomButtons = currentStyles?.buttonColor;
      const hasCustomText = currentStyles?.textColor;
      
      if (!hasCustomBackground) {
        suggestions.push('Consider customizing the background color to match your preferences');
      }
      
      if (!hasCustomButtons) {
        suggestions.push('Customize button colors to improve visual hierarchy');
      }
      
      if (!hasCustomText && configuration.capabilities.customColors) {
        suggestions.push('Adjust text colors for better contrast and readability');
      }
      
      // Capability-based suggestions
      if (configuration.capabilities.animations && !currentStyles?.animations) {
        suggestions.push('Enable subtle animations to make your wallet feel more responsive');
      }
      
      if (configuration.capabilities.responsive && configuration.screens.length > 1) {
        suggestions.push('Ensure your customizations look good across all wallet screens');
      }
      
      // Accessibility suggestions
      if (configuration.capabilities.accessibility) {
        suggestions.push('Check color contrast ratios for accessibility compliance');
        suggestions.push('Consider users with visual impairments when choosing colors');
      }
      
      return suggestions.slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.error('❌ Error generating suggestions:', error);
      return ['Try experimenting with different color combinations'];
    }
  }

  /**
   * Экспорт конфигурации кошелька
   */
  async exportWalletConfig(walletType: string): Promise<any> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      
      return {
        exportedAt: new Date().toISOString(),
        version: '2.0.0',
        walletType,
        configuration: {
          metadata: configuration.metadata,
          capabilities: configuration.capabilities,
          styling: configuration.styling,
          elements: configuration.elements.map(el => ({
            id: el.id,
            screen: el.screen,
            name: el.name,
            type: el.type,
            customizable: el.customizable,
            customProperties: el.custom_props
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error exporting wallet config:', error);
      throw error;
    }
  }

  /**
   * Сравнить конфигурации кошельков
   */
  async compareWallets(walletType1: string, walletType2: string): Promise<any> {
    try {
      const config1 = await this.getWalletConfiguration(walletType1);
      const config2 = await this.getWalletConfiguration(walletType2);
      
      return {
        comparison: {
          [walletType1]: {
            elements: config1.elements.length,
            customizable: config1.metadata.customizableElements,
            screens: config1.screens.length,
            complexity: config1.metadata.complexity,
            capabilities: config1.capabilities
          },
          [walletType2]: {
            elements: config2.elements.length,
            customizable: config2.metadata.customizableElements,
            screens: config2.screens.length,
            complexity: config2.metadata.complexity,
            capabilities: config2.capabilities
          }
        },
        recommendations: [
          `${walletType1} has ${config1.metadata.customizableElements} customizable elements`,
          `${walletType2} has ${config2.metadata.customizableElements} customizable elements`,
          config1.metadata.customizableElements > config2.metadata.customizableElements 
            ? `${walletType1} offers more customization options`
            : `${walletType2} offers more customization options`
        ]
      };
    } catch (error) {
      console.error('❌ Error comparing wallets:', error);
      throw error;
    }
  }

  /**
   * Очистить кеш конфигурации
   */
  clearConfigCache(): void {
    this.configCache.clear();
    this.elementsManager.clearCache();
    console.log('🗑️ Configuration cache cleared');
  }

  /**
   * Получить статус здоровья менеджера
   */
  async getHealthStatus(): Promise<any> {
    try {
      const supportedWallets = await this.getSupportedWalletTypes();
      const testConfig = await this.getWalletConfiguration('phantom');
      
      return {
        status: 'healthy',
        supportedWallets: supportedWallets.length,
        cacheSize: this.configCache.size,
        lastCheck: new Date().toISOString(),
        database: 'connected',
        elements: testConfig.elements.length > 0 ? 'loaded' : 'empty'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

// Factory function for creating wallet manager
export function createWalletManager(supabaseUrl: string, supabaseKey: string) {
  return new WalletManager(supabaseUrl, supabaseKey);
}
