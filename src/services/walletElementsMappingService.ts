
import { WalletElement } from '@/hooks/useWalletElements';

export class WalletElementsMappingService {
  private static instance: WalletElementsMappingService;
  private elementMap: Map<string, WalletElement> = new Map();

  static getInstance(): WalletElementsMappingService {
    if (!WalletElementsMappingService.instance) {
      WalletElementsMappingService.instance = new WalletElementsMappingService();
    }
    return WalletElementsMappingService.instance;
  }

  updateElements(elements: WalletElement[]) {
    this.elementMap.clear();
    elements.forEach(element => {
      if (element.selector) {
        // Сохраняем основной селектор
        this.elementMap.set(element.selector, element);
        
        // Добавляем альтернативные селекторы для совместимости
        const alternativeSelectors = this.getAlternativeSelectors(element.selector);
        alternativeSelectors.forEach(altSelector => {
          this.elementMap.set(altSelector, element);
        });
        
        console.log(`📝 Mapped element: ${element.selector} -> ${element.name} (+ ${alternativeSelectors.length} alternatives)`);
      }
    });
    
    console.log(`🔄 Total elements mapped: ${this.elementMap.size}`);
    console.log(`🎯 Unique elements: ${elements.length}`);
    
    // Логируем иконки по категориям
    const iconElements = elements.filter(el => el.category === 'icon');
    const iconsByScreen = iconElements.reduce((acc, icon) => {
      acc[icon.screen] = (acc[icon.screen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Icons by screen:', iconsByScreen);
  }

  private getAlternativeSelectors(selector: string): string[] {
    const alternatives: string[] = [];
    
    // Маппинг селекторов к реальным классам в DOM
    const selectorMappings: Record<string, string[]> = {
      // Навигационные иконки
      'nav-home-icon': ['nav-home-icon'],
      'nav-apps-icon': ['nav-apps-icon'],
      'nav-swap-icon': ['nav-swap-icon'],
      'nav-history-icon': ['nav-history-icon'],
      'nav-search-icon': ['nav-search-icon'],
      
      // Иконки действий
      'action-send-icon': ['action-send-icon'],
      'action-receive-icon': ['action-receive-icon'],
      'action-buy-icon': ['action-buy-icon'],
      'action-swap-main': ['action-swap-icon'],
      
      // Системные иконки
      'header-search-icon': ['header-search-icon'],
      'header-menu-icon': ['header-menu-icon'],
      'swap-settings-icon': ['swap-settings-icon'],
      'swap-arrow-main': ['swap-arrow-container', 'swap-arrow-icon'],
      'receive-qr-main': ['receive-qr-code', 'receive-qr-icon'],
      'receive-copy-icon': ['receive-copy-icon'],
      
      // Поисковые иконки
      'search-magnify-icon': ['search-input-icon', 'search-magnify-icon'],
      'search-recent-icon': ['search-recent-icon'],
      'search-trending-icon': ['search-trending-icon']
    };
    
    if (selectorMappings[selector]) {
      alternatives.push(...selectorMappings[selector]);
    }
    
    return alternatives;
  }

  getElementBySelector(selector: string): WalletElement | undefined {
    return this.elementMap.get(selector);
  }

  isElementCustomizable(domElement: HTMLElement): boolean {
    // Проверяем все возможные селекторы
    const selectors = this.extractSelectorsFromElement(domElement);
    
    for (const selector of selectors) {
      if (this.elementMap.has(selector)) {
        console.log(`✅ Found customizable element: ${selector}`);
        return true;
      }
    }

    // Проверяем родительские элементы
    let parent = domElement.parentElement;
    let level = 0;
    while (parent && level < 3) {
      const parentSelectors = this.extractSelectorsFromElement(parent);
      for (const selector of parentSelectors) {
        if (this.elementMap.has(selector)) {
          console.log(`✅ Found customizable parent element: ${selector} (level ${level + 1})`);
          return true;
        }
      }
      parent = parent.parentElement;
      level++;
    }

    return false;
  }

  getElementInfo(domElement: HTMLElement): WalletElement | null {
    // Проверяем все возможные селекторы
    const selectors = this.extractSelectorsFromElement(domElement);
    
    for (const selector of selectors) {
      const element = this.elementMap.get(selector);
      if (element) {
        console.log(`🎯 Retrieved element info: ${selector} -> ${element.name}`);
        return element;
      }
    }

    // Проверяем родительские элементы
    let parent = domElement.parentElement;
    let level = 0;
    while (parent && level < 3) {
      const parentSelectors = this.extractSelectorsFromElement(parent);
      for (const selector of parentSelectors) {
        const element = this.elementMap.get(selector);
        if (element) {
          console.log(`🎯 Retrieved parent element info: ${selector} -> ${element.name} (level ${level + 1})`);
          return element;
        }
      }
      parent = parent.parentElement;
      level++;
    }

    console.log(`❌ No element info found for:`, domElement);
    return null;
  }

  private extractSelectorsFromElement(element: HTMLElement): string[] {
    const selectors: string[] = [];
    
    // CSS классы
    element.classList.forEach(className => {
      selectors.push(className);
    });
    
    // data-element-id
    const dataElementId = element.getAttribute('data-element-id');
    if (dataElementId) {
      selectors.push(dataElementId);
    }
    
    // ID
    if (element.id) {
      selectors.push(element.id);
    }
    
    return selectors;
  }

  getAllElements(): WalletElement[] {
    const uniqueElements = new Map<string, WalletElement>();
    
    this.elementMap.forEach((element, selector) => {
      uniqueElements.set(element.id, element);
    });
    
    return Array.from(uniqueElements.values());
  }

  getIconsByCategory(): { [category: string]: WalletElement[] } {
    const iconElements = this.getAllElements().filter(el => el.category === 'icon');
    const categories: { [category: string]: WalletElement[] } = {
      'navigation': [],
      'actions': [],
      'system': [],
      'search': [],
      'other': []
    };

    iconElements.forEach(icon => {
      if (icon.screen === 'navigation') {
        categories.navigation.push(icon);
      } else if (icon.name.includes('Action') || icon.asset_library_path?.includes('actions')) {
        categories.actions.push(icon);
      } else if (icon.name.includes('Header') || icon.name.includes('Swap') || icon.name.includes('QR') || icon.name.includes('Copy')) {
        categories.system.push(icon);
      } else if (icon.screen === 'search') {
        categories.search.push(icon);
      } else {
        categories.other.push(icon);
      }
    });

    return categories;
  }

  debugLogAvailableSelectors(): void {
    console.log('🔍 Available selectors in mapping service:');
    console.log(`📊 Total mapped selectors: ${this.elementMap.size}`);
    console.log(`🎯 Unique elements: ${this.getAllElements().length}`);
    
    const iconsByCategory = this.getIconsByCategory();
    console.log('🎯 Icons by functional category:');
    Object.entries(iconsByCategory).forEach(([category, icons]) => {
      if (icons.length > 0) {
        console.log(`  📁 ${category}: ${icons.length} icons`);
        icons.forEach(icon => {
          console.log(`    - ${icon.selector} -> ${icon.name} (customizable: ${icon.customizable})`);
        });
      }
    });
  }
}

export const walletElementsMapper = WalletElementsMappingService.getInstance();
