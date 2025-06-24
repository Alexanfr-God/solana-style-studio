
// Менеджер для работы с детальным реестром элементов кошелька

export interface DetailedWalletElement {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  selector: string;
  cssSelector?: string;
  customizable: boolean;
  layer?: string;
  interactiveState?: 'default' | 'hover' | 'active' | 'focus';
  position?: 'header' | 'content' | 'footer' | 'sidebar' | 'overlay';
  elementType?: 'container' | 'button' | 'text' | 'input' | 'icon' | 'image' | 'background';
}

export class DetailedElementsManager {
  private elements: DetailedWalletElement[];

  constructor(elements: DetailedWalletElement[]) {
    this.elements = elements;
  }

  // Получить элементы по слою
  getElementsByLayer(layer: string): DetailedWalletElement[] {
    return this.elements.filter(element => element.layer === layer);
  }

  // Получить элементы по категории
  getElementsByCategory(category: string): DetailedWalletElement[] {
    return this.elements.filter(element => element.category === category);
  }

  // Получить элементы по позиции
  getElementsByPosition(position: string): DetailedWalletElement[] {
    return this.elements.filter(element => element.position === position);
  }

  // Поиск элементов
  searchElements(query: string): DetailedWalletElement[] {
    const lowercaseQuery = query.toLowerCase();
    return this.elements.filter(element => 
      element.name.toLowerCase().includes(lowercaseQuery) ||
      element.description.toLowerCase().includes(lowercaseQuery) ||
      element.category.toLowerCase().includes(lowercaseQuery) ||
      (element.subcategory && element.subcategory.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Получить все доступные слои
  getAllLayers(): string[] {
    return [...new Set(this.elements.filter(e => e.layer).map(e => e.layer!))];
  }

  // Получить все категории
  getAllCategories(): string[] {
    return [...new Set(this.elements.map(e => e.category))];
  }

  // Получить статистику
  getStatistics() {
    return {
      totalElements: this.elements.length,
      customizableElements: this.elements.filter(e => e.customizable).length,
      layersCount: this.getAllLayers().length,
      categoriesCount: this.getAllCategories().length,
      elementsByType: this.elements.reduce((acc, element) => {
        const type = element.elementType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Создать контекст для GPT
  createGPTContext(specificLayer?: string) {
    const relevantElements = specificLayer 
      ? this.getElementsByLayer(specificLayer)
      : this.elements.filter(e => e.customizable);

    return {
      totalElements: relevantElements.length,
      elements: relevantElements.map(element => ({
        id: element.id,
        name: element.name,
        category: element.category,
        subcategory: element.subcategory,
        description: element.description,
        selector: element.selector,
        layer: element.layer,
        position: element.position,
        type: element.elementType
      })),
      layers: this.getAllLayers(),
      categories: this.getAllCategories(),
      statistics: this.getStatistics()
    };
  }

  // Валидация селекторов
  validateSelectors(): { valid: string[], invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];

    this.elements.forEach(element => {
      try {
        // Простая проверка валидности селектора
        if (element.selector && element.selector.trim().length > 0) {
          valid.push(element.selector);
        } else {
          invalid.push(element.id);
        }
      } catch {
        invalid.push(element.id);
      }
    });

    return { valid, invalid };
  }

  // Группировка элементов для лучшей организации
  groupElements() {
    return {
      byLayer: this.elements.reduce((acc, element) => {
        const layer = element.layer || 'global';
        if (!acc[layer]) acc[layer] = [];
        acc[layer].push(element);
        return acc;
      }, {} as Record<string, DetailedWalletElement[]>),
      
      byCategory: this.elements.reduce((acc, element) => {
        if (!acc[element.category]) acc[element.category] = [];
        acc[element.category].push(element);
        return acc;
      }, {} as Record<string, DetailedWalletElement[]>),
      
      byPosition: this.elements.reduce((acc, element) => {
        const position = element.position || 'unknown';
        if (!acc[position]) acc[position] = [];
        acc[position].push(element);
        return acc;
      }, {} as Record<string, DetailedWalletElement[]>)
    };
  }
}

export const createDetailedElementsManager = (elements: DetailedWalletElement[]) => {
  return new DetailedElementsManager(elements);
};
