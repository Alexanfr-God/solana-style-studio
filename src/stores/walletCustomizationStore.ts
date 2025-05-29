import { create } from 'zustand';
import { WalletLayout, WalletLayoutLayer } from '@/services/walletLayoutRecorder';

export interface WalletStyle {
  backgroundColor: string;
  font: string;
  primaryColor: string;
  image?: string;
}

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';
export type AiPetBodyType = 'phantom' | 'lottie';

interface AiPetState {
  emotion: AiPetEmotion;
  zone: AiPetZone;
  bodyType: AiPetBodyType;
  isVisible: boolean;
  position: { x: number; y: number };
  isDragging: boolean;
  lastInteraction: number;
  energy: number;
  isHovered: boolean;
  emotionTimer: NodeJS.Timeout | null;
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
  setAiPetBodyType: (bodyType: AiPetBodyType) => void;
  setAiPetPosition: (position: { x: number; y: number }) => void;
  setAiPetVisibility: (visible: boolean) => void;
  setAiPetDragging: (dragging: boolean) => void;
  setAiPetEnergy: (energy: number) => void;
  setAiPetHovered: (hovered: boolean) => void;
  setAiPetBehavior: (behavior: Partial<AiPetBehavior>) => void;
  setContainerBounds: (bounds: DOMRect | null) => void;
  triggerAiPetInteraction: () => void;
  updateAiPetEnergy: () => void;
  setTemporaryEmotion: (emotion: AiPetEmotion, duration?: number) => void;
  onAiPetHover: () => void;
  onAiPetClick: () => void;
  onAiPetDoubleClick: () => void;
  onCustomizationStart: () => void;
  onCustomizationComplete: () => void;
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
  bodyType: 'phantom',
  isVisible: true,
  position: { x: 0, y: 0 },
  isDragging: false,
  lastInteraction: Date.now(),
  energy: 80,
  isHovered: false,
  emotionTimer: null
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

  setAiPetBodyType: (bodyType) => set((state) => ({
    aiPet: { ...state.aiPet, bodyType }
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

  setAiPetHovered: (hovered) => set((state) => ({
    aiPet: { ...state.aiPet, isHovered: hovered }
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
    const energyDecay = Math.floor(timeSinceInteraction / 60000);
    const newEnergy = Math.max(0, state.aiPet.energy - energyDecay);
    
    let newEmotion = state.aiPet.emotion;
    if (!state.aiPet.emotionTimer) {
      if (newEnergy < 20) newEmotion = 'sleepy';
      else if (newEnergy > 80) newEmotion = 'excited';
      else if (newEnergy > 60) newEmotion = 'happy';
      else newEmotion = 'idle';
    }
    
    return {
      aiPet: { ...state.aiPet, energy: newEnergy, emotion: newEmotion }
    };
  }),

  setTemporaryEmotion: (emotion, duration = 4000) => {
    const state = get();
    
    if (state.aiPet.emotionTimer) {
      clearTimeout(state.aiPet.emotionTimer);
    }

    set((state) => ({
      aiPet: { ...state.aiPet, emotion, lastInteraction: Date.now() }
    }));

    const timer = setTimeout(() => {
      set((state) => ({
        aiPet: { ...state.aiPet, emotion: 'idle', emotionTimer: null }
      }));
    }, duration);

    set((state) => ({
      aiPet: { ...state.aiPet, emotionTimer: timer }
    }));
  },

  onAiPetHover: () => {
    const { setTemporaryEmotion, setAiPetHovered } = get();
    setAiPetHovered(true);
    setTemporaryEmotion('suspicious', 2000);
  },

  onAiPetClick: () => {
    const { setTemporaryEmotion, triggerAiPetInteraction } = get();
    triggerAiPetInteraction();
    setTemporaryEmotion('wink', 3000);
  },

  onAiPetDoubleClick: () => {
    const state = get();
    const newZone = state.aiPet.zone === 'inside' ? 'outside' : 'inside';
    const newEmotion = newZone === 'outside' ? 'sleepy' : 'happy';
    
    set((prevState) => ({
      aiPet: { 
        ...prevState.aiPet, 
        zone: newZone,
        emotion: newEmotion,
        lastInteraction: Date.now()
      }
    }));

    get().setTemporaryEmotion(newEmotion, 4000);
  },

  onCustomizationStart: () => {
    const { setTemporaryEmotion } = get();
    setTemporaryEmotion('excited', 2000);
  },

  onCustomizationComplete: () => {
    const { setTemporaryEmotion } = get();
    setTemporaryEmotion('happy', 5000);
  },
  
  customizeWallet: () => {
    const { uploadedImage, onCustomizationStart, onCustomizationComplete } = get();
    
    onCustomizationStart();
    
    set((state) => ({
      walletStyle: {
        ...state.walletStyle,
        backgroundColor: '#e93e3e',
        image: uploadedImage || undefined
      },
      isCustomizing: true
    }));
    
    setTimeout(() => {
      set({ isCustomizing: false });
      onCustomizationComplete();
    }, 1000);
  },
  
  resetWallet: () => {
    const state = get();
    
    if (state.aiPet.emotionTimer) {
      clearTimeout(state.aiPet.emotionTimer);
    }

    set({
      walletStyle: { ...defaultWalletStyle },
      uploadedImage: null,
      isCustomizing: false,
      recordedLayout: null,
      recordedLayers: null,
      aiPet: { ...defaultAiPetState },
      aiPetBehavior: { ...defaultAiPetBehavior },
      containerBounds: null
    });
  }
}));
