import type { WalletBridgeAPI, WalletDOMStructure, WalletElement, CSSStyleRecord, BridgeMessage } from './WalletBridge';

/**
 * MetaMask Bridge - Connects to MetaMask via Chrome Extension
 * Uses postMessage protocol to communicate with content script
 */
export class MetaMaskBridge implements WalletBridgeAPI {
  private connected = false;
  private pendingRequests = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();
  private readonly REQUEST_TIMEOUT = 15000; // 15 seconds
  
  constructor() {
    // Listen for responses from content script
    window.addEventListener('message', this.handleMessage.bind(this));
  }
  
  async connect(walletType: 'MetaMask'): Promise<boolean> {
    console.log('[MetaMaskBridge] 🔌 Connecting to MetaMask...');
    
    try {
      // Step 1: Check if extension is installed and responding
      const response = await this.sendRequest('ping', {});
      
      if (response.status === 'ok') {
        this.connected = true;
        console.log('[MetaMaskBridge] ✅ Connected to MetaMask extension');
        return true;
      }
      
      throw new Error('MetaMask extension did not respond correctly');
      
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ Connection failed:', error);
      
      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('MetaMask extension is not responding. Please ensure:\n1. The WCC MetaMask Bridge extension is installed\n2. MetaMask popup is open\n3. You are on the MetaMask extension page');
        }
      }
      
      throw new Error('Failed to connect to MetaMask. Please ensure the WCC MetaMask Bridge extension is installed and MetaMask is open.');
    }
  }
  
  disconnect(): void {
    console.log('[MetaMaskBridge] 🔌 Disconnecting...');
    this.connected = false;
    
    // Reject all pending requests
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
    console.log('[MetaMaskBridge] 📡 Fetching DOM from MetaMask...');
    
    try {
      const response = await this.sendRequest('fetchDOM', {});
      return response.dom;
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ fetchDOM failed:', error);
      throw new Error(`Failed to fetch DOM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async fetchScreenshot(screen: string): Promise<string | null> {
    this.ensureConnected();
    console.log('[MetaMaskBridge] 📸 Capturing screenshot...');
    
    try {
      const response = await this.sendRequest('fetchScreenshot', { screen });
      return response.screenshot;
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ fetchScreenshot failed:', error);
      // Non-critical - return null instead of throwing
      return null;
    }
  }
  
  async navigate(screen: string): Promise<boolean> {
    this.ensureConnected();
    console.log('[MetaMaskBridge] 🧭 Navigating to:', screen);
    
    try {
      const response = await this.sendRequest('navigate', { screen });
      return response.success || false;
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ navigate failed:', error);
      return false;
    }
  }
  
  async getCurrentScreen(): Promise<string> {
    this.ensureConnected();
    
    try {
      const response = await this.sendRequest('getCurrentScreen', {});
      return response.screen || 'home';
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ getCurrentScreen failed:', error);
      return 'home';
    }
  }
  
  async getElementsTree(): Promise<WalletElement[]> {
    this.ensureConnected();
    
    try {
      const domStructure = await this.fetchDOM();
      return domStructure.allElements;
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ getElementsTree failed:', error);
      return [];
    }
  }
  
  async getElementStyle(selector: string): Promise<CSSStyleRecord> {
    this.ensureConnected();
    console.log('[MetaMaskBridge] 🎨 Getting styles for:', selector);
    
    try {
      const response = await this.sendRequest('getElementStyle', { selector });
      return response.styles;
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ getElementStyle failed:', error);
      throw new Error(`Failed to get element style: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async clickElement(selector: string): Promise<boolean> {
    this.ensureConnected();
    console.log('[MetaMaskBridge] 👆 Clicking element:', selector);
    
    try {
      const response = await this.sendRequest('clickElement', { selector });
      return response.success || false;
    } catch (error) {
      console.error('[MetaMaskBridge] ❌ clickElement failed:', error);
      return false;
    }
  }
  
  /**
   * Static method to check if extension is available
   */
  static async checkExtensionAvailability(): Promise<{
    available: boolean;
    error?: string;
    suggestion?: string;
  }> {
    return new Promise((resolve) => {
      const testBridge = new MetaMaskBridge();
      const timeoutId = setTimeout(() => {
        resolve({
          available: false,
          error: 'Extension not responding',
          suggestion: 'Install the WCC MetaMask Bridge extension from packages/metamask-bridge-extension'
        });
      }, 3000);
      
      // Try to ping
      const messageHandler = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.source === 'wallet-bridge' && msg.type === 'WALLET_RES') {
          clearTimeout(timeoutId);
          window.removeEventListener('message', messageHandler);
          resolve({ available: true });
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Send ping
      window.postMessage({
        source: 'wcc-admin',
        type: 'WALLET_REQ',
        id: 'availability-check',
        method: 'ping',
        params: {}
      }, '*');
    });
  }
  
  // Private methods
  
  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error('Not connected to MetaMask. Please call connect() first.');
    }
  }
  
  private async sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      
      // Set timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method} (${this.REQUEST_TIMEOUT}ms)`));
      }, this.REQUEST_TIMEOUT);
      
      // Store promise handlers with timeout
      this.pendingRequests.set(id, { resolve, reject, timeout });
      
      // Send message to content script (via extension background)
      console.log(`[MetaMaskBridge] 📤 Sending request: ${method} (${id})`);
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
    
    // Only handle wallet-bridge responses
    if (msg.source !== 'wallet-bridge' || msg.type !== 'WALLET_RES') {
      return;
    }
    
    const pending = this.pendingRequests.get(msg.id);
    if (!pending) {
      return;
    }
    
    // Clear timeout and remove from pending
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(msg.id);
    
    console.log(`[MetaMaskBridge] 📥 Received response: ${msg.id}`);
    
    if (msg.error) {
      pending.reject(new Error(msg.error));
    } else {
      pending.resolve(msg.result);
    }
  }
}
