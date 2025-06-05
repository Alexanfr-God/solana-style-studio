
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateStyle } from '@/services/apiService';
import type { StyleBlueprint } from '@/services/styleBlueprintService';
import { blueprintToWalletStyles } from '@/services/styleBlueprintService';

export type LayerType = 'login' | 'wallet';
export type WalletLayer = 'home' | 'apps' | 'swap' | 'history' | 'search' | 'send' | 'receive' | 'buy' | 'login';
export type AiPetEmotion = 'idle' | 'happy' | 'excited' | 'sleepy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';
export type AiPetBodyType = 'phantom' | 'lottie';

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
  // Additional properties expected by components
  primaryColor?: string;
  font?: string;
  image?: string;
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

interface AiPetState {
  isVisible: boolean;
  emotion: AiPetEmotion;
  zone: AiPetZone;
  bodyType: AiPetBodyType;
  energy: number;
}

interface Account {
  id: string;
  name: string;
  address: string;
  balance: string;
  avatar?: string;
}

interface WalletCustomizationStore {
  loginStyle: WalletStyle;
  walletStyle: WalletStyle;
  activeLayer: LayerType;
  prompt: string;
  uploadedImage: string | null;
  isGenerating: boolean;
  isCustomizing: boolean;
  editorMode: 'create-style' | 'fine-tune' | 'decorate';
  components: ComponentStyles;
  
  // Wallet and Layer Management
  selectedWallet: 'phantom' | 'metamask';
  currentLayer: WalletLayer;
  setSelectedWallet: (wallet: 'phantom' | 'metamask') => void;
  setCurrentLayer: (layer: WalletLayer) => void;
  
  // AI Pet State
  aiPet: AiPetState;
  containerBounds: DOMRect | null;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setAiPetZone: (zone: AiPetZone) => void;
  setAiPetBodyType: (bodyType: AiPetBodyType) => void;
  setContainerBounds: (bounds: DOMRect | null) => void;
  triggerAiPetInteraction: () => void;
  updateAiPetEnergy: () => void;
  onAiPetHover: () => void;
  onAiPetClick: () => void;
  onAiPetDoubleClick: () => void;
  setTemporaryEmotion: (emotion: AiPetEmotion, duration: number) => void;
  
  // Account Management
  accounts: Account[];
  activeAccountId: string;
  showAccountSidebar: boolean;
  showAccountDropdown: boolean;
  setActiveAccount: (accountId: string) => void;
  setShowAccountSidebar: (show: boolean) => void;
  setShowAccountDropdown: (show: boolean) => void;
  
  // Style Management
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
  unlockWallet: () => void;
  resetWallet: () => void;
  
  // Component Styling
  getStyleForComponent: (component: string) => any;
  
  // Customization Methods
  customizeWallet: () => void;
  onCustomizationStart: () => void;
  
  // StyleBlueprint Integration
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
  styleNotes: 'default login style',
  primaryColor: '#9945FF',
  font: 'Inter, sans-serif'
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
  styleNotes: 'default wallet style',
  primaryColor: '#9945FF',
  font: 'Inter, sans-serif'
};

const defaultAccounts: Account[] = [
  {
    id: 'account1',
    name: 'Main Account',
    address: '7Z8...K9L',
    balance: '2.45 SOL',
    avatar: undefined
  },
  {
    id: 'account2', 
    name: 'Trading Account',
    address: '9M3...X2Y',
    balance: '0.12 SOL',
    avatar: undefined
  }
];

