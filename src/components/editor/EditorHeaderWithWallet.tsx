
import React from 'react';
import WalletSelector from '../wallet/WalletSelector';

const EditorHeaderWithWallet = () => {
  console.log('🔍 EditorHeaderWithWallet rendered');
  
  return (
    <div className="flex items-center justify-between w-full mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Wallet Coast Customs
        </h1>
        <p className="text-sm text-white/70 hidden md:block">
          Custom AI wallet skins for Phantom
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-white/60 hidden lg:block">
          Connect wallet to generate styles
        </div>
        <WalletSelector />
      </div>
    </div>
  );
};

export default EditorHeaderWithWallet;
