import { create } from 'zustand';
import { defaultLoginStyle, defaultWalletStyle } from '../constants/defaultWalletStyles';

// Diagnostic marker for store instance tracking  
export const CUST_STORE_INSTANCE_ID = 'custStore#C91K';

export type LayerType = 'login' | 'wallet';
export type EditorModeType = 'create-style' | 'fine-tune' | 'decorate';

export interface WalletStyle {
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  boxShadow?: string;
  styleNotes?: string;
  // Add missing properties for compatibility
  primaryColor?: string;
  font?: string;
  gradient?: string;
}

export interface WalletAnalysis {
  uiStructure: {
    dimensions: {
      width: number;
      height: number;
      aspectRatio: string;
    };
    layout: {
      type: 'login' | 'wallet';
      primaryElements: string[];
      interactiveElements: string[];
      visualHierarchy: string[];
    };
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
      gradients?: string[];
    };
    typography: {
      fontFamily: string;
      primaryTextColor: string;
      secondaryTextColor: string;
      textSizes: string[];
    };
    interactivity: {
      buttons: Array<{
        type: string;
        position: string;
        color: string;
        textColor: string;
        functionality: string;
      }>;
      inputs: Array<{
        type: string;
        placeholder: string;
        position: string;
        styling: string;
      }>;
      animations: string[];
    };
    safeZone: {
      x: number;
      y: number;
      width: number;
      height: number;
      criticalElements: string[];
    };
  };
  functionalContext: {
    purpose: string;
    userFlow: string[];
    criticalFeatures: string[];
    designPhilosophy: string;
  };
  generationContext: {
    promptEnhancement: string;
    characterInteractionGuidelines: string[];
    preservationRules: string[];
    styleAdaptation: string;
  };
}

interface CustomizationState {
  activeLayer: LayerType;
  loginStyle: WalletStyle;
  walletStyle: WalletStyle;
  isGenerating: boolean;
  prompt: string;
  uploadedImage: string | null;
  stylingTip: string;
  editorMode: EditorModeType;
  walletAnalysis: WalletAnalysis | null;
  isAnalyzing: boolean;
  analysisTimestamp: string | null;
  isDecorateGenerationDisabled: boolean;
  
  setActiveLayer: (layer: LayerType) => void;
  setStyleForLayer: (layer: LayerType, style: WalletStyle) => void;
  resetLayer: (layer: LayerType) => void;
  setPrompt: (prompt: string) => void;
  setUploadedImage: (imageUrl: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setStylingTip: (tip: string) => void;
  setEditorMode: (mode: EditorModeType) => void;
  setWalletAnalysis: (analysis: WalletAnalysis | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  analyzeCurrentWallet: () => Promise<void>;
  setIsDecorateGenerationDisabled: (disabled: boolean) => void;
}

const stylingTips = [
  "Try 'neon cyberpunk with blue accents' for a futuristic look!",
  "For a clean professional look, try 'minimal white with subtle gradients'",
  "Want something fun? Try 'playful with bright colors and rounded corners'",
  "For luxury feel, try 'dark mode with gold accents and glass effect'",
  "Nature inspired? Try 'forest theme with earthy tones and organic shapes'",
  "Try 'cartoon pepe wallet' for a meme-inspired design",
  "For luxury theme try 'gold dubai luxury wallet'",
  "For cosmic feel try 'space galaxy cosmic wallet'"
];

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  activeLayer: 'login',
  loginStyle: { ...defaultLoginStyle },
  walletStyle: { ...defaultWalletStyle },
  isGenerating: false,
  prompt: '',
  uploadedImage: null,
  stylingTip: stylingTips[Math.floor(Math.random() * stylingTips.length)],
  editorMode: 'create-style',
  walletAnalysis: null,
  isAnalyzing: false,
  analysisTimestamp: null,
  isDecorateGenerationDisabled: true,
  
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  
  setStyleForLayer: (layer, style) => set((state) => {
    console.log(`[STORE:cust apply] ${layer} style instanceId:`, CUST_STORE_INSTANCE_ID, Object.keys(style));
    console.log('[STORE:cust apply]', { hasLogin: layer === 'login' ? 'updating' : !!state.loginStyle, hasWallet: layer === 'wallet' ? 'updating' : !!state.walletStyle });
    
    const newState = layer === 'login' 
      ? { loginStyle: { ...state.loginStyle, ...style }, isGenerating: false } 
      : { walletStyle: { ...state.walletStyle, ...style }, isGenerating: false };
    
    console.log(`[STORE:cust] ✅ ${layer} style updated`);
    
    return {
      ...newState,
      // Сбросить анализ при изменении стиля
      walletAnalysis: null,
      analysisTimestamp: null
    };
  }),
  
  resetLayer: (layer) => set((state) => ({
    ...(layer === 'login' 
      ? { loginStyle: { ...defaultLoginStyle }, isGenerating: false } 
      : { walletStyle: { ...defaultWalletStyle }, isGenerating: false }),
    // Сбросить анализ при сбросе стиля
    walletAnalysis: null,
    analysisTimestamp: null
  })),
  
  setPrompt: (prompt) => set({ prompt }),
  
  setUploadedImage: (imageUrl) => set({ uploadedImage: imageUrl }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  setStylingTip: (tip) => set({ stylingTip: tip }),
  
  setEditorMode: (mode) => set({ editorMode: mode }),

  setWalletAnalysis: (analysis) => set({ walletAnalysis: analysis }),

  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

  setIsDecorateGenerationDisabled: (disabled) => set({ isDecorateGenerationDisabled: disabled }),

  analyzeCurrentWallet: async () => {
    const state = get();
    
    try {
      set({ isAnalyzing: true });
      console.log('🔍 Starting wallet analysis...');
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('analyze-wallet-structure', {
        body: {
          loginStyle: state.loginStyle,
          walletStyle: state.walletStyle,
          activeLayer: state.activeLayer
        }
      });
      
      if (error) {
        throw new Error(`Analysis failed: ${error.message}`);
      }
      
      if (!data || !data.analysis) {
        throw new Error("Analysis failed - no data returned");
      }
      
      console.log('✅ Wallet analysis completed:', data.analysis);
      
      set({ 
        walletAnalysis: data.analysis,
        analysisTimestamp: new Date().toISOString(),
        isAnalyzing: false 
      });
      
    } catch (error) {
      console.error('💥 Wallet analysis error:', error);
      set({ isAnalyzing: false });
      throw error;
    }
  }
}));
