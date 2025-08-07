
import React, { useState, useEffect } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const SearchContent = () => {
  const { getGlobalSearchInput, getSearchLayer, getTokenElements, getGlobal } = useWalletTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const globalSearchInput = getGlobalSearchInput();
  const searchLayer = getSearchLayer();
  const tokenElements = getTokenElements();
  const globalStyle = getGlobal();

  // Sample data for tokens
  const recentSearches = ['Bitcoin', 'Ethereum', 'Solana'];
  
  const trendingTokens = [
    { 
      name: 'Bitcoin', 
      symbol: 'BTC', 
      price: '$65,432.10', 
      change: '+2.5%',
      isPositive: true
    },
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      price: '$3,245.67', 
      change: '-1.2%',
      isPositive: false
    },
    { 
      name: 'Solana', 
      symbol: 'SOL', 
      price: '$145.89', 
      change: '+5.8%',
      isPositive: true
    },
    { 
      name: 'Cardano', 
      symbol: 'ADA', 
      price: '$0.89', 
      change: '0.0%',
      isPositive: null
    }
  ];

  const filteredTokens = searchQuery 
    ? trendingTokens.filter(token => 
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : trendingTokens;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleTokenClick = (tokenName: string) => {
    console.log(`Token clicked: ${tokenName}`);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setSearchQuery(searchTerm);
  };

  useEffect(() => {
    setIsSearchActive(searchQuery.length > 0);
  }, [searchQuery]);

  return (
    <div className="flex-1 flex flex-col px-4 py-3 search-content" data-element-id="search-content">
      {/* Search Input */}
      <div className="relative mb-6 search-input-container" data-element-id="search-input-container">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 search-icon"
            data-element-id="search-icon"
            style={{ color: globalSearchInput.iconSearch?.color || '#ffd873' }}
          />
          <input
            type="text"
            placeholder="Search coins, tokens..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-3 rounded-xl border-none outline-none search-input"
            data-element-id="search-input"
            style={{
              backgroundColor: globalSearchInput.backgroundColor || '#1b140a',
              color: globalSearchInput.textColor || '#ffd873',
              fontFamily: globalSearchInput.fontFamily || 'Inter, sans-serif',
              fontSize: globalSearchInput.fontSize || '15px',
              borderRadius: globalSearchInput.borderRadius || '12px'
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 search-clear"
              data-element-id="search-clear"
            >
              <X 
                className="w-4 h-4 search-clear-icon"
                data-element-id="search-clear-icon"
                style={{ color: globalSearchInput.iconClose?.color || '#ffd873' }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Recent Searches */}
      {!isSearchActive && (
        <div className="mb-6 search-recent" data-element-id="search-recent">
          <div className="flex items-center mb-3 search-recent-header" data-element-id="search-recent-header">
            <Clock 
              className="w-4 h-4 mr-2 search-recent-icon"
              data-element-id="search-recent-icon"
              style={{ color: searchLayer.recentSearchesLabel?.iconTime?.color || '#ffd873' }}
            />
            <span 
              className="font-semibold search-recent-label"
              data-element-id="search-recent-label"
              style={{
                color: searchLayer.recentSearchesLabel?.textColor || '#ffd873',
                fontFamily: searchLayer.recentSearchesLabel?.fontFamily || 'Inter, sans-serif',
                fontWeight: searchLayer.recentSearchesLabel?.fontWeight || 'bold',
                fontSize: searchLayer.recentSearchesLabel?.fontSize || '17px'
              }}
            >
              Recent Searches
            </span>
          </div>
          <div className="flex flex-wrap gap-2 search-recent-tags" data-element-id="search-recent-tags">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                className="px-3 py-2 rounded-lg text-sm search-recent-tag"
                data-element-id={`search-recent-tag-${index}`}
                onClick={() => handleRecentSearchClick(search)}
                style={{
                  backgroundColor: searchLayer.tokenTag?.backgroundColor || '#2a2115',
                  color: searchLayer.tokenTag?.textColor || '#ffd873',
                  fontFamily: searchLayer.tokenTag?.fontFamily || 'Inter, sans-serif',
                  fontSize: searchLayer.tokenTag?.fontSize || '14px',
                  borderRadius: searchLayer.tokenTag?.borderRadius || '10px'
                }}
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending / Search Results */}
      <div className="search-results" data-element-id="search-results">
        <div className="flex items-center mb-4 search-results-header" data-element-id="search-results-header">
          <TrendingUp 
            className="w-4 h-4 mr-2 search-trending-icon"
            data-element-id="search-trending-icon"
            style={{ color: searchLayer.trendingLabel?.iconTrending?.color || '#13e163' }}
          />
          <span 
            className="font-semibold search-results-label"
            data-element-id="search-results-label"
            style={{
              color: searchLayer.trendingLabel?.textColor || '#ffd873',
              fontFamily: searchLayer.trendingLabel?.fontFamily || 'Inter, sans-serif',
              fontWeight: searchLayer.trendingLabel?.fontWeight || 'bold',
              fontSize: searchLayer.trendingLabel?.fontSize || '17px'
            }}
          >
            {isSearchActive ? 'Search Results' : 'Trending'}
          </span>
        </div>

        <div className="space-y-3 search-token-list" data-element-id="search-token-list">
          {filteredTokens.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer search-token-item"
              data-element-id={`search-token-item-${index}`}
              onClick={() => handleTokenClick(token.name)}
              style={{
                transition: globalStyle.transition || 'all 0.2s ease'
              }}
            >
              <div className="flex items-center space-x-3 search-token-left" data-element-id={`search-token-left-${index}`}>
                {/* Token Avatar */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold search-token-avatar"
                  data-element-id={`search-token-avatar-${index}`}
                  style={{ 
                    backgroundColor: '#444',
                    color: '#FFFFFF'
                  }}
                >
                  {token.symbol.charAt(0)}
                </div>
                
                {/* Token Info */}
                <div className="search-token-info" data-element-id={`search-token-info-${index}`}>
                  <div 
                    className="font-medium search-token-name"
                    data-element-id={`search-token-name-${index}`}
                    style={{
                      color: tokenElements.name?.textColor || '#FFD166',
                      fontFamily: tokenElements.name?.fontFamily || globalStyle.fontFamily,
                      fontWeight: tokenElements.name?.fontWeight || 'bold',
                      fontSize: tokenElements.name?.fontSize || '16px'
                    }}
                  >
                    {token.name}
                  </div>
                  <div 
                    className="text-sm opacity-70 search-token-symbol"
                    data-element-id={`search-token-symbol-${index}`}
                    style={{
                      color: tokenElements.amount?.textColor || '#FFFFFF',
                      fontFamily: tokenElements.amount?.fontFamily || globalStyle.fontFamily
                    }}
                  >
                    {token.symbol}
                  </div>
                </div>
              </div>

              {/* Price and Change */}
              <div className="text-right search-token-right" data-element-id={`search-token-right-${index}`}>
                <div 
                  className="font-medium search-token-price"
                  data-element-id={`search-token-price-${index}`}
                  style={{
                    color: tokenElements.dollarValue?.textColor || '#FFFFFF',
                    fontFamily: tokenElements.dollarValue?.fontFamily || globalStyle.fontFamily,
                    fontSize: tokenElements.dollarValue?.fontSize || '15px'
                  }}
                >
                  {token.price}
                </div>
                <div 
                  className="text-sm search-token-change"
                  data-element-id={`search-token-change-${index}`}
                  style={{
                    color: token.isPositive === null
                      ? tokenElements.percentChange?.neutralColor || '#FFFFFF'
                      : token.isPositive
                      ? tokenElements.percentChange?.positiveColor || '#13e163'
                      : tokenElements.percentChange?.negativeColor || '#ff5959',
                    fontFamily: tokenElements.percentChange?.fontFamily || globalStyle.fontFamily,
                    fontSize: tokenElements.percentChange?.fontSize || '14px'
                  }}
                >
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {isSearchActive && filteredTokens.length === 0 && (
          <div 
            className="text-center py-8 search-no-results"
            data-element-id="search-no-results"
            style={{
              color: '#aaa',
              fontFamily: globalStyle.fontFamily
            }}
          >
            No tokens found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchContent;
