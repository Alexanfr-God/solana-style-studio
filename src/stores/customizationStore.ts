
import { create } from 'zustand';

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
}

interface CustomizationState {
  activeLayer: LayerType;
  loginStyle: WalletStyle;
  walletStyle: WalletStyle;
  isGenerating: boolean;
  prompt: string;
  uploadedImage: string | null;
  
  setActiveLayer: (layer: LayerType) => void;
  setStyleForLayer: (layer: LayerType, style: WalletStyle) => void;
  resetLayer: (layer: LayerType) => void;
  setPrompt: (prompt: string) => void;
  setUploadedImage: (imageUrl: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

// Default styles
const defaultLoginStyle: WalletStyle = {
  backgroundColor: '#1E1E2E',
  accentColor: '#9945FF',
  textColor: '#FFFFFF',
  buttonColor: '#9945FF',
  buttonTextColor: '#FFFFFF',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
};

const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#1E1E2E',
  accentColor: '#14F195',
  textColor: '#FFFFFF',
  buttonColor: '#14F195',
  buttonTextColor: '#1E1E2E',
  borderRadius: '16px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
};

export const useCustomizationStore = create<CustomizationState>((set) => ({
  activeLayer: 'login',
  loginStyle: { ...defaultLoginStyle },
  walletStyle: { ...defaultWalletStyle },
  isGenerating: false,
  prompt: '',
  uploadedImage: null,
  
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  
  setStyleForLayer: (layer, style) => set((state) => ({
    ...(layer === 'login' 
      ? { loginStyle: { ...state.loginStyle, ...style } } 
      : { walletStyle: { ...state.walletStyle, ...style } })
  })),
  
  resetLayer: (layer) => set((state) => ({
    ...(layer === 'login' 
      ? { loginStyle: { ...defaultLoginStyle } } 
      : { walletStyle: { ...defaultWalletStyle } })
  })),
  
  setPrompt: (prompt) => set({ prompt }),
  
  setUploadedImage: (imageUrl) => set({ uploadedImage: imageUrl }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating })
}));
