
import { useState, useEffect } from 'react';
import type { AssetCardStyle } from '@/types/walletStyleSchema';

interface WalletThemeLayer {
  [key: string]: any;
}

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

interface TokenElements {
  name?: {
    textColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: string;
  };
  amount?: {
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  dollarValue?: {
    textColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  percentChange?: {
    positiveColor?: string;
    negativeColor?: string;
    neutralColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
}

interface WalletTheme {
  globalSearchInput?: GlobalSearchInput;
  lockLayer?: WalletThemeLayer;
  avatarHeader?: WalletThemeLayer;
  sidebarLayer?: WalletThemeLayer;
  homeLayer?: WalletThemeLayer;
  receiveLayer?: WalletThemeLayer;
  sendLayer?: WalletThemeLayer;
  appsLayer?: WalletThemeLayer;
  buyLayer?: WalletThemeLayer;
  swapLayer?: WalletThemeLayer;
  historyLayer?: WalletThemeLayer;
  searchLayer?: WalletThemeLayer;
  assetCard?: AssetCardStyle;
  tokenElements?: TokenElements;
  global?: WalletThemeLayer;
}

export const useWalletTheme = () => {
  const [theme, setTheme] = useState<WalletTheme>({});

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await fetch('/themes/defaultTheme.json');
        const themeData = await response.json();
        setTheme(themeData);
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Global Search Input styles
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

  // Global Token Elements styles
  const getTokenElements = (): TokenElements => {
    return theme.tokenElements || {
      name: {
        textColor: '#FFD166',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fontSize: '16px'
      },
      amount: {
        textColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px'
      },
      dollarValue: {
        textColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px'
      },
      percentChange: {
        positiveColor: '#13e163',
        negativeColor: '#ff5959',
        neutralColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px'
      }
    };
  };

  // Global Asset Card styles
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

  const getTransition = (type: string = 'default') => {
    return theme.global?.transition || 'all 0.2s ease';
  };

  const getUnifiedTokenColor = (change: string) => {
    const tokenElements = getTokenElements();
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    const isZero = change === '0' || change === '$0.00' || change === '0.0%';
    
    return {
      color: isZero 
        ? tokenElements.percentChange?.neutralColor || '#FFFFFF'
        : isPositive 
        ? tokenElements.percentChange?.positiveColor || '#13e163'
        : isNegative
        ? tokenElements.percentChange?.negativeColor || '#ff5959'
        : tokenElements.percentChange?.neutralColor || '#FFFFFF',
      fontFamily: tokenElements.percentChange?.fontFamily || 'Inter, sans-serif',
      fontSize: tokenElements.percentChange?.fontSize || '14px'
    };
  };

  const tokenColors = {
    positive: theme.tokenElements?.percentChange?.positiveColor || '#13e163',
    negative: theme.tokenElements?.percentChange?.negativeColor || '#ff5959',
    neutral: theme.tokenElements?.percentChange?.neutralColor || '#FFFFFF',
    warning: '#ffd600',
    info: theme.assetCard?.icon?.color || '#ad7e26'
  };

  return {
    theme,
    getGlobalSearchInput,
    getTokenElements,
    getAssetCard,
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
    getTransition,
    getUnifiedTokenColor,
    tokenColors
  };
};
