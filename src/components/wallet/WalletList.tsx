
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { formatAddress } from '@/lib/utils';

interface WalletListProps {
  context: 'dropdown' | 'popup';
  onAccountSelect?: (accountId: string) => void;
  onClose?: () => void;
  metadata?: {
    triggeredBy?: string;
    purpose?: string;
    sharedElementId?: string;
    context?: string;
    layoutType?: string;
    animation?: string;
  };
}

const WalletList = ({ context, onAccountSelect, onClose, metadata }: WalletListProps) => {
  const {
    accounts,
    activeAccountId,
    walletStyle,
    setActiveAccount
  } = useWalletCustomizationStore();
  
  const { getHomeLayer } = useWalletTheme();
  const dropdownStyle = getHomeLayer()?.accountDropdown;
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleAccountSelect = (accountId: string) => {
    if (onAccountSelect) {
      onAccountSelect(accountId);
    } else {
      setActiveAccount(accountId);
    }
  };

  const handleCopyAddress = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  const containerClass = context === 'dropdown' 
    ? "max-h-64 overflow-y-auto" 
    : "max-h-80 overflow-y-auto";

  return (
    <div 
      className={`${containerClass} wallet-list-container`}
      data-shared-element-id={metadata?.sharedElementId || 'walletList'}
      data-element-id="wallet-list-container"
      data-context={context}
      data-triggered-by={metadata?.triggeredBy}
    >
      {accounts.map((account, index) => (
        <div
          key={account.id}
          className={`flex items-center justify-between p-4 hover:bg-white/10 transition-colors cursor-pointer wallet-list-item ${
            account.id === activeAccountId ? 'bg-white/5' : ''
          }`}
          data-element-id={`wallet-list-item-${index}`}
          onClick={() => handleAccountSelect(account.id)}
          data-shared-element-id="walletItem"
        >
          <div className="flex items-center space-x-3 wallet-list-item-left" data-element-id={`wallet-list-item-left-${index}`}>
            {/* Account Avatar */}
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center wallet-list-avatar"
              data-element-id={`wallet-list-avatar-${index}`}
              style={{ 
                backgroundColor: account.id === activeAccountId 
                  ? walletStyle.primaryColor || '#9945FF' 
                  : '#444' 
              }}
            >
              <span className="font-medium text-white text-xs wallet-list-avatar-text" data-element-id={`wallet-list-avatar-text-${index}`}>
                {account.name.slice(-1)}
              </span>
            </div>
            
            {/* Account Info */}
            <div className="wallet-list-account-info" data-element-id={`wallet-list-account-info-${index}`}>
              <div 
                className="font-medium text-sm wallet-list-account-name" 
                data-element-id={`wallet-list-account-name-${index}`}
                style={{
                  color: dropdownStyle?.accountItems?.mainAccountColor || '#FFFFFF',
                  fontFamily: dropdownStyle?.accountItems?.mainAccountFontFamily || 'Inter, sans-serif'
                }}
              >
                {account.name}
              </div>
              <div 
                className="text-xs wallet-list-account-network" 
                data-element-id={`wallet-list-account-network-${index}`}
                style={{
                  color: dropdownStyle?.accountItems?.accountNetworkColor || '#aaa',
                  fontFamily: dropdownStyle?.accountItems?.tradingAccountFontFamily || 'Inter, sans-serif'
                }}
              >
                {account.network}
              </div>
            </div>
          </div>
          
          {/* Address and Copy */}
          <div className="flex items-center space-x-2 wallet-list-item-right" data-element-id={`wallet-list-item-right-${index}`}>
            <span 
              className="text-xs font-mono wallet-list-address" 
              data-element-id={`wallet-list-address-${index}`}
              style={{
                color: dropdownStyle?.accountItems?.accountAddressColor || '#aaa',
                fontFamily: 'monospace'
              }}
            >
              {formatAddress(account.address)}
            </span>
            <button
              className="p-1 rounded hover:bg-white/10 transition-colors wallet-list-copy-button"
              data-element-id={`wallet-list-copy-button-${index}`}
              onClick={(e) => handleCopyAddress(account.address, e)}
              data-shared-element-id="copyButton"
            >
              {copiedAddress === account.address ? (
                <Check className="w-3 h-3 text-green-400 wallet-list-copy-check" data-element-id={`wallet-list-copy-check-${index}`} />
              ) : (
                <Copy 
                  className="w-3 h-3 hover:scale-105 transition-transform wallet-list-copy-icon" 
                  data-element-id={`wallet-list-copy-icon-${index}`}
                  style={{
                    color: dropdownStyle?.icons?.copyAddressIcon?.color || '#aaa'
                  }}
                />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WalletList;
