
import { create } from 'zustand';
import { WalletStyle } from './customizationStore';

export type WalletLayer = 'login' | 'wallet' | 'receive' | 'send' | 'buy' | 'swap' | 'apps' | 'history' | 'search' | 'home';

export interface WalletCustomizationState {
  currentLayer: WalletLayer;
  walletStyle: WalletStyle;
  loginStyle: WalletStyle;
  selectedWallet: 'phantom' | 'metamask';
  isCustomizing: boolean;
  customizationProgress: number;
  isSuccessAnimationActive: boolean;
  
  // Add missing properties for compatibility
  uploadedImage: string | null;
  accounts: Array<{
    id: string;
    name: string;
    address: string;
    balance: string;
    isActive: boolean;
  }>;
  activeAccountId: string;
  showAccountSidebar: boolean;
  showAccountDropdown: boolean;
  tokens: Array<{
    id: string;
    symbol: string;
    name: string;
    balance: string;
    value: string;
    change: string;
    icon: string;
  }>;
  totalBalance: string;
  totalChange: string;
  isBalancePositive: boolean;
  
  // Navigation and state management
  setCurrentLayer: (layer: WalletLayer) => void;
  unlockWallet: () => void;
  
  // Style management with automatic animation triggers
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  setLoginStyle: (style: Partial<WalletStyle>) => void;
  applyUniversalStyle: (style: Partial<WalletStyle>) => void;
  
  // Animation control
  onCustomizationStart: () => void;
  onCustomizationStartWithTimeout: () => void;
  resetCustomizationState: () => void;
  triggerSuccessAnimation: () => void;
  
  // Wallet selection
  setSelectedWallet: (wallet: 'phantom' | 'metamask') => void;
  
  // Image management
  setUploadedImage: (imageUrl: string | null) => void;
  
  // Account management
  setActiveAccount: (accountId: string) => void;
  setShowAccountSidebar: (show: boolean) => void;
  setShowAccountDropdown: (show: boolean) => void;
  
  // AI Pet interactions (stub implementations)
  setAiPetZone: (zone: string) => void;
  triggerAiPetInteraction: () => void;
  setTemporaryEmotion: (emotion: string) => void;
  
  // Style helpers
  getStyleForComponent: (component: string) => any;
}

// Default styles with extended properties
const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#181818',
  backgroundImage: undefined,
  accentColor: '#a390f5',
  textColor: '#FFFFFF',
  buttonColor: '#a390f5',
  buttonTextColor: '#FFFFFF',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
  styleNotes: 'Default wallet style'
};

const defaultLoginStyle: WalletStyle = {
  backgroundColor: '#181818',
  backgroundImage: undefined,
  accentColor: '#a390f5',
  textColor: '#FFFFFF',
  buttonColor: '#a390f5',
  buttonTextColor: '#FFFFFF',
  borderRadius: '12px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
  styleNotes: 'Default login style'
};

// Mock data for compatibility
const mockAccounts = [
  {
    id: 'account-1',
    name: 'Main Account',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    balance: '$1,234.56',
    isActive: true
  },
  {
    id: 'account-2', 
    name: 'Trading Account',
    address: '9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
    balance: '$567.89',
    isActive: false
  }
];

const mockTokens = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    balance: '12.45',
    value: '$2,150.32',
    change: '+5.2%',
    icon: '/placeholder.svg'
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1,000.00',
    value: '$1,000.00',
    change: '0.0%',
    icon: '/placeholder.svg'
  }
];

// Universal style change wrapper - ВСЕГДА вызывает анимацию
const withScanAnimation = (fn: () => void, set: any) => {
  console.log('🎯 Triggering scan animation for style change');
  
  // Запускаем анимацию сканирования
  set({ 
    isCustomizing: true, 
    customizationProgress: 0,
    isSuccessAnimationActive: false 
  });
  
  // Выполняем изменение стиля
  fn();
  
  // Симулируем прогресс
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 25;
    set({ customizationProgress: progress });
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      
      // Завершаем анимацию через 1.5 секунды
      setTimeout(() => {
        set({ 
          isCustomizing: false,
          customizationProgress: 0,
          isSuccessAnimationActive: true 
        });
        
        // Убираем success анимацию через 0.8 секунды
        setTimeout(() => {
          set({ isSuccessAnimationActive: false });
        }, 800);
      }, 1500);
    }
  }, 200);
};

