import { create } from 'zustand';
import { WalletStyle } from './customizationStore';
import { getCoinIcon } from '@/constants/coinIcons';
import { THEME_SOT_IS_ZUSTAND } from '@/config/flags';

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
  
  // Manual-only style management (no auto-sync)
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  setLoginStyle: (style: Partial<WalletStyle>) => void;
  applyUniversalStyle: (style: Partial<WalletStyle>) => void;
  
  // Layer-specific background application methods
  applyBackgroundToLoginLayer: (imageUrl: string) => void;
  applyBackgroundToWalletLayer: (imageUrl: string) => void;
  applyBackgroundToBothLayers: (imageUrl: string) => void;
  
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
  
  // Style helpers (deprecated in SoT mode)
  getStyleForComponent: (component: string) => any;
  getTokenColors: () => any;
  getStatusColors: () => any;
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

  // Manual-only style updates (no auto-sync with useThemeStore)
  setWalletStyle: (newStyle) => {
    console.log('🎯 Manual wallet style update (no auto-sync):', newStyle);
    set((state) => ({
      walletStyle: { ...state.walletStyle, ...newStyle }
    }));
  },

  setLoginStyle: (newStyle) => {
    console.log('🎯 Manual login style update (no auto-sync):', newStyle);
    set((state) => ({
      loginStyle: { ...state.loginStyle, ...newStyle }
    }));
  },

  applyUniversalStyle: (newStyle) => {
    console.log('🎯 Manual universal style update (no auto-sync):', newStyle);
    set((state) => ({
      walletStyle: { ...state.walletStyle, ...newStyle },
      loginStyle: { ...state.loginStyle, ...newStyle }
    }));
  },

  // Background application methods
  applyBackgroundToLoginLayer: (imageUrl: string) => {
    set((state) => ({
      loginStyle: { ...state.loginStyle, backgroundImage: `url(${imageUrl})` }
    }));
    console.log('🔒 Background applied to LOGIN layer only:', imageUrl);
  },

  applyBackgroundToWalletLayer: (imageUrl: string) => {
    set((state) => ({
      walletStyle: { ...state.walletStyle, backgroundImage: `url(${imageUrl})` }
    }));
    console.log('🔓 Background applied to WALLET layer only:', imageUrl);
  },

  applyBackgroundToBothLayers: (imageUrl: string) => {
    set((state) => ({
      walletStyle: { ...state.walletStyle, backgroundImage: `url(${imageUrl})` },
      loginStyle: { ...state.loginStyle, backgroundImage: `url(${imageUrl})` }
    }));
    console.log('🔒✨ Background applied to BOTH layers:', imageUrl);
  },

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
  setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),

  getStyleForComponent: (component: string) => {
    if (THEME_SOT_IS_ZUSTAND) {
      console.warn(`⚠️ getStyleForComponent(${component}) is deprecated in SoT mode - use useThemeStore instead`);
      return {};
    }
    // Legacy implementation for rollback
    return {};
  },

  getTokenColors: () => ({
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280',
    warning: '#F59E0B',
    info: '#3B82F6'
  }),

  getStatusColors: () => ({
    success: '#10B981',
    error: '#EF4444',
    pending: '#F59E0B',
    inactive: '#6B7280'
  })
}));
