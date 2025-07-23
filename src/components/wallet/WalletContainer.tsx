
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletHomeLayer from './layers/WalletHomeLayer';
import ReceiveLayer from './layers/ReceiveLayer';
import SendLayer from './layers/SendLayer';
import BuyLayer from './layers/BuyLayer';
import SwapContent from './content/SwapContent';
import AppsContent from './content/AppsContent';
import HistoryContent from './content/HistoryContent';
import SearchContent from './content/SearchContent';

const WalletContainer = () => {
  const { currentLayer } = useWalletCustomizationStore();

  const renderMainLayer = () => {
    switch (currentLayer) {
      case 'swap':
        return <SwapContent />;
      case 'apps':
        return <AppsContent />;
      case 'history':
        return <HistoryContent />;
      case 'search':
        return <SearchContent />;
      case 'home':
      case 'receive':
      case 'send':
      case 'buy':
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
