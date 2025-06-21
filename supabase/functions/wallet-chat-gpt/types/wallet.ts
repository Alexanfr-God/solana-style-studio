
// Wallet types and interfaces
export interface WalletContext {
  walletType: string;
  activeLayer: string;
  currentStyle: {
    backgroundColor?: string;
    primaryColor?: string;
    font?: string;
  };
  availableElements: string[];
}

export interface WalletElement {
  name: string;
  type: string;
  customizable: boolean;
}
