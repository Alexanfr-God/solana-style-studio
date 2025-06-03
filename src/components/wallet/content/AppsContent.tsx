
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Image, Grid, Palette, Gamepad2 } from 'lucide-react';

const AppsContent = () => {
  const {
    walletStyle,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const handleCollectibleClick = (iconName: string) => {
    console.log(`Clicked collectible: ${iconName}`);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  const handleManageListClick = () => {
    console.log('Manage collectible list clicked');
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const collectibleIcons = [
    { icon: Image, name: 'Art NFT', color: '#FF6B6B' },
    { icon: Grid, name: 'Pixel Art', color: '#4ECDC4' },
    { icon: Palette, name: 'Digital Art', color: '#45B7D1' },
    { icon: Gamepad2, name: 'Game Item', color: '#96CEB4' }
  ];

  return (
    <div className="flex-1 px-4 pb-20 overflow-auto" id="apps-content-container">
      {/* Apps Content */}
      <div className="mb-8" id="apps-main-section">
        <h2 
          id="collectibles-title"
          className="text-2xl font-semibold text-white mb-2"
          style={{ 
            color: walletStyle.primaryColor || '#FFFFFF',
            fontFamily: walletStyle.font || 'Inter'
          }}
        >
          No collectibles found
        </h2>
        <p id="collectibles-description" className="text-sm text-gray-400 mb-6">
          You don't own any collectibles yet. Get your first collectible on a marketplace.
        </p>

        {/* Collectibles Grid */}
        <div id="collectibles-grid" className="grid grid-cols-4 gap-4 mb-8">
          {collectibleIcons.map((item, index) => (
            <button
              key={index}
              id={`collectible-icon-${index + 1}`}
              onClick={() => handleCollectibleClick(item.name)}
              className="flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105 group"
              data-shared-element-id={`nft-icon-${index + 1}`}
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
            onClick={handleManageListClick}
            className="relative text-sm font-medium transition-all duration-300 group"
            style={{ 
              color: walletStyle.primaryColor || '#9945FF',
              fontFamily: walletStyle.font || 'Inter'
            }}
            data-shared-element-id="manage-collectible-list"
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
