import { create } from 'zustand';
import { WalletStyleSet, AiPetEmotion, AiPetZone, AiPetBodyType, ComponentStyle } from '@/types/walletStyleSchema';

interface Account {
  id: string;
  name: string;
  address: string;
  network: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change?: string;
  isPositive: boolean;
}

interface AiPetState {
  isVisible: boolean;
  emotion: AiPetEmotion;
  zone: AiPetZone;
  bodyType: AiPetBodyType;
  energy: number;
}

export type WalletLayer = 'login' | 'home' | 'apps' | 'swap' | 'history' | 'search' | 'send' | 'receive' | 'buy';

interface WalletCustomizationState {
  walletStyle: WalletStyleSet & {
    backgroundColor?: string;
    primaryColor?: string;
    font?: string;
    image?: string;
  };
  selectedWallet: 'phantom' | 'metamask';
  isCustomizing: boolean;
  aiPet: AiPetState;
  containerBounds: DOMRect | null;
  currentLayer: WalletLayer;
  accounts: Account[];
  activeAccountId: string | null;
  tokens: Token[];
  totalBalance: string;
  totalChange: string;
  isBalancePositive: boolean;
  showAccountSidebar: boolean;
  showAccountDropdown: boolean;
  uploadedImage: string | null;

  // Methods
  setSelectedWallet: (wallet: 'phantom' | 'metamask') => void;
  setCurrentLayer: (layer: WalletLayer) => void;
  setContainerBounds: (bounds: DOMRect) => void;
  unlockWallet: () => void;
  lockWallet: () => void;
  resetWallet: () => void;
  getStyleForComponent: (component: keyof Omit<WalletStyleSet, 'aiPet' | 'tokenColors' | 'statusColors'>) => ComponentStyle;
  getTokenColors: () => WalletStyleSet['tokenColors'];
  getStatusColors: () => WalletStyleSet['statusColors'];
  setActiveAccount: (accountId: string) => void;
  setShowAccountSidebar: (show: boolean) => void;
  setShowAccountDropdown: (show: boolean) => void;
  triggerAiPetInteraction: () => void;
  updateAiPetEnergy: () => void;
  onAiPetHover: () => void;
  onAiPetClick: () => void;
  onAiPetDoubleClick: () => void;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setAiPetZone: (zone: AiPetZone) => void;
  setAiPetBodyType: (bodyType: AiPetBodyType) => void;
  setTemporaryEmotion: (emotion: AiPetEmotion, duration: number) => void;
  setWalletStyle: (style: Partial<WalletStyleSet & { backgroundColor?: string; primaryColor?: string; font?: string; image?: string }>) => void;
  setUploadedImage: (image: string | null) => void;
  customizeWallet: () => void;
  onCustomizationStart: () => void;
}

const initialWalletStyle: WalletStyleSet & {
  backgroundColor?: string;
  primaryColor?: string;
  font?: string;
  image?: string;
} = {
  global: {
    backgroundColor: '#181818',
    textColor: '#FFFFFF',
    fontFamily: 'Inter',
    borderRadius: '12px',
    animation: {
      transition: 'all 0.2s ease',
    },
  },
  header: {},
  buttons: {
    backgroundColor: '#9945FF',
    textColor: '#FFFFFF',
    borderRadius: '12px',
    animation: {
      transition: 'all 0.2s ease',
    },
  },
  panels: {},
  navigation: {},
  inputs: {},
  cards: {
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    textColor: '#FFFFFF',
    borderRadius: '16px',
    animation: {
      transition: 'all 0.2s ease',
    },
  },
  overlays: {},
  containers: {
    backgroundColor: 'rgba(40, 40, 40, 0.8)',
    textColor: '#FFFFFF',
  },
  searchInputs: {},
  tokenColors: {
    positive: '#34D399',
    negative: '#EF4444',
    neutral: '#9CA3AF',
    warning: '#FBBF24',
    info: '#3B82F6',
  },
  statusColors: {
    success: '#10B981',
    error: '#EF4444',
    pending: '#FBBF24',
    inactive: '#6B7280',
  },
  aiPet: {
    zone: 'inside',
    bodyType: 'phantom',
    emotion: 'idle',
  },
  backgroundColor: '#181818',
  primaryColor: '#9945FF',
  font: 'Inter',
};

