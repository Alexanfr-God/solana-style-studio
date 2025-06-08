
export interface AIAnalysisResult {
  analysisId: string;
  confidence: number;
  processingTime: number;
  result: any;
}

export interface ImageAnalysis extends AIAnalysisResult {
  colorPalette: {
    dominant: string[];
    accent: string;
    neutral: string;
  };
  moodProfile: {
    primary: string;
    energy: 'high' | 'medium' | 'low';
    formality: 'formal' | 'casual' | 'mixed';
  };
}

export interface WalletAnalysis extends AIAnalysisResult {
  elementAnalysis: { [elementId: string]: ElementAnalysis };
  globalInsights: {
    walletType: string;
    designPatterns: string[];
    criticalElements: string[];
  };
}

export interface ElementAnalysis {
  semanticType: string;
  functionalPurpose: string;
  importanceLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  customizationPotential: {
    colors: boolean;
    fonts: boolean;
    sizes: boolean;
    effects: boolean;
  };
}

export interface CustomizationResult {
  success: boolean;
  themeId: string;
  generatedCSS: {
    variables: { [key: string]: string };
    elements: { [elementId: string]: any };
  };
  applicationResult?: any;
}

export interface AIRequest {
  type: 'wallet_analysis' | 'image_analysis' | 'style_generation' | 'full_customization';
  walletType: string;
  imageUrl?: string;
  customPrompt?: string;
  walletAnalysis?: WalletAnalysis;
  imageAnalysis?: ImageAnalysis;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  requestId: string;
}
