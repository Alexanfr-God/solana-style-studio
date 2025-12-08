/**
 * MutationTracker - отслеживание изменений DOM через MutationObserver
 * Отправляет дельта-обновления вместо полных снапшотов
 */

import type { ExtensionUIUpdate, ExtensionType } from './protocol';
import { SecuritySanitizer } from './SecuritySanitizer';

export interface MutationTrackerOptions {
  extensionType: ExtensionType;
  rootSelector?: string;
  debounceMs?: number;
  batchUpdates?: boolean;
  onUpdate?: (update: ExtensionUIUpdate) => void;
  onScreenChange?: (previousScreen: string, currentScreen: string) => void;
  sanitizer?: SecuritySanitizer;
}

interface TrackedChange {
  elementId: string;
  property: string;
  oldValue: string;
  newValue: string;
}

export class MutationTracker {
  private observer: MutationObserver | null = null;
  private extensionType: ExtensionType;
  private rootSelector: string;
  private debounceMs: number;
  private batchUpdates: boolean;
  private sanitizer: SecuritySanitizer;
  
  private pendingChanges: TrackedChange[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private currentScreen: string = 'HOME';
  private elementIdMap: WeakMap<Element, string> = new WeakMap();
  private elementCounter: number = 0;
  
  private onUpdate?: (update: ExtensionUIUpdate) => void;
  private onScreenChange?: (previousScreen: string, currentScreen: string) => void;
  
  constructor(options: MutationTrackerOptions) {
    this.extensionType = options.extensionType;
    this.rootSelector = options.rootSelector || 'body';
    this.debounceMs = options.debounceMs || 100;
    this.batchUpdates = options.batchUpdates ?? true;
    this.onUpdate = options.onUpdate;
    this.onScreenChange = options.onScreenChange;
    this.sanitizer = options.sanitizer || new SecuritySanitizer();
  }
  
  /**
   * Начинает отслеживание изменений
   */
  start(): void {
    if (this.observer) {
      console.warn('[MutationTracker] Already started');
      return;
    }
    
    const root = document.querySelector(this.rootSelector);
    if (!root) {
      console.error(`[MutationTracker] Root element not found: ${this.rootSelector}`);
      return;
    }
    
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });
    
