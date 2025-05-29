
import React, { useRef, useEffect } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const WalletAccountDropdown = () => {
  const {
    accounts,
    activeAccountId,
    walletStyle,
    setActiveAccount,
    setShowAccountDropdown,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
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
    triggerAiPetInteraction();
  };

  const handleCopyAddress = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    triggerAiPetInteraction();
    
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
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
      
      {/* Account List */}
      <div className="max-h-64 overflow-y-auto">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`flex items-center justify-between p-4 hover:bg-white/10 transition-colors cursor-pointer ${
              account.id === activeAccountId ? 'bg-white/5' : ''
            }`}
            onClick={() => handleAccountSelect(account.id)}
          >
            <div className="flex items-center space-x-3">
              {/* Account Avatar */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: account.id === activeAccountId 
                    ? walletStyle.primaryColor || '#9945FF' 
                    : '#444' 
                }}
              >
                <span className="font-medium text-white text-xs">
                  {account.name.slice(-1)}
                </span>
              </div>
              
              {/* Account Info */}
              <div>
                <div className="font-medium text-white text-sm">
                  {account.name}
                </div>
                <div className="text-xs text-gray-400">
                  {account.network}
                </div>
              </div>
            </div>
            
            {/* Address and Copy */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-mono">
                {account.address}
              </span>
              <button
                className="p-1 rounded hover:bg-white/10 transition-colors"
                onClick={(e) => handleCopyAddress(account.address, e)}
              >
                {copiedAddress === account.address ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
      
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