export type { AiPetEmotion, AiPetZone, AiPetBodyType };

export const useWalletCustomizationStore = create<WalletCustomizationState>((set, get) => ({
  walletStyle: initialWalletStyle,
  selectedWallet: 'phantom',
  isCustomizing: false,
  aiPet: {
    isVisible: true,
    emotion: 'idle',
    zone: 'inside',
    bodyType: 'phantom',
    energy: 100,
  },
  containerBounds: null,
  currentLayer: 'login',
  accounts: [
    { id: '1', name: 'Main Account', address: '3QLo...yJd2', network: 'Solana' },
    { id: '2', name: 'Savings', address: '7YTp...x9kL', network: 'Solana' },
  ],
  activeAccountId: '1',
  tokens: [
    { id: '1', name: 'TheCoin', symbol: 'THECOIN', amount: '12.34M', value: '$123.45M', change: '+5.67%', isPositive: true },
    { id: '2', name: 'Solana', symbol: 'SOL', amount: '5.03', value: '$1,127.61', change: '-1.23%', isPositive: false },
  ],
  totalBalance: '$124.57M',
  totalChange: '+4.44%',
  isBalancePositive: true,
  showAccountSidebar: false,
  showAccountDropdown: false,
  uploadedImage: null,

  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  setContainerBounds: (bounds) => set({ containerBounds: bounds }),
  unlockWallet: () => {
    set({ currentLayer: 'home' });
  },
  lockWallet: () => {
    set({ currentLayer: 'login' });
  },
  resetWallet: () => {
    set({ 
      walletStyle: initialWalletStyle,
      currentLayer: 'login',
      uploadedImage: null,
      isCustomizing: false 
    });
  },
  getStyleForComponent: (component) => {
    const style = get().walletStyle[component];
    return style || {};
  },
  getTokenColors: () => get().walletStyle.tokenColors,
  getStatusColors: () => get().walletStyle.statusColors,
  setActiveAccount: (accountId) => set({ activeAccountId: accountId }),
  setShowAccountSidebar: (show) => set({ showAccountSidebar: show }),
  setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),
  triggerAiPetInteraction: () => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, emotion: 'excited' } });
    setTimeout(() => {
      const currentAiPet = get().aiPet;
      set({ aiPet: { ...currentAiPet, emotion: 'idle' } });
    }, 1500);
  },
  updateAiPetEnergy: () => {
    const aiPet = get().aiPet;
    let newEnergy = aiPet.energy - 1;
    if (newEnergy < 0) newEnergy = 100;
    set({ aiPet: { ...aiPet, energy: newEnergy } });
  },
  onAiPetHover: () => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, emotion: 'suspicious' } });
    setTimeout(() => {
      const currentAiPet = get().aiPet;
      set({ aiPet: { ...currentAiPet, emotion: 'idle' } });
    }, 1500);
  },
  onAiPetClick: () => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, emotion: 'wink' } });
    setTimeout(() => {
      const currentAiPet = get().aiPet;
      set({ aiPet: { ...currentAiPet, emotion: 'idle' } });
    }, 1500);
  },
  onAiPetDoubleClick: () => {
    const aiPet = get().aiPet;
    const newZone = aiPet.zone === 'inside' ? 'outside' : 'inside';
    set({ aiPet: { ...aiPet, zone: newZone } });
  },
  setAiPetEmotion: (emotion) => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, emotion } });
  },
  setAiPetZone: (zone) => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, zone } });
  },
  setAiPetBodyType: (bodyType) => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, bodyType } });
  },
  setTemporaryEmotion: (emotion, duration) => {
    const aiPet = get().aiPet;
    set({ aiPet: { ...aiPet, emotion } });
    setTimeout(() => {
      const currentAiPet = get().aiPet;
      set({ aiPet: { ...currentAiPet, emotion: 'idle' } });
    }, duration);
  },
  setWalletStyle: (style) => {
    set((state) => ({
      walletStyle: { ...state.walletStyle, ...style }
    }));
  },
  setUploadedImage: (image) => set({ uploadedImage: image }),
  customizeWallet: () => {
    set({ isCustomizing: true });
    // Simulate customization process
    setTimeout(() => {
      set({ isCustomizing: false });
    }, 2000);
  },
  onCustomizationStart: () => {
    set({ isCustomizing: true });
  },
}));
