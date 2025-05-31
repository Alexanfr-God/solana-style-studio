
import React, { useState } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

const SwapContent = () => {
  const {
    walletStyle,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const [payAmount, setPayAmount] = useState('0.1');
  const [receiveAmount, setReceiveAmount] = useState('184.86');
  const [activeFilter, setActiveFilter] = useState('Trending');

  const handleSwapClick = () => {
    console.log('Swap tokens clicked');
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  const handleTokenSelect = (tokenName: string) => {
    console.log(`Selected token: ${tokenName}`);
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    triggerAiPetInteraction();
    setTemporaryEmotion('wink', 1000);
  };

  const tokens = [
    { rank: 1, name: 'dogwifmask', symbol: 'DOGWIFMASK', price: '$0.000000003402', change: '+12.34%', icon: '🐕' },
    { rank: 2, name: 'Solana', symbol: 'SOL', price: '$184.86', change: '+5.67%', icon: '◎' },
    { rank: 3, name: 'USDC', symbol: 'USDC', price: '$1.00', change: '+0.01%', icon: '💰' },
    { rank: 4, name: 'Bonk', symbol: 'BONK', price: '$0.00002345', change: '-2.11%', icon: '🐶' },
    { rank: 5, name: 'Jito', symbol: 'JTO', price: '$3.45', change: '+8.92%', icon: '⚡' }
  ];

  const filters = ['Trending', 'Solana', '24h'];

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto" id="swap-content-container">
      {/* Swap Interface */}
      <div className="mb-6" id="swap-interface-section">
        {/* You Pay Section */}
        <div className="mb-4" id="you-pay-section">
          <div className="text-sm text-gray-400 mb-2">You pay</div>
          <div 
            className="bg-white/5 rounded-xl p-4 border border-white/10"
            id="pay-input-container"
          >
            <div className="flex items-center justify-between mb-3">
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                onClick={() => handleTokenSelect('SOL')}
                id="pay-token-selector"
              >
                <span className="text-lg">◎</span>
                <span className="text-white font-medium">SOL</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <input
                type="text"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="bg-transparent text-right text-2xl font-semibold text-white outline-none"
                placeholder="0.0"
                id="pay-amount-input"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Balance: 5.03 SOL</span>
              <div className="flex gap-2">
                <button 
                  className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 hover:bg-white/15 transition-colors"
                  onClick={() => setPayAmount('5.03')}
                  id="pay-max-button"
                >
                  5.03
                </button>
                <button 
                  className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 hover:bg-white/15 transition-colors"
                  onClick={() => setPayAmount('2.515')}
                  id="pay-50-button"
                >
                  50%
                </button>
                <button 
                  className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300 hover:bg-white/15 transition-colors"
                  onClick={() => setPayAmount('5.03')}
                  id="pay-max-button-2"
                >
                  Max
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center mb-4" id="swap-button-container">
          <button
            onClick={handleSwapClick}
            className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/15 transition-all duration-200 hover:scale-105"
            id="swap-tokens-button"
          >
            <ArrowUpDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* You Receive Section */}
        <div className="mb-6" id="you-receive-section">
          <div className="text-sm text-gray-400 mb-2">You receive</div>
          <div 
            className="bg-white/5 rounded-xl p-4 border border-white/10"
            id="receive-input-container"
          >
            <div className="flex items-center justify-between mb-3">
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
                onClick={() => handleTokenSelect('USDC')}
                id="receive-token-selector"
              >
                <span className="text-lg">💰</span>
                <span className="text-white font-medium">USDC</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <input
                type="text"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
                className="bg-transparent text-right text-2xl font-semibold text-white outline-none"
                placeholder="0.0"
                id="receive-amount-input"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Balance: 0 USDC</span>
            </div>
          </div>
        </div>

        {/* Swap Action Button */}
        <button
          className="w-full py-3 font-bold text-white rounded-xl transition-colors hover:opacity-90"
          style={{
            backgroundColor: walletStyle.primaryColor || '#9945FF',
            fontFamily: walletStyle.font || 'Inter'
          }}
          onClick={handleSwapClick}
          id="swap-action-button"
        >
          Swap
        </button>
      </div>

      {/* Tokens Section */}
      <div id="tokens-section">
        <div className="flex items-center justify-between mb-4" id="tokens-header">
          <h2 
            className="text-xl font-semibold text-white"
            style={{ 
              color: walletStyle.primaryColor || '#FFFFFF',
              fontFamily: walletStyle.font || 'Inter'
            }}
            id="tokens-title"
          >
            Tokens
          </h2>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4" id="tokens-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeFilter === filter 
                  ? 'bg-white/15 text-white' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
              id={`filter-${filter.toLowerCase()}`}
            >
              {filter}
              <ChevronDown className="w-3 h-3" />
            </button>
          ))}
        </div>

        {/* Tokens List */}
        <div className="space-y-2" id="tokens-list">
          {tokens.map((token) => (
            <button
              key={token.rank}
              onClick={() => handleTokenSelect(token.symbol)}
              className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              id={`token-item-${token.symbol.toLowerCase()}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-6">{token.rank}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{token.icon}</span>
                  <div>
                    <div className="text-white font-medium text-left">{token.name}</div>
                    <div className="text-gray-400 text-sm text-left">{token.symbol}</div>
                  </div>
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
    </div>
  );
};

export default SwapContent;
