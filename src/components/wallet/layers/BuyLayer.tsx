
import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletStyles } from '@/hooks/useWalletStyles';
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
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion,
    getStyleForComponent
  } = useWalletCustomizationStore();
  
  const { getButtonStyle, getTransition } = useWalletStyles();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Get dynamic styles from the customization system
  const overlayStyle = getStyleForComponent('overlays');
  const containerStyle = getStyleForComponent('containers');
  const globalStyle = getStyleForComponent('global');
  const headerStyle = getStyleForComponent('header');
  const inputStyle = getStyleForComponent('searchInputs');
  const cardStyle = getStyleForComponent('cards');
  const buttonStyle = getStyleForComponent('buttons');

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
      className="absolute inset-0 backdrop-blur-md animate-slide-in-bottom"
      style={{
        backgroundColor: overlayStyle.backgroundColor || '#181818',
        fontFamily: globalStyle.fontFamily || 'Inter',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-white/10"
        style={{
          backgroundColor: headerStyle.backgroundColor,
          borderColor: headerStyle.border || 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{
            backgroundColor: buttonStyle.backgroundColor || 'transparent',
            color: headerStyle.textColor || '#FFFFFF',
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: getTransition('buttons'),
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <h1 
          className="text-lg font-semibold"
          style={{
            color: headerStyle.textColor || '#FFFFFF',
            fontFamily: globalStyle.fontFamily || 'Inter',
          }}
        >
          Buy Crypto
        </h1>
        
        <div className="w-[60px]"></div>
      </div>

      {/* Search Bar */}
      <div 
        className="px-4 py-4"
        style={{
          backgroundColor: containerStyle.backgroundColor,
        }}
      >
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
            style={{ color: inputStyle.textColor || '#9CA3AF' }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none transition-colors"
            style={{
              backgroundColor: inputStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
              borderColor: inputStyle.border || 'rgba(255, 255, 255, 0.1)',
              color: inputStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily || 'Inter',
              borderRadius: inputStyle.borderRadius || '12px',
              transition: getTransition('searchInputs'),
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 px-4 overflow-y-auto pb-20"
        style={{
          backgroundColor: containerStyle.backgroundColor,
        }}
      >
        {/* Get Started Section */}
        <div className="mb-6">
          <h2 
            className="text-lg font-semibold mb-4"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily || 'Inter',
            }}
          >
            Get started
          </h2>
          <div className="space-y-3">
            {getStartedTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 rounded-xl border hover:bg-white/10 transition-colors cursor-pointer"
                style={{
                  backgroundColor: cardStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                  borderColor: cardStyle.border || 'rgba(255, 255, 255, 0.1)',
                  borderRadius: cardStyle.borderRadius || '12px',
                  transition: getTransition('cards'),
                }}
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
                    <div 
                      className="font-semibold text-base"
                      style={{
                        color: cardStyle.textColor || '#FFFFFF',
                        fontFamily: globalStyle.fontFamily || 'Inter',
                      }}
                    >
                      {token.name}
                    </div>
                    <div 
                      className="text-sm"
                      style={{
                        color: cardStyle.textColor || '#9CA3AF',
                        opacity: 0.7,
                      }}
                    >
                      {token.symbol}
                    </div>
                    <div 
                      className="text-xs mt-1"
                      style={{
                        color: cardStyle.textColor || '#6B7280',
                        opacity: 0.6,
                      }}
                    >
                      {token.description}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: buttonStyle.backgroundColor || '#9945FF',
                      color: buttonStyle.textColor || '#FFFFFF',
                      borderRadius: buttonStyle.borderRadius || '8px',
                      transition: getTransition('buttons'),
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
          <h2 
            className="text-lg font-semibold mb-4"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily || 'Inter',
            }}
          >
            Popular tokens
          </h2>
          <div className="space-y-3">
            {filteredPopularTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer"
                style={{
                  backgroundColor: cardStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                  borderColor: cardStyle.border || 'rgba(255, 255, 255, 0.1)',
                  borderRadius: cardStyle.borderRadius || '12px',
                  transition: getTransition('cards'),
                }}
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
                    <div 
                      className="font-medium text-sm"
                      style={{
                        color: cardStyle.textColor || '#FFFFFF',
                        fontFamily: globalStyle.fontFamily || 'Inter',
                      }}
                    >
                      {token.name}
                    </div>
                    <div 
                      className="text-xs"
                      style={{
                        color: cardStyle.textColor || '#9CA3AF',
                        opacity: 0.7,
                      }}
                    >
                      {token.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <button
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                      color: buttonStyle.textColor || '#FFFFFF',
                      borderRadius: buttonStyle.borderRadius || '8px',
                      transition: getTransition('buttons'),
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

          {filteredPopularTokens.length === 0 && searchQuery && (
            <div className="text-center py-6">
              <p 
                className="text-sm"
                style={{
                  color: globalStyle.textColor || '#9CA3AF',
                  opacity: 0.7,
                }}
              >
                No tokens found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Close Button */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 border-t backdrop-blur-sm"
        style={{
          backgroundColor: overlayStyle.backgroundColor || 'rgba(0, 0, 0, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          style={{
            backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
            color: buttonStyle.textColor || '#FFFFFF',
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: getTransition('buttons'),
          }}
        >
          <X className="w-5 h-5" />
          <span className="font-medium">Close</span>
        </button>
      </div>
    </div>
  );
};

export default BuyLayer;
