/**
 * WalletBridge API - Interface for connecting to external wallets
 * Provides read-only access to wallet UI structure and styles
 */

export interface WalletBridgeAPI {
  // Connection
  connect(walletType: 'MetaMask' | 'Phantom'): Promise<boolean>;
  disconnect(): void;
  isConnected(): boolean;
  
  // DOM Data
  fetchDOM(): Promise<WalletDOMStructure>;
  fetchScreenshot(screen: string): Promise<string | null>; // base64 dataURL
  
  // Navigation
  navigate(screen: string): Promise<boolean>;
  getCurrentScreen(): Promise<string>;
  
  // Elements
  getElementsTree(): Promise<WalletElement[]>;
  getElementStyle(selector: string): Promise<CSSStyleRecord>;
  clickElement(selector: string): Promise<boolean>;
}

export interface WalletDOMStructure {
  walletType: string;
  currentScreen: string;
  timestamp: number;
  allElements: WalletElement[];
}

export interface WalletElement {
  id: string;
  tag: string;
  classes: string[];
  selector: string;
  text: string;
  isVisible: boolean;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles: CSSStyleRecord;
}

export type CSSStyleRecord = Record<string, string>;

// Messaging protocol for Chrome Extension communication
export interface BridgeMessage {
  source: 'wcc-admin' | 'wallet-bridge';
  type: 'WALLET_REQ' | 'WALLET_RES';
  id: string; // UUID for matching request/response
  method?: string; // 'fetchDOM', 'getElementStyle', 'navigate', 'ping'
  params?: any;
  result?: any;
  error?: string | null;
}
