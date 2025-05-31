
import React, { useState } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SearchContent = () => {
  const {
    walletStyle,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches] = useState([
    'Bitcoin',
    'Ethereum',
    'Solana',
    'USDC'
  ]);

  const [trendingTokens] = useState([
    { name: 'Bitcoin', symbol: 'BTC', price: '$67,234', change: '+2.4%', icon: '₿' },
    { name: 'Ethereum', symbol: 'ETH', price: '$3,456', change: '+1.8%', icon: 'Ξ' },
    { name: 'Solana', symbol: 'SOL', price: '$184', change: '+5.2%', icon: '◎' },
    { name: 'Cardano', symbol: 'ADA', price: '$0.67', change: '-0.5%', icon: '₳' }
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log(`Searching for: ${query}`);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto">
      {/* Search Input */}
      <div className="mb-6 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search tokens, NFTs, transactions..."
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            style={{ fontFamily: walletStyle.font || 'Inter' }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {!searchQuery ? (
        <>
          {/* Recent Searches */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Recent Searches</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="px-3 py-2 bg-white/5 rounded-lg text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Tokens */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Trending</h3>
            </div>
            <div className="space-y-2">
              {trendingTokens.map((token, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(token.name)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="text-lg">{token.icon}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">{token.name}</div>
                      <div className="text-gray-400 text-sm">{token.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{token.price}</div>
                    <div className={`text-sm ${token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {token.change}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            Searching for "{searchQuery}"...
          </div>
          <div className="text-sm text-gray-500">
            Search functionality coming soon
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchContent;
