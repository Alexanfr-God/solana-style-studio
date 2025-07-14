
import React, { useState } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const SearchContent = () => {
  const { getSearchLayer, getAssetCard, getGlobal } = useWalletTheme();

  // Get layer-specific styles
  const searchStyle = getSearchLayer();
  const assetCard = getAssetCard();
  const globalStyle = getGlobal();

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
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 search-input-icon" 
            data-element-id="search-input-icon"
            style={{ color: searchStyle.searchInput?.iconSearch?.color || '#aaa' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search tokens, NFTs, transactions..."
            className="w-full pl-10 pr-10 py-3 focus:outline-none transition-colors search-input"
            data-element-id="search-input"
            style={{
              backgroundColor: searchStyle.searchInput?.backgroundColor || '#181818',
              border: searchStyle.searchInput?.border || 'none',
              borderRadius: searchStyle.searchInput?.borderRadius || '12px',
              fontFamily: searchStyle.searchInputFont?.fontFamily || globalStyle.fontFamily,
              fontSize: searchStyle.searchInputFont?.fontSize || '15px',
              color: searchStyle.searchInputFont?.textColor || '#fff',
              transition: globalStyle.transition || 'all 0.2s ease'
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 hover:scale-110 transition-transform search-clear"
              data-element-id="search-clear"
            >
              <X 
                className="w-5 h-5 search-clear-icon" 
                data-element-id="search-clear-icon"
                style={{ color: searchStyle.searchInput?.iconClose?.color || '#aaa' }}
              />
            </button>
          )}
        </div>
      </div>

      {!searchQuery ? (
        <>
          {/* Recent Searches */}
          <div className="mb-6 search-recent-section" data-element-id="search-recent-section">
            <div className="flex items-center gap-2 mb-3">
              <Clock 
                className="w-4 h-4 search-recent-icon" 
                data-element-id="search-recent-icon"
                style={{ color: searchStyle.recentSearchesLabel?.iconTime?.color || '#fff' }}
              />
              <h3 
                className="text-sm font-medium search-recent-title"
                data-element-id="search-recent-title"
                style={{
                  color: searchStyle.recentSearchesLabel?.textColor || '#fff',
                  fontFamily: searchStyle.recentSearchesLabel?.fontFamily || globalStyle.fontFamily,
                  fontWeight: searchStyle.recentSearchesLabel?.fontWeight || 'bold',
                  fontSize: searchStyle.recentSearchesLabel?.fontSize || '17px'
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
                    backgroundColor: searchStyle.tokenTag?.backgroundColor || '#232323',
                    borderRadius: searchStyle.tokenTag?.borderRadius || '10px',
                    color: searchStyle.tokenTag?.textColor || '#fff',
                    fontFamily: searchStyle.tokenTag?.fontFamily || globalStyle.fontFamily,
                    fontSize: searchStyle.tokenTag?.fontSize || '14px',
                    transition: globalStyle.transition || 'all 0.2s ease'
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Tokens - Using assetCard */}
          <div className="search-trending-section" data-element-id="search-trending-section">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp 
                className="w-4 h-4 search-trending-icon" 
                data-element-id="search-trending-icon"
                style={{ color: searchStyle.trendingLabel?.iconTrending?.color || '#13e163' }}
              />
              <h3 
                className="text-sm font-medium search-trending-title"
                data-element-id="search-trending-title"
                style={{
                  color: searchStyle.trendingLabel?.textColor || '#fff',
                  fontFamily: searchStyle.trendingLabel?.fontFamily || globalStyle.fontFamily,
                  fontWeight: searchStyle.trendingLabel?.fontWeight || 'bold',
                  fontSize: searchStyle.trendingLabel?.fontSize || '17px'
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
                  className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors search-trending-item"
                  data-element-id={`search-trending-item-${index}`}
                  style={{
                    backgroundColor: assetCard.backgroundColor || '#232323',
                    borderRadius: assetCard.borderRadius || '15px',
                    transition: globalStyle.transition || 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center search-trending-token-icon-container-${index}`}
                      data-element-id={`search-trending-token-icon-container-${index}`}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%'
                      }}
                    >
                      <span className={`text-lg search-trending-token-icon-${index}`} data-element-id={`search-trending-token-icon-${index}`}>
                        {token.icon}
                      </span>
                    </div>
                    <div className="text-left">
                      <div 
                        className="font-medium search-trending-token-name"
                        data-element-id={`search-trending-token-name-${index}`}
                        style={{
                          color: assetCard.title?.textColor || '#fff',
                          fontFamily: assetCard.title?.fontFamily || globalStyle.fontFamily
                        }}
                      >
                        {token.name}
                      </div>
                      <div 
                        className="text-sm search-trending-token-symbol"
                        data-element-id={`search-trending-token-symbol-${index}`}
                        style={{ 
                          color: assetCard.description?.textColor || '#aaa',
                          fontFamily: assetCard.description?.fontFamily || globalStyle.fontFamily
                        }}
                      >
                        {token.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="font-medium search-trending-token-price"
                      data-element-id={`search-trending-token-price-${index}`}
                      style={{
                        color: assetCard.value?.textColor || '#fff',
                        fontFamily: assetCard.value?.fontFamily || globalStyle.fontFamily
                      }}
                    >
                      {token.price}
                    </div>
                    <div 
                      className="text-sm search-trending-token-change"
                      data-element-id={`search-trending-token-change-${index}`}
                      style={{ 
                        color: token.change.startsWith('+') 
                          ? assetCard.percent?.positiveColor || '#13e163'
                          : assetCard.percent?.negativeColor || '#ff5959',
                        fontFamily: assetCard.percent?.fontFamily || globalStyle.fontFamily
                      }}
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
            className="mb-4 search-results-query"
            data-element-id="search-results-query"
            style={{ 
              color: assetCard.description?.textColor || '#aaa',
              fontFamily: globalStyle.fontFamily 
            }}
          >
            Searching for "{searchQuery}"...
          </div>
          <div 
            className="text-sm search-results-message"
            data-element-id="search-results-message"
            style={{ 
              color: assetCard.description?.textColor || '#aaa',
              fontFamily: globalStyle.fontFamily 
            }}
          >
            Search functionality coming soon
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchContent;
