
// DEPRECATED bridge — не добавлять новую логику здесь. SoT is useThemeStore.
import { useThemeStore } from '@/state/themeStore';
import type { AssetCardStyle } from '@/types/walletStyleSchema';

interface GlobalSearchInput {
  backgroundColor?: string;
  textColor?: string;
  placeholderColor?: string;
  borderRadius?: string;
  border?: string;
  fontFamily?: string;
  fontSize?: string;
  iconSearch?: { color?: string; type?: string };
  iconClose?: { color?: string; type?: string };
}

interface TokenCost {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
}

interface TokenCardTitle {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
}

interface TokenCardDescription {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  textAlign?: string;
}

export interface LockLayerTheme {
  backgroundColor?: string;
  backgroundImage?: string;
  title?: {
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  };
  passwordInput?: {
    backgroundColor?: string;
    textColor?: string;
    iconEyeColor?: string;
    placeholderColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    border?: string;
  };
  forgotPassword?: {
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  unlockButton?: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: string;
    borderRadius?: string;
  };
}

interface WalletTheme {
  globalSearchInput?: GlobalSearchInput;
  lockLayer?: any;
  avatarHeader?: any;
  sidebarLayer?: any;
  homeLayer?: any;
  receiveLayer?: any;
  sendLayer?: any;
  appsLayer?: any;
  buyLayer?: any;
  swapLayer?: any;
  historyLayer?: any;
  searchLayer?: any;
  assetCard?: AssetCardStyle;
  tokenCost?: TokenCost;
  tokenCardTitle?: TokenCardTitle;
  tokenCardDescription?: TokenCardDescription;
  global?: any;
  accountDropdown?: any;
  bottomNavigation?: any;
  actionButtons?: any;
}

