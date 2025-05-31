
import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, QrCode, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useToast } from '@/hooks/use-toast';

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  address: string;
  icon: string;
  color: string;
}

const cryptoNetworks: CryptoNetwork[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    address: '52Tm...mBCN',
    icon: '/lovable-uploads/72224164-59bd-4fc3-abf5-d57bbdbee278.png',
    color: '#9945FF'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0xa30b...4Ff4',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'BASE',
    address: '0xa30b...4Ff4',
    icon: '/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png',
    color: '#0052FF'
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    address: '0xd1d1...c8f9',
    icon: '/lovable-uploads/9dd9ce9c-2158-40cf-98ee-2e189bd56595.png',
    color: '#4CA2FF'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    address: '0xa30b...4Ff4',
    icon: '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
    color: '#8247E5'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1q...x7h2',
    icon: '/lovable-uploads/cd33fecf-bff4-4243-bd9d-3f3062e0ba37.png',
    color: '#F7931A'
  }
];

const ReceiveLayer = () => {
  const {
    walletStyle,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBack = () => {
    setCurrentLayer('home');
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const handleClose = () => {
    setCurrentLayer('home');
    triggerAiPetInteraction();
  };

  const handleCopyAddress = (address: string, networkName: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    triggerAiPetInteraction();
    
    toast({
      title: "Address Copied",
      description: `${networkName} address copied to clipboard`,
    });
    
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  const handleQrCode = (networkName: string) => {
    console.log('QR Code clicked for:', networkName);
    triggerAiPetInteraction();
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
          onClick={() => handleQrCode('All')}
        >
          <QrCode className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-white mb-2">Select Network</h2>
          <p className="text-xs text-gray-400">
            Choose which network you want to receive crypto on
          </p>
        </div>

        {/* Crypto Networks List */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-6">
          {cryptoNetworks.map((network) => (
            <div
              key={network.id}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                {/* Network Icon */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                </div>
                
                {/* Network Info */}
                <div>
                  <div className="font-medium text-white text-sm">
                    {network.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {network.symbol}
                  </div>
                </div>
              </div>
              
              {/* Address and Actions */}
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-300 font-mono">
                  {network.address}
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    onClick={() => handleQrCode(network.name)}
                  >
                    <QrCode className="w-4 h-4 text-gray-400 hover:text-white" />
                  </button>
                  
                  <button
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    onClick={() => handleCopyAddress(network.address, network.name)}
                  >
                    {copiedAddress === network.address ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <X className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Close</span>
        </button>
      </div>
    </div>
  );
};

export default ReceiveLayer;
