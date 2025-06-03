
import { supabase } from '@/integrations/supabase/client';

export interface DetailedImageAnalysis {
  style: string;
  mood: string;
  colors: {
    dominant: string[];
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    primary: string;
    secondary: string;
    weight: string;
    size: string;
  };
  lighting: string;
  contrast: string;
  textures: string[];
  patterns: string[];
  composition: {
    balance: string;
    focusArea: string;
    complexity: string;
  };
  designElements: {
    hasGradients: boolean;
    hasPatterns: boolean;
    hasTextures: boolean;
    hasGeometry: boolean;
    hasShadows: boolean;
  };
  aiPetCharacteristics: {
    recommendedEmotion: string;
    recommendedZone: 'inside' | 'outside';
    recommendedBodyType: 'phantom' | 'lottie';
    animationStyle: string;
  };
}

export interface WalletComponentStyles {
  // Header Components
  headerContainer: ComponentStyle;
  walletTitle: ComponentStyle;
  helpIcon: ComponentStyle;
  
  // Login Layer
  loginContainer: ComponentStyle;
  passwordTitle: ComponentStyle;
  passwordInput: ComponentStyle;
  eyeToggle: ComponentStyle;
  forgotPasswordLink: ComponentStyle;
  unlockButton: ComponentStyle;
  
  // Home Layer  
  homeContainer: ComponentStyle;
  balanceSection: ComponentStyle;
  totalBalanceLabel: ComponentStyle;
  balanceAmount: ComponentStyle;
  balanceUSD: ComponentStyle;
  
  // Action Buttons
  actionButtonsContainer: ComponentStyle;
  sendButton: ComponentStyle;
  receiveButton: ComponentStyle;
  swapButton: ComponentStyle;
  buyButton: ComponentStyle;
  
  // Transaction History
  transactionContainer: ComponentStyle;
  transactionTitle: ComponentStyle;
  transactionItem: ComponentStyle;
  transactionIcon: ComponentStyle;
  transactionText: ComponentStyle;
  transactionAmount: ComponentStyle;
  
  // Navigation
  bottomNavigation: ComponentStyle;
  navButton: ComponentStyle;
  navIcon: ComponentStyle;
  navLabel: ComponentStyle;
  
  // Overlays and Modals
  accountSidebar: ComponentStyle;
  receiveModal: ComponentStyle;
  sendModal: ComponentStyle;
  
  // Input Components
  searchInput: ComponentStyle;
  amountInput: ComponentStyle;
  addressInput: ComponentStyle;
  
  // AI Pet
  aiPet: {
    zone: 'inside' | 'outside';
    bodyType: 'phantom' | 'lottie';
    emotion: string;
    color: string;
    size: number;
    animationSpeed: string;
  };
  
  // Global Styles
  globalContainer: ComponentStyle;
  backgroundOverlay: ComponentStyle;
}

export interface ComponentStyle {
  backgroundColor?: string;
  gradient?: string;
  textColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  border?: string;
  backdropFilter?: string;
  transition?: string;
  opacity?: string;
  padding?: string;
  margin?: string;
  animation?: string;
}

export interface WalletImageAnalysisResult {
  success: boolean;
  analysis: DetailedImageAnalysis;
  walletStyles: WalletComponentStyles;
  savedStyleId?: string;
  error?: string;
}

export const analyzeWalletImage = async (imageUrl: string): Promise<WalletImageAnalysisResult> => {
  try {
    console.log('Starting wallet image analysis for:', imageUrl);
    
    const { data, error } = await supabase.functions.invoke('analyze-wallet-image', {
      body: { imageUrl }
    });

    if (error) {
      console.error('Analysis error:', error);
      throw new Error(error.message);
    }

    console.log('Analysis completed successfully:', data);
    return data as WalletImageAnalysisResult;
    
  } catch (error) {
    console.error('Wallet image analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      analysis: {} as DetailedImageAnalysis,
      walletStyles: {} as WalletComponentStyles
    };
  }
};

export const applyWalletStyles = (
  styles: WalletComponentStyles,
  targetElement: HTMLElement,
  componentType: keyof WalletComponentStyles
) => {
  const componentStyle = styles[componentType];
  
  if (!componentStyle || typeof componentStyle !== 'object' || 'zone' in componentStyle) {
    return; // Skip AI Pet and invalid styles
  }
  
  Object.entries(componentStyle).forEach(([property, value]) => {
    if (value && typeof value === 'string') {
      // Convert camelCase to kebab-case for CSS properties
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      targetElement.style.setProperty(cssProperty, value);
    }
  });
};

export const saveWalletStyleToLibrary = async (
  styleName: string,
  styles: WalletComponentStyles,
  analysis: DetailedImageAnalysis,
  imageUrl: string
) => {
  try {
    const { data, error } = await supabase
      .from('style_library')
      .insert({
        style_name: styleName,
        style_data: styles as any,
        ai_analysis: analysis as any,
        inspiration_image_url: imageUrl,
        created_by: 'user'
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving wallet style:', error);
    throw error;
  }
};
