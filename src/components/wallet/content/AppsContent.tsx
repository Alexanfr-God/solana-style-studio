
import React from 'react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const AppsContent = () => {
  const { getAppsLayer } = useWalletTheme();
  const appsStyle = getAppsLayer();

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
          className="text-2xl font-bold mb-2 collectibles-title"
          data-element-id="collectibles-title"
          style={{
            color: appsStyle.title?.textColor || '#FFFFFF',
            fontFamily: appsStyle.title?.fontFamily || 'Inter, sans-serif',
            fontWeight: appsStyle.title?.fontWeight || 'bold',
            fontSize: appsStyle.title?.fontSize || '26px'
          }}
        >
          Collectibles
        </h2>
        <p 
          className="mb-6 collectibles-description"
          data-element-id="collectibles-description"
          style={{ 
            color: appsStyle.subtitle?.textColor || '#aaa',
            fontFamily: appsStyle.subtitle?.fontFamily || 'Inter, sans-serif',
            fontSize: appsStyle.subtitle?.fontSize || '16px'
          }}
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
              backgroundColor: appsStyle.collectibleCard?.backgroundColor || '#232323',
              borderRadius: appsStyle.collectibleCard?.borderRadius || '16px',
              backgroundImage: appsStyle.collectibleCard?.backgroundImage || ''
            }}
          >
            <div className="text-4xl mb-2">🎨</div>
            <div 
              className="font-medium"
              style={{
                color: appsStyle.collectibleName?.textColor || '#FFFFFF',
                fontFamily: appsStyle.collectibleName?.fontFamily || 'Inter, sans-serif',
                fontSize: appsStyle.collectibleName?.fontSize || '17px'
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
              backgroundColor: appsStyle.collectibleCard?.backgroundColor || '#232323',
              borderRadius: appsStyle.collectibleCard?.borderRadius || '16px',
              backgroundImage: appsStyle.collectibleCard?.backgroundImage || ''
            }}
          >
            <div className="text-4xl mb-2">🎮</div>
            <div 
              className="font-medium"
              style={{
                color: appsStyle.collectibleName?.textColor || '#FFFFFF',
                fontFamily: appsStyle.collectibleName?.fontFamily || 'Inter, sans-serif',
                fontSize: appsStyle.collectibleName?.fontSize || '17px'
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
              backgroundColor: appsStyle.collectibleCard?.backgroundColor || '#232323',
              borderRadius: appsStyle.collectibleCard?.borderRadius || '16px',
              backgroundImage: appsStyle.collectibleCard?.backgroundImage || ''
            }}
          >
            <div className="text-4xl mb-2">🖼️</div>
            <div 
              className="font-medium"
              style={{
                color: appsStyle.collectibleName?.textColor || '#FFFFFF',
                fontFamily: appsStyle.collectibleName?.fontFamily || 'Inter, sans-serif',
                fontSize: appsStyle.collectibleName?.fontSize || '17px'
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
              backgroundColor: appsStyle.collectibleCard?.backgroundColor || '#232323',
              borderRadius: appsStyle.collectibleCard?.borderRadius || '16px',
              backgroundImage: appsStyle.collectibleCard?.backgroundImage || ''
            }}
          >
            <div className="text-4xl mb-2">⚔️</div>
            <div 
              className="font-medium"
              style={{
                color: appsStyle.collectibleName?.textColor || '#FFFFFF',
                fontFamily: appsStyle.collectibleName?.fontFamily || 'Inter, sans-serif',
                fontSize: appsStyle.collectibleName?.fontSize || '17px'
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
            color: appsStyle.manageCollectibleList?.textColor || '#FFD700',
            fontFamily: appsStyle.manageCollectibleList?.fontFamily || 'Inter, sans-serif',
            fontSize: appsStyle.manageCollectibleList?.fontSize || '14px'
          }}
        >
          Manage collectible list
        </button>
      </div>
    </div>
  );
};

export default AppsContent;
