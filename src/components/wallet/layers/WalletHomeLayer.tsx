
import React, { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletAccountDropdown from '../WalletAccountDropdown';
import WalletBottomNavigation from '../WalletBottomNavigation';
import HomeContent from '../content/HomeContent';
import AppsContent from '../content/AppsContent';
import SwapContent from '../content/SwapContent';
import HistoryContent from '../content/HistoryContent';

const WalletHomeLayer = () => {
  const {
    walletStyle,
    accounts,
    activeAccountId,
    showAccountDropdown,
    setShowAccountDropdown,
    triggerAiPetInteraction,
    currentLayer
  } = useWalletCustomizationStore();

  const [dropdownContext, setDropdownContext] = useState<'account-selector' | 'send-flow'>('account-selector');

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);

  const handleSearchHover = () => {
    triggerAiPetInteraction();
  };

  const handleAccountDropdownClose = () => {
    setShowAccountDropdown(false);
    setDropdownContext('account-selector');
  };

  const renderContent = () => {
    switch (currentLayer) {
      case 'apps':
        return <AppsContent />;
      case 'swap':
        return <SwapContent />;
      case 'history':
        return <HistoryContent />;
      case 'home':
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{
      backgroundColor: walletStyle.backgroundColor || '#181818',
      fontFamily: walletStyle.font || 'Inter'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          {/* Account Avatar */}
          <div 
            className="relative w-9 h-9 rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
            onClick={() => {
              setDropdownContext('account-selector');
              setShowAccountDropdown(!showAccountDropdown);
            }}
          >
            <span className="font-medium text-white text-sm">
              {activeAccount?.name.slice(-1) || '8'}
            </span>
          </div>
          
          {/* Account Info */}
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setDropdownContext('account-selector');
              setShowAccountDropdown(!showAccountDropdown);
            }}
          >
            <div className="font-medium text-white text-sm">
              {activeAccount?.name || 'Account 8'}
            </div>
            <div className="text-xs text-gray-400">
              {activeAccount?.address || 'A8...5Gh3'}
            </div>
          </div>
          
          {/* Network Dropdown Trigger */}
          <div className="relative">
            <button
              className="flex items-center space-x-1 p-1 rounded hover:bg-white/10 transition-colors"
              onClick={() => {
                setDropdownContext('account-selector');
                setShowAccountDropdown(!showAccountDropdown);
              }}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
              </div>
            </button>
            
            {/* Account Dropdown */}
            {showAccountDropdown && (
              <WalletAccountDropdown 
                context={dropdownContext}
                onClose={handleAccountDropdownClose}
              />
            )}
          </div>
        </div>
        
        {/* Search Icon */}
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 group"
          onMouseEnter={handleSearchHover}
        >
          <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>
      
      {/* Dynamic Content Area */}
      {renderContent()}
      
      {/* Bottom Navigation */}
      <WalletBottomNavigation />
    </div>
  );
};

export default WalletHomeLayer;
