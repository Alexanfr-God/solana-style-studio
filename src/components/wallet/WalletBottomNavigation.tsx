
import React from 'react';
import { Home, Zap, Search, Clock, Grid3X3 } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const WalletBottomNavigation = () => {
  const { 
    currentLayer, 
    setCurrentLayer,
    getStyleForComponent 
  } = useWalletCustomizationStore();

  const navigationStyle = getStyleForComponent('navigation');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, selector: 'nav-home' },
    { id: 'apps', label: 'Apps', icon: Grid3X3, selector: 'nav-apps' },
    { id: 'swap', label: 'Swap', icon: Zap, selector: 'nav-swap' },
    { id: 'history', label: 'History', icon: Clock, selector: 'nav-history' },
    { id: 'search', label: 'Search', icon: Search, selector: 'nav-search' }
  ];

  return (
    <div 
      className="flex items-center justify-around px-4 py-3 border-t border-white/10 bg-black/20 backdrop-blur-md z-[10] bottom-navigation"
      data-element-id="bottom-navigation"
      style={{
        backgroundColor: navigationStyle.backgroundColor || 'rgba(0, 0, 0, 0.2)',
        backdropFilter: navigationStyle.backdropFilter || 'blur(10px)',
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem',
        border: navigationStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: navigationStyle.boxShadow
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentLayer === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentLayer(tab.id as any)}
            className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${tab.selector}`}
            data-element-id={tab.selector}
            style={{
              color: isActive 
                ? navigationStyle.activeColor || '#A855F7'
                : navigationStyle.inactiveColor || '#9CA3AF'
            }}
          >
            <Icon 
              className={`w-5 h-5 ${tab.selector}-icon`}
              data-element-id={`${tab.selector}-icon`}
            />
            <span 
              className={`text-xs font-medium ${tab.selector}-label`}
              data-element-id={`${tab.selector}-label`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default WalletBottomNavigation;
