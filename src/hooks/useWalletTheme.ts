
import { useState, useEffect } from 'react';
import type { AssetCardStyle } from '@/types/walletStyleSchema';

interface WalletThemeLayer {
  [key: string]: any;
}

interface WalletTheme {
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
  walletActionButton?: {
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: string;
    borderRadius?: string;
    padding?: string;
    border?: string;
    boxShadow?: string;
    hoverOpacity?: string;
    icon?: {
      color?: string;
      size?: string;
    };
  };
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
