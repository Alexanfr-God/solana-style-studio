
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Image, Grid, Palette, Gamepad2 } from 'lucide-react';

const AppsLayer = () => {
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
    <div 
      className="absolute inset-0 bg-black/95 backdrop-blur-md animate-slide-in-bottom"
      style={{
        backgroundColor: walletStyle.backgroundColor || '#181818',
        fontFamily: walletStyle.font || 'Inter'
      }}
    >
      {/* Content */}
      <div className="flex-1 px-4 py-6 mt-16">
        {/* Apps Content Container */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
          <div className="mb-8">
            <h2 
              className="text-2xl font-semibold text-white mb-2"
              style={{ color: walletStyle.primaryColor || '#FFFFFF' }}
            >
              Collectibles
            </h2>
            <p className="text-sm text-gray-400">
              Manage your digital collectibles and NFTs
            </p>
          </div>

          {/* Collectibles Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {collectibleIcons.map((item, index) => (
              <button
                key={index}
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

          {/* Additional Collectibles Preview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-white/10 flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer"
                onClick={() => handleCollectibleClick(`placeholder-${index}`)}
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{index}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Manage Collectible List Link */}
          <div className="flex justify-center">
            <button
              onClick={handleManageListClick}
              className="relative text-sm font-medium transition-all duration-300 group story-link"
              style={{ color: walletStyle.primaryColor || '#9945FF' }}
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

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Grid className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-blue-300 font-medium text-sm mb-1">Your Collection</h3>
              <p className="text-blue-200 text-xs leading-relaxed">
                View and manage your digital collectibles, NFTs, and other blockchain assets. 
                Click on any item to view details or interact with it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppsLayer;
