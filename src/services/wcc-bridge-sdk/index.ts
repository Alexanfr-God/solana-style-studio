/**
 * WCC Bridge SDK - главный экспорт
 * SDK для встраивания в браузерные расширения
 */

export { DOMScanner, type DOMScannerOptions } from './DOMScanner';
export { MutationTracker, type MutationTrackerOptions } from './MutationTracker';
export { SecuritySanitizer, type SanitizeOptions, defaultSanitizer } from './SecuritySanitizer';
export { WCCClient, type WCCClientOptions } from './WCCClient';
export * from './protocol';

import { DOMScanner, type DOMScannerOptions } from './DOMScanner';
import { MutationTracker } from './MutationTracker';
import { SecuritySanitizer } from './SecuritySanitizer';
import { WCCClient, type WCCClientOptions } from './WCCClient';
import type { ExtensionType, ApplyThemeCommand } from './protocol';

/**
 * WCCBridge - единая точка входа для SDK
 * Объединяет DOMScanner, MutationTracker и WCCClient
 */
export interface WCCBridgeOptions {
  wsUrl: string;
  extensionId: ExtensionType;
  rootSelector?: string;
  autoConnect?: boolean;
  autoScan?: boolean;
  scanInterval?: number;
  onThemeCommand?: (theme: Record<string, string>) => void;
}

export class WCCBridge {
  private scanner: DOMScanner;
  private tracker: MutationTracker;
  private client: WCCClient;
  private sanitizer: SecuritySanitizer;
  
  private scanInterval: number;
  private scanTimer: ReturnType<typeof setInterval> | null = null;
  private isStarted: boolean = false;
  
  constructor(options: WCCBridgeOptions) {
    this.sanitizer = new SecuritySanitizer();
    
    this.scanner = new DOMScanner({
      extensionType: options.extensionId,
      rootSelector: options.rootSelector,
      sanitizer: this.sanitizer
    });
    
    this.tracker = new MutationTracker({
      extensionType: options.extensionId,
      rootSelector: options.rootSelector,
      sanitizer: this.sanitizer,
      onUpdate: (update) => {
        this.client.sendUpdate(update);
      },
      onScreenChange: (prev, current) => {
        this.client.sendScreenChange(prev, current);
        // При смене экрана отправляем полный снапшот
        this.sendSnapshot();
      }
    });
    
    this.client = new WCCClient({
      wsUrl: options.wsUrl,
      extensionId: options.extensionId,
      onConnected: () => {
        console.log('[WCCBridge] ✅ Connected, sending initial snapshot');
        this.sendSnapshot();
      },
      onCommand: (command: ApplyThemeCommand) => {
        if (options.onThemeCommand) {
          options.onThemeCommand(command.theme);
        } else {
          this.applyTheme(command.theme);
        }
      }
    });
    
    this.scanInterval = options.scanInterval || 5000;
    
    if (options.autoConnect !== false) {
      // Автоподключение после загрузки DOM
      if (document.readyState === 'complete') {
        this.start();
      } else {
        window.addEventListener('DOMContentLoaded', () => this.start());
      }
    }
  }
  
  /**
   * Запускает bridge
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      console.warn('[WCCBridge] Already started');
      return;
    }
    
    this.isStarted = true;
    console.log('[WCCBridge] 🚀 Starting...');
    
    try {
      // Подключаемся к серверу
      await this.client.connect();
      
      // Запускаем отслеживание мутаций
      this.tracker.start();
      
      // Запускаем периодическое сканирование
      this.startPeriodicScan();
      
      console.log('[WCCBridge] ✅ Started successfully');
    } catch (error) {
      console.error('[WCCBridge] ❌ Failed to start:', error);
      this.isStarted = false;
    }
  }
  
  /**
   * Останавливает bridge
   */
  stop(): void {
    if (!this.isStarted) return;
    
    console.log('[WCCBridge] 🛑 Stopping...');
    
    this.stopPeriodicScan();
    this.tracker.stop();
    this.client.disconnect();
    
    this.isStarted = false;
  }
  
  /**
   * Отправляет текущий снапшот
   */
  sendSnapshot(): void {
    try {
      const snapshot = this.scanner.scan();
      this.client.sendSnapshot(snapshot);
    } catch (error) {
      console.error('[WCCBridge] ❌ Failed to send snapshot:', error);
    }
  }
  
  /**
   * Применяет тему к UI
   */
  applyTheme(theme: Record<string, string>): void {
    console.log('[WCCBridge] 🎨 Applying theme:', Object.keys(theme).length, 'properties');
    
    const root = document.documentElement;
    
    for (const [property, value] of Object.entries(theme)) {
      if (property.startsWith('--')) {
        // CSS переменные
        root.style.setProperty(property, value);
      } else {
        // Прямые селекторы
        try {
          const elements = document.querySelectorAll(property);
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              // Парсим значение как объект стилей
              if (typeof value === 'object') {
                Object.assign(el.style, value);
              } else {
                // Предполагаем, что это backgroundColor
                el.style.backgroundColor = value;
              }
            }
          });
        } catch {
          // Невалидный селектор, пропускаем
        }
      }
    }
  }
  
  /**
   * Проверяет, запущен ли bridge
   */
  isRunning(): boolean {
    return this.isStarted;
  }
  
  /**
   * Проверяет подключение
   */
  isConnected(): boolean {
    return this.client.isConnected();
  }
  
  // ============= Private Methods =============
  
  private startPeriodicScan(): void {
    this.scanTimer = setInterval(() => {
      if (this.client.isConnected()) {
        this.sendSnapshot();
      }
    }, this.scanInterval);
  }
  
  private stopPeriodicScan(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
  }
}

// Экспортируем для использования в расширениях
export default WCCBridge;
