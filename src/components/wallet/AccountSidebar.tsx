
import React from 'react';
import { X, Copy, LogOut, Settings } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatAddress } from '@/lib/utils';

const AccountSidebar = () => {
  const { 
    showAccountSidebar, 
    setShowAccountSidebar,
    accounts,
    activeAccountId,
    setActiveAccount 
  } = useWalletCustomizationStore();
  
  const { theme } = useWalletTheme();
  
  const activeAccount = accounts.find(acc => acc.id === activeAccountId);
  
  // Get sidebar styles from theme
  const sidebarStyle = theme.sidebarLayer || {};
  const avatarStyle = theme.avatarHeader || {};

  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    setShowAccountSidebar(false);
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      console.log('Address copied to clipboard');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (!showAccountSidebar) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={() => setShowAccountSidebar(false)}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 z-[101] transform transition-transform duration-300 ease-out"
        style={{
          backgroundColor: sidebarStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
          backdropFilter: sidebarStyle.backdropFilter || 'blur(20px)',
          borderRight: sidebarStyle.border || '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-white/10"
          style={{
            borderColor: sidebarStyle.borderColor || 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2 
            className="text-lg font-semibold"
            style={{
              color: sidebarStyle.header?.textColor || '#FFFFFF',
              fontFamily: sidebarStyle.header?.fontFamily || theme.global?.fontFamily || 'Inter, sans-serif'
            }}
          >
            Accounts
          </h2>
          <button
            onClick={() => setShowAccountSidebar(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{
              color: sidebarStyle.header?.iconColor || '#FFFFFF'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account List */}
        <div className="p-4 space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                account.id === activeAccountId ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: account.id === activeAccountId 
                  ? sidebarStyle.accountCard?.activeBackgroundColor || 'rgba(123, 108, 255, 0.2)'
                  : sidebarStyle.accountCard?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                ringColor: account.id === activeAccountId 
                  ? sidebarStyle.accountCard?.activeBorderColor || '#7B6CFF'
                  : 'transparent'
              }}
              onClick={() => handleAccountSelect(account.id)}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt={account.name} />
                  <AvatarFallback 
                    style={{
                      backgroundColor: avatarStyle.backgroundColor || '#7B6CFF',
                      color: avatarStyle.textColor || '#fff',
                      fontFamily: avatarStyle.fontFamily || 'Inter, sans-serif'
                    }}
                  >
                    {account.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div 
                    className="font-medium"
                    style={{
                      color: sidebarStyle.accountCard?.nameColor || '#FFFFFF',
                      fontFamily: sidebarStyle.accountCard?.fontFamily || theme.global?.fontFamily || 'Inter, sans-serif'
                    }}
                  >
                    {account.name}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-sm"
                      style={{
                        color: sidebarStyle.accountCard?.addressColor || '#CCCCCC'
                      }}
                    >
                      {formatAddress(account.address)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAddress(account.address);
                      }}
                      className="p-1 rounded hover:bg-white/10"
                      style={{
                        color: sidebarStyle.accountCard?.iconColor || '#CCCCCC'
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div 
                    className="text-sm"
                    style={{
                      color: sidebarStyle.accountCard?.balanceColor || '#CCCCCC'
                    }}
                  >
                    {account.balance}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div 
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10"
          style={{
            borderColor: sidebarStyle.borderColor || 'rgba(255, 255, 255, 0.1)',
            backgroundColor: sidebarStyle.footer?.backgroundColor || 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div className="space-y-2">
            <button 
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
              style={{
                color: sidebarStyle.footer?.textColor || '#FFFFFF'
              }}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button 
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-red-400"
              style={{
                color: sidebarStyle.footer?.dangerColor || '#EF4444'
              }}
            >
              <LogOut className="w-5 h-5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSidebar;
