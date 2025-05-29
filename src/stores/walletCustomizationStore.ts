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
export type WalletLayer = 'login' | 'home' | 'apps' | 'swap' | 'history' | 'search';

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

interface WalletAccount {
  id: string;
  name: string;
  address: string;
  network: string;
  isActive: boolean;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  icon: string;
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
  currentLayer: WalletLayer;
  accounts: WalletAccount[];
  activeAccountId: string;
  tokens: Token[];
  totalBalance: string;
  totalChange: string;
  totalChangePercent: string;
  isBalancePositive: boolean;
  showAccountDropdown: boolean;
  
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
  setCurrentLayer: (layer: WalletLayer) => void;
  setActiveAccount: (accountId: string) => void;
  setShowAccountDropdown: (show: boolean) => void;
  unlockWallet: () => void;
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

const mockAccounts: WalletAccount[] = [
  {
    id: 'account-1',
    name: 'Account 1',
    address: 'A8...5Gh3',
    network: 'Solana',
    isActive: false
  },
  {
    id: 'account-8',
    name: 'Account 8',
    address: 'B7...2Kx9',
    network: 'Solana',
    isActive: true
  },
  {
    id: 'account-eth',
    name: 'ETH Account',
    address: '0x7...3f2a',
    network: 'Ethereum',
    isActive: false
  }
];

const mockTokens: Token[] = [
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    amount: '5.03737',
    value: '$807.73',
    change: '+$74.96',
    changePercent: '+10.23%',
    isPositive: true,
    icon: '◎'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    amount: '0.25',
    value: '$562.50',
    change: '-$12.30',
    changePercent: '-2.14%',
    isPositive: false,
    icon: 'Ξ'
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    amount: '150.00',
    value: '$45.75',
    change: '+$3.20',
    changePercent: '+7.52%',
    isPositive: true,
    icon: '🌊'
  },
  {
    id: 'matic',
    name: 'Polygon',
    symbol: 'MATIC',
    amount: '89.12',
    value: '$67.84',
    change: '+$2.15',
    changePercent: '+3.27%',
    isPositive: true,
    icon: '⬡'
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    amount: '0.0123',
    value: '$789.45',
    change: '+$45.67',
    changePercent: '+6.13%',
    isPositive: true,
    icon: '₿'
  }
];

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
  currentLayer: 'login',
  accounts: mockAccounts,
  activeAccountId: 'account-8',
  tokens: mockTokens,
  totalBalance: '$2,272.27',
  totalChange: '+$113.68',
  totalChangePercent: '+5.26%',
  isBalancePositive: true,
  showAccountDropdown: false,
  
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

  setCurrentLayer: (layer) => set({ currentLayer: layer }),

  setActiveAccount: (accountId) => set((state) => ({
    activeAccountId: accountId,
    showAccountDropdown: false,
    accounts: state.accounts.map(acc => ({
      ...acc,
      isActive: acc.id === accountId
    }))
  })),

  setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),

  unlockWallet: () => {
    console.log('Unlocking wallet - changing layer from login to home');
    const { setTemporaryEmotion, triggerAiPetInteraction } = get();
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 3000);
    set({ currentLayer: 'home' });
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
      containerBounds: null,
      currentLayer: 'login',
      showAccountDropdown: false
    });
  }
}));
