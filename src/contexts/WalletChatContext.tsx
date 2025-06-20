
import React, { createContext, useContext, ReactNode } from 'react';
import { useCustomizationStore } from '@/stores/customizationStore';

interface WalletChatContextType {
  getWalletContext: () => {
    walletType: string;
    activeLayer: string;
    currentStyle: any;
    availableElements: string[];
  };
}

const WalletChatContext = createContext<WalletChatContextType | undefined>(undefined);

interface WalletChatProviderProps {
  children: ReactNode;
}

export const WalletChatProvider = ({ children }: WalletChatProviderProps) => {
  const { activeLayer, loginStyle, walletStyle } = useCustomizationStore();

  const getWalletContext = () => {
    const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;
    
    return {
      walletType: 'Phantom',
      activeLayer,
      currentStyle,
      availableElements: [
        'Header Bar',
        'Balance Display', 
        'Login Screen',
        'Action Buttons',
        'Asset List',
        'Bottom Navigation',
        'Background',
        'Color Scheme',
        'Typography',
        'Icons'
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
