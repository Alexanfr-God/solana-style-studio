
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
        // Убираем точку в начале селектора если есть
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
    // Проверяем класс элемента
    for (const className of domElement.classList) {
      if (this.elementMap.has(className)) {
        return true;
      }
    }
    
    // Проверяем data-атрибуты
    const dataElementId = domElement.getAttribute('data-element-id');
    if (dataElementId && this.elementMap.has(dataElementId)) {
      return true;
    }

    return false;
  }

  getElementInfo(domElement: HTMLElement): WalletElement | null {
    // Проверяем по классам
    for (const className of domElement.classList) {
      const element = this.elementMap.get(className);
      if (element) {
        return element;
      }
    }
    
    // Проверяем по data-атрибуту
    const dataElementId = domElement.getAttribute('data-element-id');
    if (dataElementId) {
      const element = this.elementMap.get(dataElementId);
      if (element) {
        return element;
      }
    }

    return null;
  }

  getAllElements(): WalletElement[] {
    return Array.from(this.elementMap.values());
  }
}

export const walletElementsMapper = WalletElementsMappingService.getInstance();
