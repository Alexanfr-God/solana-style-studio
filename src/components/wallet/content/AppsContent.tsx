
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Image, Grid, Palette, Gamepad2 } from 'lucide-react';

const AppsContent = () => {
  const {
    walletStyle
  } = useWalletCustomizationStore();

  const handleCollectibleClick = (iconName: string) => {
    console.log(`Clicked collectible: ${iconName}`);
  };

  const handleManageListClick = () => {
    console.log('Manage collectible list clicked');
  };

  const collectibleIcons = [
    { icon: Image, name: 'Art NFT', color: '#FF6B6B', className: 'nft-icon-1' },
    { icon: Grid, name: 'Pixel Art', color: '#4ECDC4', className: 'nft-icon-2' },
    { icon: Palette, name: 'Digital Art', color: '#45B7D1', className: 'nft-icon-3' },
    { icon: Gamepad2, name: 'Game Item', color: '#96CEB4', className: 'nft-icon-4' }
  ];

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto apps-content" data-element-id="apps-content-container" id="apps-content-container">
      {/* Apps Content */}
      <div className="mb-8" id="apps-main-section">
        <h2 
          id="collectibles-title"
          className="text-2xl font-semibold text-white mb-2 collectibles-title"
          data-element-id="collectibles-title"
          style={{ 
            color: walletStyle.primaryColor || '#FFFFFF',
            fontFamily: walletStyle.font || 'Inter'
          }}
        >
          No collectibles found
        </h2>
        <p 
          id="collectibles-description" 
          className="text-sm text-gray-400 mb-6 collectibles-description"
          data-element-id="collectibles-description"
        >
          You don't own any collectibles yet. Get your first collectible on a marketplace.
        </p>

        {/* Collectibles Grid */}
        <div 
          id="collectibles-grid" 
          className="grid grid-cols-4 gap-4 mb-8 collectibles-grid"
          data-element-id="collectibles-grid"
        >
          {collectibleIcons.map((item, index) => (
            <button
              key={index}
              id={`collectible-icon-${index + 1}`}
              className={`flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105 group ${item.className}`}
              data-element-id={item.className}
              onClick={() => handleCollectibleClick(item.name)}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: item.color }}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-gray-400 text-center group-hover:text-white transition-colors">
                {item.name}
              </span>
            </button>
          ))}
        </div>

        {/* Manage Collectible List Link */}
        <div className="flex justify-center" id="manage-collectible-section">
          <button
            id="manage-collectible-list"
            className="relative text-sm font-medium transition-all duration-300 group manage-collectible-list"
            data-element-id="manage-collectible-list"
            onClick={handleManageListClick}
            style={{ 
              color: walletStyle.primaryColor || '#9945FF',
              fontFamily: walletStyle.font || 'Inter'
            }}
          >
            <span className="relative z-10">Manage collectible list</span>
            <div 
              className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100 origin-left"
              style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppsContent;
