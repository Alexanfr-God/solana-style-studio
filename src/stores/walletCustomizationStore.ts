import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateStyle } from '@/services/apiService';
import type { StyleBlueprint } from '@/services/styleBlueprintService';
import { blueprintToWalletStyles } from '@/services/styleBlueprintService';

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
  boxShadow: string;
  styleNotes?: string;
}

interface ComponentStyles {
  header: {
    backgroundColor: string;
    color: string;
    fontFamily: string;
  };
  buttons: {
    backgroundColor: string;
    color: string;
    borderRadius: string;
    boxShadow: string;
  };
  inputs: {
    backgroundColor: string;
    borderColor: string;
    focusColor: string;
  };
}

interface WalletCustomizationStore {
  loginStyle: WalletStyle;
  walletStyle: WalletStyle;
  activeLayer: LayerType;
  prompt: string;
  uploadedImage: string | null;
  isGenerating: boolean;
  editorMode: 'create-style' | 'fine-tune' | 'decorate';
  components: ComponentStyles;
  
  setBackgroundColor: (color: string) => void;
  setLoginStyle: (style: WalletStyle) => void;
  setWalletStyle: (style: WalletStyle) => void;
  setStyleForLayer: (layer: LayerType, style: WalletStyle) => void;
  setActiveLayer: (layer: LayerType) => void;
  setPrompt: (prompt: string) => void;
  setUploadedImage: (image: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setEditorMode: (mode: 'create-style' | 'fine-tune' | 'decorate') => void;
  resetStyles: () => void;
  lockWallet: () => void;
  
  currentBlueprint: StyleBlueprint | null;
  applyStyleFromBlueprint: (blueprint: StyleBlueprint) => void;
}

const defaultLoginStyle: WalletStyle = {
  backgroundColor: '#131313',
  accentColor: '#9945FF',
  textColor: '#FFFFFF',
  buttonColor: '#9945FF',
  buttonTextColor: '#000000',
  borderRadius: '100px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  styleNotes: 'default login style'
};

const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#131313',
  accentColor: '#9945FF',
  textColor: '#FFFFFF',
  buttonColor: 'rgba(40, 40, 40, 0.8)',
  buttonTextColor: '#9945FF',
  borderRadius: '16px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  styleNotes: 'default wallet style'
};

export const useWalletCustomizationStore = create<WalletCustomizationStore>()(
  persist(
    (set, get) => ({
      loginStyle: defaultLoginStyle,
      walletStyle: defaultWalletStyle,
      activeLayer: 'wallet',
      prompt: '',
      uploadedImage: null,
      isGenerating: false,
      editorMode: 'create-style',
      components: {
        header: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
        },
        buttons: {
          backgroundColor: '#9945FF',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        },
        inputs: {
          backgroundColor: '#2b2b2b',
          borderColor: '#444444',
          focusColor: '#9945FF',
        },
      },
      
      setBackgroundColor: (color: string) => {
        if (get().activeLayer === 'login') {
          set((state) => ({
            loginStyle: { ...state.loginStyle, backgroundColor: color },
          }));
        } else {
          set((state) => ({
            walletStyle: { ...state.walletStyle, backgroundColor: color },
          }));
        }
      },
      setLoginStyle: (style: WalletStyle) => set({ loginStyle: style }),
      setWalletStyle: (style: WalletStyle) => set({ walletStyle: style }),
      setStyleForLayer: (layer: LayerType, style: WalletStyle) => {
        if (layer === 'login') {
          set({ loginStyle: style });
        } else {
          set({ walletStyle: style });
        }
      },
      setActiveLayer: (layer: LayerType) => set({ activeLayer: layer }),
      setPrompt: (prompt: string) => set({ prompt }),
      setUploadedImage: (image: string | null) => set({ uploadedImage: image }),
      setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
      setEditorMode: (mode: 'create-style' | 'fine-tune' | 'decorate') => set({ editorMode: mode }),
      resetStyles: () => {
        set({ 
          loginStyle: defaultLoginStyle, 
          walletStyle: defaultWalletStyle,
          components: {
            header: {
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
            },
            buttons: {
              backgroundColor: '#9945FF',
              color: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            },
            inputs: {
              backgroundColor: '#2b2b2b',
              borderColor: '#444444',
              focusColor: '#9945FF',
            },
          }
        });
      },
      lockWallet: () => {
        set({
          walletStyle: {
            ...get().walletStyle,
            styleNotes: 'Locked. Unlock in settings.',
          },
        });
      },
      
      currentBlueprint: null,
      
      applyStyleFromBlueprint: (blueprint: StyleBlueprint) => {
        const walletStyles = blueprintToWalletStyles(blueprint);
        
        set({
          currentBlueprint: blueprint,
          backgroundColor: walletStyles.backgroundColor,
          backgroundImage: walletStyles.backgroundImage,
          accentColor: walletStyles.accentColor,
          textColor: walletStyles.textColor,
          fontFamily: walletStyles.fontFamily,
          borderRadius: walletStyles.borderRadius,
          boxShadow: walletStyles.boxShadow,
          
          components: {
            ...get().components,
            header: {
              ...get().components.header,
              backgroundColor: blueprint.colorSystem.neutral,
              color: walletStyles.textColor,
              fontFamily: blueprint.typography.fontFamily,
            },
            buttons: {
              ...get().components.buttons,
              backgroundColor: blueprint.colorSystem.primary,
              color: walletStyles.buttonTextColor,
              borderRadius: walletStyles.borderRadius,
              boxShadow: blueprint.lighting.shadows,
            },
            inputs: {
              ...get().components.inputs,
              backgroundColor: blueprint.interactionHints.loginBox.background,
              borderColor: blueprint.interactionHints.loginBox.border,
              focusColor: blueprint.interactionHints.loginBox.focusState,
            }
          }
        });
        
        console.log('Applied StyleBlueprint to wallet:', {
          title: blueprint.meta.title,
          theme: blueprint.meta.theme,
          confidence: blueprint.meta.confidenceScore
        });
      },
    }),
    {
      name: 'wallet-customization-storage',
    }
  )
);
