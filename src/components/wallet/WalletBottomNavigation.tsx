
import React from 'react';
import { Home, LayoutGrid, ArrowRightLeft, Clock, Search } from 'lucide-react';
import { useWalletCustomizationStore, WalletLayer } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const WalletBottomNavigation = () => {
  const {
    currentLayer,
    setCurrentLayer
  } = useWalletCustomizationStore();
  
  const { getHomeLayer, getBottomNavigation } = useWalletTheme();
  const homeStyle = getHomeLayer();
  const bottomNavStyle = getBottomNavigation();

  const navItems = [
    { 
      id: 'home' as WalletLayer, 
      icon: Home, 
      label: 'Home', 
      iconDataId: 'global-nav-home-tab',
      labelDataId: 'global-nav-home-label'
    },
    { 
      id: 'apps' as WalletLayer, 
      icon: LayoutGrid, 
      label: 'Apps', 
      iconDataId: 'global-nav-apps-tab',
      labelDataId: 'global-nav-apps-label'
    },
    { 
      id: 'swap' as WalletLayer, 
      icon: ArrowRightLeft, 
      label: 'Swap', 
      iconDataId: 'global-nav-swap-tab',
      labelDataId: 'global-nav-swap-label'
    },
    { 
      id: 'history' as WalletLayer, 
      icon: Clock, 
      label: 'History', 
      iconDataId: 'global-nav-history-tab',
      labelDataId: 'global-nav-history-label'
    },
    { 
      id: 'search' as WalletLayer, 
      icon: Search, 
      label: 'Search', 
      iconDataId: 'global-nav-search-tab',
      labelDataId: 'global-nav-search-label'
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
        backgroundColor: (homeStyle.footer?.backgroundImage && homeStyle.footer.backgroundImage !== '')
          ? undefined
          : bottomNavStyle?.backgroundColor || homeStyle.footer?.backgroundColor || 'rgba(0, 0, 0, 0.5)',
        backgroundImage: (homeStyle.footer?.backgroundImage && homeStyle.footer.backgroundImage !== '')
          ? `url(${homeStyle.footer.backgroundImage})`
          : undefined,
        backgroundSize: (homeStyle.footer?.backgroundImage && homeStyle.footer.backgroundImage !== '') ? 'cover' : undefined,
        backgroundPosition: (homeStyle.footer?.backgroundImage && homeStyle.footer.backgroundImage !== '') ? 'center' : undefined,
        backdropFilter: 'blur(10px)',
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem',
        borderColor: bottomNavStyle?.borderColor || 'rgba(255, 255, 255, 0.1)',
        border: `1px solid ${bottomNavStyle?.borderColor || 'rgba(255, 255, 255, 0.1)'}`
      }}
    >
      <div className="grid grid-cols-5 items-center">
        {navItems.map(item => {
          const iconConfig = homeStyle.footer?.navigationIcons?.[`${item.id}Icon` as keyof typeof homeStyle.footer.navigationIcons];
          const isActive = currentLayer === item.id;
          
          return (
            <button 
              key={item.id}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:scale-105 ${
                isActive ? 'opacity-100' : 'opacity-50'
              }`}
              onClick={() => handleNavClick(item.id)}
              style={{
                borderRadius: '8px'
              }}
            >
              <item.icon 
                className={`w-6 h-6 transition-colors`} 
                data-element-id={item.iconDataId}
                style={{
                  color: isActive 
                    ? iconConfig?.activeColor || bottomNavStyle?.activeColor || homeStyle.footer?.activeIconColor || '#fff'
                    : iconConfig?.color || bottomNavStyle?.inactiveColor || homeStyle.footer?.iconColor || '#6a55ff'
                }}
              />
              <span 
                className={`text-xs mt-1 transition-colors`}
                data-element-id={item.labelDataId}
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
