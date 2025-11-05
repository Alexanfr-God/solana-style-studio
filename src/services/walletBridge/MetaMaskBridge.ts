import type { WalletBridgeAPI, WalletDOMStructure, WalletElement, CSSStyleRecord, BridgeMessage } from './WalletBridge';

/**
 * MetaMask Bridge - Connects to MetaMask via Chrome Extension
 * Uses postMessage protocol to communicate with content script
 */
export class MetaMaskBridge implements WalletBridgeAPI {
  private connected = false;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();
  
  constructor() {
    // Listen for responses from content script
    window.addEventListener('message', this.handleMessage.bind(this));
    console.log('[MetaMaskBridge] 🔧 Initialized, listening for extension messages');
  }
  
  async connect(walletType: 'MetaMask'): Promise<boolean> {
    console.log('[MetaMaskBridge] 🔌 Connecting to MetaMask extension...');
    
    try {
      // Send PING to check if extension is available
      const response = await this.sendRequest('ping', {});
      
      if (response.status === 'ok') {
        this.connected = true;
        console.log('[MetaMaskBridge] ✅ Connected to MetaMask extension');
        return true;
      }
      
      throw new Error('MetaMask extension not responding');
      
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ Connection failed:', error);
      throw new Error('MetaMask extension not available. Please install the WCC MetaMask Bridge extension.');
    }
  }
  
  disconnect(): void {
    this.connected = false;
    // Cancel all pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Bridge disconnected'));
    });
    this.pendingRequests.clear();
    console.log('[MetaMaskBridge] 🔌 Disconnected');
  }
  
  isConnected(): boolean {
    return this.connected;
  }
  
  async fetchDOM(): Promise<WalletDOMStructure> {
    console.log('[MetaMaskBridge] 📡 Fetching DOM from MetaMask...');
    const response = await this.sendRequest('fetchDOM', {});
    
    if (!response.dom) {
      throw new Error('Invalid DOM response from extension');
    }
    
    console.log(`[MetaMaskBridge] ✅ Fetched ${response.dom.allElements?.length || 0} elements`);
    return response.dom;
  }
  
  async fetchScreenshot(screen: string): Promise<string | null> {
    console.log('[MetaMaskBridge] 📸 Capturing screenshot...');
    const response = await this.sendRequest('fetchScreenshot', { screen });
    return response.screenshot || null;
  }
  
  async navigate(screen: string): Promise<boolean> {
    console.log(`[MetaMaskBridge] 🧭 Navigating to ${screen}...`);
    const response = await this.sendRequest('navigate', { screen });
    return response.success === true;
  }
  
  async getCurrentScreen(): Promise<string> {
    const response = await this.sendRequest('getCurrentScreen', {});
    return response.screen || 'unknown';
  }
  
  async getElementsTree(): Promise<WalletElement[]> {
    const dom = await this.fetchDOM();
    return dom.allElements;
  }
  
  async getElementStyle(selector: string): Promise<CSSStyleRecord> {
    console.log(`[MetaMaskBridge] 🎨 Getting styles for ${selector}...`);
    const response = await this.sendRequest('getElementStyle', { selector });
    return response.styles || {};
  }
  
  async clickElement(selector: string): Promise<boolean> {
    console.log(`[MetaMaskBridge] 👆 Clicking element ${selector}...`);
    const response = await this.sendRequest('clickElement', { selector });
    return response.success === true;
  }
  
  /**
   * Send request to content script via postMessage
   */
  private async sendRequest(method: string, params: any): Promise<any> {
    if (!this.connected && method !== 'ping') {
      throw new Error('Bridge not connected. Call connect() first.');
    }
    
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      
      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 10000);
      
      // Store promise handlers
      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      // Send message to content script (via extension background)
      const message: BridgeMessage = {
        source: 'wcc-admin',
        type: 'WALLET_REQ',
        id,
        method,
        params
      };
      
      console.log(`[MetaMaskBridge] 📤 Sending request:`, { id, method });
      window.postMessage(message, '*');
    });
  }
  
  /**
   * Handle response from content script
   */
  private handleMessage(event: MessageEvent) {
    const msg = event.data as BridgeMessage;
    
    // Only process messages from wallet-bridge
    if (msg.source !== 'wallet-bridge' || msg.type !== 'WALLET_RES') {
      return;
    }
    
    console.log(`[MetaMaskBridge] 📥 Received response:`, { id: msg.id, hasError: !!msg.error });
    
    const pending = this.pendingRequests.get(msg.id);
    if (!pending) {
      console.warn(`[MetaMaskBridge] ⚠️ No pending request for ID: ${msg.id}`);
      return;
    }
    
    // Clear timeout and remove from pending
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(msg.id);
    
    // Resolve or reject based on response
    if (msg.error) {
      pending.reject(new Error(msg.error));
    } else {
      pending.resolve(msg.result);
    }
  }
}
