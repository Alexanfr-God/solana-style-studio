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

// Updated comprehensive style interfaces based on AI analysis
interface ComponentStyle {
  backgroundColor?: string;
  gradient?: string;
  textColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  animation?: string;
  border?: string;
  backgroundImage?: string;
  backdropFilter?: string;
  transition?: string;
  opacity?: string;
}

interface WalletStyleSet {
  global: ComponentStyle;
  header: ComponentStyle;
  buttons: ComponentStyle;
  panels: ComponentStyle;
  navigation: ComponentStyle;
  inputs: ComponentStyle;
  cards: ComponentStyle;
  overlays: ComponentStyle;
  containers: ComponentStyle;
  searchInputs: ComponentStyle;
  aiPet: {
    zone: AiPetZone;
    bodyType: AiPetBodyType;
    emotion: AiPetEmotion;
  };
}

// Legacy interface for backward compatibility
interface WalletStyle {
  backgroundColor: string;
  primaryColor: string;
  font: string;
  image?: string;
  backgroundImage?: string;
  borderRadius?: string;
  boxShadow?: string;
}

export type AiPetEmotion = 'idle' | 'happy' | 'excited' | 'sleepy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';
export type AiPetBodyType = 'phantom' | 'lottie';
export type WalletLayer = 'login' | 'home' | 'apps' | 'swap' | 'history' | 'search' | 'receive' | 'send' | 'buy';

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
  
  // New comprehensive style system
  walletStyleSet: WalletStyleSet;
  applyStyleSet: (styleSet: WalletStyleSet) => void;
  getStyleForComponent: (component: keyof Omit<WalletStyleSet, 'aiPet'>) => ComponentStyle;
  
  // Legacy style system for backward compatibility
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
  showAccountSidebar: boolean;
  setShowAccountSidebar: (show: boolean) => void;
  
  // Customization properties
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  isCustomizing: boolean;
  customizeWallet: () => void;
  onCustomizationStart: () => void;
  resetWallet: () => void;
  lockWallet: () => void;
  unlockWallet: () => void;
  
  // AI Pet properties
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

const defaultStyleSet: WalletStyleSet = {
  global: {
    backgroundColor: '#181818',
    fontFamily: 'Inter',
    backgroundImage: 'url("background.jpg")',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  buttons: {
    backgroundColor: '#9945FF',
    gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
    textColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(153, 69, 255, 0.3)'
  },
  panels: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  navigation: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '0px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  inputs: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  cards: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  overlays: {
    backgroundColor: 'rgba(24, 24, 24, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  containers: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  searchInputs: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    textColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  aiPet: {
    zone: 'inside',
    bodyType: 'phantom',
    emotion: 'idle'
  }
};

