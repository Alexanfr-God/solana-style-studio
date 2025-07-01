
import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

interface SendLayerProps {
  onBack: () => void;
}

const SendLayer = ({ onBack }: SendLayerProps) => {
  const { walletStyle, accounts } = useWalletCustomizationStore();
  const [searchQuery, setSearchQuery] = useState('');

  const tokens = [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: '12.45',
      price: '$184.32',
      icon: '◎',
      network: 'Solana'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '2.156',
      price: '$3,456.78',
      icon: 'Ξ',
      network: 'Ethereum'
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '1,250.00',
      price: '$1.00',
      icon: '$',
      network: 'Multi-chain'
    }
  ];

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col send-header"
      data-element-id="send-header"
      style={{ 
        backgroundColor: walletStyle.backgroundColor || '#1a1a1a',
        fontFamily: walletStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors send-back-button"
          data-element-id="send-back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 
          className="text-lg font-semibold send-title"
          data-element-id="send-title"
        >
          Send
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Search */}
      <div 
        className="p-4 send-search-container"
        data-element-id="send-search-container"
      >
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 send-search-icon"
            data-element-id="send-search-icon"
          />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 border border-gray-700 focus:border-purple-500 focus:outline-none send-search-input"
            data-element-id="send-search-input"
          />
        </div>
      </div>

      {/* Token List */}
      <div 
        className="flex-1 overflow-y-auto send-token-list"
        data-element-id="send-token-list"
      >
        {filteredTokens.map((token, index) => (
          <div
            key={token.symbol}
            className={`p-4 border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors ${
              index === 0 ? 'send-solana-item' : 
              index === 1 ? 'send-ethereum-item' : 
              'send-token-item'
            }`}
            data-element-id={
              index === 0 ? 'send-solana-item' : 
              index === 1 ? 'send-ethereum-item' : 
              `send-token-item-${index}`
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'send-solana-icon' : 
                    index === 1 ? 'send-ethereum-icon' : 
                    'send-token-icon'
                  }`}
                  data-element-id={
                    index === 0 ? 'send-solana-icon' : 
                    index === 1 ? 'send-ethereum-icon' : 
                    `send-token-icon-${index}`
                  }
                  style={{ backgroundColor: walletStyle.accentColor || '#9945FF' }}
                >
                  {token.icon}
                </div>
                <div>
                  <div 
                    className={`font-medium ${
                      index === 0 ? 'send-solana-name' : 
                      index === 1 ? 'send-ethereum-name' : 
                      'send-token-name'
                    }`}
                    data-element-id={
                      index === 0 ? 'send-solana-name' : 
                      index === 1 ? 'send-ethereum-name' : 
                      `send-token-name-${index}`
                    }
                  >
                    {token.name}
                  </div>
                  <div className="text-sm text-gray-400">{token.network}</div>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className={`font-medium ${
                    index === 0 ? 'send-solana-balance' : 
                    index === 1 ? 'send-ethereum-balance' : 
                    'send-token-balance'
                  }`}
                  data-element-id={
                    index === 0 ? 'send-solana-balance' : 
                    index === 1 ? 'send-ethereum-balance' : 
                    `send-token-balance-${index}`
                  }
                >
                  {token.balance} {token.symbol}
                </div>
                <div 
                  className={`text-sm text-gray-400 ${
                    index === 0 ? 'send-solana-price' : 
                    index === 1 ? 'send-ethereum-price' : 
                    'send-token-price'
                  }`}
                  data-element-id={
                    index === 0 ? 'send-solana-price' : 
                    index === 1 ? 'send-ethereum-price' : 
                    `send-token-price-${index}`
                  }
                >
                  {token.price}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SendLayer;
