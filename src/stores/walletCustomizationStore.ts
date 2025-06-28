
import { create } from 'zustand';
import { WalletStyle } from './customizationStore';

export interface WalletCustomizationState {
  currentLayer: 'login' | 'wallet';
  walletStyle: WalletStyle;
  loginStyle: WalletStyle;
  selectedWallet: 'phantom' | 'metamask';
  isCustomizing: boolean;
  customizationProgress: number;
  isSuccessAnimationActive: boolean;
  
  // Navigation and state management
  setCurrentLayer: (layer: 'login' | 'wallet') => void;
  unlockWallet: () => void;
  
  // Style management with automatic animation triggers
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  setLoginStyle: (style: Partial<WalletStyle>) => void;
  applyUniversalStyle: (style: Partial<WalletStyle>) => void;
  
  // Animation control
  onCustomizationStart: () => void;
  resetCustomizationState: () => void;
  triggerSuccessAnimation: () => void;
  
  // Wallet selection
  setSelectedWallet: (wallet: 'phantom' | 'metamask') => void;
  
  // Style helpers
  getStyleForComponent: (component: string) => any;
}

// Default styles
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
