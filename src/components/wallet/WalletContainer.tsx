
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import WalletHomeLayer from './layers/WalletHomeLayer';
import ReceiveLayer from './layers/ReceiveLayer';
import SendLayer from './layers/SendLayer';
import BuyLayer from './layers/BuyLayer';

const WalletContainer = () => {
  const { currentLayer } = useWalletCustomizationStore();
  const { theme } = useWalletTheme();

  const renderMainLayer = () => {
    switch (currentLayer) {
      case 'home':
      case 'receive':
      case 'send':
      case 'buy':
      case 'swap':
      case 'apps':
      case 'history':
      case 'search':
      default:
        return <WalletHomeLayer />;
    }
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{
        backgroundColor: theme.homeLayer?.backgroundColor || '#181818',
        backgroundImage: theme.homeLayer?.backgroundImage ? `url(${theme.homeLayer.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: theme.global?.fontFamily || 'Inter, sans-serif'
      }}
    >
      {renderMainLayer()}
      
      {/* ReceiveLayer as bottom-sheet overlay */}
      {currentLayer === 'receive' && <ReceiveLayer />}
      
      {/* SendLayer as bottom-sheet overlay */}
      {currentLayer === 'send' && <SendLayer />}
      
      {/* BuyLayer as bottom-sheet overlay */}
      {currentLayer === 'buy' && <BuyLayer />}
    </div>
  );
};

export default WalletContainer;
