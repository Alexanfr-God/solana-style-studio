
import { create } from 'zustand';
import { defaultLoginStyle, defaultWalletStyle } from '../constants/defaultWalletStyles';

export type LayerType = 'login' | 'wallet';

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
}

interface CustomizationState {
  activeLayer: LayerType;
  loginStyle: WalletStyle;
  walletStyle: WalletStyle;
  isGenerating: boolean;
  prompt: string;
  uploadedImage: string | null;
  stylingTip: string;
  
  setActiveLayer: (layer: LayerType) => void;
  setStyleForLayer: (layer: LayerType, style: WalletStyle) => void;
  resetLayer: (layer: LayerType) => void;
  setPrompt: (prompt: string) => void;
  setUploadedImage: (imageUrl: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setStylingTip: (tip: string) => void;
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

export const useCustomizationStore = create<CustomizationState>((set) => ({
  activeLayer: 'login',
  loginStyle: { ...defaultLoginStyle },
  walletStyle: { ...defaultWalletStyle },
  isGenerating: false,
  prompt: '',
  uploadedImage: null,
  stylingTip: stylingTips[Math.floor(Math.random() * stylingTips.length)],
  
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  
  setStyleForLayer: (layer, style) => set((state) => ({
    ...(layer === 'login' 
      ? { loginStyle: { ...state.loginStyle, ...style }, isGenerating: false } 
      : { walletStyle: { ...state.walletStyle, ...style }, isGenerating: false })
  })),
  
  resetLayer: (layer) => set((state) => ({
    ...(layer === 'login' 
      ? { loginStyle: { ...defaultLoginStyle }, isGenerating: false } 
      : { walletStyle: { ...defaultWalletStyle }, isGenerating: false })
  })),
  
  setPrompt: (prompt) => set({ prompt }),
  
  setUploadedImage: (imageUrl) => set({ uploadedImage: imageUrl }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  setStylingTip: (tip) => set({ stylingTip: tip })
}));
