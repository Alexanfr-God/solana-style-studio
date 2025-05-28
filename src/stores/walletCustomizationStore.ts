
import { create } from 'zustand';
import { WalletLayout } from '@/services/walletLayoutRecorder';

export interface WalletStyle {
  backgroundColor: string;
  font: string;
  primaryColor: string;
  image?: string;
}

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy';
export type AiPetZone = 'inside' | 'outside';

interface AiPetState {
  emotion: AiPetEmotion;
  zone: AiPetZone;
  isVisible: boolean;
  position: { x: number; y: number };
}

interface WalletCustomizationState {
  walletStyle: WalletStyle;
  uploadedImage: string | null;
  selectedWallet: 'phantom' | 'metamask' | 'solflare';
  isCustomizing: boolean;
  recordedLayout: WalletLayout | null;
  aiPet: AiPetState;
  
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  setUploadedImage: (image: string | null) => void;
  setSelectedWallet: (wallet: 'phantom' | 'metamask' | 'solflare') => void;
  setIsCustomizing: (isCustomizing: boolean) => void;
  setRecordedLayout: (layout: WalletLayout | null) => void;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setAiPetZone: (zone: AiPetZone) => void;
  setAiPetPosition: (position: { x: number; y: number }) => void;
  setAiPetVisibility: (visible: boolean) => void;
  customizeWallet: () => void;
  resetWallet: () => void;
}

const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#1a1a1a',
  font: 'Inter',
  primaryColor: '#8B5CF6',
  image: undefined
};

const defaultAiPetState: AiPetState = {
  emotion: 'idle',
  zone: 'inside',
  isVisible: true,
  position: { x: 0, y: 0 }
};

export const useWalletCustomizationStore = create<WalletCustomizationState>((set, get) => ({
  walletStyle: { ...defaultWalletStyle },
  uploadedImage: null,
  selectedWallet: 'phantom',
  isCustomizing: false,
  recordedLayout: null,
  aiPet: { ...defaultAiPetState },
  
  setWalletStyle: (style) => set((state) => ({
    walletStyle: { ...state.walletStyle, ...style }
  })),
  
  setUploadedImage: (image) => set({ uploadedImage: image }),
  
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  
  setIsCustomizing: (isCustomizing) => set({ isCustomizing }),
  
  setRecordedLayout: (layout) => set({ recordedLayout: layout }),

  setAiPetEmotion: (emotion) => set((state) => ({
    aiPet: { ...state.aiPet, emotion }
  })),

  setAiPetZone: (zone) => set((state) => ({
    aiPet: { ...state.aiPet, zone }
  })),

  setAiPetPosition: (position) => set((state) => ({
    aiPet: { ...state.aiPet, position }
  })),

  setAiPetVisibility: (visible) => set((state) => ({
    aiPet: { ...state.aiPet, isVisible: visible }
  })),
  
  customizeWallet: () => {
    const { uploadedImage } = get();
    set((state) => ({
      walletStyle: {
        ...state.walletStyle,
        backgroundColor: '#e93e3e',
        image: uploadedImage || undefined
      },
      isCustomizing: true,
      aiPet: {
        ...state.aiPet,
        emotion: 'excited' // Pet gets excited when customizing!
      }
    }));
    
    // Reset customizing state and pet emotion after animation
    setTimeout(() => set((state) => ({ 
      isCustomizing: false,
      aiPet: {
        ...state.aiPet,
        emotion: 'happy' // Happy after successful customization
      }
    })), 1000);

    // Return to idle after a while
    setTimeout(() => set((state) => ({
      aiPet: {
        ...state.aiPet,
        emotion: 'idle'
      }
    })), 3000);
  },
  
  resetWallet: () => set({
    walletStyle: { ...defaultWalletStyle },
    uploadedImage: null,
    isCustomizing: false,
    recordedLayout: null,
    aiPet: { ...defaultAiPetState }
  })
}));
