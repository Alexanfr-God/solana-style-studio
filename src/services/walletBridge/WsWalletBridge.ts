/**
 * WebSocket-based Wallet Bridge
 * Connects to WS server and communicates with wallet clients
 */

import type { WalletBridgeAPI, WalletDOMStructure, WalletElement, CSSStyleRecord } from './WalletBridge';

export class WsWalletBridge implements WalletBridgeAPI {
  private ws: WebSocket | null = null;
  private messageQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void; type: string }> = [];
  private connectionPromise: Promise<boolean> | null = null;
  
  private WS_URL = 'ws://localhost:3001';
  
  async connect(): Promise<boolean> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('[WsWalletBridge] 🔌 Connecting to WS server...');
      
      this.ws = new WebSocket(this.WS_URL);
      
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout (15s)'));
        this.ws?.close();
      }, 15000);
      
      this.ws.onopen = () => {
        clearTimeout(timeout);
        console.log('[WsWalletBridge] ✅ Connected to WS server');
        
        // Send hello
        this.sendMessage({
          type: 'hello',
          source: 'admin-ui',
          timestamp: Date.now()
        });
        
        resolve(true);
      };
      
      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('[WsWalletBridge] ❌ Connection error:', error);
        reject(new Error('Failed to connect to WS server'));
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };
      
      this.ws.onclose = () => {
        console.log('[WsWalletBridge] 🔴 Disconnected from WS server');
        this.ws = null;
        this.connectionPromise = null;
      };
    });
    
    return this.connectionPromise;
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
    this.messageQueue = [];
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  async fetchDOM(): Promise<WalletDOMStructure> {
    if (!this.isConnected()) {
      throw new Error('Not connected to WS server');
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('fetchDOM timeout (10s)'));
      }, 10000);
      
      this.messageQueue.push({
        resolve: (data) => {
          clearTimeout(timeout);
          resolve(this.convertUIMapToDOM(data));
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        type: 'uiMap'
      });
      
      this.sendMessage({ type: 'getUIMap' });
    });
  }
  
  // Navigation methods (not implemented for WS-based wallets yet)
  async navigate(screen: string): Promise<boolean> {
    console.warn('[WsWalletBridge] ⚠️ navigate() not implemented for WS bridge');
    return false;
  }
  
  async getCurrentScreen(): Promise<string> {
    return 'home'; // Default for WS-based wallets
  }
  
  async getElementsTree(): Promise<WalletElement[]> {
    const dom = await this.fetchDOM();
    return dom.allElements;
  }
  
  async getElementStyle(selector: string): Promise<CSSStyleRecord> {
    const dom = await this.fetchDOM();
    const element = dom.allElements.find(el => el.selector === selector);
    return element?.styles || {};
  }
  
  async clickElement(selector: string): Promise<boolean> {
    console.warn('[WsWalletBridge] ⚠️ clickElement() not implemented for WS bridge');
    return false;
  }
  
  async fetchScreenshot(screen: string = 'home'): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Not connected to WS server');
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('fetchScreenshot timeout (10s)'));
      }, 10000);
      
      this.messageQueue.push({
        resolve: (data) => {
          clearTimeout(timeout);
          resolve(data);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        type: 'screenshot'
      });
      
      this.sendMessage({ type: 'getScreenshot', screen });
    });
  }
  
  async applyTheme(themeJson: any): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Not connected to WS server');
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('applyTheme timeout (5s)'));
      }, 5000);
      
      this.messageQueue.push({
        resolve: (data) => {
          clearTimeout(timeout);
          resolve(data.ok === true);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
        type: 'applyAck'
      });
      
      this.sendMessage({ 
        type: 'applyTheme', 
        data: themeJson 
      });
    });
  }
  
  // Private methods
  
  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('[WsWalletBridge] 📤 Sent:', message.type);
    } else {
      console.warn('[WsWalletBridge] ⚠️ Cannot send message, not connected');
    }
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      console.log('[WsWalletBridge] 📨 Received:', message.type);
      
      // Find waiting promise for this message type
      const queueIndex = this.messageQueue.findIndex(q => q.type === message.type);
      
      if (queueIndex !== -1) {
        const { resolve, reject } = this.messageQueue[queueIndex];
        this.messageQueue.splice(queueIndex, 1);
        
        if (message.type === 'uiMap') {
          resolve(message.data);
        } else if (message.type === 'screenshot') {
          resolve(message.data);
        } else if (message.type === 'applyAck') {
          if (message.ok) {
            resolve(message);
          } else {
            reject(new Error(message.error || 'Theme application failed'));
          }
        }
      }
      
      // Handle server messages
      if (message.type === 'connected') {
        console.log('[WsWalletBridge] ✅ Server assigned client ID:', message.clientId);
      } else if (message.type === 'pong') {
        console.log('[WsWalletBridge] 🏓 Pong received');
      }
      
    } catch (error) {
      console.error('[WsWalletBridge] ❌ Failed to parse message:', error);
    }
  }
  
  private convertUIMapToDOM(uiMapData: any): WalletDOMStructure {
    const elements: WalletElement[] = (uiMapData.elements || []).map((el: any, index: number) => ({
      id: `element-${index}`,
      tag: this.inferTagFromRole(el.role),
      classes: [el.role.split('.')[0]],
      text: el.text || '',
      selector: el.selector,
      isVisible: true,
      rect: el.rect,
      styles: {
        backgroundColor: el.styles.backgroundColor || 'transparent',
        color: el.styles.color || '#ffffff',
        borderRadius: el.styles.borderRadius || '0px',
        fontFamily: el.styles.fontFamily || 'sans-serif',
        fontSize: el.styles.fontSize || '14px',
        border: el.styles.border || 'none'
      }
    }));
    
    return {
      walletType: uiMapData.walletType || 'unknown',
      currentScreen: uiMapData.screen || 'home',
      timestamp: Date.now(),
      allElements: elements
    };
  }
  
  private inferTagFromRole(role: string): string {
    if (role.includes('button')) return 'button';
    if (role.includes('input')) return 'input';
    if (role.includes('icon')) return 'svg';
    if (role.includes('card') || role.includes('display')) return 'div';
    return 'div';
  }
}
