
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

  const getLockLayer = () => theme.lockLayer || {};
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
  
  const getAccountDropdown = () => theme.accountDropdown || {};

  const getBottomNavigation = () => theme.bottomNavigation || {};

  const getActionButtons = () => theme.actionButtons || {};

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
