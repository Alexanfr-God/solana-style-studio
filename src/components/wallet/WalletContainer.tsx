
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletHomeLayer from './layers/WalletHomeLayer';
import ReceiveLayer from './layers/ReceiveLayer';
import AppsLayer from './layers/AppsLayer';

const WalletContainer = () => {
  const { currentLayer } = useWalletCustomizationStore();

  const renderLayer = () => {
    switch (currentLayer) {
      case 'home':
        return <WalletHomeLayer />;
      case 'receive':
        return <ReceiveLayer />;
      case 'apps':
        return <AppsLayer />;
      case 'swap':
      case 'history':
      case 'search':
        // Placeholder for future layers
        return <WalletHomeLayer />;
      default:
        return <WalletHomeLayer />;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {renderLayer()}
    </div>
  );
};

export default WalletContainer;
