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
    walletStyle,
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
  
  // Используем хук для прямоугольной анимации AI Pet
  useAiPetOrbit(aiPetRef.current, containerBounds, 'rectangle');

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);

  const handleSearchClick = () => {
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

  // Render content based on current layer
  const renderContent = () => {
    switch (currentLayer) {
      case 'swap':
        return <SwapContent />;
      case 'apps':
        return <AppsContent />;
      case 'history':
        return <HistoryContent />;
      case 'search':
        return <SearchContent />;
      case 'home':
      default:
        return <HomeContent />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        backgroundColor: walletStyle.backgroundColor || '#181818',
        fontFamily: walletStyle.font || 'Inter'
      }}
    >
      {/* Header Section */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10">
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
          >
            <div className="text-left">
              <div className="text-sm font-medium text-white">
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
        >
          <Search className="w-5 h-5 text-gray-400" />
        </button>

        {/* Centered Account Dropdown */}
        {showAccountDropdown && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
            <WalletAccountDropdown context="account-selector" />
          </div>
        )}
      </div>

      {/* Dynamic Content based on current layer */}
      {renderContent()}

      {/* Bottom Navigation */}
      <WalletBottomNavigation />

      {/* Account Sidebar */}
      <AccountSidebar />
    </div>
  );
};

export default WalletHomeLayer;