export const useWalletCustomizationStore = create<WalletCustomizationState>()(
  (set, get) => ({
    accounts: [
      { id: '1', name: 'Account 1', address: '0x123...', network: 'Ethereum' },
      { id: '2', name: 'Account 2', address: '0x456...', network: 'Ethereum' },
      { id: '3', name: 'Account 3', address: '0x789...', network: 'Ethereum' },
      { id: '4', name: 'Account 4', address: '0xabc...', network: 'Ethereum' },
      { id: '5', name: 'Account 5', address: '0xdef...', network: 'Ethereum' },
      { id: '6', name: 'Account 6', address: '0x111...', network: 'Ethereum' },
    ],
    activeAccountId: '1',
    setActiveAccount: (accountId: string) => set({ activeAccountId: accountId }),
    tokens: [
      { id: '1', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', amount: '3.456', value: '$12,345.67', change: '+3.4%', isPositive: true },
      { id: '2', name: 'Solana', symbol: 'SOL', icon: '◎', amount: '12.345', value: '$2,345.67', change: '-1.2%', isPositive: false },
      { id: '3', name: 'Bitcoin', symbol: 'BTC', icon: '₿', amount: '0.123', value: '$3,456.78', change: '+0.8%', isPositive: true },
    ],
    
    // New comprehensive style system
    walletStyleSet: defaultStyleSet,
    applyStyleSet: (styleSet: WalletStyleSet) => {
      set({ walletStyleSet: styleSet });
      
      // Update AI Pet configuration from styleSet
      if (styleSet.aiPet) {
        set(state => ({ 
          aiPet: { 
            ...state.aiPet, 
            zone: styleSet.aiPet.zone,
            bodyType: styleSet.aiPet.bodyType,
            emotion: styleSet.aiPet.emotion
          } 
        }));
      }
      
      // Update legacy walletStyle for backward compatibility
      const legacyStyle: WalletStyle = {
        backgroundColor: styleSet.global.backgroundColor || '#181818',
        primaryColor: styleSet.buttons.backgroundColor || '#9945FF',
        font: styleSet.global.fontFamily || 'Inter',
        backgroundImage: styleSet.global.backgroundImage,
        borderRadius: styleSet.global.borderRadius,
        boxShadow: styleSet.global.boxShadow
      };
      set({ walletStyle: legacyStyle });
      
      get().triggerAiPetInteraction();
    },
    
    getStyleForComponent: (component: keyof Omit<WalletStyleSet, 'aiPet'>) => {
      const styleSet = get().walletStyleSet;
      return styleSet[component] || {};
    },
    
    // Legacy style system for backward compatibility
    walletStyle: {
      backgroundColor: '#181818',
      primaryColor: '#9945FF',
      font: 'Inter',
      backgroundImage: 'url("background.jpg")',
      borderRadius: '10px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
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
      const emotions: AiPetEmotion[] = ['happy', 'excited', 'idle', 'sleepy'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      get().setAiPetEmotion(randomEmotion);
    },
    selectedWallet: 'phantom',
    setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
    currentLayer: 'login',
    setCurrentLayer: (layer: WalletLayer) => set({ currentLayer: layer }),
    showAccountDropdown: false,
    setShowAccountDropdown: (show: boolean) => set({ showAccountDropdown: show }),
    showAccountSidebar: false,
    setShowAccountSidebar: (show: boolean) => set({ showAccountSidebar: show }),
    
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
        walletStyleSet: defaultStyleSet,
        walletStyle: {
          backgroundColor: '#181818',
          primaryColor: '#9945FF',
          font: 'Inter',
          backgroundImage: 'url("background.jpg")',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
        },
        uploadedImage: null,
        isCustomizing: false,
        aiPet: {
          isVisible: true,
          emotion: 'idle',
          zone: 'inside',
          bodyType: 'phantom',
          energy: 100
        }
      });
      get().triggerAiPetInteraction();
    },
    lockWallet: () => {
      set({ currentLayer: 'login' });
      set(state => ({ 
        aiPet: { 
          ...state.aiPet, 
          zone: 'inside',
          emotion: 'idle'
        } 
      }));
      get().triggerAiPetInteraction();
    },
    unlockWallet: () => {
      set({ currentLayer: 'home' });
      set(state => ({ 
        aiPet: { 
          ...state.aiPet, 
          zone: 'outside',
          emotion: 'excited'
        } 
      }));
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
    setAiPetZone: (zone) => {
      set(state => ({ aiPet: { ...state.aiPet, zone } }));
      get().triggerAiPetInteraction();
    },
    setAiPetBodyType: (bodyType) => set(state => ({ aiPet: { ...state.aiPet, bodyType } })),
    containerBounds: null,
    setContainerBounds: (bounds: DOMRect | null) => set({ containerBounds: bounds }),
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
      get().setAiPetEmotion('happy');
      get().setTemporaryEmotion('happy', 2000);
    },
    onAiPetDoubleClick: () => {
      const currentZone = get().aiPet.zone;
      get().setAiPetZone(currentZone === 'inside' ? 'outside' : 'inside');
      get().setAiPetEmotion('excited');
    },
  })
);