export const useWalletCustomizationStore = create<WalletCustomizationState>((set, get) => ({
  currentLayer: 'login',
  walletStyle: { ...defaultWalletStyle },
  loginStyle: { ...defaultLoginStyle },
  selectedWallet: 'phantom',
  isCustomizing: false,
  customizationProgress: 0,
  isSuccessAnimationActive: false,
  
  // Add missing properties with default values
  uploadedImage: null,
  accounts: mockAccounts,
  activeAccountId: 'account-1',
  showAccountSidebar: false,
  showAccountDropdown: false,
  tokens: mockTokens,
  totalBalance: '$3,150.32',
  totalChange: '+4.8%',
  isBalancePositive: true,

  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  
  unlockWallet: () => set({ currentLayer: 'wallet' }),

  // МОДИФИЦИРОВАННЫЕ методы - теперь ВСЕГДА запускают анимацию
  setWalletStyle: (newStyle) => {
    withScanAnimation(() => {
      set((state) => ({
        walletStyle: { ...state.walletStyle, ...newStyle }
      }));
      console.log('✅ Wallet style updated with animation:', newStyle);
    }, set);
  },

  setLoginStyle: (newStyle) => {
    withScanAnimation(() => {
      set((state) => ({
        loginStyle: { ...state.loginStyle, ...newStyle }
      }));
      console.log('✅ Login style updated with animation:', newStyle);
    }, set);
  },

  // НОВЫЙ метод - применяет стиль к ОБОИМ экранам одновременно
  applyUniversalStyle: (newStyle) => {
    withScanAnimation(() => {
      set((state) => ({
        walletStyle: { ...state.walletStyle, ...newStyle },
        loginStyle: { ...state.loginStyle, ...newStyle }
      }));
      console.log('✅ Universal style applied to BOTH screens with animation:', newStyle);
    }, set);
  },

  // Прямое управление анимацией (для особых случаев)
  onCustomizationStart: () => {
    console.log('🔄 Manual customization animation started');
    set({ 
      isCustomizing: true, 
      customizationProgress: 0,
      isSuccessAnimationActive: false 
    });
  },

  onCustomizationStartWithTimeout: () => {
    console.log('🔄 Manual customization animation started with timeout');
    set({ 
      isCustomizing: true, 
      customizationProgress: 0,
      isSuccessAnimationActive: false 
    });
    
    setTimeout(() => {
      set({ 
        isCustomizing: false,
        isSuccessAnimationActive: true 
      });
      
      setTimeout(() => {
        set({ isSuccessAnimationActive: false });
      }, 800);
    }, 3000);
  },

  resetCustomizationState: () => {
    console.log('🔄 Customization animation reset');
    set({ 
      isCustomizing: false, 
      customizationProgress: 0,
      isSuccessAnimationActive: false 
    });
  },

  triggerSuccessAnimation: () => {
    console.log('🎉 Success animation triggered');
    set({ 
      isCustomizing: false,
      isSuccessAnimationActive: true 
    });
    
    setTimeout(() => {
      set({ isSuccessAnimationActive: false });
    }, 800);
  },

  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),

  // Image management
  setUploadedImage: (imageUrl) => set({ uploadedImage: imageUrl }),

  // Account management
  setActiveAccount: (accountId) => set({ activeAccountId: accountId }),
  setShowAccountSidebar: (show) => set({ showAccountSidebar: show }),
  setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),

  // AI Pet interactions (stub implementations for compatibility)
  setAiPetZone: (zone) => {
    console.log('🤖 AI Pet zone set to:', zone);
  },
  triggerAiPetInteraction: () => {
    console.log('🤖 AI Pet interaction triggered');
  },
  setTemporaryEmotion: (emotion) => {
    console.log('🤖 AI Pet emotion set to:', emotion);
  },

  getStyleForComponent: (component: string) => {
    const state = get();
    const currentStyle = state.currentLayer === 'login' ? state.loginStyle : state.walletStyle;
    
    // Возвращаем стиль в зависимости от компонента
    switch (component) {
      case 'global':
        return currentStyle;
      case 'header':
        return {
          backgroundColor: currentStyle.backgroundColor,
          color: currentStyle.textColor,
          fontFamily: currentStyle.fontFamily
        };
      default:
        return currentStyle;
    }
  }
}));
