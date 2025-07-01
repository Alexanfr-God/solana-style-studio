
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const AppsContent = () => {
  const { getStyleForComponent } = useWalletCustomizationStore();

  // Get component-specific styles
  const containerStyle = getStyleForComponent('containers');
  const panelStyle = getStyleForComponent('panels');
  const buttonStyle = getStyleForComponent('buttons');
  const globalStyle = getStyleForComponent('global');

  const handleNftClick = (type: string) => {
    console.log(`${type} NFT clicked`);
  };

  const handleManageCollectibles = () => {
    console.log('Manage collectibles clicked');
  };

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto apps-content" data-element-id="apps-content">
      {/* Collectibles Section */}
      <div className="py-6">
        <h2 
          className="text-2xl font-bold text-white mb-2 collectibles-title"
          data-element-id="collectibles-title"
          style={{
            color: globalStyle.textColor || '#FFFFFF',
            fontFamily: globalStyle.fontFamily
          }}
        >
          Collectibles
        </h2>
        <p 
          className="text-gray-400 mb-6 collectibles-description"
          data-element-id="collectibles-description"
          style={{ fontFamily: globalStyle.fontFamily }}
        >
          Manage your NFTs and digital collectibles
        </p>

        {/* NFT Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6 collectibles-grid" data-element-id="collectibles-grid">
          <button
            onClick={() => handleNftClick('Art')}
            className="p-6 rounded-xl hover:bg-white/10 transition-colors nft-icon-1"
            data-element-id="nft-icon-1"
            style={{
              backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
              borderRadius: panelStyle.borderRadius || '12px',
              border: panelStyle.border,
              backdropFilter: panelStyle.backdropFilter,
              transition: panelStyle.transition
            }}
          >
            <div className="text-4xl mb-2">🎨</div>
            <div 
              className="text-white font-medium"
              style={{
                color: globalStyle.textColor || '#FFFFFF',
                fontFamily: globalStyle.fontFamily
              }}
            >
              Art
            </div>
          </button>

          <button
            onClick={() => handleNftClick('Pixel Art')}
            className="p-6 rounded-xl hover:bg-white/10 transition-colors nft-icon-2"
            data-element-id="nft-icon-2"
            style={{
              backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
              borderRadius: panelStyle.borderRadius || '12px',
              border: panelStyle.border,
              backdropFilter: panelStyle.backdropFilter,
              transition: panelStyle.transition
            }}
          >
            <div className="text-4xl mb-2">🎮</div>
            <div 
              className="text-white font-medium"
              style={{
                color: globalStyle.textColor || '#FFFFFF',
                fontFamily: globalStyle.fontFamily
              }}
            >
              Pixel Art
            </div>
          </button>

          <button
            onClick={() => handleNftClick('Digital Art')}
            className="p-6 rounded-xl hover:bg-white/10 transition-colors nft-icon-3"
            data-element-id="nft-icon-3"
            style={{
              backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
              borderRadius: panelStyle.borderRadius || '12px',
              border: panelStyle.border,
              backdropFilter: panelStyle.backdropFilter,
              transition: panelStyle.transition
            }}
          >
            <div className="text-4xl mb-2">🖼️</div>
            <div 
              className="text-white font-medium"
              style={{
                color: globalStyle.textColor || '#FFFFFF',
                fontFamily: globalStyle.fontFamily
              }}
            >
              Digital Art
            </div>
          </button>

          <button
            onClick={() => handleNftClick('Game Items')}
            className="p-6 rounded-xl hover:bg-white/10 transition-colors nft-icon-4"
            data-element-id="nft-icon-4"
            style={{
              backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
              borderRadius: panelStyle.borderRadius || '12px',
              border: panelStyle.border,
              backdropFilter: panelStyle.backdropFilter,
              transition: panelStyle.transition
            }}
          >
            <div className="text-4xl mb-2">⚔️</div>
            <div 
              className="text-white font-medium"
              style={{
                color: globalStyle.textColor || '#FFFFFF',
                fontFamily: globalStyle.fontFamily
              }}
            >
              Game Items
            </div>
          </button>
        </div>

        {/* Manage Link */}
        <button
          onClick={handleManageCollectibles}
          className="w-full py-3 text-center hover:bg-white/10 transition-colors manage-collectible-list"
          data-element-id="manage-collectible-list"
          style={{
            color: buttonStyle.backgroundColor || '#9945FF',
            fontFamily: globalStyle.fontFamily,
            transition: buttonStyle.transition,
            borderRadius: buttonStyle.borderRadius || '8px'
          }}
        >
          Manage collectible list
        </button>
      </div>
    </div>
  );
};

export default AppsContent;
