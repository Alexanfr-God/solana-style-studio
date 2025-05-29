
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

interface WalletListProps {
  context: 'dropdown' | 'popup';
  onAccountSelect?: (accountId: string) => void;
  onClose?: () => void;
}

const WalletList = ({ context, onAccountSelect, onClose }: WalletListProps) => {
  const {
    accounts,
    activeAccountId,
    walletStyle,
    setActiveAccount,
    triggerAiPetInteraction
  } = useWalletCustomizationStore();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleAccountSelect = (accountId: string) => {
    if (onAccountSelect) {
      onAccountSelect(accountId);
    } else {
      setActiveAccount(accountId);
    }
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

  const containerClass = context === 'dropdown' 
    ? "max-h-64 overflow-y-auto" 
    : "max-h-80 overflow-y-auto";

  return (
    <div className={containerClass}>
      {accounts.map((account) => (
        <div
          key={account.id}
          className={`flex items-center justify-between p-4 hover:bg-white/10 transition-colors cursor-pointer ${
            account.id === activeAccountId ? 'bg-white/5' : ''
          }`}
          onClick={() => handleAccountSelect(account.id)}
          data-shared-element-id="walletList"
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
  );
};

export default WalletList;
