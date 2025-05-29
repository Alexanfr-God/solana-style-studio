
import React, { useRef, useEffect } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Plus, Settings, Edit3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WalletSidebar = () => {
  const {
    accounts,
    activeAccountId,
    walletStyle,
    setActiveAccount,
    setShowAccountDropdown,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();
  
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowAccountDropdown]);

  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    setShowAccountDropdown(false);
    triggerAiPetInteraction();
  };

  const handleFooterAction = (action: string) => {
    console.log(`${action} clicked`);
    triggerAiPetInteraction();
    setShowAccountDropdown(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => setShowAccountDropdown(false)}
      />
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className="fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-slide-in-right"
        style={{ fontFamily: walletStyle.font || 'Inter' }}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white mb-2">Select Account</h2>
          <p className="text-sm text-gray-400">Choose which account to use</p>
        </div>
        
        {/* Scrollable Account List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                  account.id === activeAccountId ? 'bg-white/5 border border-white/20' : ''
                }`}
                onClick={() => handleAccountSelect(account.id)}
              >
                {/* Account Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
                  style={{ 
                    backgroundColor: account.id === activeAccountId 
                      ? walletStyle.primaryColor || '#9945FF' 
                      : '#444' 
                  }}
                >
                  <span className="text-lg">
                    {account.name.slice(-1)}
                  </span>
                </div>
                
                {/* Account Info */}
                <div className="flex-1">
                  <div className="font-semibold text-white text-base mb-1">
                    {account.name}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {account.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    {account.network}
                  </div>
                </div>
                
                {/* Active Indicator */}
                {account.id === activeAccountId && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: walletStyle.primaryColor || '#9945FF' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-6 border-t border-white/10">
          <TooltipProvider>
            <div className="flex items-center justify-around">
              {/* Add/Connect Wallet */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105"
                    onClick={() => handleFooterAction('Add Wallet')}
                  >
                    <Plus className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-white/20">
                  <p>Add / Connect Wallet</p>
                </TooltipContent>
              </Tooltip>

              {/* Manage Accounts */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105"
                    onClick={() => handleFooterAction('Manage Accounts')}
                  >
                    <Edit3 className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-white/20">
                  <p>Manage Accounts</p>
                </TooltipContent>
              </Tooltip>

              {/* Settings */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105"
                    onClick={() => handleFooterAction('Settings')}
                  >
                    <Settings className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-white/20">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletSidebar;
