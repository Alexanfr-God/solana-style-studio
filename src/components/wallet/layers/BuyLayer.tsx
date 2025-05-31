
import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useToast } from '@/hooks/use-toast';

interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  description: string;
  isGetStarted?: boolean;
}

const getStartedTokens: Token[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '/lovable-uploads/72224164-59bd-4fc3-abf5-d57bbdbee278.png',
    color: '#9945FF',
    description: 'Fast, secure and censorship resistant blockchain',
    isGetStarted: true
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '/lovable-uploads/ac5b7bea-562a-4609-a80b-c37750039adc.png',
    color: '#2775CA',
    description: 'Digital dollar for the internet',
    isGetStarted: true
  }
];

const popularTokens: Token[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA',
    description: 'Decentralized platform for smart contracts'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '/lovable-uploads/f57c7d94-7776-485c-8d15-e2da5c9c80b4.png',
    color: '#F7931A',
    description: 'The original cryptocurrency'
  }
];

const BuyLayer = () => {
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

  const handleTokenBuy = (tokenName: string) => {
    console.log('Buy token clicked:', tokenName);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
    
    toast({
      title: "Buy Token",
      description: `Starting purchase process for ${tokenName}`,
    });
  };

  const filteredPopularTokens = popularTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
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
        
        <h1 className="text-lg font-semibold text-white">Buy Crypto</h1>
        
        <div className="w-[60px]"></div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
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
      <div className="flex-1 px-4 overflow-y-auto pb-20">
        {/* Get Started Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Get started</h2>
          <div className="space-y-3">
            {getStartedTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleTokenBuy(token.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-base">
                      {token.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {token.description}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: walletStyle.primaryColor || '#9945FF',
                      color: 'white'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTokenBuy(token.name);
                    }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tokens Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Popular tokens</h2>
          <div className="space-y-3">
            {filteredPopularTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleTokenBuy(token.name)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">
                      {token.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {token.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTokenBuy(token.name);
                    }}
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPopularTokens.length === 0 && searchQuery && (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No tokens found</p>
            </div>
          )}
        </div>
      </div>

      {/* Close Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/80 backdrop-blur-sm">
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

export default BuyLayer;
