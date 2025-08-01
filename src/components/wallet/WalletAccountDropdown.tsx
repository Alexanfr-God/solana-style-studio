
import React, { useRef, useEffect } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import WalletList from './WalletList';

interface WalletAccountDropdownProps {
  context?: 'account-selector' | 'receive-flow' | 'send-flow';
  onClose?: () => void;
}

const WalletAccountDropdown = ({ context = 'account-selector', onClose }: WalletAccountDropdownProps) => {
  const {
    setShowAccountDropdown,
    setActiveAccount
  } = useWalletCustomizationStore();
  
  const { getHomeLayer, getTransition } = useWalletTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const homeStyle = getHomeLayer();
  const dropdownConfig = homeStyle.accountDropdown;

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
    <>
      {/* Backdrop with rounded corners */}
      <div 
        className="fixed w-80 backdrop-blur-sm z-[9997] rounded-xl account-dropdown-overlay"
        data-element-id="account-dropdown-overlay"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: dropdownConfig?.containerBorderRadius || '16px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          height: 'auto',
          minHeight: '300px'
        }}
        onClick={() => {
          if (onClose) {
            onClose();
          } else {
            setShowAccountDropdown(false);
          }
        }}
      />
      
      {/* Dropdown */}
      <div 
        ref={dropdownRef}
        className="fixed w-80 rounded-xl border shadow-2xl overflow-hidden animate-fade-in z-[9999] account-dropdown-menu"
        data-element-id="account-dropdown-menu"
        style={{
          backgroundColor: dropdownConfig?.containerBackgroundColor || '#18140e',
          backdropFilter: 'blur(20px)',
          borderRadius: dropdownConfig?.containerBorderRadius || '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b account-dropdown-header"
          data-element-id="account-dropdown-header"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 
            className="text-sm font-medium account-dropdown-title"
            data-element-id="account-dropdown-title"
            style={{
              color: dropdownConfig?.headerText?.selectAccountColor || '#FFD166',
              fontFamily: dropdownConfig?.headerText?.selectAccountFontFamily || 'Inter, sans-serif',
              fontSize: dropdownConfig?.headerText?.selectAccountFontSize || '14px'
            }}
          >
            {getTitle()}
          </h3>
          <p 
            className="text-xs mt-1 account-dropdown-description"
            data-element-id="account-dropdown-description"
            style={{ 
              color: dropdownConfig?.headerText?.selectAccountDescription || '#ffe6a2',
              fontFamily: dropdownConfig?.headerText?.selectAccountFontFamily || 'Inter, sans-serif'
            }}
          >
            {getDescription()}
          </p>
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
        <div 
          className="px-4 py-3 border-t account-dropdown-footer"
          data-element-id="account-dropdown-footer"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <button 
            className="w-full text-sm transition-colors hover:scale-105 account-dropdown-add-button"
            data-element-id="account-dropdown-add-button"
            onClick={() => {
              console.log('Add new account');
              if (onClose) {
                onClose();
              } else {
                setShowAccountDropdown(false);
              }
            }}
            style={{
              color: dropdownConfig?.actionButtons?.addAccountColor || '#FFD700',
              fontFamily: dropdownConfig?.actionButtons?.addAccountFontFamily || 'Inter, sans-serif',
              fontSize: dropdownConfig?.actionButtons?.addAccountFontSize || '14px',
              transition: getTransition('default')
            }}
          >
            <span className="account-dropdown-add-text" data-element-id="account-dropdown-add-text">
              + Add New Account
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default WalletAccountDropdown;
