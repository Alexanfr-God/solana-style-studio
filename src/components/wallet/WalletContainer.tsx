
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletHomeLayer from './layers/WalletHomeLayer';
import ReceiveLayer from './layers/ReceiveLayer';

const WalletContainer = () => {
  const { currentLayer } = useWalletCustomizationStore();

  const renderLayer = () => {
    switch (currentLayer) {
      case 'receive':
        return <ReceiveLayer />;
      case 'home':
      case 'apps':
      case 'swap':
      case 'history':
      case 'search':
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
