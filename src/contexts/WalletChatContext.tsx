
import React, { createContext, useContext, ReactNode } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { WALLET_ELEMENTS_REGISTRY, getAllCategories } from '@/components/wallet/WalletElementsRegistry';

interface WalletChatContextType {
  getWalletContext: () => {
    walletType: string;
    activeLayer: string;
    activeScreen: string;
    currentStyle: any;
    availableElements: Array<{
      id: string;
      name: string;
      category: string;
      description: string;
      customizable: boolean;
    }>;
    elementCategories: string[];
    totalElements: number;
    walletFeatures: {
      hasBottomNavigation: boolean;
      hasBalanceDisplay: boolean;
      hasActionButtons: boolean;
      hasTransactionHistory: boolean;
      hasAssetsList: boolean;
      supportsDarkMode: boolean;
      supportsCustomBackgrounds: boolean;
    };
    uiStructure: {
      layout: string;
      sections: string[];
      interactiveElements: string[];
      customizableAreas: string[];
    };
    userPreferences?: {
      theme: string;
      language: string;
    };
    customizableScreens: string[];
  };
}

const WalletChatContext = createContext<WalletChatContextType | undefined>(undefined);

interface WalletChatProviderProps {
  children: ReactNode;
}

export const WalletChatProvider = ({ children }: WalletChatProviderProps) => {
  const { currentLayer, walletStyle, loginStyle } = useWalletCustomizationStore();

  const getWalletContext = () => {
    const currentStyle = currentLayer === 'login' ? loginStyle : walletStyle;
    
    return {
      walletType: 'Phantom Wallet (WalletAlivePlayground)',
      activeLayer: currentLayer || 'wallet',
      activeScreen: currentLayer || 'home',
      currentStyle: {
        backgroundColor: currentStyle.backgroundColor,
        primaryColor: currentStyle.primaryColor,
        font: currentStyle.font,
        textColor: currentStyle.textColor,
        accentColor: currentStyle.accentColor,
        buttonColor: currentStyle.buttonColor,
        borderRadius: currentStyle.borderRadius,
        backgroundImage: currentStyle.backgroundImage,
        boxShadow: currentStyle.boxShadow,
        fontFamily: currentStyle.fontFamily,
        theme: currentStyle.theme || 'dark',
        animations: currentStyle.animations || { enabled: true }
      },
      availableElements: WALLET_ELEMENTS_REGISTRY.map(element => ({
        id: element.id,
        name: element.name,
        category: element.category,
        description: element.description,
        customizable: element.customizable
      })),
      elementCategories: getAllCategories(),
      totalElements: WALLET_ELEMENTS_REGISTRY.length,
      walletFeatures: {
        hasBottomNavigation: true,
        hasBalanceDisplay: true,
        hasActionButtons: true,
        hasTransactionHistory: true,
        hasAssetsList: true,
        supportsDarkMode: true,
        supportsCustomBackgrounds: true
      },
      uiStructure: {
        layout: 'mobile-first',
        sections: ['header', 'balance', 'actions', 'content', 'navigation'],
        interactiveElements: ['buttons', 'tabs', 'dropdowns', 'modals'],
        customizableAreas: ['backgrounds', 'colors', 'typography', 'effects']
      },
      userPreferences: {
        theme: currentStyle.theme || 'dark',
        language: 'en' // Could be dynamic based on browser locale
      },
      customizableScreens: [
        'home',
        'wallet',
        'send',
        'receive',
        'swap',
        'apps',
        'search',
        'history',
        'settings',
        'login',
        'buy',
        'nfts'
      ]
    };
  };

  return (
    <WalletChatContext.Provider value={{ getWalletContext }}>
      {children}
    </WalletChatContext.Provider>
  );
};

export const useWalletChat = () => {
  const context = useContext(WalletChatContext);
  if (context === undefined) {
    throw new Error('useWalletChat must be used within a WalletChatProvider');
  }
  return context;
};