// Bridge to useThemeStore - single source of truth
export const useWalletTheme = () => {
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);

  // Computed getters based on theme from useThemeStore
  const getGlobalSearchInput = (): GlobalSearchInput => {
    return theme.globalSearchInput || {
      backgroundColor: '#1b140a',
      textColor: '#ffd873',
      placeholderColor: '#ad7e26',
      borderRadius: '12px',
      border: 'none',
      fontFamily: 'Inter, sans-serif',
      fontSize: '15px',
      iconSearch: { color: '#ffd873', type: 'search' },
      iconClose: { color: '#ffd873', type: 'x' }
    };
  };

  const getTokenCost = (): TokenCost => {
    return theme.tokenCost || {
      fontSize: '13px',
      fontWeight: '400',
      fontFamily: 'Inter, sans-serif',
      color: '#CCCCCC'
    };
  };

  const getAssetCard = (): AssetCardStyle => {
    return theme.assetCard || {
      backgroundColor: '#432818',
      borderRadius: '14px',
      title: {
        textColor: '#FFD166',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fontSize: '16px'
      },
      description: {
        textColor: '#aaa',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      },
      value: {
        textColor: '#fff',
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px'
      },
      percent: {
        positiveColor: '#13e163',
        negativeColor: '#ff5959',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      },
      icon: {
        color: '#ad7e26',
        size: '24px'
      }
    };
  };

  const getTokenCardTitleStyle = (): TokenCardTitle => {
    return theme.tokenCardTitle || {
      fontSize: '16px',
      fontWeight: '600',
      fontFamily: 'Inter, sans-serif',
      color: '#FFFFFF',
      textAlign: 'center'
    };
  };

  const getTokenCardDescriptionStyle = (): TokenCardDescription => {
    return theme.tokenCardDescription || {
      fontSize: '13px',
      fontWeight: '400',
      fontFamily: 'Inter, sans-serif',
      color: '#CCCCCC',
      textAlign: 'center'
    };
  };

  const getAvatarHeader = () => theme.avatarHeader || {};
  const getSidebarLayer = () => theme.sidebarLayer || {};
  const getHomeLayer = () => theme.homeLayer || {};
  const getReceiveLayer = () => theme.receiveLayer || {};
  const getSendLayer = () => theme.sendLayer || {};
  const getAppsLayer = () => theme.appsLayer || {};
  const getBuyLayer = () => theme.buyLayer || {};
  const getSwapLayer = () => theme.swapLayer || {};
  const getHistoryLayer = () => theme.historyLayer || {};
  const getSearchLayer = () => theme.searchLayer || {};
  const getGlobal = () => theme.global || {};
  
  const getAccountDropdown = () => theme.homeLayer?.accountDropdown || {};

  const getBottomNavigation = () => theme.homeLayer?.footer || {};

  const getActionButtons = () => theme.homeLayer?.actionButtons || {};

  const getLockLayer = (): LockLayerTheme => {
    const lockLayer = theme?.lockLayer || {};
    
    // 🛡️ Мягкие fallback: ТОЛЬКО типографика и радиусы (не цвета!)
    return {
      backgroundColor: lockLayer.backgroundColor,
      backgroundImage: lockLayer.backgroundImage,
      title: {
        textColor: lockLayer.title?.textColor,
        fontFamily: lockLayer.title?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: lockLayer.title?.fontSize || '20px',
        fontWeight: lockLayer.title?.fontWeight || '600'
      },
      passwordInput: {
        backgroundColor: lockLayer.passwordInput?.backgroundColor || '#1c1c1c',
        textColor: lockLayer.passwordInput?.textColor || '#ffffff',
        iconEyeColor: lockLayer.passwordInput?.iconEyeColor || '#9CA3AF',
        placeholderColor: lockLayer.passwordInput?.placeholderColor || '#6B7280',
        fontFamily: lockLayer.passwordInput?.fontFamily || 'Inter, system-ui, sans-serif',
        borderRadius: lockLayer.passwordInput?.borderRadius || '12px',
        border: lockLayer.passwordInput?.border || 'none'
      },
      forgotPassword: {
        textColor: lockLayer.forgotPassword?.textColor || '#9CA3AF',
        fontFamily: lockLayer.forgotPassword?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: lockLayer.forgotPassword?.fontSize || '14px'
      },
      unlockButton: {
        backgroundColor: lockLayer.unlockButton?.backgroundColor || '#9945FF',
        textColor: lockLayer.unlockButton?.textColor || '#ffffff',
        fontFamily: lockLayer.unlockButton?.fontFamily || 'Inter, system-ui, sans-serif',
        fontWeight: lockLayer.unlockButton?.fontWeight || '700',
        fontSize: lockLayer.unlockButton?.fontSize || '16px',
        borderRadius: lockLayer.unlockButton?.borderRadius || '12px'
      }
    };
  };

  const getTransition = (type: string = 'default') => {
    return theme.global?.transition || 'all 0.2s ease';
  };

  const getUnifiedTokenColor = (change: string) => {
    const assetCard = getAssetCard();
    const isPositive = change.startsWith('+');
    const isZero = change === '0' || change === '$0.00';
    
    return {
      color: isZero 
        ? assetCard.value?.textColor || '#fff'
        : isPositive 
        ? assetCard.percent?.positiveColor || '#13e163'
        : assetCard.percent?.negativeColor || '#ff5959',
      fontFamily: assetCard.percent?.fontFamily || 'Inter, sans-serif',
      fontSize: assetCard.percent?.fontSize || '14px'
    };
  };

  const tokenColors = {
    positive: theme.assetCard?.percent?.positiveColor || '#13e163',
    negative: theme.assetCard?.percent?.negativeColor || '#ff5959',
    neutral: theme.assetCard?.value?.textColor || '#fff',
    warning: '#ffd600',
    info: theme.assetCard?.icon?.color || '#ad7e26'
  };

  return {
    theme,
    setTheme,
    getGlobalSearchInput,
    getAssetCard,
    getTokenCost,
    getTokenCardTitleStyle,
    getTokenCardDescriptionStyle,
    getLockLayer,
    getAvatarHeader,
    getSidebarLayer,
    getHomeLayer,
    getReceiveLayer,
    getSendLayer,
    getAppsLayer,
    getBuyLayer,
    getSwapLayer,
    getHistoryLayer,
    getSearchLayer,
    getGlobal,
    getAccountDropdown,
    getBottomNavigation,
    getActionButtons,
    getTransition,
    getUnifiedTokenColor,
    tokenColors
  };
};

// Utils for external usage (non-React contexts)
export const getCurrentTheme = () => useThemeStore.getState().theme;
export const setCurrentTheme = (theme: WalletTheme) => useThemeStore.getState().setTheme(theme);
