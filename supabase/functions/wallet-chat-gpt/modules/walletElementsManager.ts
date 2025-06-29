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
