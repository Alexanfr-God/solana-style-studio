/**
 * Extension Bridge Client
 * 
 * Клиент для подключения к локальному WebSocket серверу extension-bridge.
 * Используется в Admin AI Scanner для получения снапшотов от внешних расширений.
 * 
 * ВАЖНО: Это клиент, который подключается к отдельному WS-серверу.
 * WS-сервер нужно запускать отдельно (см. scripts/extension-bridge-server.js)
 */

import { useAiScannerStore } from '@/stores/aiScannerStore';
import type { ExtensionUISnapshot } from '@/stores/aiScannerStore';
import {
  EXTENSION_BRIDGE_WS_URL,
  EXTENSION_BRIDGE_HEARTBEAT_INTERVAL,
  type ExtensionBridgeMessage,
  type ExtensionHelloMessage,
  type ExtensionSnapshotMessage,
} from './config';

export interface BridgeMetrics {
  connectedAt: number | null;
  lastHeartbeat: number | null;
  lastSnapshotSize: number | null;
  messagesReceived: number;
  extensionName: string | null;
  extensionVersion: string | null;
}

class ExtensionBridgeClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  
  private metrics: BridgeMetrics = {
    connectedAt: null,
    lastHeartbeat: null,
    lastSnapshotSize: null,
    messagesReceived: 0,
    extensionName: null,
    extensionVersion: null,
  };
  
  private listeners: Set<(msg: ExtensionBridgeMessage) => void> = new Set();
  
  /**
   * Подключиться к extension bridge серверу
   */
  async connect(url: string = EXTENSION_BRIDGE_WS_URL): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[ExtensionBridgeClient] Already connected');
      return true;
    }
    
    if (this.isConnecting) {
      console.log('[ExtensionBridgeClient] Connection in progress...');
      return false;
    }
    
    this.isConnecting = true;
    
    return new Promise((resolve) => {
      const store = useAiScannerStore.getState();
      
      console.log(`[ExtensionBridgeClient] 🔌 Connecting to ${url}...`);
      store.addLog('scanning', '🟢', `Connecting to extension bridge: ${url}`);
      
      try {
        this.ws = new WebSocket(url);
        
        const timeout = setTimeout(() => {
          console.log('[ExtensionBridgeClient] ⏱️ Connection timeout');
          store.addLog('error', '❌', 'Extension bridge connection timeout');
          this.isConnecting = false;
          this.ws?.close();
          resolve(false);
        }, 10000);
        
        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          this.metrics.connectedAt = Date.now();
          
          console.log('[ExtensionBridgeClient] ✅ Connected to extension bridge');
          store.addLog('verified', '✅', 'Connected to extension bridge server');
          
          // Обновляем метрики WS
          store.updateWsMetrics({ isConnected: true });
          
          // Запускаем heartbeat
          this.startHeartbeat();
          
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('[ExtensionBridgeClient] ❌ WebSocket error:', error);
          store.addLog('error', '❌', 'Extension bridge connection error');
          this.isConnecting = false;
          resolve(false);
        };
        
        this.ws.onclose = () => {
          console.log('[ExtensionBridgeClient] 🔴 Disconnected from extension bridge');
          store.addLog('error', '❌', 'Extension bridge disconnected');
          store.updateWsMetrics({ isConnected: false });
          
          this.stopHeartbeat();
          this.ws = null;
          this.isConnecting = false;
          
          // Сбрасываем метрики
          this.metrics = {
            connectedAt: null,
            lastHeartbeat: null,
            lastSnapshotSize: null,
            messagesReceived: 0,
            extensionName: null,
            extensionVersion: null,
          };
        };
        
      } catch (error) {
        console.error('[ExtensionBridgeClient] ❌ Failed to create WebSocket:', error);
        store.addLog('error', '❌', `Failed to connect: ${error}`);
        this.isConnecting = false;
        resolve(false);
      }
    });
  }
  
  /**
   * Отключиться от сервера
   */
  disconnect(): void {
    console.log('[ExtensionBridgeClient] Disconnecting...');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Проверить статус подключения
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
  
  /**
   * Проверить, подключено ли расширение (получили EXT_HELLO)
   */
  isExtensionConnected(): boolean {
    return this.metrics.extensionName !== null;
  }
  
  /**
   * Получить метрики
   */
  getMetrics(): BridgeMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Отправить сообщение расширению
   */
  send(message: Record<string, unknown>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[ExtensionBridgeClient] Cannot send: not connected');
      return false;
    }
    
    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[ExtensionBridgeClient] Failed to send message:', error);
      return false;
    }
  }
  
  /**
   * Запросить снапшот от расширения
   */
  requestSnapshot(): boolean {
    return this.send({ type: 'WCC_REQUEST_SNAPSHOT' });
  }
  
  /**
   * Подписаться на сообщения
   */
  subscribe(listener: (msg: ExtensionBridgeMessage) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  // === Private Methods ===
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as ExtensionBridgeMessage;
      const store = useAiScannerStore.getState();
      
      this.metrics.messagesReceived++;
      
      console.log('[ExtensionBridgeClient] 📨 Received:', message.type);
      
      switch (message.type) {
        case 'EXT_HELLO':
          this.handleHello(message as ExtensionHelloMessage);
          break;
          
        case 'EXT_UI_SNAPSHOT':
          this.handleSnapshot(message as ExtensionSnapshotMessage);
          break;
          
        case 'EXT_PING':
          this.handlePing(message);
          break;
          
        case 'EXT_PONG':
          this.metrics.lastHeartbeat = Date.now();
          break;
          
        case 'EXT_GOODBYE':
          console.log('[ExtensionBridgeClient] 👋 Extension disconnected');
          store.addLog('error', '❌', `Extension disconnected: ${(message as any).extension}`);
          this.metrics.extensionName = null;
          this.metrics.extensionVersion = null;
          break;
          
        default:
          console.log('[ExtensionBridgeClient] Unknown message type:', (message as any).type);
      }
      
      // Уведомляем подписчиков
      this.listeners.forEach(listener => listener(message));
      
    } catch (error) {
      console.error('[ExtensionBridgeClient] Failed to parse message:', error);
    }
  }
  
  private handleHello(message: ExtensionHelloMessage): void {
    const store = useAiScannerStore.getState();
    
    this.metrics.extensionName = message.extension;
    this.metrics.extensionVersion = message.version;
    
    console.log(`[ExtensionBridgeClient] 🤝 Extension connected: ${message.extension} v${message.version}`);
    store.addLog('verified', '✅', `Extension connected: ${message.extension} v${message.version}`);
    
    // Помечаем wallet как подключенный для режима bridge
    store.setWalletConnected(true);
  }
  
  private handleSnapshot(message: ExtensionSnapshotMessage): void {
    const store = useAiScannerStore.getState();
    
    const snapshotSize = JSON.stringify(message.snapshot).length;
    this.metrics.lastSnapshotSize = snapshotSize;
    
    console.log(`[ExtensionBridgeClient] 📸 Snapshot received: ${message.screen}, ${snapshotSize} bytes`);
    store.addLog('snapshot', '🔵', `Snapshot: ${message.extension} - ${message.screen} (${snapshotSize} bytes)`);
    
    // Конвертируем в формат ExtensionUISnapshot для store
    const uiSnapshot: ExtensionUISnapshot = {
      type: 'EXTENSION_UI_SNAPSHOT',
      extension: message.extension,
      timestamp: message.timestamp || Date.now(),
      screen: message.screen,
      ui: {
        elements: message.snapshot.elements?.map(el => ({
          id: el.id,
          selector: el.selector,
          tagName: el.tag,
          className: el.classes?.join(' '),
          textContent: el.text,
          rect: el.rect,
          styles: el.styles,
        })),
        theme: message.snapshot.theme,
      },
    };
    
    store.setExtensionSnapshot(uiSnapshot);
  }
  
  private handlePing(message: { type: 'EXT_PING'; ts: number }): void {
    // Отвечаем PONG
    this.send({ type: 'WCC_PONG', ts: message.ts });
    this.metrics.lastHeartbeat = Date.now();
  }
  
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'WCC_PING', ts: Date.now() });
      }
    }, EXTENSION_BRIDGE_HEARTBEAT_INTERVAL);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Singleton instance
export const extensionBridgeClient = new ExtensionBridgeClient();
