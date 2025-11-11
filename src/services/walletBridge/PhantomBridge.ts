import type { WalletBridgeAPI, WalletDOMStructure, WalletElement, CSSStyleRecord, BridgeMessage } from './WalletBridge';

/**
 * Phantom Bridge - Connects to Phantom via Chrome Extension
 * Uses postMessage protocol (same as MetaMask)
 * Extension ID: bfnaelmomeimhlpmgjnjophhpkkoljpa
 */
export class PhantomBridge implements WalletBridgeAPI {
  private connected = false;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();
  private readonly REQUEST_TIMEOUT = 15000;
  
  constructor() {
    window.addEventListener('message', this.handleMessage.bind(this));
  }
  
  async connect(walletType: 'Phantom'): Promise<boolean> {
    console.log('[PhantomBridge] 🔌 Connecting to Phantom...');
    
    try {
      const response = await this.sendRequest('ping', {});
      
      if (response.status === 'ok') {
        this.connected = true;
        console.log('[PhantomBridge] ✅ Connected to Phantom extension');
        return true;
      }
      
      throw new Error('Phantom extension did not respond correctly');
      
    } catch (error) {
      console.error('[PhantomBridge] ❌ Connection failed:', error);
      throw new Error('Failed to connect to Phantom. Please ensure the WCC Phantom Bridge extension is installed and Phantom is open.');
    }
  }
  
  disconnect(): void {
    console.log('[PhantomBridge] 🔌 Disconnecting...');
    this.connected = false;
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Bridge disconnected'));
    });
    this.pendingRequests.clear();
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  async fetchDOM(): Promise<WalletDOMStructure> {
    this.ensureConnected();
    console.log('[PhantomBridge] 📡 Fetching DOM from Phantom...');
    
    try {
      const response = await this.sendRequest('fetchDOM', {});
      return response.dom;
    } catch (error) {
      console.error('[PhantomBridge] ❌ fetchDOM failed:', error);
      throw new Error(`Failed to fetch DOM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async fetchScreenshot(screen: string): Promise<string | null> {
    this.ensureConnected();
    console.log('[PhantomBridge] 📸 Capturing screenshot...');
    
    try {
      const response = await this.sendRequest('fetchScreenshot', { screen });
      return response.screenshot;
    } catch (error) {
      console.error('[PhantomBridge] ❌ fetchScreenshot failed:', error);
      return null;
    }
  }
  
  async navigate(screen: string): Promise<boolean> {
    this.ensureConnected();
    console.log('[PhantomBridge] 🧭 Navigating to:', screen);
    
    try {
      const response = await this.sendRequest('navigate', { screen });
      return response.success || false;
    } catch (error) {
      console.error('[PhantomBridge] ❌ navigate failed:', error);
      return false;
    }
  }
  
  async getCurrentScreen(): Promise<string> {
    this.ensureConnected();
    
    try {
      const response = await this.sendRequest('getCurrentScreen', {});
      return response.screen || 'home';
    } catch (error) {
      console.error('[PhantomBridge] ❌ getCurrentScreen failed:', error);
      return 'home';
    }
  }
  
  async getElementsTree(): Promise<WalletElement[]> {
    this.ensureConnected();
    
    try {
      const domStructure = await this.fetchDOM();
      return domStructure.allElements;
    } catch (error) {
      console.error('[PhantomBridge] ❌ getElementsTree failed:', error);
      return [];
    }
  }
  
  async getElementStyle(selector: string): Promise<CSSStyleRecord> {
    this.ensureConnected();
    console.log('[PhantomBridge] 🎨 Getting styles for:', selector);
    
    try {
      const response = await this.sendRequest('getElementStyle', { selector });
      return response.styles;
    } catch (error) {
      console.error('[PhantomBridge] ❌ getElementStyle failed:', error);
      throw new Error(`Failed to get element style: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async clickElement(selector: string): Promise<boolean> {
    this.ensureConnected();
    console.log('[PhantomBridge] 👆 Clicking element:', selector);
    
    try {
      const response = await this.sendRequest('clickElement', { selector });
      return response.success || false;
    } catch (error) {
      console.error('[PhantomBridge] ❌ clickElement failed:', error);
      return false;
    }
  }
  
  // Private methods
  
  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('Not connected to Phantom. Please call connect() first.');
    }
  }
  
  private async sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method} (${this.REQUEST_TIMEOUT}ms)`));
      }, this.REQUEST_TIMEOUT);
      
      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      console.log(`[PhantomBridge] 📤 Sending request: ${method} (${id})`);
      window.postMessage({
        source: 'wcc-admin',
        type: 'WALLET_REQ',
        id,
        method,
        params
      }, '*');
    });
  }
  
  private handleMessage(event: MessageEvent) {
    const msg = event.data as BridgeMessage;
    
    if (msg.source !== 'wallet-bridge' || msg.type !== 'WALLET_RES') {
      return;
    }
    
    const pending = this.pendingRequests.get(msg.id);
    if (!pending) {
      return;
    }
    
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(msg.id);
    
    console.log(`[PhantomBridge] 📥 Received response: ${msg.id}`);
    
    if (msg.error) {
      pending.reject(new Error(msg.error));
    } else {
      pending.resolve(msg.result);
    }
  }
}
