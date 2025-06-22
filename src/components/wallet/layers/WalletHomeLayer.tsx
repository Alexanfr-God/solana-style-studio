
import React, { useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useAiPetOrbit } from '@/hooks/useAiPetOrbit';
import WalletAccountDropdown from '../WalletAccountDropdown';
import WalletBottomNavigation from '../WalletBottomNavigation';
import AccountSidebar from '../AccountSidebar';
import HomeContent from '../content/HomeContent';
import SwapContent from '../content/SwapContent';
import AppsContent from '../content/AppsContent';
import HistoryContent from '../content/HistoryContent';
import SearchContent from '../content/SearchContent';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AiPet from '@/components/ui/AiPet';

const WalletHomeLayer = () => {
  const {
    getStyleForComponent,
    accounts,
    activeAccountId,
    showAccountDropdown,
    setShowAccountDropdown,
    showAccountSidebar,
    setShowAccountSidebar,
    currentLayer,
    setCurrentLayer,
    triggerAiPetInteraction,
    setTemporaryEmotion,
    containerBounds,
    setContainerBounds,
    aiPet
  } = useWalletCustomizationStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const aiPetRef = useRef<HTMLDivElement>(null);
  
  // Get component-specific styles
  const globalStyle = getStyleForComponent('global');
  const headerStyle = getStyleForComponent('header');
  const navigationStyle = getStyleForComponent('navigation');
  
  // Используем хук для прямоугольной анимации AI Pet
  useAiPetOrbit(aiPetRef.current, containerBounds, 'rectangle');

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);

  const handleSearchClick = () => {
    console.log('🔍 Search clicked, setting layer to search');
    setCurrentLayer('search');
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  const handleAccountDropdownToggle = () => {
    setShowAccountDropdown(!showAccountDropdown);
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const handleAvatarClick = () => {
    setShowAccountSidebar(true);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  // Обновляем границы контейнера для AI Pet
  useEffect(() => {
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      setContainerBounds(bounds);
    }
  }, [setContainerBounds]);

  // Отслеживаем изменения размера контейнера
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        setContainerBounds(bounds);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setContainerBounds]);

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
      className="relative w-full h-full flex flex-col"
      style={{
        backgroundColor: globalStyle.backgroundColor || '#181818',
        fontFamily: globalStyle.fontFamily || 'Inter',
        backgroundImage: globalStyle.backgroundImage,
        borderRadius: '1rem',
        boxShadow: globalStyle.boxShadow,
        overflow: 'hidden' // Добавляем для правильного закругления
      }}
    >
      {/* Header Section with AI-generated styles */}
      <div 
        className="relative flex items-center justify-between px-4 py-3 border-b border-white/10 z-[10]"
        style={{
          backgroundColor: headerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          background: headerStyle.gradient || headerStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          backdropFilter: headerStyle.backdropFilter || 'blur(10px)',
          borderTopLeftRadius: '1rem',
          borderTopRightRadius: '1rem',
          border: headerStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: headerStyle.boxShadow,
          color: headerStyle.textColor || '#FFFFFF'
        }}
      >
        {/* Account Section */}
        <div className="flex items-center space-x-3">
          {/* Clickable Round Avatar */}
          <button
            onClick={handleAvatarClick}
            className="transition-transform duration-200 hover:scale-105"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src="" alt={activeAccount?.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                {activeAccount?.name.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
          </button>
          
          {/* Square Account Selector Button */}
          <button
            onClick={handleAccountDropdownToggle}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-105"
            style={{
              borderRadius: headerStyle.borderRadius || '8px',
              color: headerStyle.textColor || '#FFFFFF'
            }}
          >
            <div className="text-left">
              <div className="text-sm font-medium">
                {activeAccount?.name || 'Account 1'}
              </div>
              <div className="text-xs text-gray-400">
                {activeAccount?.address || '0x123...'}
              </div>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform ${showAccountDropdown ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Search Icon */}
        <button
          onClick={handleSearchClick}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          style={{
            borderRadius: headerStyle.borderRadius || '8px',
            color: headerStyle.textColor || '#FFFFFF'
          }}
        >
          <Search className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Dynamic Content based on current layer with isolated stacking context */}
      <div 
        className="relative flex-1 z-[1]"
        style={{ overflow: 'hidden' }} // Исправляем закругление для контента
      >
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
