/**
 * DOMScanner - сканирование DOM для извлечения UI структуры
 * Создаёт JSON-снапшоты UI расширения
 */

import type { 
  ExtensionUIElement, 
  ExtractedTheme, 
  ExtensionType,
  ExtensionUISnapshot,
  ExtensionState
} from './protocol';
import { SecuritySanitizer } from './SecuritySanitizer';

export interface DOMScannerOptions {
  extensionType: ExtensionType;
  rootSelector?: string;
  maxDepth?: number;
  includeHidden?: boolean;
  sanitizer?: SecuritySanitizer;
}

export class DOMScanner {
  private extensionType: ExtensionType;
  private rootSelector: string;
  private maxDepth: number;
  private includeHidden: boolean;
  private sanitizer: SecuritySanitizer;
  private elementCounter: number = 0;
  
  constructor(options: DOMScannerOptions) {
    this.extensionType = options.extensionType;
    this.rootSelector = options.rootSelector || 'body';
    this.maxDepth = options.maxDepth || 10;
    this.includeHidden = options.includeHidden || false;
    this.sanitizer = options.sanitizer || new SecuritySanitizer();
  }
  
  /**
   * Сканирует DOM и создаёт полный снапшот
   */
  scan(): ExtensionUISnapshot {
    this.elementCounter = 0;
    this.sanitizer.reset();
    
    const root = document.querySelector(this.rootSelector) as HTMLElement;
    if (!root) {
      throw new Error(`Root element not found: ${this.rootSelector}`);
    }
    
    const elements = this.scanElement(root, 0);
    const theme = this.extractTheme(root);
    const screen = this.detectCurrentScreen();
    const state = this.extractState();
    
    return {
      type: 'EXTENSION_UI_SNAPSHOT',
      extension: this.extensionType,
      version: '1.0.0',
      timestamp: Date.now(),
      screen,
      state,
      ui: {
        rootSelector: this.rootSelector,
        elements,
        theme,
        dimensions: {
          width: root.offsetWidth,
          height: root.offsetHeight
        }
      },
      security: this.sanitizer.getSecurityInfo()
    };
  }
  
  /**
   * Рекурсивно сканирует элемент и его детей
   */
  private scanElement(element: HTMLElement, depth: number, parentId?: string): ExtensionUIElement[] {
    const elements: ExtensionUIElement[] = [];
    
    if (depth > this.maxDepth) return elements;
    
    // Проверяем, нужно ли пропустить элемент
    if (this.sanitizer.shouldSkipElement(element)) {
      return elements;
    }
    
    // Проверяем видимость
    const isVisible = this.isElementVisible(element);
    if (!isVisible && !this.includeHidden) {
      return elements;
    }
    
    const id = `el-${++this.elementCounter}`;
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    
    const uiElement: ExtensionUIElement = {
      id,
      tag: element.tagName.toLowerCase(),
      selector: this.generateSelector(element),
      classes: Array.from(element.classList),
      text: this.getDirectText(element),
      role: element.getAttribute('role') || undefined,
      isVisible,
      isInteractive: this.isInteractive(element),
      rect: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      styles: {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        boxShadow: styles.boxShadow,
        opacity: styles.opacity
      },
      parentId,
      children: []
    };
    
    // Санитизируем элемент
    const sanitizedElement = this.sanitizer.sanitizeElement(uiElement);
    elements.push(sanitizedElement);
    
    // Сканируем детей
    const children = Array.from(element.children) as HTMLElement[];
    const childIds: string[] = [];
    
    for (const child of children) {
      const childElements = this.scanElement(child, depth + 1, id);
      if (childElements.length > 0) {
        childIds.push(childElements[0].id);
        elements.push(...childElements);
      }
    }
    
    sanitizedElement.children = childIds;
    
    return elements;
  }
  
  /**
   * Извлекает тему из корневого элемента
   */
  private extractTheme(root: HTMLElement): ExtractedTheme {
    const styles = window.getComputedStyle(root);
    const bodyStyles = window.getComputedStyle(document.body);
    
    // Пробуем найти основные цвета
    const backgroundColor = this.findColor(root, 'backgroundColor') || 
                           styles.backgroundColor || 
                           bodyStyles.backgroundColor;
    
    const textColor = this.findColor(root, 'color') || 
                     styles.color || 
                     bodyStyles.color;
    
    // Ищем акцентные цвета в кнопках
    const buttons = root.querySelectorAll('button, [role="button"], .btn');
    let primaryColor = textColor;
    let accentColor = textColor;
    
    if (buttons.length > 0) {
      const btnStyles = window.getComputedStyle(buttons[0] as HTMLElement);
      primaryColor = btnStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' 
        ? btnStyles.backgroundColor 
        : btnStyles.color;
      
      if (buttons.length > 1) {
        const btn2Styles = window.getComputedStyle(buttons[1] as HTMLElement);
        accentColor = btn2Styles.backgroundColor !== 'rgba(0, 0, 0, 0)'
          ? btn2Styles.backgroundColor
          : btn2Styles.color;
      }
    }
    
    // Ищем цвет границ
    const borderColor = this.findBorderColor(root) || 
                       styles.borderColor || 
                       'transparent';
    
    // Ищем surface цвет (карточки, панели)
    const cards = root.querySelectorAll('.card, [class*="panel"], [class*="surface"]');
    let surfaceColor = backgroundColor;
    if (cards.length > 0) {
      const cardStyles = window.getComputedStyle(cards[0] as HTMLElement);
      if (cardStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        surfaceColor = cardStyles.backgroundColor;
      }
    }
    
    return {
      backgroundColor,
      primaryColor,
      secondaryColor: surfaceColor,
      textColor,
      accentColor,
      borderColor,
      surfaceColor
    };
  }
  
