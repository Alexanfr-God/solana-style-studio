
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
        // Clean selector (remove dots if present)
        const cleanSelector = element.selector.startsWith('.') 
          ? element.selector.substring(1) 
          : element.selector;
        this.elementMap.set(cleanSelector, element);
        console.log(`📝 Mapped element: ${cleanSelector} -> ${element.name}`);
      }
    });
  }

  getElementBySelector(selector: string): WalletElement | undefined {
    return this.elementMap.get(selector);
  }

  isElementCustomizable(domElement: HTMLElement): boolean {
    // Strategy 1: Check CSS classes
    for (const className of domElement.classList) {
      if (this.elementMap.has(className)) {
        console.log(`✅ Found customizable element by class: ${className}`);
        return true;
      }
    }
    
    // Strategy 2: Check data-element-id attribute
    const dataElementId = domElement.getAttribute('data-element-id');
    if (dataElementId && this.elementMap.has(dataElementId)) {
      console.log(`✅ Found customizable element by data-element-id: ${dataElementId}`);
      return true;
    }

    // Strategy 3: Check ID attribute
    const elementId = domElement.id;
    if (elementId && this.elementMap.has(elementId)) {
      console.log(`✅ Found customizable element by ID: ${elementId}`);
      return true;
    }

    // Strategy 4: Check parent elements (up to 3 levels)
    let parent = domElement.parentElement;
    let level = 0;
    while (parent && level < 3) {
      // Check parent classes
      for (const className of parent.classList) {
        if (this.elementMap.has(className)) {
          console.log(`✅ Found customizable element by parent class: ${className} (level ${level + 1})`);
          return true;
        }
      }
      
      // Check parent data-element-id
      const parentDataId = parent.getAttribute('data-element-id');
      if (parentDataId && this.elementMap.has(parentDataId)) {
        console.log(`✅ Found customizable element by parent data-element-id: ${parentDataId} (level ${level + 1})`);
        return true;
      }

      parent = parent.parentElement;
      level++;
    }

    return false;
  }

  getElementInfo(domElement: HTMLElement): WalletElement | null {
    // Strategy 1: Check CSS classes
    for (const className of domElement.classList) {
      const element = this.elementMap.get(className);
      if (element) {
        console.log(`🎯 Retrieved element info by class: ${className} -> ${element.name}`);
        return element;
      }
    }
    
    // Strategy 2: Check data-element-id attribute
    const dataElementId = domElement.getAttribute('data-element-id');
    if (dataElementId) {
      const element = this.elementMap.get(dataElementId);
      if (element) {
        console.log(`🎯 Retrieved element info by data-element-id: ${dataElementId} -> ${element.name}`);
        return element;
      }
    }

    // Strategy 3: Check ID attribute
    const elementId = domElement.id;
    if (elementId) {
      const element = this.elementMap.get(elementId);
      if (element) {
        console.log(`🎯 Retrieved element info by ID: ${elementId} -> ${element.name}`);
        return element;
      }
    }

    // Strategy 4: Check parent elements
    let parent = domElement.parentElement;
    let level = 0;
    while (parent && level < 3) {
      // Check parent classes
      for (const className of parent.classList) {
        const element = this.elementMap.get(className);
        if (element) {
          console.log(`🎯 Retrieved element info by parent class: ${className} -> ${element.name} (level ${level + 1})`);
          return element;
        }
      }
      
      // Check parent data-element-id
      const parentDataId = parent.getAttribute('data-element-id');
      if (parentDataId) {
        const element = this.elementMap.get(parentDataId);
        if (element) {
          console.log(`🎯 Retrieved element info by parent data-element-id: ${parentDataId} -> ${element.name} (level ${level + 1})`);
          return element;
        }
      }

      parent = parent.parentElement;
      level++;
    }

    console.log(`❌ No element info found for:`, domElement);
    return null;
  }

  getAllElements(): WalletElement[] {
    return Array.from(this.elementMap.values());
  }

  // Debug method to log all available selectors
  debugLogAvailableSelectors(): void {
    console.log('🔍 Available selectors in mapping service:');
    this.elementMap.forEach((element, selector) => {
      console.log(`  - ${selector} -> ${element.name} (${element.type})`);
    });
  }
}

export const walletElementsMapper = WalletElementsMappingService.getInstance();
