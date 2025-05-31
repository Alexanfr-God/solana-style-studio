
import React, { useState } from 'react';
import { Search, TrendingUp, ExternalLink, Coins, Globe, Image } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const SearchContent = () => {
  const { walletStyle } = useWalletCustomizationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'tokens' | 'sites' | 'collections'>('tokens');

  const categories = [
    { id: 'tokens' as const, label: 'Tokens', icon: Coins, color: 'bg-green-500' },
    { id: 'sites' as const, label: 'Sites', icon: Globe, color: 'bg-blue-500' },
    { id: 'collections' as const, label: 'Collections', icon: Image, color: 'bg-pink-500' }
  ];

  const trendingTokens = [
    {
      position: 1,
      name: 'bunnywifshades',
      symbol: 'BUNNY',
      price: '$0.0032',
      change: '+24.5%',
      isPositive: true,
      avatar: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png'
    },
    {
      position: 2,
      name: '$0.1b is not a L...',
      symbol: '0.1B',
      price: '$0.0001',
      change: '-12.3%',
      isPositive: false,
      avatar: '/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png'
    },
    {
      position: 3,
      name: 'Zebec Network',
      symbol: 'ZBC',
      price: '$0.0205',
      change: '+8.7%',
      isPositive: true,
      avatar: '/lovable-uploads/9dd9ce9c-2158-40cf-98ee-2e189bd56595.png'
    }
  ];

  const trendingSites = [
    {
      name: 'Jupiter',
      description: 'The key liquidity aggregator and swap infrastructure for Solana',
      icon: '/lovable-uploads/72224164-59bd-4fc3-abf5-d57bbdbee278.png',
      url: 'jup.ag'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-3 overflow-y-auto">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for sites, tokens"
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors"
          />
        </div>
      </form>

      {/* Category Buttons */}
      <div className="flex gap-3 mb-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
              activeCategory === category.id 
                ? `${category.color} text-white` 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Trending Tokens */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: walletStyle.primaryColor || '#9945FF' }} />
            Trending Tokens
          </h3>
          <button 
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: walletStyle.primaryColor || '#9945FF' }}
          >
            See More
          </button>
        </div>
        
        <div className="space-y-3">
          {trendingTokens.map((token) => (
            <div
              key={token.position}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              {/* Position */}
              <div className="w-6 h-6 flex items-center justify-center text-gray-400 text-sm font-medium">
                {token.position}
              </div>

              {/* Token Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={token.avatar}
                  alt={token.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Token Info */}
              <div className="flex-1">
                <div className="text-white text-sm font-medium">
                  {token.name}
                </div>
                <div className="text-gray-400 text-xs">
                  {token.symbol}
                </div>
              </div>

              {/* Price and Change */}
              <div className="text-right">
                <div className="text-white text-sm font-medium">
                  {token.price}
                </div>
                <div className={`text-xs font-medium ${
                  token.isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Sites */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5" style={{ color: walletStyle.primaryColor || '#9945FF' }} />
            Trending Sites
          </h3>
          <button 
            className="text-sm font-medium transition-colors hover:text-white"
            style={{ color: walletStyle.primaryColor || '#9945FF' }}
          >
            See More
          </button>
        </div>
        
        <div className="space-y-3">
          {trendingSites.map((site, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              {/* Site Icon */}
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                <img
                  src={site.icon}
                  alt={site.name}
                  className="w-8 h-8 object-cover rounded"
                />
              </div>

              {/* Site Info */}
              <div className="flex-1">
                <div className="text-white text-sm font-medium">
                  {site.name}
                </div>
                <div className="text-gray-400 text-xs">
                  {site.description}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {site.url}
                </div>
              </div>

              {/* External Link Icon */}
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchContent;
