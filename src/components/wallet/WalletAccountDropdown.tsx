
import React, { useRef, useEffect } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletList from './WalletList';

const WalletAccountDropdown = () => {
  const {
    walletStyle,
    setShowAccountDropdown,
    setActiveAccount,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-fade-in"
      style={{ fontFamily: walletStyle.font || 'Inter' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">Select Account</h3>
        <p className="text-xs text-gray-400 mt-1">Choose which account to use</p>
      </div>
      
      {/* Shared Wallet List */}
      <WalletList 
        context="dropdown" 
        onAccountSelect={handleAccountSelect}
      />
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <button 
          className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => {
            console.log('Add new account');
            setShowAccountDropdown(false);
            triggerAiPetInteraction();
          }}
        >
          + Add New Account
        </button>
      </div>
    </div>
  );
};

export default WalletAccountDropdown;
