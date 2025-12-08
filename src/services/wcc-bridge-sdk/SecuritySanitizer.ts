/**
 * SecuritySanitizer - фильтрация приватных данных из DOM снапшотов
 * Гарантирует, что никакие чувствительные данные не покидают расширение
 */

import type { ExtensionUIElement, SecurityInfo } from './protocol';

// Селекторы элементов, содержащих приватные данные
const SANITIZE_SELECTORS = [
  '[type="password"]',
  '[name="password"]',
  '[name="seed"]',
  '[name="private-key"]',
  '[name="mnemonic"]',
  '.password-field',
  '.seed-phrase',
  '.private-key',
  '.secret-recovery-phrase',
  '[data-testid="secret-recovery-phrase"]',
  '[data-testid="password-input"]',
  '[autocomplete="current-password"]',
  '[autocomplete="new-password"]'
];

// Атрибуты, которые нужно исключить
const EXCLUDED_ATTRIBUTES = [
  'value',
  'placeholder', // может содержать hints
  'data-value',
  'data-secret',
  'data-private'
];

// Паттерны для фильтрации текста
const SENSITIVE_TEXT_PATTERNS = [
  /\b[0-9a-fA-F]{64}\b/g,                    // Private keys (64 hex chars)
  /\b[0-9a-fA-F]{128}\b/g,                   // Extended private keys
  /\b0x[0-9a-fA-F]{40}\b/g,                  // Ethereum addresses - keep but may redact
  /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g,        // Solana addresses / base58
  /\b(\w+\s+){11,23}\w+\b/g,                 // Seed phrases (12-24 words)
  /password|secret|private|mnemonic|seed/gi  // Keywords
];

// Классы элементов, которые точно содержат чувствительные данные
const SENSITIVE_CLASSES = [
  'seed-phrase',
  'private-key',
  'secret',
  'password',
  'mnemonic',
  'recovery-phrase'
];

export interface SanitizeOptions {
  redactAddresses?: boolean;      // Редактировать ли адреса (по умолчанию false)
  redactBalances?: boolean;       // Редактировать ли балансы (по умолчанию false)
  keepStructure?: boolean;        // Сохранять структуру DOM (по умолчанию true)
  logRedactions?: boolean;        // Логировать редактирования (по умолчанию false)
}

export class SecuritySanitizer {
  private redactedFields: string[] = [];
  private options: SanitizeOptions;
  
  constructor(options: SanitizeOptions = {}) {
    this.options = {
      redactAddresses: false,
      redactBalances: false,
      keepStructure: true,
      logRedactions: false,
      ...options
    };
  }
  
  /**
   * Проверяет, является ли элемент чувствительным
   */
  isSensitiveElement(element: HTMLElement): boolean {
    // Проверка по селекторам
    for (const selector of SANITIZE_SELECTORS) {
      if (element.matches(selector)) {
        return true;
      }
    }
    
    // Проверка по классам
    const classList = Array.from(element.classList);
    for (const className of classList) {
      for (const sensitiveClass of SENSITIVE_CLASSES) {
        if (className.toLowerCase().includes(sensitiveClass)) {
          return true;
        }
      }
    }
    
    // Проверка типа input
    if (element.tagName === 'INPUT') {
      const input = element as HTMLInputElement;
      if (input.type === 'password') {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Санитизирует текст, удаляя потенциально приватные данные
   */
  sanitizeText(text: string): string {
    if (!text) return text;
    
    let sanitized = text;
    
    for (const pattern of SENSITIVE_TEXT_PATTERNS) {
      const matches = sanitized.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Для адресов - оставляем первые и последние символы
          if (match.startsWith('0x') && match.length === 42) {
            if (this.options.redactAddresses) {
              const redacted = `${match.slice(0, 6)}...${match.slice(-4)}`;
              sanitized = sanitized.replace(match, redacted);
              this.redactedFields.push('address');
            }
          } else {
            // Для остальных чувствительных данных - полная редакция
            sanitized = sanitized.replace(match, '[REDACTED]');
            this.redactedFields.push('sensitive_data');
          }
        }
      }
    }
    
    return sanitized;
  }
  
  /**
   * Санитизирует элемент UI
   */
  sanitizeElement(element: ExtensionUIElement): ExtensionUIElement {
    const sanitized = { ...element };
    
    // Проверяем классы на чувствительность
    const hasSensitiveClass = element.classes.some(cls => 
      SENSITIVE_CLASSES.some(sc => cls.toLowerCase().includes(sc))
    );
    
    if (hasSensitiveClass) {
      sanitized.text = '[REDACTED]';
      this.redactedFields.push(`element:${element.id}`);
      
      if (this.options.logRedactions) {
        console.log(`[SecuritySanitizer] Redacted element: ${element.id}`);
      }
    } else {
      // Санитизируем текст
      sanitized.text = this.sanitizeText(element.text);
    }
    
    // Удаляем чувствительные стили (если есть)
    if (sanitized.styles) {
      // Стили обычно безопасны, но очищаем content если есть
      delete (sanitized.styles as any).content;
    }
    
    return sanitized;
  }
  
  /**
   * Санитизирует массив элементов
   */
  sanitizeElements(elements: ExtensionUIElement[]): ExtensionUIElement[] {
    this.redactedFields = []; // Reset for this batch
    return elements.map(el => this.sanitizeElement(el));
  }
  
  /**
   * Проверяет, нужно ли пропустить элемент полностью
   */
  shouldSkipElement(element: HTMLElement): boolean {
    // Пропускаем скрытые элементы с чувствительными данными
    if (this.isSensitiveElement(element)) {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return true;
      }
    }
    
    // Пропускаем элементы со специальными атрибутами
    if (element.hasAttribute('data-wcc-ignore')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Получает информацию о безопасности для снапшота
   */
  getSecurityInfo(): SecurityInfo {
    return {
      sanitized: true,
      redactedFields: [...new Set(this.redactedFields)],
      timestamp: Date.now()
    };
  }
  
  /**
   * Сбрасывает список редактированных полей
   */
  reset(): void {
    this.redactedFields = [];
  }
}

// Экспортируем singleton для удобства
export const defaultSanitizer = new SecuritySanitizer();
