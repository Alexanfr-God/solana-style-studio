
import React from 'react';
import { Home, LayoutGrid, ArrowRightLeft, Clock, Search } from 'lucide-react';
import { useWalletCustomizationStore, WalletLayer } from '@/stores/walletCustomizationStore';

const WalletBottomNavigation = () => {
  const {
    currentLayer,
    walletStyle,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

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
    <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-white/10 bg-black/50 backdrop-blur-md">
      <div className="grid grid-cols-5 items-center">
        {navItems.map(item => (
          <button 
            key={item.id}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-105 ${
              currentLayer === item.id ? 'opacity-100' : 'opacity-50'
            }`}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon 
              className={`w-6 h-6 transition-colors ${
                currentLayer === item.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`} 
              style={{
                color: currentLayer === item.id 
                  ? walletStyle.primaryColor || '#9945FF'
                  : undefined
              }}
            />
            <span 
              className={`text-xs mt-1 transition-colors ${
                currentLayer === item.id 
                  ? 'text-white' 
                  : 'text-gray-400'
              }`}
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
