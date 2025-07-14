
import React from 'react';
import { X, Plus, Pencil, Settings } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { useWalletStyles } from '@/hooks/useWalletStyles';
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

  const { getSidebarLayer, getTransition } = useWalletTheme();
  const { getComponentStyle } = useWalletStyles();

  // Get sidebar-specific styles from theme
  const sidebarStyle = getSidebarLayer();
  const overlayStyle = getComponentStyle('overlays');
  const buttonStyle = getComponentStyle('buttons');

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
      
      {/* Sidebar with rounded corners and theme styles */}
      <div 
        className="fixed top-4 left-4 bottom-4 w-80 z-50 flex flex-col animate-slide-in-right account-sidebar-container"
        data-element-id="account-sidebar-container"
        style={{
          backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
          backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
          fontFamily: sidebarStyle.center?.accountList?.accountName?.fontFamily || 'Inter',
          border: overlayStyle.border || '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: overlayStyle.borderRadius || '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header with close button and theme styles */}
        <div 
          className="flex items-center justify-between p-4 border-b account-sidebar-header"
          data-element-id="account-sidebar-header"
          style={{
            backgroundColor: sidebarStyle.header?.backgroundColor || '#181818',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2 
            className="text-lg font-medium account-sidebar-title"
            data-element-id="account-sidebar-title"
            style={{
              color: sidebarStyle.header?.accountTitle?.textColor || '#FFFFFF',
              fontFamily: sidebarStyle.header?.accountTitle?.fontFamily || 'Inter, sans-serif',
              fontWeight: sidebarStyle.header?.accountTitle?.fontWeight || 'bold',
              fontSize: sidebarStyle.header?.accountTitle?.fontSize || '19px'
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
            <X 
              className="w-5 h-5 account-sidebar-close-icon" 
              data-element-id="account-sidebar-close-icon"
              style={{
                color: sidebarStyle.header?.closeIcon?.color || '#aaa'
              }}
            />
          </button>
        </div>

        {/* Accounts List with theme styles */}
        <div 
          className="flex-1 p-4 space-y-3 overflow-auto account-sidebar-list" 
          data-element-id="account-sidebar-list"
          style={{
            backgroundColor: sidebarStyle.center?.backgroundColor || '#232323'
          }}
        >
          {accounts.map((account, index) => (
            <button
              key={account.id}
              onClick={() => handleAccountSelect(account.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 account-sidebar-item`}
              data-element-id={`account-sidebar-item-${index}`}
              style={{
                backgroundColor: activeAccountId === account.id 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'transparent',
                borderRadius: '12px',
                transition: getTransition('default'),
                ...(activeAccountId === account.id && {
                  boxShadow: sidebarStyle.center?.accountList?.selectedAnimation?.type === 'glow' 
                    ? `0 0 10px ${sidebarStyle.center?.accountList?.selectedAnimation?.color || '#a259ff'}` 
                    : undefined,
                  border: sidebarStyle.center?.accountList?.selectedAnimation?.type === 'border' 
                    ? `1px solid ${sidebarStyle.center?.accountList?.selectedAnimation?.color || '#a259ff'}` 
                    : undefined
                })
              }}
            >
              <Avatar className="w-10 h-10 account-sidebar-avatar" data-element-id={`account-sidebar-avatar-${index}`}>
                <AvatarImage src="" alt={account.name} />
                <AvatarFallback 
                  className="text-white font-medium account-sidebar-avatar-fallback"
                  data-element-id={`account-sidebar-avatar-fallback-${index}`}
                  style={{
                    backgroundColor: sidebarStyle.center?.accountList?.avatar?.backgroundColor || '#7B6CFF',
                    color: sidebarStyle.center?.accountList?.avatar?.textColor || '#fff',
                    fontFamily: sidebarStyle.center?.accountList?.avatar?.fontFamily || 'Inter, sans-serif',
                    fontWeight: sidebarStyle.center?.accountList?.avatar?.fontWeight || 'bold',
                    fontSize: sidebarStyle.center?.accountList?.avatar?.fontSize || '20px'
                  }}
                >
                  {account.name.charAt(account.name.length - 1)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left account-sidebar-account-info" data-element-id={`account-sidebar-account-info-${index}`}>
                <div 
                  className="text-sm font-medium account-sidebar-account-name"
                  data-element-id={`account-sidebar-account-name-${index}`}
                  style={{
                    color: sidebarStyle.center?.accountList?.accountName?.textColor || '#FFFFFF',
                    fontFamily: sidebarStyle.center?.accountList?.accountName?.fontFamily || 'Inter, sans-serif',
                    fontWeight: sidebarStyle.center?.accountList?.accountName?.fontWeight || 'bold',
                    fontSize: sidebarStyle.center?.accountList?.accountName?.fontSize || '17px'
                  }}
                >
                  {account.name}
                </div>
                <div 
                  className="text-xs account-sidebar-account-address"
                  data-element-id={`account-sidebar-account-address-${index}`}
                  style={{ 
                    color: sidebarStyle.center?.accountList?.accountAddress?.textColor || '#aaa',
                    fontFamily: sidebarStyle.center?.accountList?.accountAddress?.fontFamily || 'Inter, sans-serif',
                    fontSize: sidebarStyle.center?.accountList?.accountAddress?.fontSize || '14px'
                  }}
                >
                  {formatAddress(account.address)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions with theme styles */}
        <div 
          className="p-4 border-t account-sidebar-actions"
          data-element-id="account-sidebar-actions"
          style={{
            backgroundColor: sidebarStyle.footer?.backgroundColor || '#181818',
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
              <Plus 
                className="w-6 h-6 hover:text-white account-sidebar-add-icon" 
                data-element-id="account-sidebar-add-icon"
                style={{
                  color: sidebarStyle.footer?.footerIcons?.addIcon?.color || '#aaa'
                }}
              />
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
              <Pencil 
                className="w-6 h-6 hover:text-white account-sidebar-edit-icon" 
                data-element-id="account-sidebar-edit-icon"
                style={{
                  color: sidebarStyle.footer?.footerIcons?.editIcon?.color || '#aaa'
                }}
              />
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
              <Settings 
                className="w-6 h-6 hover:text-white account-sidebar-settings-icon" 
                data-element-id="account-sidebar-settings-icon"
                style={{
                  color: sidebarStyle.footer?.footerIcons?.settingsIcon?.color || '#aaa'
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSidebar;
