
import { create } from 'zustand';

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
  icon: string;
  amount: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface WalletStyle {
  backgroundColor: string;
  primaryColor: string;
  font: string;
  image?: string;
}

export type AiPetEmotion = 'idle' | 'happy' | 'excited' | 'sleepy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';
export type AiPetBodyType = 'phantom' | 'lottie';
export type WalletLayer = 'login' | 'home' | 'apps' | 'swap' | 'history' | 'search';

interface AiPet {
  isVisible: boolean;
  emotion: AiPetEmotion;
  zone: AiPetZone;
  bodyType: AiPetBodyType;
  energy: number;
}

interface WalletCustomizationState {
  accounts: Account[];
  activeAccountId: string;
  setActiveAccount: (accountId: string) => void;
  tokens: Token[];
  walletStyle: WalletStyle;
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  totalBalance: string;
  totalChange: string;
  totalChangePercent: string;
  isBalancePositive: boolean;
  aiPetEmotion: { emotion: string; timestamp: number } | null;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setTemporaryEmotion: (emotion: string, duration: number) => void;
  triggerAiPetInteraction: () => void;
  selectedWallet: string;
  setSelectedWallet: (wallet: string) => void;
  currentLayer: WalletLayer;
  setCurrentLayer: (layer: WalletLayer) => void;
  showAccountDropdown: boolean;
  setShowAccountDropdown: (show: boolean) => void;
  
  // Missing properties for customization
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  isCustomizing: boolean;
  customizeWallet: () => void;
  onCustomizationStart: () => void;
  resetWallet: () => void;
  unlockWallet: () => void;
  
  // Missing AI Pet properties
  aiPet: AiPet;
  setAiPetZone: (zone: AiPetZone) => void;
  setAiPetBodyType: (bodyType: AiPetBodyType) => void;
  containerBounds: DOMRect | null;
  setContainerBounds: (bounds: DOMRect | null) => void;
  updateAiPetEnergy: () => void;
  onAiPetHover: () => void;
  onAiPetClick: () => void;
  onAiPetDoubleClick: () => void;
}

export const useWalletCustomizationStore = create<WalletCustomizationState>()(
  (set, get) => ({
    accounts: [
      { id: '1', name: 'Account 1', address: '0x123...', network: 'Ethereum' },
      { id: '2', name: 'Account 2', address: '0x456...', network: 'Ethereum' },
      { id: '3', name: 'Account 3', address: '0x789...', network: 'Ethereum' },
    ],
    activeAccountId: '1',
    setActiveAccount: (accountId: string) => set({ activeAccountId: accountId }),
    tokens: [
      { id: '1', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', amount: '3.456', value: '$12,345.67', change: '+3.4%', isPositive: true },
      { id: '2', name: 'Solana', symbol: 'SOL', icon: '◎', amount: '12.345', value: '$2,345.67', change: '-1.2%', isPositive: false },
      { id: '3', name: 'Bitcoin', symbol: 'BTC', icon: '₿', amount: '0.123', value: '$3,456.78', change: '+0.8%', isPositive: true },
    ],
    walletStyle: {
      backgroundColor: '#181818',
      primaryColor: '#9945FF',
      font: 'Inter'
    },
    setWalletStyle: (style) => set(state => ({ walletStyle: { ...state.walletStyle, ...style } })),
    totalBalance: '$15,691.34',
    totalChange: '+ $123.45',
    totalChangePercent: '+0.78%',
    isBalancePositive: true,
    aiPetEmotion: null,
    setAiPetEmotion: (emotion) => {
      set({ aiPetEmotion: { emotion: emotion, timestamp: Date.now() } });
      set(state => ({ aiPet: { ...state.aiPet, emotion } }));
    },
    setTemporaryEmotion: (emotion, duration) => {
      set({ aiPetEmotion: { emotion: emotion, timestamp: Date.now() } });
      setTimeout(() => {
        set({ aiPetEmotion: null });
      }, duration);
    },
    triggerAiPetInteraction: () => {
      const emotions: AiPetEmotion[] = ['happy', 'excited', 'wink', 'sleepy', 'idle'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      get().setAiPetEmotion(randomEmotion);
    },
    selectedWallet: 'phantom',
    setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
    currentLayer: 'login',
    setCurrentLayer: (layer) => set({ currentLayer: layer }),
    showAccountDropdown: false,
    setShowAccountDropdown: (show: boolean) => set({ showAccountDropdown: show }),
    
    // Customization properties
    uploadedImage: null,
    setUploadedImage: (image) => set({ uploadedImage: image }),
    isCustomizing: false,
    customizeWallet: () => {
      set({ isCustomizing: true });
      // Simulate customization process
      setTimeout(() => {
        set({ isCustomizing: false });
        get().triggerAiPetInteraction();
      }, 3000);
    },
    onCustomizationStart: () => set({ isCustomizing: true }),
    resetWallet: () => {
      set({
        walletStyle: {
          backgroundColor: '#181818',
          primaryColor: '#9945FF',
          font: 'Inter'
        },
        uploadedImage: null,
        isCustomizing: false
      });
      get().triggerAiPetInteraction();
    },
    unlockWallet: () => {
      set({ currentLayer: 'home' });
      get().triggerAiPetInteraction();
    },
    
    // AI Pet properties
    aiPet: {
      isVisible: true,
      emotion: 'idle',
      zone: 'inside',
      bodyType: 'phantom',
      energy: 100
    },
    setAiPetZone: (zone) => set(state => ({ aiPet: { ...state.aiPet, zone } })),
    setAiPetBodyType: (bodyType) => set(state => ({ aiPet: { ...state.aiPet, bodyType } })),
    containerBounds: null,
    setContainerBounds: (bounds) => set({ containerBounds: bounds }),
    updateAiPetEnergy: () => {
      set(state => ({ 
        aiPet: { 
          ...state.aiPet, 
          energy: Math.max(0, state.aiPet.energy - 1) 
        } 
      }));
    },
    onAiPetHover: () => {
      get().setAiPetEmotion('suspicious');
    },
    onAiPetClick: () => {
      get().setAiPetEmotion('wink');
      get().setTemporaryEmotion('wink', 2000);
    },
    onAiPetDoubleClick: () => {
      const currentZone = get().aiPet.zone;
      get().setAiPetZone(currentZone === 'inside' ? 'outside' : 'inside');
      get().setAiPetEmotion('excited');
    },
  })
);
