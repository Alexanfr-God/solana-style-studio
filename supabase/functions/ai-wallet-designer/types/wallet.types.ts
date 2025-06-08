
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

export interface WalletAnalysis {
  analysisId: string;
  confidence: number;
  processingTime: number;
  result: {
    elementAnalysis: { [elementId: string]: any };
    globalInsights: {
      walletType: string;
      designPatterns: string[];
      criticalElements: string[];
      customizabilityScore?: number;
    };
    recommendations?: Array<{
      type: string;
      message: string;
      elements: string[];
    }>;
  };
}

export interface WalletCustomizationRequest {
  walletType: string;
  imageUrl?: string;
  customPrompt?: string;
  targetElements?: string[];
  preserveLayout?: boolean;
}

export interface WalletTheme {
  themeId: string;
  name: string;
  description?: string;
  cssVariables: { [key: string]: string };
  elementStyles: { [elementId: string]: any };
  metadata: {
    createdAt: string;
    walletType: string;
    version: string;
  };
}