  /**
   * Определяет текущий экран расширения
   */
  private detectCurrentScreen(): string {
    // VPN-specific screens
    if (this.extensionType === 'proton-vpn') {
      if (document.querySelector('[class*="connected"]')) return 'CONNECTED';
      if (document.querySelector('[class*="disconnected"]')) return 'DISCONNECTED';
      if (document.querySelector('[class*="connecting"]')) return 'LOADING';
      if (document.querySelector('[class*="server-list"]')) return 'SERVER_SELECT';
      if (document.querySelector('[class*="login"]')) return 'AUTH';
    }
    
    // Wallet-specific screens
    if (this.extensionType === 'metamask' || this.extensionType === 'phantom') {
      if (document.querySelector('[class*="unlock"]')) return 'UNLOCK';
      if (document.querySelector('[class*="send"]')) return 'SEND';
      if (document.querySelector('[class*="swap"]')) return 'SWAP';
      if (document.querySelector('[class*="activity"]')) return 'ACTIVITY';
      if (document.querySelector('[class*="settings"]')) return 'SETTINGS';
    }
    
    // Generic detection
    const url = window.location.hash || window.location.pathname;
    if (url.includes('settings')) return 'SETTINGS';
    if (url.includes('login') || url.includes('auth')) return 'AUTH';
    
    return 'HOME';
  }
  
  /**
   * Извлекает состояние расширения
   */
  private extractState(): ExtensionState {
    const state: ExtensionState = {
      isLoading: false,
      hasError: false
    };
    
    // Проверяем loading состояние
    if (document.querySelector('[class*="loading"], [class*="spinner"], .loader')) {
      state.isLoading = true;
    }
    
    // Проверяем ошибки
    const errorElement = document.querySelector('[class*="error"], .error-message');
    if (errorElement) {
      state.hasError = true;
      state.errorMessage = (errorElement as HTMLElement).textContent?.trim();
    }
    
    // VPN-specific state
    if (this.extensionType === 'proton-vpn') {
      const connectedEl = document.querySelector('[class*="connected"]');
      const disconnectedEl = document.querySelector('[class*="disconnected"]');
      const connectingEl = document.querySelector('[class*="connecting"]');
      
      if (connectedEl) state.connectionStatus = 'connected';
      else if (connectingEl) state.connectionStatus = 'connecting';
      else if (disconnectedEl) state.connectionStatus = 'disconnected';
      
      const serverEl = document.querySelector('[class*="server-name"], [class*="current-server"]');
      if (serverEl) {
        state.currentServer = (serverEl as HTMLElement).textContent?.trim();
      }
    }
    
    return state;
  }
  
  // ============= Helper Methods =============
  
  private isElementVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      parseFloat(style.opacity) > 0 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }
  
  private isInteractive(element: HTMLElement): boolean {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    
    return (
      tag === 'button' ||
      tag === 'a' ||
      tag === 'input' ||
      tag === 'select' ||
      tag === 'textarea' ||
      role === 'button' ||
      role === 'link' ||
      element.hasAttribute('onclick') ||
      element.hasAttribute('tabindex')
    );
  }
  
  private getDirectText(element: HTMLElement): string {
    let text = '';
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent?.trim() || '';
      }
    }
    return text.slice(0, 100); // Limit text length
  }
  
  private generateSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).slice(0, 2).join('.');
    
    if (classes) {
      return `${tag}.${classes}`;
    }
    
    // Generate nth-child selector
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      return `${tag}:nth-child(${index})`;
    }
    
    return tag;
  }
  
  private findColor(root: HTMLElement, property: string): string | null {
    const value = window.getComputedStyle(root)[property as any];
    if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
      return value;
    }
    return null;
  }
  
  private findBorderColor(root: HTMLElement): string | null {
    const elementsWithBorder = root.querySelectorAll('[class*="border"], .card, .panel');
    for (const el of Array.from(elementsWithBorder)) {
      const styles = window.getComputedStyle(el as HTMLElement);
      if (styles.borderColor && styles.borderColor !== 'rgba(0, 0, 0, 0)') {
        return styles.borderColor;
      }
    }
    return null;
  }
}
