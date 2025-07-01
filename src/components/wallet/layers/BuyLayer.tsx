
import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

interface BuyLayerProps {
  onBack: () => void;
}

const BuyLayer = ({ onBack }: BuyLayerProps) => {
  const { walletStyle } = useWalletCustomizationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const getStartedTokens = [
    {
      name: 'Solana',
      description: 'Fast, secure and censorship resistant blockchain',
      icon: '◎'
    },
    {
      name: 'USD Coin',
      description: 'Digital dollar for the internet',
      icon: '$'
    }
  ];

  const popularTokens = [
    {
      name: 'Ethereum',
      description: 'Decentralized platform for smart contracts',
      icon: 'Ξ'
    },
    {
      name: 'Bitcoin',
      description: 'The original cryptocurrency',
      icon: '₿'
    }
  ];

  return (
    <div 
      className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col buy-container"
      data-element-id="buy-container"
      style={{ 
        backgroundColor: walletStyle.backgroundColor || '#1a1a1a',
        fontFamily: walletStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors buy-back-button"
          data-element-id="buy-back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 
          className="text-lg font-semibold buy-title"
          data-element-id="buy-title"
        >
          Buy
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Search */}
      <div 
        className="p-4 buy-search-container"
        data-element-id="buy-search-container"
      >
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 buy-search-icon"
            data-element-id="buy-search-icon"
          />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:border-purple-500 focus:outline-none buy-search-input"
            data-element-id="buy-search-input"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Get Started Section */}
        <div 
          className="buy-get-started-container"
          data-element-id="buy-get-started-container"
        >
          <h2 
            className="text-lg font-semibold mb-4 buy-get-started-title"
            data-element-id="buy-get-started-title"
          >
            Get started
          </h2>
          <div className="space-y-3">
            {getStartedTokens.map((token, index) => (
              <div
                key={token.name}
                className={`flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors ${
                  index === 0 ? 'buy-solana-item' : 'buy-usdc-item'
                }`}
                data-element-id={index === 0 ? 'buy-solana-item' : 'buy-usdc-item'}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'buy-solana-icon' : 'buy-usdc-icon'
                    }`}
                    data-element-id={index === 0 ? 'buy-solana-icon' : 'buy-usdc-icon'}
                    style={{ backgroundColor: walletStyle.accentColor || '#9945FF' }}
                  >
                    {token.icon}
                  </div>
                  <div>
                    <div 
                      className={`font-medium text-white ${
                        index === 0 ? 'buy-solana-name' : 'buy-usdc-name'
                      }`}
                      data-element-id={index === 0 ? 'buy-solana-name' : 'buy-usdc-name'}
                    >
                      {token.name}
                    </div>
                    <div 
                      className={`text-sm text-gray-400 ${
                        index === 0 ? 'buy-solana-description' : 'buy-usdc-description'
                      }`}
                      data-element-id={index === 0 ? 'buy-solana-description' : 'buy-usdc-description'}
                    >
                      {token.description}
                    </div>
                  </div>
                </div>
                <button 
                  className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors ${
                    index === 0 ? 'buy-solana-button' : 'buy-usdc-button'
                  }`}
                  data-element-id={index === 0 ? 'buy-solana-button' : 'buy-usdc-button'}
                  style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Section */}
        <div 
          className="buy-popular-container"
          data-element-id="buy-popular-container"
        >
          <h2 
            className="text-lg font-semibold mb-4 buy-popular-title"
            data-element-id="buy-popular-title"
          >
            Popular
          </h2>
          <div className="space-y-3">
            {popularTokens.map((token, index) => (
              <div
                key={token.name}
                className={`flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors ${
                  index === 0 ? 'buy-ethereum-item' : 'buy-bitcoin-item'
                }`}
                data-element-id={index === 0 ? 'buy-ethereum-item' : 'buy-bitcoin-item'}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'buy-ethereum-icon' : 'buy-bitcoin-icon'
                    }`}
                    data-element-id={index === 0 ? 'buy-ethereum-icon' : 'buy-bitcoin-icon'}
                    style={{ backgroundColor: walletStyle.accentColor || '#9945FF' }}
                  >
                    {token.icon}
                  </div>
                  <div>
                    <div 
                      className={`font-medium text-white ${
                        index === 0 ? 'buy-ethereum-name' : 'buy-bitcoin-name'
                      }`}
                      data-element-id={index === 0 ? 'buy-ethereum-name' : 'buy-bitcoin-name'}
                    >
                      {token.name}
                    </div>
                    <div 
                      className={`text-sm text-gray-400 ${
                        index === 0 ? 'buy-ethereum-description' : 'buy-bitcoin-description'
                      }`}
                      data-element-id={index === 0 ? 'buy-ethereum-description' : 'buy-bitcoin-description'}
                    >
                      {token.description}
                    </div>
                  </div>
                </div>
                <button 
                  className={`px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors ${
                    index === 0 ? 'buy-ethereum-button' : 'buy-bitcoin-button'
                  }`}
                  data-element-id={index === 0 ? 'buy-ethereum-button' : 'buy-bitcoin-button'}
                  style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
                >
                  Buy
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyLayer;
