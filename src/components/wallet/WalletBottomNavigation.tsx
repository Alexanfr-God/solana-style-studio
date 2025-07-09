
import React from 'react';
import { Home, LayoutGrid, ArrowRightLeft, Clock, Search } from 'lucide-react';
import { useWalletCustomizationStore, WalletLayer } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const WalletBottomNavigation = () => {
  const {
    currentLayer,
    setCurrentLayer
  } = useWalletCustomizationStore();
  
  const { getHomeLayer } = useWalletTheme();
  const homeStyle = getHomeLayer();

  const navItems = [
    { 
      id: 'home' as WalletLayer, 
      icon: Home, 
      label: 'Home', 
      className: 'nav-home-icon',
      dataElementId: 'nav-home-icon'
    },
    { 
      id: 'apps' as WalletLayer, 
      icon: LayoutGrid, 
      label: 'Apps', 
      className: 'nav-apps-icon',
      dataElementId: 'nav-apps-icon'
    },
    { 
      id: 'swap' as WalletLayer, 
      icon: ArrowRightLeft, 
      label: 'Swap', 
      className: 'nav-swap-icon',
      dataElementId: 'nav-swap-icon'
    },
    { 
      id: 'history' as WalletLayer, 
      icon: Clock, 
      label: 'History', 
      className: 'nav-history-icon',
      dataElementId: 'nav-history-icon'
    },
    { 
      id: 'search' as WalletLayer, 
      icon: Search, 
      label: 'Search', 
      className: 'nav-search-icon',
      dataElementId: 'nav-search-icon'
    }
  ];

  const handleNavClick = (layerId: WalletLayer) => {
    console.log(`🔄 Navigation clicked: ${layerId}, current: ${currentLayer}`);
    setCurrentLayer(layerId);
    console.log(`✅ Navigation set to: ${layerId}`);
  };

  console.log(`🎯 Current layer in navigation: ${currentLayer}`);

  return (
    <div 
      className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-white/10 z-[5] bottom-navigation"
      data-element-id="bottom-navigation"
      style={{
        backgroundColor: homeStyle.footer?.backgroundImage 
          ? `url(${homeStyle.footer.backgroundImage})` 
          : homeStyle.footer?.backgroundColor || 'rgba(0, 0, 0, 0.5)',
        backgroundSize: homeStyle.footer?.backgroundImage ? 'cover' : undefined,
        backgroundPosition: homeStyle.footer?.backgroundImage ? 'center' : undefined,
        backdropFilter: 'blur(10px)',
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="grid grid-cols-5 items-center">
        {navItems.map(item => {
          const iconConfig = homeStyle.footer?.navigationIcons?.[`${item.id}Icon` as keyof typeof homeStyle.footer.navigationIcons];
          const isActive = currentLayer === item.id;
          
          return (
            <button 
              key={item.id}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-105 ${item.className} ${
                isActive ? 'opacity-100' : 'opacity-50'
              }`}
              data-element-id={item.dataElementId}
              onClick={() => handleNavClick(item.id)}
              style={{
                borderRadius: '8px'
              }}
            >
              <item.icon 
                className={`w-6 h-6 transition-colors ${item.className}`} 
                data-element-id={item.dataElementId}
                style={{
                  color: isActive 
                    ? iconConfig?.activeColor || homeStyle.footer?.activeIconColor || '#fff'
                    : iconConfig?.color || homeStyle.footer?.iconColor || '#6a55ff'
                }}
              />
              <span 
                className={`text-xs mt-1 transition-colors ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}
                style={{
                  color: isActive 
                    ? homeStyle.footer?.activeTextColor || '#FFFFFF'
                    : homeStyle.footer?.textColor || '#FFFFFF',
                  fontFamily: homeStyle.footer?.fontFamily
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WalletBottomNavigation;
