
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SearchContent = () => {
  const { walletStyle } = useWalletCustomizationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const recentSearches = ['Bitcoin', 'Ethereum', 'Solana', 'USDC'];
  
  const trendingTokens = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: '$67,234',
      change: '+2.4%',
      icon: '₿',
      changePositive: true
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: '$3,456',
      change: '+1.8%',
      icon: 'Ξ',
      changePositive: true
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: '$184',
      change: '+5.2%',
      icon: '◎',
      changePositive: true
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: '$0.67',
      change: '',
      icon: '₳',
      changePositive: null
    }
  ];

  return (
    <div 
      className="h-full bg-gradient-to-b from-gray-900 to-gray-800 p-6 search-container"
      data-element-id="search-container"
      style={{ backgroundColor: walletStyle.backgroundColor || '#1a1a1a' }}
    >
      {/* Search Input */}
      <div 
        className="mb-6 search-input-container"
        data-element-id="search-input-container"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-800 rounded-xl text-white placeholder-gray-400 border border-gray-700 focus:border-purple-500 focus:outline-none search-input"
            data-element-id="search-input"
          />
        </div>
      </div>

      {/* Recent Searches */}
      <div 
        className="mb-6 search-recent-container"
        data-element-id="search-recent-container"
      >
        <h3 
          className="text-lg font-semibold text-white mb-3 search-recent-title"
          data-element-id="search-recent-title"
        >
          Recent
        </h3>
        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search, index) => (
            <button
              key={search}
              className={`px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors ${
                search === 'Bitcoin' ? 'search-recent-bitcoin' :
                search === 'Ethereum' ? 'search-recent-ethereum' :
                search === 'Solana' ? 'search-recent-solana' :
                search === 'USDC' ? 'search-recent-usdc' :
                'search-recent-item'
              }`}
              data-element-id={
                search === 'Bitcoin' ? 'search-recent-bitcoin' :
                search === 'Ethereum' ? 'search-recent-ethereum' :
                search === 'Solana' ? 'search-recent-solana' :
                search === 'USDC' ? 'search-recent-usdc' :
                `search-recent-item-${index}`
              }
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div 
        className="search-trending-container"
        data-element-id="search-trending-container"
      >
        <h3 
          className="text-lg font-semibold text-white mb-4 search-trending-title"
          data-element-id="search-trending-title"
        >
          Trending
        </h3>
        <div className="space-y-3">
          {trendingTokens.map((token, index) => (
            <div
              key={token.symbol}
              className={`flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors ${
                token.symbol === 'BTC' ? 'search-bitcoin-item' :
                token.symbol === 'ETH' ? 'search-ethereum-item' :
                token.symbol === 'SOL' ? 'search-solana-item' :
                token.symbol === 'ADA' ? 'search-cardano-item' :
                'search-token-item'
              }`}
              data-element-id={
                token.symbol === 'BTC' ? 'search-bitcoin-item' :
                token.symbol === 'ETH' ? 'search-ethereum-item' :
                token.symbol === 'SOL' ? 'search-solana-item' :
                token.symbol === 'ADA' ? 'search-cardano-item' :
                `search-token-item-${index}`
              }
            >
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    token.symbol === 'BTC' ? 'search-bitcoin-icon' :
                    token.symbol === 'ETH' ? 'search-ethereum-icon' :
                    token.symbol === 'SOL' ? 'search-solana-icon' :
                    token.symbol === 'ADA' ? 'search-cardano-icon' :
                    'search-token-icon'
                  }`}
                  data-element-id={
                    token.symbol === 'BTC' ? 'search-bitcoin-icon' :
                    token.symbol === 'ETH' ? 'search-ethereum-icon' :
                    token.symbol === 'SOL' ? 'search-solana-icon' :
                    token.symbol === 'ADA' ? 'search-cardano-icon' :
                    `search-token-icon-${index}`
                  }
                  style={{ backgroundColor: walletStyle.accentColor || '#9945FF' }}
                >
                  {token.icon}
                </div>
                <div>
                  <div 
                    className={`font-medium text-white ${
                      token.symbol === 'BTC' ? 'search-bitcoin-name' :
                      token.symbol === 'ETH' ? 'search-ethereum-name' :
                      token.symbol === 'SOL' ? 'search-solana-name' :
                      token.symbol === 'ADA' ? 'search-cardano-name' :
                      'search-token-name'
                    }`}
                    data-element-id={
                      token.symbol === 'BTC' ? 'search-bitcoin-name' :
                      token.symbol === 'ETH' ? 'search-ethereum-name' :
                      token.symbol === 'SOL' ? 'search-solana-name' :
                      token.symbol === 'ADA' ? 'search-cardano-name' :
                      `search-token-name-${index}`
                    }
                  >
                    {token.name}
                  </div>
                  <div 
                    className={`text-sm text-gray-400 ${
                      token.symbol === 'BTC' ? 'search-bitcoin-symbol' :
                      token.symbol === 'ETH' ? 'search-ethereum-symbol' :
                      token.symbol === 'SOL' ? 'search-solana-symbol' :
                      token.symbol === 'ADA' ? 'search-cardano-symbol' :
                      'search-token-symbol'
                    }`}
                    data-element-id={
                      token.symbol === 'BTC' ? 'search-bitcoin-symbol' :
                      token.symbol === 'ETH' ? 'search-ethereum-symbol' :
                      token.symbol === 'SOL' ? 'search-solana-symbol' :
                      token.symbol === 'ADA' ? 'search-cardano-symbol' :
                      `search-token-symbol-${index}`
                    }
                  >
                    {token.symbol}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className={`font-semibold text-white ${
                    token.symbol === 'BTC' ? 'search-bitcoin-price' :
                    token.symbol === 'ETH' ? 'search-ethereum-price' :
                    token.symbol === 'SOL' ? 'search-solana-price' :
                    token.symbol === 'ADA' ? 'search-cardano-price' :
                    'search-token-price'
                  }`}
                  data-element-id={
                    token.symbol === 'BTC' ? 'search-bitcoin-price' :
                    token.symbol === 'ETH' ? 'search-ethereum-price' :
                    token.symbol === 'SOL' ? 'search-solana-price' :
                    token.symbol === 'ADA' ? 'search-cardano-price' :
                    `search-token-price-${index}`
                  }
                >
                  {token.price}
                </div>
                {token.change && (
                  <div 
                    className={`text-sm ${
                      token.changePositive ? 'text-green-400' : 'text-red-400'
                    } ${
                      token.symbol === 'BTC' ? 'search-bitcoin-change' :
                      token.symbol === 'ETH' ? 'search-ethereum-change' :
                      token.symbol === 'SOL' ? 'search-solana-change' :
                      'search-token-change'
                    }`}
                    data-element-id={
                      token.symbol === 'BTC' ? 'search-bitcoin-change' :
                      token.symbol === 'ETH' ? 'search-ethereum-change' :
                      token.symbol === 'SOL' ? 'search-solana-change' :
                      `search-token-change-${index}`
                    }
                  >
                    {token.change}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchContent;
