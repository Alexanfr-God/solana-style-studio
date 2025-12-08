/**
 * WCCClient - WebSocket клиент для связи с WCC сервером
 * Отправляет снапшоты и получает команды
 */

import type { 
  WCCBridgeMessage, 
  ExtensionUISnapshot, 
  ExtensionUIUpdate,
  ExtensionType,
  ApplyThemeCommand
} from './protocol';
import { createSnapshotMessage, createUpdateMessage } from './protocol';

export interface WCCClientOptions {
  wsUrl: string;
  extensionId: ExtensionType;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onCommand?: (command: ApplyThemeCommand) => void;
  onError?: (error: Error) => void;
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export class WCCClient {
  private ws: WebSocket | null = null;
  private wsUrl: string;
  private extensionId: ExtensionType;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private messageQueue: WCCBridgeMessage[] = [];
  
  private onConnected?: () => void;
  private onDisconnected?: () => void;
  private onCommand?: (command: ApplyThemeCommand) => void;
  private onError?: (error: Error) => void;
  
  constructor(options: WCCClientOptions) {
    this.wsUrl = options.wsUrl;
    this.extensionId = options.extensionId;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.onConnected = options.onConnected;
    this.onDisconnected = options.onDisconnected;
    this.onCommand = options.onCommand;
    this.onError = options.onError;
  }
  
  /**
   * Подключается к WCC серверу
   */
  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.connectionState === 'connected') {
        resolve(true);
        return;
      }
      
      this.connectionState = 'connecting';
      console.log(`[WCCClient] 🔌 Connecting to ${this.wsUrl}...`);
      
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        const timeout = setTimeout(() => {
          if (this.connectionState === 'connecting') {
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          
          console.log('[WCCClient] ✅ Connected to WCC server');
          
          // Отправляем hello
          this.sendRaw({
            id: `hello-${Date.now()}`,
            source: 'extension',
            timestamp: Date.now(),
            payload: {
              type: 'EXTENSION_CONNECTED' as any,
              extension: this.extensionId,
              version: '1.0.0'
            }
          });
          
          // Запускаем ping
          this.startPing();
          
          // Отправляем очередь сообщений
          this.flushQueue();
          
          this.onConnected?.();
          resolve(true);
        };
        
        this.ws.onerror = (event) => {
          clearTimeout(timeout);
          const error = new Error('WebSocket error');
          console.error('[WCCClient] ❌ Connection error:', event);
          this.onError?.(error);
          
          if (this.connectionState === 'connecting') {
            reject(error);
          }
        };
        
        this.ws.onclose = () => {
          console.log('[WCCClient] 🔴 Disconnected');
          this.connectionState = 'disconnected';
          this.stopPing();
          this.onDisconnected?.();
          
          // Автоматическое переподключение
          this.scheduleReconnect();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };
        
      } catch (error) {
        this.connectionState = 'disconnected';
        reject(error);
      }
    });
  }
  
  /**
   * Отключается от сервера
   */
  disconnect(): void {
    this.stopPing();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      // Отправляем disconnect перед закрытием
      this.sendRaw({
        id: `bye-${Date.now()}`,
        source: 'extension',
        timestamp: Date.now(),
        payload: {
          type: 'EXTENSION_DISCONNECTED' as any,
          extension: this.extensionId
        }
      });
      
      this.ws.close();
      this.ws = null;
    }
    
    this.connectionState = 'disconnected';
    this.messageQueue = [];
  }
  
  /**
   * Отправляет UI снапшот
   */
  sendSnapshot(snapshot: Omit<ExtensionUISnapshot, 'type'>): void {
    const message = createSnapshotMessage(snapshot);
    this.send(message);
  }
  
  /**
   * Отправляет обновление UI
   */
  sendUpdate(update: Omit<ExtensionUIUpdate, 'type'>): void {
    const message = createUpdateMessage(update);
    this.send(message);
  }
  
  /**
   * Отправляет уведомление о смене экрана
   */
  sendScreenChange(previousScreen: string, currentScreen: string): void {
    this.send({
      id: `screen-${Date.now()}`,
      source: 'extension',
      timestamp: Date.now(),
      payload: {
        type: 'EXTENSION_SCREEN_CHANGE',
        extension: this.extensionId,
        timestamp: Date.now(),
        previousScreen,
        currentScreen
      }
    });
  }
  
  /**
   * Проверяет, подключен ли клиент
   */
  isConnected(): boolean {
    return this.connectionState === 'connected' && 
           this.ws !== null && 
           this.ws.readyState === WebSocket.OPEN;
  }
  
  /**
   * Получает текущее состояние подключения
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }
  
  // ============= Private Methods =============
  
  private send(message: WCCBridgeMessage): void {
    if (this.isConnected()) {
      this.sendRaw(message);
    } else {
      // Добавляем в очередь для отправки после подключения
      this.messageQueue.push(message);
      console.log(`[WCCClient] 📝 Queued message (queue size: ${this.messageQueue.length})`);
    }
  }
  
  private sendRaw(message: WCCBridgeMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log(`[WCCClient] 📤 Sent: ${message.payload.type}`);
    }
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WCCBridgeMessage = JSON.parse(event.data);
      console.log(`[WCCClient] 📨 Received: ${message.payload.type}`);
      
      switch (message.payload.type) {
        case 'APPLY_THEME':
          this.onCommand?.(message.payload as ApplyThemeCommand);
          // Отправляем ACK
          this.sendRaw({
            id: `ack-${message.id}`,
            source: 'extension',
            timestamp: Date.now(),
            payload: { type: 'ACK', success: true }
          });
          break;
          
        case 'GET_UI_SNAPSHOT':
          // Это сигнал для отправки снапшота - обрабатывается снаружи
          console.log('[WCCClient] 📸 Snapshot requested by server');
          break;
          
        case 'PING':
          this.sendRaw({
            id: `pong-${Date.now()}`,
            source: 'extension',
            timestamp: Date.now(),
            payload: { type: 'PONG' }
          });
          break;
          
        default:
          console.log(`[WCCClient] Unknown message type: ${message.payload.type}`);
      }
      
    } catch (error) {
      console.error('[WCCClient] ❌ Failed to parse message:', error);
    }
  }
  
  private flushQueue(): void {
    if (this.messageQueue.length === 0) return;
    
    console.log(`[WCCClient] 📤 Flushing ${this.messageQueue.length} queued messages`);
    
    for (const message of this.messageQueue) {
      this.sendRaw(message);
    }
    
    this.messageQueue = [];
  }
  
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WCCClient] ❌ Max reconnect attempts reached');
      return;
    }
    
    this.connectionState = 'reconnecting';
    this.reconnectAttempts++;
    
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 5);
    console.log(`[WCCClient] 🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Ошибка уже залогирована в connect()
      });
    }, delay);
  }
  
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendRaw({
          id: `ping-${Date.now()}`,
          source: 'extension',
          timestamp: Date.now(),
          payload: { type: 'PING' }
        });
      }
    }, 30000); // Ping каждые 30 секунд
  }
  
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
