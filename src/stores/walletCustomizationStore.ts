
import { create } from 'zustand';
import { WalletLayout, WalletLayoutLayer } from '@/services/walletLayoutRecorder';

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
  isDragging: boolean;
  lastInteraction: number;
  energy: number; // 0-100, affects behavior
}

interface AiPetBehavior {
  followMouse: boolean;
  autonomousMovement: boolean;
  reactToClicks: boolean;
  emotionTransitions: boolean;
}

interface WalletCustomizationState {
  walletStyle: WalletStyle;
  uploadedImage: string | null;
  selectedWallet: 'phantom' | 'metamask' | 'solflare';
  isCustomizing: boolean;
  recordedLayout: WalletLayout | null;
  recordedLayers: WalletLayoutLayer[] | null;
  aiPet: AiPetState;
  aiPetBehavior: AiPetBehavior;
  containerBounds: DOMRect | null;
  
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  setUploadedImage: (image: string | null) => void;
  setSelectedWallet: (wallet: 'phantom' | 'metamask' | 'solflare') => void;
  setIsCustomizing: (isCustomizing: boolean) => void;
  setRecordedLayout: (layout: WalletLayout | null) => void;
  setRecordedLayers: (layers: WalletLayoutLayer[] | null) => void;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setAiPetZone: (zone: AiPetZone) => void;
  setAiPetPosition: (position: { x: number; y: number }) => void;
  setAiPetVisibility: (visible: boolean) => void;
  setAiPetDragging: (dragging: boolean) => void;
  setAiPetEnergy: (energy: number) => void;
  setAiPetBehavior: (behavior: Partial<AiPetBehavior>) => void;
  setContainerBounds: (bounds: DOMRect | null) => void;
  triggerAiPetInteraction: () => void;
  updateAiPetEnergy: () => void;
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
  position: { x: 0, y: 0 },
  isDragging: false,
  lastInteraction: Date.now(),
  energy: 80
};

const defaultAiPetBehavior: AiPetBehavior = {
  followMouse: true,
  autonomousMovement: true,
  reactToClicks: true,
  emotionTransitions: true
};

export const useWalletCustomizationStore = create<WalletCustomizationState>((set, get) => ({
  walletStyle: { ...defaultWalletStyle },
  uploadedImage: null,
  selectedWallet: 'phantom',
  isCustomizing: false,
  recordedLayout: null,
  recordedLayers: null,
  aiPet: { ...defaultAiPetState },
  aiPetBehavior: { ...defaultAiPetBehavior },
  containerBounds: null,
  
  setWalletStyle: (style) => set((state) => ({
    walletStyle: { ...state.walletStyle, ...style }
  })),
  
  setUploadedImage: (image) => set({ uploadedImage: image }),
  
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  
  setIsCustomizing: (isCustomizing) => set({ isCustomizing }),
  
  setRecordedLayout: (layout) => set({ 
    recordedLayout: layout,
    recordedLayers: layout?.layers || null
  }),

  setRecordedLayers: (layers) => set({ recordedLayers: layers }),

  setAiPetEmotion: (emotion) => set((state) => ({
    aiPet: { ...state.aiPet, emotion, lastInteraction: Date.now() }
  })),

  setAiPetZone: (zone) => set((state) => ({
    aiPet: { ...state.aiPet, zone, lastInteraction: Date.now() }
  })),

  setAiPetPosition: (position) => set((state) => ({
    aiPet: { ...state.aiPet, position }
  })),

  setAiPetVisibility: (visible) => set((state) => ({
    aiPet: { ...state.aiPet, isVisible: visible }
  })),

  setAiPetDragging: (dragging) => set((state) => ({
    aiPet: { ...state.aiPet, isDragging: dragging }
  })),

  setAiPetEnergy: (energy) => set((state) => ({
    aiPet: { ...state.aiPet, energy: Math.max(0, Math.min(100, energy)) }
  })),

  setAiPetBehavior: (behavior) => set((state) => ({
    aiPetBehavior: { ...state.aiPetBehavior, ...behavior }
  })),

  setContainerBounds: (bounds) => set({ containerBounds: bounds }),

  triggerAiPetInteraction: () => set((state) => ({
    aiPet: { 
      ...state.aiPet, 
      lastInteraction: Date.now(),
      energy: Math.min(100, state.aiPet.energy + 10)
    }
  })),

  updateAiPetEnergy: () => set((state) => {
    const timeSinceInteraction = Date.now() - state.aiPet.lastInteraction;
    const energyDecay = Math.floor(timeSinceInteraction / 60000); // 1 energy per minute
    const newEnergy = Math.max(0, state.aiPet.energy - energyDecay);
    
    // Auto emotion change based on energy
    let newEmotion = state.aiPet.emotion;
    if (newEnergy < 20) newEmotion = 'sleepy';
    else if (newEnergy > 80) newEmotion = 'excited';
    else if (newEnergy > 60) newEmotion = 'happy';
    else newEmotion = 'idle';
    
    return {
      aiPet: { ...state.aiPet, energy: newEnergy, emotion: newEmotion }
    };
  }),
  
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
        emotion: 'excited',
        energy: 100,
        lastInteraction: Date.now()
      }
    }));
    
    setTimeout(() => set((state) => ({ 
      isCustomizing: false,
      aiPet: {
        ...state.aiPet,
        emotion: 'happy'
      }
    })), 1000);

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
    recordedLayers: null,
    aiPet: { ...defaultAiPetState },
    aiPetBehavior: { ...defaultAiPetBehavior },
    containerBounds: null
  })
}));
