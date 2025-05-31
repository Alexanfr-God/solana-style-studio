
import React, { useRef, useEffect } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletList from './WalletList';

interface WalletAccountDropdownProps {
  context?: 'account-selector' | 'receive-flow' | 'send-flow';
  onClose?: () => void;
}

const WalletAccountDropdown = ({ context = 'account-selector', onClose }: WalletAccountDropdownProps) => {
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
        if (onClose) {
          onClose();
        } else {
          setShowAccountDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowAccountDropdown, onClose]);

  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    if (onClose) {
      onClose();
    } else {
      setShowAccountDropdown(false);
    }
    triggerAiPetInteraction();
  };

  const getTitle = () => {
    switch (context) {
      case 'receive-flow':
        return 'Receive Crypto';
      case 'send-flow':
        return 'Send From Account';
      default:
        return 'Select Account';
    }
  };

  const getDescription = () => {
    switch (context) {
      case 'receive-flow':
        return 'Select an account to receive funds';
      case 'send-flow':
        return 'Choose which account to send from';
      default:
        return 'Choose which account to use';
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="w-80 bg-black/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in"
      style={{ fontFamily: walletStyle.font || 'Inter' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">{getTitle()}</h3>
        <p className="text-xs text-gray-400 mt-1">{getDescription()}</p>
      </div>
      
      {/* Shared Wallet List */}
      <WalletList 
        context="dropdown" 
        onAccountSelect={handleAccountSelect}
        metadata={{
          triggeredBy: context,
          purpose: context === 'receive-flow' ? 'Display wallet addresses for receive flow' : 'Account selection',
          sharedElementId: 'walletList'
        }}
      />
      
      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5">
        <button 
          className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          onClick={() => {
            console.log('Add new account');
            if (onClose) {
              onClose();
            } else {
              setShowAccountDropdown(false);
            }
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
