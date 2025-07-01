
import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useToast } from '@/hooks/use-toast';

interface CryptoNetwork {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  balanceUsd: string;
  icon: string;
  color: string;
  isSpecial?: boolean;
}

const cryptoNetworks: CryptoNetwork[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    balance: '5.03737',
    balanceUsd: '$1,127.61',
    icon: '/lovable-uploads/72224164-59bd-4fc3-abf5-d57bbdbee278.png',
    color: '#9945FF'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA'
  },
  {
    id: 'ethereum-theta',
    name: 'Ethereum',
    symbol: 'ETH',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
    color: '#627EEA',
    isSpecial: true
  },
  {
    id: 'sui',
    name: 'Sui',
    symbol: 'SUI',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/9dd9ce9c-2158-40cf-98ee-2e189bd56595.png',
    color: '#4CA2FF'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    balance: '0',
    balanceUsd: '$0.00',
    icon: '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
    color: '#8247E5'
  }
];

const SendLayer = () => {
  const {
    getStyleForComponent,
    setCurrentLayer
  } = useWalletCustomizationStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Get component-specific styles
  const overlayStyle = getStyleForComponent('overlays');
  const searchInputStyle = getStyleForComponent('searchInputs');
  const containerStyle = getStyleForComponent('containers');
  const buttonStyle = getStyleForComponent('buttons');
  const globalStyle = getStyleForComponent('global');

  const handleBack = () => {
    setCurrentLayer('home');
  };

  const handleClose = () => {
    setCurrentLayer('home');
  };

  const handleNetworkSelect = (networkName: string) => {
    console.log('Network selected:', networkName);
    
    toast({
      title: "Network Selected",
      description: `Selected ${networkName} for sending`,
    });
  };

  const filteredNetworks = cryptoNetworks.filter(network =>
    network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    network.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="absolute inset-0 animate-slide-in-bottom send-layer"
      data-element-id="send-layer"
      style={{
        backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
        backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
        fontFamily: globalStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b send-header"
        data-element-id="send-header"
        style={{
          borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors send-back-button"
          data-element-id="send-back-button"
          style={{
            borderRadius: buttonStyle.borderRadius || '8px',
            transition: buttonStyle.transition
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white send-back-icon" data-element-id="send-back-icon" />
          <span 
            className="text-white font-medium send-back-text"
            data-element-id="send-back-text"
            style={{
              color: globalStyle.textColor,
              fontFamily: globalStyle.fontFamily
            }}
          >
            Back
          </span>
        </button>
        
        <h1 
          className="text-lg font-semibold text-white send-title"
          data-element-id="send-title"
          style={{
            color: globalStyle.textColor,
            fontFamily: globalStyle.fontFamily
          }}
        >
          Send Crypto
        </h1>
        
        <div className="w-[60px] send-header-spacer" data-element-id="send-header-spacer"></div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b send-search-container" data-element-id="send-search-container" style={{ borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)' }}>
        <div className="relative send-search-input-container" data-element-id="send-search-input-container">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 send-search-icon" data-element-id="send-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none transition-colors send-search-input"
            data-element-id="send-search-input"
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto send-content" data-element-id="send-content">
        <div className="mb-4 send-instructions" data-element-id="send-instructions">
          <h2 
            className="text-sm font-medium text-white mb-2 send-instructions-title"
            data-element-id="send-instructions-title"
            style={{
              color: globalStyle.textColor,
              fontFamily: globalStyle.fontFamily
            }}
          >
            Select Network
          </h2>
          <p 
            className="text-xs text-gray-400 send-instructions-description"
            data-element-id="send-instructions-description"
            style={{ fontFamily: globalStyle.fontFamily }}
          >
            Choose which network you want to send crypto from
          </p>
        </div>

        {/* Crypto Networks List */}
        <div 
          className="rounded-xl border overflow-hidden mb-6 send-networks-container"
          data-element-id="send-networks-container"
          style={{
            backgroundColor: containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: containerStyle.borderRadius || '16px',
            border: containerStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: containerStyle.backdropFilter
          }}
        >
          {filteredNetworks.map((network, index) => (
            <div
              key={network.id}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 cursor-pointer send-network-item"
              data-element-id={`send-network-item-${index}`}
              onClick={() => handleNetworkSelect(network.name)}
              style={{ transition: containerStyle.transition }}
            >
              <div className="flex items-center space-x-3">
                {/* Network Icon */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center relative send-network-icon-container" data-element-id={`send-network-icon-container-${index}`}>
                  <img
                    src={network.icon}
                    alt={network.name}
                    className="w-8 h-8 object-cover rounded send-network-icon"
                    data-element-id={`send-network-icon-${index}`}
                  />
                  {network.isSpecial && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold send-network-special-badge" data-element-id={`send-network-special-badge-${index}`}>
                      <span className="send-network-special-badge-text" data-element-id={`send-network-special-badge-text-${index}`}>Θ</span>
                    </div>
                  )}
                </div>
                
                {/* Network Info */}
                <div className="send-network-info" data-element-id={`send-network-info-${index}`}>
                  <div 
                    className="font-medium text-white text-sm send-network-name"
                    data-element-id={`send-network-name-${index}`}
                    style={{
                      color: globalStyle.textColor,
                      fontFamily: globalStyle.fontFamily
                    }}
                  >
                    {network.name}
                  </div>
                  <div 
                    className="text-xs text-gray-400 send-network-symbol"
                    data-element-id={`send-network-symbol-${index}`}
                    style={{ fontFamily: globalStyle.fontFamily }}
                  >
                    {network.symbol}
                  </div>
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-right send-network-balance" data-element-id={`send-network-balance-${index}`}>
                <div 
                  className="font-medium text-white text-sm send-network-balance-amount"
                  data-element-id={`send-network-balance-amount-${index}`}
                  style={{
                    color: globalStyle.textColor,
                    fontFamily: globalStyle.fontFamily
                  }}
                >
                  {network.balance} {network.symbol}
                </div>
                <div 
                  className="text-xs text-gray-400 send-network-balance-usd"
                  data-element-id={`send-network-balance-usd-${index}`}
                  style={{ fontFamily: globalStyle.fontFamily }}
                >
                  {network.balanceUsd}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNetworks.length === 0 && (
          <div className="text-center py-8 send-no-results" data-element-id="send-no-results">
            <p 
              className="text-gray-400 text-sm send-no-results-text"
              data-element-id="send-no-results-text"
              style={{ fontFamily: globalStyle.fontFamily }}
            >
              No networks found
            </p>
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="p-4 border-t send-footer" data-element-id="send-footer" style={{ borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)' }}>
        <button
          onClick={handleClose}
          className="w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 send-close-button"
          data-element-id="send-close-button"
          style={{
            backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
            borderRadius: buttonStyle.borderRadius || '12px',
            transition: buttonStyle.transition,
            color: buttonStyle.textColor || '#FFFFFF',
            fontFamily: globalStyle.fontFamily
          }}
        >
          <X className="w-5 h-5 send-close-icon" data-element-id="send-close-icon" />
          <span className="font-medium send-close-text" data-element-id="send-close-text">Close</span>
        </button>
      </div>
    </div>
  );
};

export default SendLayer;
