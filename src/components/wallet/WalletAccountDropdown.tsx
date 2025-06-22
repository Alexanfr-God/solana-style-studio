
import React, { useRef, useEffect } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletList from './WalletList';

interface WalletAccountDropdownProps {
  context?: 'account-selector' | 'receive-flow' | 'send-flow';
  onClose?: () => void;
}

const WalletAccountDropdown = ({ context = 'account-selector', onClose }: WalletAccountDropdownProps) => {
  const {
    getStyleForComponent,
    setShowAccountDropdown,
    setActiveAccount,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get component-specific styles
  const overlayStyle = getStyleForComponent('overlays');
  const globalStyle = getStyleForComponent('global');
  const buttonStyle = getStyleForComponent('buttons');

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
    <>
      {/* Backdrop with rounded corners */}
      <div 
        className="fixed w-80 backdrop-blur-sm z-[9997] rounded-xl"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: overlayStyle.borderRadius || '16px',
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
        className="fixed w-80 rounded-xl border shadow-2xl overflow-hidden animate-fade-in z-[9999]"
        style={{
          backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
          backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
          borderRadius: overlayStyle.borderRadius || '16px',
          border: overlayStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: overlayStyle.boxShadow || '0 20px 40px rgba(0, 0, 0, 0.5)',
          fontFamily: globalStyle.fontFamily || 'Inter',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 border-b"
          style={{
            borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h3 
            className="text-sm font-medium text-white"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            {getTitle()}
          </h3>
          <p 
            className="text-xs text-gray-400 mt-1"
            style={{ fontFamily: globalStyle.fontFamily }}
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
          className="px-4 py-3 border-t"
          style={{
            backgroundColor: overlayStyle.backgroundColor?.replace('E6', 'CC') || 'rgba(255, 255, 255, 0.05)',
            borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <button 
            className="w-full text-sm transition-colors hover:scale-105"
            onClick={() => {
              console.log('Add new account');
              if (onClose) {
                onClose();
              } else {
                setShowAccountDropdown(false);
              }
              triggerAiPetInteraction();
            }}
            style={{
              color: buttonStyle.backgroundColor || '#9945FF',
              fontFamily: globalStyle.fontFamily,
              transition: buttonStyle.transition
            }}
          >
            + Add New Account
          </button>
        </div>
      </div>
    </>
  );
};

export default WalletAccountDropdown;
