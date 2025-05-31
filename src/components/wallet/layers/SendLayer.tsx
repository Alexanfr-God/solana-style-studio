
import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useToast } from '@/hooks/use-toast';

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  balanceUsd: string;
  icon: string;
  color: string;
  isSpecial?: boolean;
}

const cryptoNetworks: CryptoNetwork[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    balance: '5.03737',
    balanceUsd: '$1,127.61',
    icon: '/lovable-uploads/72224164-59bd-4fc3-abf5-d57bbdbee278.png',
    color: '#9945FF'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA'
  },
  {
    id: 'ethereum-theta',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA',
    isSpecial: true
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/9dd9ce9c-2158-40cf-98ee-2e189bd56595.png',
    color: '#4CA2FF'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
    color: '#8247E5'
  }
];

const SendLayer = () => {
  const {
    walletStyle,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleNetworkSelect = (networkName: string) => {
    console.log('Network selected:', networkName);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
    
    toast({
      title: "Network Selected",
      description: `Selected ${networkName} for sending`,
    });
  };

  const filteredNetworks = cryptoNetworks.filter(network =>
    network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    network.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        
        <h1 className="text-lg font-semibold text-white">Send Crypto</h1>
        
        <div className="w-[60px]"></div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-colors"
            style={{ fontFamily: walletStyle.font || 'Inter' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-white mb-2">Select Network</h2>
          <p className="text-xs text-gray-400">
            Choose which network you want to send crypto from
          </p>
        </div>

        {/* Crypto Networks List */}
        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mb-6">
          {filteredNetworks.map((network) => (
            <div
              key={network.id}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 cursor-pointer"
              onClick={() => handleNetworkSelect(network.name)}
            >
              <div className="flex items-center space-x-3">
                {/* Network Icon */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center relative">
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  {network.isSpecial && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      Θ
                    </div>
                  )}
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
              
              {/* Balance */}
              <div className="text-right">
                <div className="font-medium text-white text-sm">
                  {network.balance} {network.symbol}
                </div>
                <div className="text-xs text-gray-400">
                  {network.balanceUsd}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNetworks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No networks found</p>
          </div>
        )}
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

export default SendLayer;
