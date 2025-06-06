
import React from 'react';
import { Home, LayoutGrid, ArrowRightLeft, Clock, Search } from 'lucide-react';
import { useWalletCustomizationStore, WalletLayer } from '@/stores/walletCustomizationStore';

const WalletBottomNavigation = () => {
  const {
    currentLayer,
    getStyleForComponent,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  // Get navigation-specific styles
  const navigationStyle = getStyleForComponent('navigation');
  const buttonStyle = getStyleForComponent('buttons');

  const navItems = [
    { id: 'home' as WalletLayer, icon: Home, label: 'Home' },
    { id: 'apps' as WalletLayer, icon: LayoutGrid, label: 'Apps' },
    { id: 'swap' as WalletLayer, icon: ArrowRightLeft, label: 'Swap' },
    { id: 'history' as WalletLayer, icon: Clock, label: 'History' },
    { id: 'search' as WalletLayer, icon: Search, label: 'Search' }
  ];

  const handleNavClick = (layerId: WalletLayer) => {
    setCurrentLayer(layerId);
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 2000);
    console.log(`Navigated to ${layerId} layer`);
  };

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-white/10 z-30"
      style={{
        backgroundColor: navigationStyle.backgroundColor || 'rgba(0, 0, 0, 0.5)',
        background: navigationStyle.gradient || navigationStyle.backgroundColor || 'rgba(0, 0, 0, 0.5)',
        backdropFilter: navigationStyle.backdropFilter || 'blur(10px)',
        borderRadius: navigationStyle.borderRadius || '0px',
        border: navigationStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: navigationStyle.boxShadow
      }}
    >
      <div className="grid grid-cols-5 items-center">
        {navItems.map(item => (
          <button 
            key={item.id}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-105 ${
              currentLayer === item.id ? 'opacity-100' : 'opacity-50'
            }`}
            onClick={() => handleNavClick(item.id)}
            style={{
              borderRadius: navigationStyle.borderRadius || '8px'
            }}
          >
            <item.icon 
              className={`w-6 h-6 transition-colors ${
                currentLayer === item.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`} 
              style={{
                color: currentLayer === item.id 
                  ? buttonStyle.backgroundColor || '#9945FF'
                  : undefined
              }}
            />
            <span 
              className={`text-xs mt-1 transition-colors ${
                currentLayer === item.id 
                  ? 'text-white' 
                  : 'text-gray-400'
              }`}
              style={{
                color: currentLayer === item.id 
                  ? buttonStyle.textColor || '#FFFFFF'
                  : undefined,
                fontFamily: navigationStyle.fontFamily
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WalletBottomNavigation;