    this.observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true
    });
    
    console.log(`[MutationTracker] ✅ Started tracking: ${this.rootSelector}`);
  }
  
  /**
   * Останавливает отслеживание
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.pendingChanges = [];
    console.log('[MutationTracker] 🔴 Stopped tracking');
  }
  
  /**
   * Обрабатывает мутации DOM
   */
  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      // Пропускаем чувствительные элементы
      if (mutation.target instanceof HTMLElement) {
        if (this.sanitizer.shouldSkipElement(mutation.target)) {
          continue;
        }
      }
      
      switch (mutation.type) {
        case 'childList':
          this.handleChildListMutation(mutation);
          break;
          
        case 'attributes':
          this.handleAttributeMutation(mutation);
          break;
          
        case 'characterData':
          this.handleCharacterDataMutation(mutation);
          break;
      }
    }
    
    // Проверяем смену экрана
    this.checkScreenChange();
    
    // Отправляем изменения
    if (this.batchUpdates) {
      this.scheduleBatchUpdate();
    } else {
      this.flushChanges();
    }
  }
  
  /**
   * Обрабатывает добавление/удаление элементов
   */
  private handleChildListMutation(mutation: MutationRecord): void {
    const targetId = this.getElementId(mutation.target as Element);
    
    // Добавленные ноды
    for (const node of Array.from(mutation.addedNodes)) {
      if (node instanceof HTMLElement) {
        const nodeId = this.getElementId(node);
        this.pendingChanges.push({
          elementId: targetId,
          property: 'children.added',
          oldValue: '',
          newValue: nodeId
        });
      }
    }
    
    // Удалённые ноды
    for (const node of Array.from(mutation.removedNodes)) {
      if (node instanceof HTMLElement) {
        // Для удалённых нод ID может быть недоступен
        this.pendingChanges.push({
          elementId: targetId,
          property: 'children.removed',
          oldValue: node.tagName.toLowerCase(),
          newValue: ''
        });
      }
    }
  }
  
  /**
   * Обрабатывает изменение атрибутов
   */
  private handleAttributeMutation(mutation: MutationRecord): void {
    const target = mutation.target as HTMLElement;
    const elementId = this.getElementId(target);
    const attrName = mutation.attributeName || 'unknown';
    
    // Пропускаем чувствительные атрибуты
    if (['value', 'data-value', 'data-secret'].includes(attrName)) {
      return;
    }
    
    const oldValue = mutation.oldValue || '';
    const newValue = target.getAttribute(attrName) || '';
    
    // Отслеживаем только значимые изменения
    if (oldValue !== newValue) {
      this.pendingChanges.push({
        elementId,
        property: `attr.${attrName}`,
        oldValue,
        newValue
      });
      
      // Изменение класса может означать изменение стиля
      if (attrName === 'class') {
        this.trackStyleChanges(target, elementId);
      }
    }
  }
  
  /**
   * Обрабатывает изменение текста
   */
  private handleCharacterDataMutation(mutation: MutationRecord): void {
    const target = mutation.target;
    const parent = target.parentElement;
    
    if (parent) {
      // Проверяем, не является ли родитель чувствительным
      if (this.sanitizer.shouldSkipElement(parent)) {
        return;
      }
      
      const elementId = this.getElementId(parent);
      const oldText = mutation.oldValue || '';
      const newText = target.textContent || '';
      
      // Санитизируем текст
      const sanitizedOld = this.sanitizer.sanitizeText(oldText);
      const sanitizedNew = this.sanitizer.sanitizeText(newText);
      
      if (sanitizedOld !== sanitizedNew) {
        this.pendingChanges.push({
          elementId,
          property: 'text',
          oldValue: sanitizedOld.slice(0, 50),
          newValue: sanitizedNew.slice(0, 50)
        });
      }
    }
  }
  
  /**
   * Отслеживает изменения стилей
   */
  private trackStyleChanges(element: HTMLElement, elementId: string): void {
    const styles = window.getComputedStyle(element);
    const trackedProps = ['backgroundColor', 'color', 'display', 'visibility', 'opacity'];
    
    for (const prop of trackedProps) {
      const value = styles[prop as any];
      // В реальности нужно хранить предыдущие значения, 
      // но для простоты просто отмечаем изменение
      this.pendingChanges.push({
        elementId,
        property: `style.${prop}`,
        oldValue: 'changed',
        newValue: value
      });
    }
  }
  
  /**
   * Проверяет, изменился ли текущий экран
   */
  private checkScreenChange(): void {
    const newScreen = this.detectScreen();
    
    if (newScreen !== this.currentScreen) {
      const previousScreen = this.currentScreen;
      this.currentScreen = newScreen;
      
      console.log(`[MutationTracker] 📱 Screen changed: ${previousScreen} → ${newScreen}`);
      
      if (this.onScreenChange) {
        this.onScreenChange(previousScreen, newScreen);
      }
    }
  }
  
  /**
   * Определяет текущий экран (аналогично DOMScanner)
   */
  private detectScreen(): string {
    // VPN screens
    if (document.querySelector('[class*="connected"]:not([class*="dis"])')) return 'CONNECTED';
    if (document.querySelector('[class*="disconnected"]')) return 'DISCONNECTED';
    if (document.querySelector('[class*="connecting"]')) return 'LOADING';
    if (document.querySelector('[class*="server-list"]')) return 'SERVER_SELECT';
    if (document.querySelector('[class*="login"]')) return 'AUTH';
    if (document.querySelector('[class*="settings"]')) return 'SETTINGS';
    
    return 'HOME';
  }
  
  /**
   * Планирует пакетное обновление
   */
  private scheduleBatchUpdate(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.flushChanges();
    }, this.debounceMs);
  }
  
  /**
   * Отправляет накопленные изменения
   */
  private flushChanges(): void {
    if (this.pendingChanges.length === 0) return;
    
    const update: ExtensionUIUpdate = {
      type: 'EXTENSION_UI_UPDATE',
      extension: this.extensionType,
      timestamp: Date.now(),
      changes: [...this.pendingChanges]
    };
    
    this.pendingChanges = [];
    
    console.log(`[MutationTracker] 📤 Sending ${update.changes.length} changes`);
    
    if (this.onUpdate) {
      this.onUpdate(update);
    }
  }
  
  /**
   * Получает или создаёт ID для элемента
   */
  private getElementId(element: Element): string {
    let id = this.elementIdMap.get(element);
    
    if (!id) {
      if (element.id) {
        id = `#${element.id}`;
      } else {
        id = `mut-${++this.elementCounter}`;
      }
      this.elementIdMap.set(element, id);
    }
    
    return id;
  }
  
  /**
   * Получает текущий экран
   */
  getCurrentScreen(): string {
    return this.currentScreen;
  }
}
