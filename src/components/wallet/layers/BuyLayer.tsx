
import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
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
  const { setCurrentLayer } = useWalletCustomizationStore();
  const { getBuyLayer, getTransition } = useWalletTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Get buy layer theme styles
  const buyLayerStyle = getBuyLayer();

  const handleBack = () => {
    setCurrentLayer('home');
  };

  const handleClose = () => {
    setCurrentLayer('home');
  };

  const handleTokenBuy = (tokenName: string) => {
    console.log('Buy token clicked:', tokenName);
    
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
      className="absolute inset-0 backdrop-blur-md animate-slide-in-bottom buy-layer"
      data-element-id="buy-layer"
      style={{
        backgroundColor: buyLayerStyle.headerContainer?.backgroundColor || '#181818',
        fontFamily: buyLayerStyle.header?.title?.fontFamily || 'Inter',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 buy-header"
        data-element-id="buy-header"
        style={{
          backgroundColor: buyLayerStyle.headerContainer?.backgroundColor,
          borderRadius: buyLayerStyle.headerContainer?.borderRadius || '0px',
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 p-2 rounded-lg transition-colors buy-back-button"
          data-element-id="buy-back-button"
          style={{
            backgroundColor: buyLayerStyle.header?.backButton?.backgroundColor || '#FFD166',
            borderRadius: buyLayerStyle.header?.backButton?.borderRadius || '14px',
            transition: getTransition('default'),
          }}
        >
          <ArrowLeft 
            className="w-5 h-5 buy-back-icon" 
            data-element-id="buy-back-icon"
            style={{ color: buyLayerStyle.header?.backButton?.icon?.color || '#181818' }}
          />
          <span 
            className="font-medium buy-back-text" 
            data-element-id="buy-back-text"
            style={{
              color: buyLayerStyle.header?.backButton?.text?.textColor || '#181818',
              fontFamily: buyLayerStyle.header?.backButton?.text?.fontFamily || 'Inter',
              fontWeight: buyLayerStyle.header?.backButton?.text?.fontWeight || 'bold',
              fontSize: buyLayerStyle.header?.backButton?.text?.fontSize || '17px',
            }}
          >
            Back
          </span>
        </button>
        
        <h1 
          className="text-lg font-semibold buy-title"
          data-element-id="buy-title"
          style={{
            color: buyLayerStyle.header?.title?.textColor || '#FFD166',
            fontFamily: buyLayerStyle.header?.title?.fontFamily || 'Inter',
            fontWeight: buyLayerStyle.header?.title?.fontWeight || 'bold',
            fontSize: buyLayerStyle.header?.title?.fontSize || '26px',
          }}
        >
          Buy Crypto
        </h1>
        
        <div className="w-[60px] buy-header-spacer" data-element-id="buy-header-spacer"></div>
      </div>

      {/* Search Bar */}
      <div 
        className="px-4 py-4 buy-search-container"
        data-element-id="buy-search-container"
      >
        <div 
          className="relative buy-search-input-container" 
          data-element-id="buy-search-input-container"
          style={{
            backgroundColor: buyLayerStyle.searchInputContainer?.backgroundColor || '#13e163',
            borderRadius: buyLayerStyle.searchInputContainer?.borderRadius || '14px',
            padding: '12px',
          }}
        >
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 buy-search-icon" 
            data-element-id="buy-search-icon"
            style={{ color: buyLayerStyle.searchInput?.iconSearch?.color || '#fff' }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent focus:outline-none transition-colors buy-search-input"
            data-element-id="buy-search-input"
            style={{
              color: buyLayerStyle.searchInput?.textColor || '#fff',
              fontFamily: buyLayerStyle.searchInput?.fontFamily || 'Inter',
              fontSize: buyLayerStyle.searchInput?.fontSize || '16px',
              transition: getTransition('default'),
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        className="flex-1 px-4 py-4 overflow-y-auto buy-content" 
        data-element-id="buy-content"
        style={{
          backgroundColor: buyLayerStyle.centerContainer?.backgroundColor,
          borderRadius: buyLayerStyle.centerContainer?.borderRadius || '0px',
        }}
      >
        {/* Get Started Section */}
        <div className="mb-6 buy-get-started-section" data-element-id="buy-get-started-section">
          <h2 
            className="text-sm font-medium mb-3 buy-get-started-title"
            data-element-id="buy-get-started-title"
            style={{
              color: buyLayerStyle.sectionLabel?.getStarted?.textColor || '#5f4025',
              fontFamily: buyLayerStyle.sectionLabel?.getStarted?.fontFamily || 'Inter',
              fontWeight: buyLayerStyle.sectionLabel?.getStarted?.fontWeight || 'bold',
              fontSize: buyLayerStyle.sectionLabel?.getStarted?.fontSize || '18px',
            }}
          >
            Get started
          </h2>
          <div className="space-y-3 buy-get-started-tokens" data-element-id="buy-get-started-tokens">
            {getStartedTokens.map((token, index) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 cursor-pointer hover:opacity-90 transition-opacity buy-get-started-token"
                data-element-id={`buy-get-started-token-${index}`}
                onClick={() => handleTokenBuy(token.name)}
                style={{
                  backgroundColor: buyLayerStyle.tokenCard?.backgroundColor || '#613c19',
                  borderRadius: buyLayerStyle.tokenCard?.borderRadius || '18px',
                  transition: getTransition('default'),
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center buy-get-started-token-icon-container" data-element-id={`buy-get-started-token-icon-container-${index}`}>
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-8 h-8 object-cover rounded buy-get-started-token-icon"
                      data-element-id={`buy-get-started-token-icon-${index}`}
                    />
                  </div>
                  <div className="buy-get-started-token-info" data-element-id={`buy-get-started-token-info-${index}`}>
                    <div 
                      className="font-medium text-sm buy-get-started-token-name"
                      data-element-id={`buy-get-started-token-name-${index}`}
                      style={{
                        color: buyLayerStyle.tokenCardContent?.tokenName?.textColor || '#fff',
                        fontFamily: buyLayerStyle.tokenCardContent?.tokenName?.fontFamily || 'Inter',
                        fontWeight: buyLayerStyle.tokenCardContent?.tokenName?.fontWeight || 'normal',
                        fontSize: buyLayerStyle.tokenCardContent?.tokenName?.fontSize || '16px',
                      }}
                    >
                      {token.name}
                    </div>
                    <div 
                      className="text-xs buy-get-started-token-description"
                      data-element-id={`buy-get-started-token-description-${index}`}
                      style={{ 
                        color: buyLayerStyle.tokenCardContent?.tokenDescription?.textColor || '#d0d0d0',
                        fontFamily: buyLayerStyle.tokenCardContent?.tokenDescription?.fontFamily || 'Inter',
                        fontWeight: buyLayerStyle.tokenCardContent?.tokenDescription?.fontWeight || 'normal',
                        fontSize: buyLayerStyle.tokenCardContent?.tokenDescription?.fontSize || '15px',
                      }}
                    >
                      {token.description}
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 font-medium transition-colors hover:scale-105 buy-get-started-token-button"
                  data-element-id={`buy-get-started-token-button-${index}`}
                  style={{
                    backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
                    color: buyLayerStyle.buyButton?.textColor || '#181818',
                    borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px',
                    fontFamily: buyLayerStyle.buyButton?.fontFamily || 'Inter',
                    fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
                    fontSize: buyLayerStyle.buyButton?.fontSize || '18px',
                    transition: getTransition('default'),
                  }}
                >
                  <span className="buy-get-started-token-button-text" data-element-id={`buy-get-started-token-button-text-${index}`}>
                    Buy
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Tokens Section */}
        <div className="mb-6 buy-popular-section" data-element-id="buy-popular-section">
          <h2 
            className="text-sm font-medium mb-3 buy-popular-title"
            data-element-id="buy-popular-title"
            style={{
              color: buyLayerStyle.sectionLabel?.popular?.textColor || '#5f4025',
              fontFamily: buyLayerStyle.sectionLabel?.popular?.fontFamily || 'Inter',
              fontWeight: buyLayerStyle.sectionLabel?.popular?.fontWeight || 'bold',
              fontSize: buyLayerStyle.sectionLabel?.popular?.fontSize || '18px',
            }}
          >
            Popular
          </h2>
          <div className="space-y-3 buy-popular-tokens" data-element-id="buy-popular-tokens">
            {filteredPopularTokens.map((token, index) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-4 cursor-pointer hover:opacity-90 transition-opacity buy-popular-token"
                data-element-id={`buy-popular-token-${index}`}
                onClick={() => handleTokenBuy(token.name)}
                style={{
                  backgroundColor: buyLayerStyle.tokenCard?.backgroundColor || '#613c19',
                  borderRadius: buyLayerStyle.tokenCard?.borderRadius || '18px',
                  transition: getTransition('default'),
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center buy-popular-token-icon-container" data-element-id={`buy-popular-token-icon-container-${index}`}>
                    <img
                      src={token.icon}
                      alt={token.name}
                      className="w-8 h-8 object-cover rounded buy-popular-token-icon"
                      data-element-id={`buy-popular-token-icon-${index}`}
                    />
                  </div>
                  <div className="buy-popular-token-info" data-element-id={`buy-popular-token-info-${index}`}>
                    <div 
                      className="font-medium text-sm buy-popular-token-name"
                      data-element-id={`buy-popular-token-name-${index}`}
                      style={{
                        color: buyLayerStyle.tokenCardContent?.tokenName?.textColor || '#fff',
                        fontFamily: buyLayerStyle.tokenCardContent?.tokenName?.fontFamily || 'Inter',
                        fontWeight: buyLayerStyle.tokenCardContent?.tokenName?.fontWeight || 'normal',
                        fontSize: buyLayerStyle.tokenCardContent?.tokenName?.fontSize || '16px',
                      }}
                    >
                      {token.name}
                    </div>
                    <div 
                      className="text-xs buy-popular-token-description"
                      data-element-id={`buy-popular-token-description-${index}`}
                      style={{ 
                        color: buyLayerStyle.tokenCardContent?.tokenDescription?.textColor || '#d0d0d0',
                        fontFamily: buyLayerStyle.tokenCardContent?.tokenDescription?.fontFamily || 'Inter',
                        fontWeight: buyLayerStyle.tokenCardContent?.tokenDescription?.fontWeight || 'normal',
                        fontSize: buyLayerStyle.tokenCardContent?.tokenDescription?.fontSize || '15px',
                      }}
                    >
                      {token.description}
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 font-medium transition-colors hover:scale-105 buy-popular-token-button"
                  data-element-id={`buy-popular-token-button-${index}`}
                  style={{
                    backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
                    color: buyLayerStyle.buyButton?.textColor || '#181818',
                    borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px',
                    fontFamily: buyLayerStyle.buyButton?.fontFamily || 'Inter',
                    fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
                    fontSize: buyLayerStyle.buyButton?.fontSize || '18px',
                    transition: getTransition('default'),
                  }}
                >
                  <span className="buy-popular-token-button-text" data-element-id={`buy-popular-token-button-text-${index}`}>
                    Buy
                  </span>
                </button>
              </div>
            ))}
          </div>

          {filteredPopularTokens.length === 0 && searchQuery && (
            <div className="text-center py-8 buy-no-results" data-element-id="buy-no-results">
              <p 
                className="text-sm buy-no-results-text"
                data-element-id="buy-no-results-text"
                style={{ 
                  color: buyLayerStyle.tokenCardContent?.tokenDescription?.textColor || '#d0d0d0',
                  fontFamily: buyLayerStyle.tokenCardContent?.tokenDescription?.fontFamily || 'Inter' 
                }}
              >
                No tokens found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Close Button */}
      <div 
        className="p-4 border-t buy-footer"
        data-element-id="buy-footer"
        style={{ 
          backgroundColor: buyLayerStyle.footerContainer?.backgroundColor || '#181818',
          borderRadius: buyLayerStyle.footerContainer?.borderRadius || '0px',
          borderColor: 'rgba(255, 255, 255, 0.1)' 
        }}
      >
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 transition-colors flex items-center justify-center space-x-2 buy-close-button"
          data-element-id="buy-close-button"
          style={{
            backgroundColor: buyLayerStyle.buyButton?.backgroundColor || '#FFD166',
            borderRadius: buyLayerStyle.buyButton?.borderRadius || '14px',
            transition: getTransition('default'),
            color: buyLayerStyle.buyButton?.textColor || '#181818',
            fontFamily: buyLayerStyle.buyButton?.fontFamily || 'Inter',
            fontWeight: buyLayerStyle.buyButton?.fontWeight || 'bold',
          }}
        >
          <X className="w-5 h-5 buy-close-icon" data-element-id="buy-close-icon" />
          <span className="font-medium buy-close-text" data-element-id="buy-close-text">Close</span>
        </button>
      </div>
    </div>
  );
};

export default BuyLayer;
