
import React, { useState } from 'react';
import { Search, X, QrCode } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { useWalletButtonStyles } from '@/hooks/useWalletButtonStyles';
import { useToast } from '@/hooks/use-toast';
import { COINMARKETCAP_ICONS } from '@/constants/coinIcons';

interface Network {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  description: string;
}

const availableNetworks: Network[] = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: COINMARKETCAP_ICONS.SOL,
    color: '#9945FF',
    description: 'Fast, secure and censorship resistant blockchain'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: COINMARKETCAP_ICONS.ETH,
    color: '#627EEA',
    description: 'Decentralized platform for smart contracts'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: COINMARKETCAP_ICONS.BTC,
    color: '#F7931A',
    description: 'The original cryptocurrency'
  }
];

const SendLayer = () => {
  const { setCurrentLayer } = useWalletCustomizationStore();
  const { getSendLayer, getGlobalSearchInput, getTransition, getAssetCard } = useWalletTheme();
  useWalletButtonStyles();
  
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Get send layer theme styles and global search input
  const sendLayerStyle = getSendLayer();
  const globalSearchInput = getGlobalSearchInput();
  const assetCard = getAssetCard();

  const handleClose = () => {
    setCurrentLayer('home');
  };

  const handleNetworkSelect = (networkName: string) => {
    console.log('Network selected:', networkName);
    
    toast({
      title: "Network Selected",
      description: `You have selected ${networkName} network`,
    });
  };

  const filteredNetworks = availableNetworks.filter(network =>
    network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    network.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll-lock handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={handleClose}
      />
      
      {/* Bottom sheet modal */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-50 max-h-[85vh] flex flex-col animate-slide-in-bottom send-layer"
        data-element-id="send-layer"
        style={{
          backgroundColor: sendLayerStyle.centerContainer?.backgroundColor || '#232323',
          backgroundImage: sendLayerStyle.centerContainer?.backgroundImage ? `url(${sendLayerStyle.centerContainer.backgroundImage})` : undefined,
          backgroundPosition: sendLayerStyle.centerContainer?.backgroundPosition || 'center',
          backgroundSize: 'cover',
          fontFamily: sendLayerStyle.centerContainer?.fontFamily || 'Inter',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        {/* Search Input - Using global search input styles */}
        <div className="relative mt-4 mx-4 send-search-input-container" data-element-id="send-search-input-container">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 send-search-icon" 
            data-element-id="send-search-icon"
            style={{ color: globalSearchInput.iconSearch?.color || '#aaa' }}
          />
          <input
            type="text"
            placeholder="Search networks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 focus:outline-none transition-colors send-search-input"
            data-element-id="send-search-input"
            style={{
              backgroundColor: globalSearchInput.backgroundColor || '#181818',
              border: globalSearchInput.border || 'none',
              borderRadius: globalSearchInput.borderRadius || '12px',
              fontFamily: globalSearchInput.fontFamily || 'Inter',
              fontSize: globalSearchInput.fontSize || '15px',
              color: globalSearchInput.textColor || '#fff',
              transition: getTransition('default')
            }}
          />
        </div>

        {/* Content - Scrollable with hidden scrollbar */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 send-content invisible-scroll" 
          data-element-id="send-content"
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
        >
          {/* Select Network Section */}
          <div className="mb-6 send-select-network-section" data-element-id="send-select-network-section">
            <h2 
              className="text-sm font-medium mb-3 send-select-network-title"
              data-element-id="send-select-network-title"
              style={{
                color: sendLayerStyle.selectNetworkLabel?.textColor || '#ad7e26',
                fontFamily: sendLayerStyle.selectNetworkLabel?.fontFamily || 'Inter',
                fontWeight: sendLayerStyle.selectNetworkLabel?.fontWeight || 'bold',
                fontSize: sendLayerStyle.selectNetworkLabel?.fontSize || '19px',
              }}
            >
              Select Network
            </h2>
            <p 
              className="text-xs mb-4 send-select-network-description"
              data-element-id="send-select-network-description"
              style={{
                color: sendLayerStyle.selectNetworkDescription?.textColor || '#aaa',
                fontFamily: sendLayerStyle.selectNetworkDescription?.fontFamily || 'Inter',
                fontSize: sendLayerStyle.selectNetworkDescription?.fontSize || '15px',
              }}
            >
              Choose the network to send your assets.
            </p>

            {/* Networks List */}
            <div className="space-y-3 send-networks-list" data-element-id="send-networks-list">
              {filteredNetworks.map((network, index) => (
                <div
                  key={network.id}
                  className="flex items-center justify-between p-4 cursor-pointer hover:opacity-90 transition-opacity send-network-item"
                  data-element-id={`send-network-item-${index}`}
                  onClick={() => handleNetworkSelect(network.name)}
                  style={{
                    backgroundColor: assetCard.backgroundColor || '#613c19',
                    borderRadius: assetCard.borderRadius || '18px',
                    transition: getTransition('default'),
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center send-network-icon-container" data-element-id={`send-network-icon-container-${index}`}>
                      <img
                        src={network.icon}
                        alt={network.name}
                        className="w-8 h-8 object-cover rounded send-network-icon"
                        data-element-id={`send-network-icon-${index}`}
                      />
                    </div>
                    <div className="send-network-info" data-element-id={`send-network-info-${index}`}>
                      <div 
                        className="font-medium text-sm send-network-name"
                        data-element-id={`send-network-name-${index}`}
                        style={{
                          fontSize: assetCard.title?.fontSize || '16px',
                          fontWeight: assetCard.title?.fontWeight || 'bold',
                          fontFamily: assetCard.title?.fontFamily || 'Inter, sans-serif',
                          color: assetCard.title?.textColor || '#FFFFFF',
                        }}
                      >
                        {network.name}
                      </div>
                      <div 
                        className="text-xs send-network-description"
                        data-element-id={`send-network-description-${index}`}
                        style={{ 
                          fontSize: assetCard.description?.fontSize || '14px',
                          fontWeight: assetCard.description?.fontWeight || '400',
                          fontFamily: assetCard.description?.fontFamily || 'Inter, sans-serif',
                          color: assetCard.description?.textColor || '#aaa',
                        }}
                      >
                        {network.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredNetworks.length === 0 && searchQuery && (
              <div className="text-center py-8 send-no-results" data-element-id="send-no-results">
                <p 
                  className="text-sm send-no-results-text"
                  data-element-id="send-no-results-text"
                  style={{ 
                    fontSize: assetCard.description?.fontSize || '14px',
                    fontFamily: assetCard.description?.fontFamily || 'Inter, sans-serif',
                    color: assetCard.description?.textColor || '#aaa'
                  }}
                >
                  No networks found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Close button */}
        <div 
          className="p-4 border-t border-white/10 send-footer"
          data-element-id="send-footer"
        >
          <button
            onClick={handleClose}
            className="wallet-action-button w-full py-3 px-4 flex items-center justify-center space-x-2 send-close-button"
            data-element-id="send-close-button"
          >
            <X 
              className="wallet-action-button-icon w-5 h-5 send-close-icon" 
              data-element-id="send-close-icon"
            />
            <span className="font-medium send-close-text" data-element-id="send-close-text">Close</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SendLayer;
