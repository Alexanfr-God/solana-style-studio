
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletHomeLayer from './layers/WalletHomeLayer';
import ReceiveLayer from './layers/ReceiveLayer';
import SendLayer from './layers/SendLayer';
import BuyLayer from './layers/BuyLayer';

const WalletContainer = () => {
  const { currentLayer } = useWalletCustomizationStore();

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
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
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
