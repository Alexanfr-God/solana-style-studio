
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Button } from '@/components/ui/button';
import { Wallet, Lock } from 'lucide-react';

const WalletLoginLayer = () => {
  const {
    walletStyle,
    unlockWallet,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const handleUnlock = () => {
    console.log('Unlock wallet clicked');
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 3000);
    unlockWallet();
  };

  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: walletStyle.backgroundColor || '#181818',
        fontFamily: walletStyle.font || 'Inter'
      }}
    >
      {/* Logo/Icon */}
      <div className="mb-8">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
        >
          <Wallet className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center">Phantom Wallet</h1>
        <p className="text-gray-400 text-center mt-2">Secure crypto wallet</p>
      </div>

      {/* Unlock Section */}
      <div className="w-full max-w-xs space-y-4">
        <div className="text-center mb-6">
          <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-300 text-sm">Wallet is locked</p>
          <p className="text-gray-500 text-xs mt-1">Click to unlock and access your wallet</p>
        </div>

        <Button
          onClick={handleUnlock}
          className="w-full py-3 text-lg font-medium transition-all duration-200 hover:scale-105"
          style={{ 
            backgroundColor: walletStyle.primaryColor || '#9945FF',
            color: 'white'
          }}
        >
          Unlock Wallet
        </Button>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Demo mode • No real funds involved
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletLoginLayer;
