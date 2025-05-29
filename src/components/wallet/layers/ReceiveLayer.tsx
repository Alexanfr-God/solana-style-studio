
import React from 'react';
import { ArrowLeft, Copy, Check, QrCode } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletList from '../WalletList';

const ReceiveLayer = () => {
  const {
    walletStyle,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const handleBack = () => {
    setCurrentLayer('home');
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const handleAccountSelect = (accountId: string) => {
    console.log('Selected account for receive:', accountId);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  return (
    <div 
      className="absolute inset-0 bg-black/95 backdrop-blur-md animate-slide-in-bottom"
      style={{
        backgroundColor: walletStyle.backgroundColor || '#181818',
        fontFamily: walletStyle.font || 'Inter'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Back</span>
        </button>
        
        <h1 className="text-lg font-semibold text-white">Receive Crypto</h1>
        
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => {
            console.log('QR Code clicked');
            triggerAiPetInteraction();
          }}
        >
          <QrCode className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-white mb-2">Select Account</h2>
          <p className="text-xs text-gray-400">
            Choose which account you want to receive crypto into
          </p>
        </div>

        {/* Shared Wallet List */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
          <WalletList 
            context="popup"
            onAccountSelect={handleAccountSelect}
            metadata={{
              triggeredBy: 'receive-button',
              purpose: 'Display wallet addresses for receive flow',
              sharedElementId: 'walletList',
              context: 'receive-flow',
              layoutType: 'bottom-sheet',
              animation: 'slide-up'
            }}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Copy className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-blue-300 font-medium text-sm mb-1">How to receive crypto</h3>
              <p className="text-blue-200 text-xs leading-relaxed">
                Select an account above, then copy the wallet address and share it with the sender. 
                You can also show the QR code for easy scanning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveLayer;
