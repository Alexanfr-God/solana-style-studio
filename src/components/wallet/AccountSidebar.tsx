
import React from 'react';
import { X, Plus, Pencil, Settings } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatAddress } from '@/lib/utils';

const AccountSidebar = () => {
  const {
    accounts,
    activeAccountId,
    setActiveAccount,
    showAccountSidebar,
    setShowAccountSidebar
  } = useWalletCustomizationStore();

  const { getComponentStyle, getTransition } = useWalletTheme();

  // Get component-specific styles from theme
  const overlayStyle = getComponentStyle('overlays');
  const containerStyle = getComponentStyle('containers');
  const buttonStyle = getComponentStyle('buttons');
  const globalStyle = getComponentStyle('global');

  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    setShowAccountSidebar(false);
  };

  const handleClose = () => {
    setShowAccountSidebar(false);
  };

  const handleIconClick = (iconType: string) => {
    console.log(`${iconType} clicked`);
  };

  if (!showAccountSidebar) return null;

  return (
    <>
      {/* Overlay with rounded corners */}
      <div 
        className="fixed top-4 left-4 bottom-4 right-4 z-40 account-sidebar-overlay"
        data-element-id="account-sidebar-overlay"
        onClick={handleClose}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: overlayStyle.backdropFilter || 'blur(8px)',
          borderRadius: overlayStyle.borderRadius || '16px'
        }}
      />
      
      {/* Sidebar with rounded corners */}
      <div 
        className="fixed top-4 left-4 bottom-4 w-80 z-50 flex flex-col animate-slide-in-right account-sidebar-container"
        data-element-id="account-sidebar-container"
        style={{
          backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
          backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
          fontFamily: globalStyle.fontFamily || 'Inter',
          border: overlayStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: overlayStyle.borderRadius || '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header with close button */}
        <div 
          className="flex items-center justify-between p-4 border-b account-sidebar-header"
          data-element-id="account-sidebar-header"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2 
            className="text-lg font-medium text-white account-sidebar-title"
            data-element-id="account-sidebar-title"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            Accounts
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors account-sidebar-close"
            data-element-id="account-sidebar-close"
            style={{
              borderRadius: buttonStyle.borderRadius || '8px',
              transition: getTransition('default')
            }}
          >
            <X className="w-5 h-5 text-gray-400 account-sidebar-close-icon" data-element-id="account-sidebar-close-icon" />
          </button>
        </div>

        {/* Accounts List */}
        <div className="flex-1 p-4 space-y-3 overflow-auto account-sidebar-list" data-element-id="account-sidebar-list">
          {accounts.map((account, index) => (
            <button
              key={account.id}
              onClick={() => handleAccountSelect(account.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 account-sidebar-item ${
                activeAccountId === account.id ? 'ring-1 ring-purple-500' : ''
              }`}
              data-element-id={`account-sidebar-item-${index}`}
              style={{
                backgroundColor: activeAccountId === account.id 
                  ? containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)' 
                  : 'transparent',
                borderRadius: containerStyle.borderRadius || '12px',
                transition: getTransition('default')
              }}
            >
              <Avatar className="w-10 h-10 account-sidebar-avatar" data-element-id={`account-sidebar-avatar-${index}`}>
                <AvatarImage src="" alt={account.name} />
                <AvatarFallback 
                  className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium account-sidebar-avatar-fallback"
                  data-element-id={`account-sidebar-avatar-fallback-${index}`}
                  style={{
                    background: 'linear-gradient(135deg, #9945FF, #14F195)'
                  }}
                >
                  {account.name.charAt(account.name.length - 1)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left account-sidebar-account-info" data-element-id={`account-sidebar-account-info-${index}`}>
                <div 
                  className="text-sm font-medium text-white account-sidebar-account-name"
                  data-element-id={`account-sidebar-account-name-${index}`}
                  style={{
                    color: globalStyle.textColor || '#FFFFFF',
                    fontFamily: globalStyle.fontFamily
                  }}
                >
                  {account.name}
                </div>
                <div 
                  className="text-xs text-gray-400 account-sidebar-account-address"
                  data-element-id={`account-sidebar-account-address-${index}`}
                  style={{ fontFamily: globalStyle.fontFamily }}
                >
                  {formatAddress(account.address)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div 
          className="p-4 border-t account-sidebar-actions"
          data-element-id="account-sidebar-actions"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-center space-x-6 account-sidebar-action-buttons" data-element-id="account-sidebar-action-buttons">
            <button
              onClick={() => handleIconClick('add')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors account-sidebar-add-button"
              data-element-id="account-sidebar-add-button"
              title="Add Account"
              style={{
                borderRadius: buttonStyle.borderRadius || '12px',
                transition: getTransition('default')
              }}
            >
              <Plus className="w-6 h-6 text-gray-400 hover:text-white account-sidebar-add-icon" data-element-id="account-sidebar-add-icon" />
            </button>
            <button
              onClick={() => handleIconClick('edit')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors account-sidebar-edit-button"
              data-element-id="account-sidebar-edit-button"
              title="Edit Account"
              style={{
                borderRadius: buttonStyle.borderRadius || '12px',
                transition: getTransition('default')
              }}
            >
              <Pencil className="w-6 h-6 text-gray-400 hover:text-white account-sidebar-edit-icon" data-element-id="account-sidebar-edit-icon" />
            </button>
            <button
              onClick={() => handleIconClick('settings')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors account-sidebar-settings-button"
              data-element-id="account-sidebar-settings-button"
              title="Settings"
              style={{
                borderRadius: buttonStyle.borderRadius || '12px',
                transition: getTransition('default')
              }}
            >
              <Settings className="w-6 h-6 text-gray-400 hover:text-white account-sidebar-settings-icon" data-element-id="account-sidebar-settings-icon" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSidebar;
