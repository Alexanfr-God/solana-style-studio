
import React, { useState } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SearchContent = () => {
  const {
    getStyleForComponent
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

  // Get component-specific styles
  const searchInputStyle = getStyleForComponent('searchInputs');
  const panelStyle = getStyleForComponent('panels');
  const containerStyle = getStyleForComponent('containers');
  const buttonStyle = getStyleForComponent('buttons');
  const globalStyle = getStyleForComponent('global');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log(`Searching for: ${query}`);
  };

  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    handleSearch(search);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto search-content" data-element-id="search-content">
      {/* Search Input */}
      <div className="mb-6 pt-4">
        <div className="relative search-input-container" data-element-id="search-input-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 search-input-icon" data-element-id="search-input-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search tokens, NFTs, transactions..."
            className="w-full pl-10 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors search-input"
            data-element-id="search-input"
            style={{
              backgroundColor: searchInputStyle.backgroundColor || 'rgba(255, 255, 255, 0.08)',
              border: searchInputStyle.border || '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: searchInputStyle.borderRadius || '12px',
              fontFamily: globalStyle.fontFamily,
              color: searchInputStyle.textColor,
              backdropFilter: searchInputStyle.backdropFilter,
              transition: searchInputStyle.transition
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-white transition-colors search-clear"
              data-element-id="search-clear"
              style={{ transition: buttonStyle.transition }}
            >
              <X className="w-5 h-5 search-clear-icon" data-element-id="search-clear-icon" />
            </button>
          )}
        </div>
      </div>

      {!searchQuery ? (
        <>
          {/* Recent Searches */}
          <div className="mb-6 search-recent-section" data-element-id="search-recent-section">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400 search-recent-icon" data-element-id="search-recent-icon" />
              <h3 
                className="text-sm font-medium text-gray-300 search-recent-title"
                data-element-id="search-recent-title"
                style={{
                  color: globalStyle.textColor || '#D1D5DB',
                  fontFamily: globalStyle.fontFamily
                }}
              >
                Recent Searches
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 search-recent-items" data-element-id="search-recent-items">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="px-3 py-2 text-sm transition-colors hover:scale-105 search-recent-item"
                  data-element-id={`search-recent-item-${index}`}
                  style={{
                    backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                    borderRadius: panelStyle.borderRadius || '8px',
                    color: globalStyle.textColor || '#D1D5DB',
                    fontFamily: globalStyle.fontFamily,
                    transition: panelStyle.transition
                  }}
                >
                  <span className="search-recent-item-text" data-element-id={`search-recent-item-text-${index}`}>
                    {search}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Tokens */}
          <div className="search-trending-section" data-element-id="search-trending-section">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-400 search-trending-icon" data-element-id="search-trending-icon" />
              <h3 
                className="text-sm font-medium text-gray-300 search-trending-title"
                data-element-id="search-trending-title"
                style={{
                  color: globalStyle.textColor || '#D1D5DB',
                  fontFamily: globalStyle.fontFamily
                }}
              >
                Trending
              </h3>
            </div>
            <div className="space-y-2 search-trending-items" data-element-id="search-trending-items">
              {trendingTokens.map((token, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(token.name)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors search-trending-item"
                  data-element-id={`search-trending-item-${index}`}
                  style={{
                    backgroundColor: containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                    borderRadius: containerStyle.borderRadius || '12px',
                    border: containerStyle.border,
                    backdropFilter: containerStyle.backdropFilter,
                    transition: containerStyle.transition
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center search-trending-token-icon-container"
                      data-element-id={`search-trending-token-icon-container-${index}`}
                      style={{
                        backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%'
                      }}
                    >
                      <span className="text-lg search-trending-token-icon" data-element-id={`search-trending-token-icon-${index}`}>
                        {token.icon}
                      </span>
                    </div>
                    <div className="text-left">
                      <div 
                        className="text-white font-medium search-trending-token-name"
                        data-element-id={`search-trending-token-name-${index}`}
                        style={{
                          color: globalStyle.textColor || '#FFFFFF',
                          fontFamily: globalStyle.fontFamily
                        }}
                      >
                        {token.name}
                      </div>
                      <div 
                        className="text-gray-400 text-sm search-trending-token-symbol"
                        data-element-id={`search-trending-token-symbol-${index}`}
                        style={{ fontFamily: globalStyle.fontFamily }}
                      >
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-white font-medium search-trending-token-price"
                      data-element-id={`search-trending-token-price-${index}`}
                      style={{
                        color: globalStyle.textColor || '#FFFFFF',
                        fontFamily: globalStyle.fontFamily
                      }}
                    >
                      {token.price}
                    </div>
                    <div 
                      className={`text-sm search-trending-token-change ${token.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
                      data-element-id={`search-trending-token-change-${index}`}
                      style={{ fontFamily: globalStyle.fontFamily }}
                    >
                      {token.change}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 search-results" data-element-id="search-results">
          <div 
            className="text-gray-400 mb-4 search-results-query"
            data-element-id="search-results-query"
            style={{ fontFamily: globalStyle.fontFamily }}
          >
            Searching for "{searchQuery}"...
          </div>
          <div 
            className="text-sm text-gray-500 search-results-message"
            data-element-id="search-results-message"
            style={{ fontFamily: globalStyle.fontFamily }}
          >
            Search functionality coming soon
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchContent;
