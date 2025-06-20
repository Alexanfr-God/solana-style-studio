
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletHomeLayer from './layers/WalletHomeLayer';
import ReceiveLayer from './layers/ReceiveLayer';
import SendLayer from './layers/SendLayer';
import BuyLayer from './layers/BuyLayer';

const WalletContainer = () => {
  const { currentLayer } = useWalletCustomizationStore();

  const renderLayer = () => {
    switch (currentLayer) {
      case 'receive':
        return <ReceiveLayer />;
      case 'send':
        return <SendLayer />;
      case 'buy':
        return <BuyLayer />;
      case 'home':
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
      {renderLayer()}
    </div>
  );
};

export default WalletContainer;