export const useWalletCustomizationStore = create<WalletCustomizationStore>()(
  persist(
    (set, get) => ({
      loginStyle: defaultLoginStyle,
      walletStyle: defaultWalletStyle,
      activeLayer: 'wallet',
      prompt: '',
      uploadedImage: null,
      isGenerating: false,
      isCustomizing: false,
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
      
      // Wallet and Layer Management
      selectedWallet: 'phantom',
      currentLayer: 'home',
      setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
      setCurrentLayer: (layer) => set({ currentLayer: layer }),
      
      // AI Pet State
      aiPet: {
        isVisible: true,
        emotion: 'idle',
        zone: 'outside',
        bodyType: 'phantom',
        energy: 100
      },
      containerBounds: null,
      setAiPetEmotion: (emotion) => set((state) => ({ aiPet: { ...state.aiPet, emotion } })),
      setAiPetZone: (zone) => set((state) => ({ aiPet: { ...state.aiPet, zone } })),
      setAiPetBodyType: (bodyType) => set((state) => ({ aiPet: { ...state.aiPet, bodyType } })),
      setContainerBounds: (bounds) => set({ containerBounds: bounds }),
      triggerAiPetInteraction: () => {
        const state = get();
        if (state.aiPet.emotion !== 'excited') {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: 'happy' } }));
          setTimeout(() => {
            set((state) => ({ aiPet: { ...state.aiPet, emotion: 'idle' } }));
          }, 2000);
        }
      },
      updateAiPetEnergy: () => {
        set((state) => ({
          aiPet: { 
            ...state.aiPet, 
            energy: Math.max(0, Math.min(100, state.aiPet.energy - 1))
          }
        }));
      },
      onAiPetHover: () => {
        set((state) => ({ aiPet: { ...state.aiPet, emotion: 'suspicious' } }));
      },
      onAiPetClick: () => {
        set((state) => ({ aiPet: { ...state.aiPet, emotion: 'wink' } }));
        setTimeout(() => {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: 'idle' } }));
        }, 1500);
      },
      onAiPetDoubleClick: () => {
        const state = get();
        const newZone = state.aiPet.zone === 'inside' ? 'outside' : 'inside';
        set((state) => ({ 
          aiPet: { ...state.aiPet, zone: newZone, emotion: 'excited' }
        }));
        setTimeout(() => {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: 'idle' } }));
        }, 2000);
      },
      setTemporaryEmotion: (emotion, duration) => {
        const currentEmotion = get().aiPet.emotion;
        set((state) => ({ aiPet: { ...state.aiPet, emotion } }));
        setTimeout(() => {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: currentEmotion } }));
        }, duration);
      },
      
      // Account Management
      accounts: defaultAccounts,
      activeAccountId: 'account1',
      showAccountSidebar: false,
      showAccountDropdown: false,
      setActiveAccount: (accountId) => set({ activeAccountId: accountId }),
      setShowAccountSidebar: (show) => set({ showAccountSidebar: show }),
      setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),
      
      // Style Management
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
      setWalletStyle: (style: WalletStyle) => {
        set({ 
          walletStyle: { 
            ...style, 
            primaryColor: style.accentColor || style.primaryColor,
            font: style.fontFamily || style.font 
          } 
        });
      },
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
          currentLayer: 'login',
          walletStyle: {
            ...get().walletStyle,
            styleNotes: 'Locked. Unlock in settings.',
          },
        });
      },
      unlockWallet: () => {
        set({ currentLayer: 'home' });
      },
      resetWallet: () => {
        set({
          loginStyle: defaultLoginStyle,
          walletStyle: defaultWalletStyle,
          currentLayer: 'home',
          selectedWallet: 'phantom',
          aiPet: {
            isVisible: true,
            emotion: 'idle',
            zone: 'outside',
            bodyType: 'phantom',
            energy: 100
          }
        });
      },
      
      // Component Styling
      getStyleForComponent: (component: string) => {
        const state = get();
        const baseStyles = {
          global: {
            backgroundColor: state.walletStyle.backgroundColor,
            textColor: state.walletStyle.textColor,
            fontFamily: state.walletStyle.fontFamily
          },
          header: state.components.header,
          buttons: state.components.buttons,
          inputs: state.components.inputs,
          navigation: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: state.walletStyle.fontFamily
          },
          overlays: {
            backgroundColor: 'rgba(24, 24, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          },
          containers: {
            backgroundColor: state.walletStyle.backgroundColor,
            borderRadius: state.walletStyle.borderRadius,
            boxShadow: state.walletStyle.boxShadow
          }
        };
        
        return baseStyles[component as keyof typeof baseStyles] || baseStyles.global;
      },
      
      // Customization Methods
      customizeWallet: () => {
        set({ isCustomizing: true });
        setTimeout(() => {
          set({ isCustomizing: false });
        }, 3000);
      },
      onCustomizationStart: () => {
        set({ isCustomizing: true });
      },
      
      // StyleBlueprint Integration
      currentBlueprint: null,
      
      applyStyleFromBlueprint: (blueprint: StyleBlueprint) => {
        const walletStyles = blueprintToWalletStyles(blueprint);
        
        const updatedStyle = {
          backgroundColor: walletStyles.backgroundColor,
          backgroundImage: walletStyles.backgroundImage,
          accentColor: walletStyles.accentColor,
          textColor: walletStyles.textColor,
          buttonColor: walletStyles.buttonColor,
          buttonTextColor: walletStyles.buttonTextColor,
          borderRadius: walletStyles.borderRadius,
          fontFamily: walletStyles.fontFamily,
          boxShadow: walletStyles.boxShadow,
          styleNotes: walletStyles.styleNotes,
          primaryColor: walletStyles.accentColor,
          font: walletStyles.fontFamily
        };
        
        set({
          currentBlueprint: blueprint,
          walletStyle: updatedStyle,
          
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
