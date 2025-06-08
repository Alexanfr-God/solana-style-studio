
export interface WalletStructure {
  metadata: WalletMetadata;
  screens: WalletScreen[];
  elements: WalletElement[];
}

export interface WalletMetadata {
  walletType: string;
  version: string;
  totalScreens: number;
  totalCustomizableElements: number;
  lastUpdated: string;
}

export interface WalletScreen {
  screenId: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  elements: { [key: string]: WalletElement };
}

export interface WalletElement {
  elementType: string;
  currentStyles: { [key: string]: any };
  customizable: boolean;
  aiInstructions?: {
    styleAgent?: string;
    fontAgent?: string;
    priority?: string;
  };
}
