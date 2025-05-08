
import React from 'react';
import { useCustomizationStore, WalletStyle } from '@/stores/customizationStore';
import { LoginScreen, WalletScreen } from './WalletScreens';

const DualWalletPreview = () => {
  const { loginStyle, walletStyle } = useCustomizationStore();

  return (
    <div className="flex flex-col h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col h-full">
          <div className="text-center mb-2">
            <h3 className="text-lg font-medium text-white/90">Login View</h3>
          </div>
          <div className="flex-1 rounded-lg bg-black/10 backdrop-blur-sm p-4 flex items-center justify-center">
            <LoginScreen style={loginStyle} />
          </div>
        </div>
        
        <div className="flex flex-col h-full">
          <div className="text-center mb-2">
            <h3 className="text-lg font-medium text-white/90">Wallet View</h3>
          </div>
          <div className="flex-1 rounded-lg bg-black/10 backdrop-blur-sm p-4 flex items-center justify-center">
            <WalletScreen style={walletStyle} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualWalletPreview;
