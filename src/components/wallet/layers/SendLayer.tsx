import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
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
  const { setCurrentLayer } = useWalletCustomizationStore();
  const { getSendLayer, getGlobal, getTransition } = useWalletTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Get sendLayer styles
  const sendLayerStyle = getSendLayer();
  const globalStyle = getGlobal();

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
        backgroundColor: sendLayerStyle.headerContainer?.backgroundColor || 'rgba(24, 24, 24, 0.95)',
        backgroundImage: sendLayerStyle.headerContainer?.backgroundImage ? `url(${sendLayerStyle.headerContainer.backgroundImage})` : undefined,
        backdropFilter: 'blur(20px)',
        fontFamily: globalStyle.fontFamily || 'Inter'
      }}
    >
      {/* Header Container */}
      <div 
        className="send-header-container"
        data-element-id="send-header-container"
        style={{
          backgroundColor: sendLayerStyle.headerContainer?.backgroundColor || '#181818',
          backgroundImage: sendLayerStyle.headerContainer?.backgroundImage ? `url(${sendLayerStyle.headerContainer.backgroundImage})` : undefined
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b send-header"
          data-element-id="send-header"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 transition-colors send-back-button"
            data-element-id="send-back-button"
            style={{
              borderRadius: globalStyle.borderRadius || '8px',
              transition: getTransition('default')
            }}
          >
            <ArrowLeft 
              className="w-5 h-5 send-back-icon" 
              data-element-id="send-back-icon"
              style={{ color: sendLayerStyle.header?.backIcon?.color || '#ad7e26' }}
            />
            <span 
              className="font-medium send-back-text"
              data-element-id="send-back-text"
              style={{
                color: sendLayerStyle.header?.backIcon?.color || '#ad7e26',
                fontFamily: globalStyle.fontFamily
              }}
            >
              Back
            </span>
          </button>
          
          <h1 
            className="text-lg font-semibold send-title"
            data-element-id="send-title"
            style={{
              color: sendLayerStyle.header?.title?.textColor || '#643800',
              fontFamily: sendLayerStyle.header?.title?.fontFamily || globalStyle.fontFamily,
              fontWeight: sendLayerStyle.header?.title?.fontWeight || 'bold',
              fontSize: sendLayerStyle.header?.title?.fontSize || '23px'
            }}
          >
            Send Crypto
          </h1>
          
          <div className="w-[60px] send-header-spacer" data-element-id="send-header-spacer"></div>
        </div>
      </div>

      {/* Search Bar Container */}
      <div 
        className="px-4 py-4 border-b send-search-container" 
        data-element-id="send-search-container" 
        style={{ 
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: sendLayerStyle.searchInputContainer?.backgroundColor || '#13e163',
          backgroundImage: sendLayerStyle.searchInputContainer?.backgroundImage ? `url(${sendLayerStyle.searchInputContainer.backgroundImage})` : undefined
        }}
      >
        <div 
          className="relative send-search-input-container" 
          data-element-id="send-search-input-container"
          style={{
            borderRadius: sendLayerStyle.searchInputContainer?.borderRadius || '16px',
            overflow: 'hidden'
          }}
        >
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 send-search-icon" 
            data-element-id="send-search-icon"
            style={{ color: sendLayerStyle.searchInput?.iconSearch?.color || '#fff' }}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 focus:outline-none transition-colors send-search-input"
            data-element-id="send-search-input"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontFamily: sendLayerStyle.searchInput?.fontFamily || globalStyle.fontFamily,
              fontSize: sendLayerStyle.searchInput?.fontSize || '16px',
              color: sendLayerStyle.searchInput?.textColor || '#fff',
              transition: getTransition('default')
            }}
          />
        </div>
      </div>

      {/* Content Container */}
      <div 
        className="flex-1 px-4 py-4 overflow-y-auto send-content" 
        data-element-id="send-content"
        style={{
          backgroundColor: sendLayerStyle.centerContainer?.backgroundColor || '#232323',
          backgroundImage: sendLayerStyle.centerContainer?.backgroundImage ? `url(${sendLayerStyle.centerContainer.backgroundImage})` : undefined,
          borderRadius: sendLayerStyle.centerContainer?.borderRadius || '18px',
          margin: '16px'
        }}
      >
        <div className="mb-4 send-instructions" data-element-id="send-instructions">
          <h2 
            className="text-sm font-medium mb-2 send-instructions-title"
            data-element-id="send-instructions-title"
            style={{
              color: sendLayerStyle.selectNetworkLabel?.textColor || '#ad7e26',
              fontFamily: sendLayerStyle.selectNetworkLabel?.fontFamily || globalStyle.fontFamily,
              fontWeight: sendLayerStyle.selectNetworkLabel?.fontWeight || 'bold',
              fontSize: sendLayerStyle.selectNetworkLabel?.fontSize || '19px'
            }}
          >
            Select Network
          </h2>
          <p 
            className="text-xs send-instructions-description"
            data-element-id="send-instructions-description"
            style={{ 
              color: sendLayerStyle.selectNetworkDescription?.textColor || '#aaa',
              fontFamily: sendLayerStyle.selectNetworkDescription?.fontFamily || globalStyle.fontFamily,
              fontSize: sendLayerStyle.selectNetworkDescription?.fontSize || '15px'
            }}
          >
            Choose which network you want to send crypto from
          </p>
        </div>

        {/* Crypto Networks List */}
        <div 
          className="rounded-xl border overflow-hidden mb-6 send-networks-container"
          data-element-id="send-networks-container"
          style={{
            backgroundColor: sendLayerStyle.networkList?.container?.backgroundColor || '#232323',
            borderRadius: sendLayerStyle.networkList?.container?.borderRadius || '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {filteredNetworks.map((network, index) => (
            <div
              key={network.id}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0 cursor-pointer send-network-item"
              data-element-id={`send-network-item-${index}`}
              onClick={() => handleNetworkSelect(network.name)}
              style={{ 
                backgroundColor: sendLayerStyle.networkList?.networkItem?.backgroundColor || '#181818',
                borderRadius: sendLayerStyle.networkList?.networkItem?.borderRadius || '13px',
                margin: '4px',
                transition: getTransition('default')
              }}
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
                    className="font-medium text-sm send-network-name"
                    data-element-id={`send-network-name-${index}`}
                    style={{
                      color: sendLayerStyle.networkList?.coinName?.textColor || '#ad7e26',
                      fontFamily: sendLayerStyle.networkList?.coinName?.fontFamily || globalStyle.fontFamily,
                      fontWeight: sendLayerStyle.networkList?.coinName?.fontWeight || 'bold',
                      fontSize: sendLayerStyle.networkList?.coinName?.fontSize || '17px'
                    }}
                  >
                    {network.name}
                  </div>
                  <div 
                    className="text-xs send-network-symbol"
                    data-element-id={`send-network-symbol-${index}`}
                    style={{ 
                      color: sendLayerStyle.networkList?.coinTicker?.textColor || '#fff',
                      fontFamily: sendLayerStyle.networkList?.coinTicker?.fontFamily || globalStyle.fontFamily,
                      fontSize: sendLayerStyle.networkList?.coinTicker?.fontSize || '14px'
                    }}
                  >
                    {network.symbol}
                  </div>
                </div>
              </div>
              
              {/* Balance */}
              <div className="text-right send-network-balance" data-element-id={`send-network-balance-${index}`}>
                <div 
                  className="font-medium text-sm send-network-balance-amount"
                  data-element-id={`send-network-balance-amount-${index}`}
                  style={{
                    color: sendLayerStyle.networkList?.balance?.textColor || '#ad7e26',
                    fontFamily: sendLayerStyle.networkList?.balance?.fontFamily || globalStyle.fontFamily,
                    fontWeight: sendLayerStyle.networkList?.balance?.fontWeight || '600',
                    fontSize: sendLayerStyle.networkList?.balance?.fontSize || '15px'
                  }}
                >
                  {network.balance} {network.symbol}
                </div>
                <div 
                  className="text-xs send-network-balance-usd"
                  data-element-id={`send-network-balance-usd-${index}`}
                  style={{ 
                    color: sendLayerStyle.networkList?.fiatValue?.textColor || '#fff',
                    fontFamily: sendLayerStyle.networkList?.fiatValue?.fontFamily || globalStyle.fontFamily,
                    fontSize: sendLayerStyle.networkList?.fiatValue?.fontSize || '14px'
                  }}
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
              className="text-sm send-no-results-text"
              data-element-id="send-no-results-text"
              style={{ 
                color: sendLayerStyle.emptyState?.textColor || '#fff',
                fontFamily: sendLayerStyle.emptyState?.fontFamily || globalStyle.fontFamily,
                fontSize: sendLayerStyle.emptyState?.fontSize || '15px'
              }}
            >
              No networks found
            </p>
          </div>
        )}
      </div>

      {/* Footer Container */}
      <div 
        className="send-footer-container" 
        data-element-id="send-footer-container"
        style={{
          backgroundColor: sendLayerStyle.footerContainer?.backgroundColor || '#181818',
          backgroundImage: sendLayerStyle.footerContainer?.backgroundImage ? `url(${sendLayerStyle.footerContainer.backgroundImage})` : undefined
        }}
      >
        {/* Close Button */}
        <div className="p-4 border-t send-footer" data-element-id="send-footer" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 send-close-button"
            data-element-id="send-close-button"
            style={{
              backgroundColor: sendLayerStyle.footer?.closeButton?.backgroundColor || '#FFD166',
              borderRadius: sendLayerStyle.footer?.closeButton?.borderRadius || '16px',
              transition: getTransition('default'),
              color: sendLayerStyle.footer?.closeButton?.textColor || '#181818',
              fontFamily: sendLayerStyle.footer?.closeButton?.fontFamily || globalStyle.fontFamily,
              fontWeight: sendLayerStyle.footer?.closeButton?.fontWeight || 'bold',
              fontSize: sendLayerStyle.footer?.closeButton?.fontSize || '19px'
            }}
          >
            <X 
              className="w-5 h-5 send-close-icon" 
              data-element-id="send-close-icon"
              style={{ color: sendLayerStyle.footer?.closeButton?.icon?.color || '#ad7e26' }}
            />
            <span className="send-close-text" data-element-id="send-close-text">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendLayer;
