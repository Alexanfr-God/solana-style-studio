
import { create } from 'zustand';
import { getCoinIcon } from '@/constants/coinIcons';

export type WalletLayer = 'login' | 'wallet' | 'receive' | 'send' | 'buy' | 'swap' | 'apps' | 'history' | 'search' | 'home';

export interface WalletCustomizationState {
  currentLayer: WalletLayer;
  selectedWallet: 'phantom' | 'metamask';
  isCustomizing: boolean;
  customizationProgress: number;
  isSuccessAnimationActive: boolean;
  
  // Navigation and account management
  uploadedImage: string | null;
  accounts: Array<{
    id: string;
    name: string;
    address: string;
    balance: string;
    isActive: boolean;
    network: string;
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
    amount: string;
    isPositive: boolean;
  }>;
  totalBalance: string;
  totalChange: string;
  isBalancePositive: boolean;
  
  // Navigation and state management
  setCurrentLayer: (layer: WalletLayer) => void;
  unlockWallet: () => void;
  
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
}

// Mock data for compatibility
const mockAccounts = [
  {
    id: 'account-1',
    name: 'Main Account',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    balance: '$1,234.56',
    isActive: true,
    network: 'Solana'
  },
  {
    id: 'account-2', 
    name: 'Trading Account',
    address: '9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
    balance: '$567.89',
    isActive: false,
    network: 'Solana'
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
    icon: getCoinIcon('SOL'),
    amount: '12.45',
    isPositive: true
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    balance: '1,000.00',
    value: '$1,000.00',
    change: '0.0%',
    icon: getCoinIcon('USDC'),
    amount: '1,000.00',
    isPositive: true
  }
];

// Universal style change wrapper - ВСЕГДА вызывает анимацию
const withScanAnimation = (fn: () => void, set: any) => {
  console.log('🎯 Triggering scan animation for customization');
  
  // Запускаем анимацию сканирования
  set({ 
    isCustomizing: true, 
    customizationProgress: 0,
    isSuccessAnimationActive: false 
  });
  
  // Выполняем изменение
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
  selectedWallet: 'phantom',
  isCustomizing: false,
  customizationProgress: 0,
  isSuccessAnimationActive: false,
  
  // Navigation and account state
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

  setUploadedImage: (imageUrl) => set({ uploadedImage: imageUrl }),

  setActiveAccount: (accountId) => set({ activeAccountId: accountId }),
  setShowAccountSidebar: (show) => set({ showAccountSidebar: show }),
  setShowAccountDropdown: (show) => set({ showAccountDropdown: show })
}));
