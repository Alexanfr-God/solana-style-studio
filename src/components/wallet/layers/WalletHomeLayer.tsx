
import React, { useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import WalletAccountDropdown from '../WalletAccountDropdown';
import WalletBottomNavigation from '../WalletBottomNavigation';
import AccountSidebar from '../AccountSidebar';
import HomeContent from '../content/HomeContent';
import SwapContent from '../content/SwapContent';
import AppsContent from '../content/AppsContent';
import HistoryContent from '../content/HistoryContent';
import SearchContent from '../content/SearchContent';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatAddress } from '@/lib/utils';

const WalletHomeLayer = () => {
  const {
    accounts,
    activeAccountId,
    showAccountDropdown,
    setShowAccountDropdown,
    showAccountSidebar,
    setShowAccountSidebar,
    currentLayer,
    setCurrentLayer
  } = useWalletCustomizationStore();

  const { getHomeLayer, getAvatarHeader, getGlobal } = useWalletTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get theme styles
  const homeStyle = getHomeLayer();
  const avatarStyle = getAvatarHeader();
  const globalStyle = getGlobal();

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);

  const handleSearchClick = () => {
    console.log('🔍 Search clicked, setting layer to search');
    setCurrentLayer('search');
  };

  const handleAccountDropdownToggle = () => {
    setShowAccountDropdown(!showAccountDropdown);
  };

  const handleAvatarClick = () => {
    setShowAccountSidebar(true);
  };

  // Render content based on current layer with debugging
  const renderContent = () => {
    console.log(`🎨 Rendering content for layer: ${currentLayer}`);
    
    switch (currentLayer) {
      case 'swap':
        console.log('📊 Rendering SwapContent');
        return <SwapContent />;
      case 'apps':
        console.log('📱 Rendering AppsContent');
        return <AppsContent />;
      case 'history':
        console.log('🕐 Rendering HistoryContent');
        return <HistoryContent />;
      case 'search':
        console.log('🔍 Rendering SearchContent');
        return <SearchContent />;
      case 'home':
      default:
        console.log('🏠 Rendering HomeContent');
        return <HomeContent showAccountDropdown={showAccountDropdown} />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: homeStyle.backgroundColor || '#181818',
        fontFamily: globalStyle.fontFamily || 'Inter',
        backgroundImage: homeStyle.backgroundImage ? `url(${homeStyle.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '1rem',
        boxShadow: homeStyle.boxShadow
      }}
    >
      {/* Header Section with theme styles */}
      <div 
        className="relative flex items-center justify-between px-4 py-3 border-b border-white/10 z-[10] home-header"
        data-element-id="home-header"
        style={{
          backgroundColor: homeStyle.header?.backgroundImage 
            ? undefined 
            : homeStyle.header?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          backgroundImage: homeStyle.header?.backgroundImage 
            ? `url(${homeStyle.header.backgroundImage})` 
            : undefined,
          backgroundSize: homeStyle.header?.backgroundImage ? 'cover' : undefined,
          backgroundPosition: homeStyle.header?.backgroundImage ? 'center' : undefined,
          backdropFilter: homeStyle.header?.backdropFilter || 'blur(10px)',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          border: homeStyle.header?.border || '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: homeStyle.header?.boxShadow,
          color: homeStyle.header?.textColor || '#FFFFFF'
        }}
      >
        {/* Account Section */}
        <div className="flex items-center space-x-3">
          {/* Clickable Round Avatar with theme styles */}
          <button
            onClick={handleAvatarClick}
            className="transition-transform duration-200 hover:scale-105"
          >
            <Avatar className="w-10 h-10 home-user-avatar" data-element-id="home-user-avatar">
              <AvatarImage src="" alt={activeAccount?.name} />
              <AvatarFallback 
                className="text-white font-medium"
                style={{
                  backgroundColor: avatarStyle.backgroundColor || '#7B6CFF',
                  color: avatarStyle.textColor || '#fff',
                  fontFamily: avatarStyle.fontFamily || 'Inter, sans-serif',
                  fontWeight: avatarStyle.fontWeight || 'bold',
                  fontSize: avatarStyle.fontSize || '20px'
                }}
              >
                {activeAccount?.name.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
          </button>
          
          {/* Square Account Selector Button */}
          <button
            onClick={handleAccountDropdownToggle}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105 home-account-dropdown"
            data-element-id="home-account-dropdown"
            style={{
              borderRadius: homeStyle.header.borderRadius || '8px',
              color: homeStyle.header.textColor || '#FFFFFF'
            }}
          >
            <div className="text-left">
              <div className="text-sm font-medium home-account-name" data-element-id="home-account-name">
                {activeAccount?.name || 'Account 1'}
              </div>
              <div className="text-xs text-gray-400 home-account-address" data-element-id="home-account-address">
                {formatAddress(activeAccount?.address || '0x123...')}
              </div>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform home-dropdown-chevron ${showAccountDropdown ? 'rotate-180' : ''}`}
              data-element-id="home-dropdown-chevron"
            />
          </button>
        </div>

        {/* Search Icon */}
        <button
          onClick={handleSearchClick}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors home-search-button"
          data-element-id="home-search-button"
          style={{
            borderRadius: homeStyle.header?.borderRadius || '8px'
          }}
        >
          <Search 
            className="w-5 h-5" 
            style={{
              color: homeStyle.header?.searchIcon?.color || homeStyle.header?.textColor || '#FFFFFF'
            }}
          />
        </button>
      </div>

      {/* Dynamic Content based on current layer with isolated stacking context */}
      <div className="relative flex-1 z-[1]">
        {renderContent()}
      </div>

      {/* Bottom Navigation with AI-generated styles */}
      <WalletBottomNavigation />

      {/* Account Sidebar */}
      <AccountSidebar />

      {/* Dropdown rendered at root level for proper layering */}
      {showAccountDropdown && (
        <WalletAccountDropdown context="account-selector" />
      )}
    </div>
  );
};

export default WalletHomeLayer;
