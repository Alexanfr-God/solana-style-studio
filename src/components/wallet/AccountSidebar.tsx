
import React from 'react';
import { X, Plus, Edit, Settings } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatAddress } from '@/lib/utils';

const AccountSidebar = () => {
  const {
    showAccountSidebar,
    setShowAccountSidebar,
    accounts,
    activeAccountId,
    setActiveAccount,
    getStyleForComponent
  } = useWalletCustomizationStore();

  const globalStyle = getStyleForComponent('global');
  const activeAccount = accounts.find(acc => acc.id === activeAccountId);

  if (!showAccountSidebar) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] account-sidebar-overlay"
        data-element-id="account-sidebar-overlay"
        onClick={() => setShowAccountSidebar(false)}
      />
      
      {/* Sidebar Panel */}
      <div 
        className="fixed top-0 right-0 h-full w-80 bg-gray-900 z-[51] transform transition-transform duration-300 ease-in-out account-sidebar-panel"
        data-element-id="account-sidebar-panel"
        style={{
          backgroundColor: globalStyle.backgroundColor || '#111827',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b border-white/10 account-sidebar-header"
          data-element-id="account-sidebar-header"
        >
          <h2 className="text-lg font-semibold text-white">Accounts</h2>
          <button
            onClick={() => setShowAccountSidebar(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors account-sidebar-close"
            data-element-id="account-sidebar-close"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div 
          className="flex-1 p-4 space-y-4 account-sidebar-content"
          data-element-id="account-sidebar-content"
        >
          {/* Main Account */}
          <div 
            className="p-4 rounded-lg bg-white/5 border border-white/10 sidebar-main-account"
            data-element-id="sidebar-main-account"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" alt={activeAccount?.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                  {activeAccount?.name.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div 
                  className="text-white font-medium sidebar-main-account-name"
                  data-element-id="sidebar-main-account-name"
                >
                  {activeAccount?.name || 'Main Account'}
                </div>
                <div 
                  className="text-gray-400 text-sm sidebar-main-account-address"
                  data-element-id="sidebar-main-account-address"
                >
                  {formatAddress(activeAccount?.address || '0x123...')}
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full inline-block">
              Active
            </div>
          </div>

          {/* Trading Account */}
          <div 
            className="p-4 rounded-lg bg-white/5 border border-white/10 sidebar-trading-account"
            data-element-id="sidebar-trading-account"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src="" alt="Trading Account" />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-medium">
                  T
                </AvatarFallable>
              </Avatar>
              <div>
                <div 
                  className="text-white font-medium sidebar-trading-account-name"
                  data-element-id="sidebar-trading-account-name"
                >
                  Trading Account
                </div>
                <div 
                  className="text-gray-400 text-sm sidebar-trading-account-address"
                  data-element-id="sidebar-trading-account-address"
                >
                  {formatAddress('0x456...')}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-500/20 px-2 py-1 rounded-full inline-block">
              Inactive
            </div>
          </div>

          {/* Account List */}
          <div className="space-y-2">
            {accounts.map((account) => (
              <button
                key={account.id}
                onClick={() => {
                  setActiveAccount(account.id);
                  setShowAccountSidebar(false);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  account.id === activeAccountId
                    ? 'bg-purple-500/20 border border-purple-500/50'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={account.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                      {account.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white text-sm font-medium">{account.name}</div>
                    <div className="text-gray-400 text-xs">{formatAddress(account.address)}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t border-white/10 sidebar-footer"
          data-element-id="sidebar-footer"
        >
          <div className="flex space-x-2">
            <button 
              className="flex-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 sidebar-plus-button"
              data-element-id="sidebar-plus-button"
            >
              <Plus className="w-5 h-5 text-white mx-auto" />
            </button>
            <button 
              className="flex-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 sidebar-pencil-button"
              data-element-id="sidebar-pencil-button"
            >
              <Edit className="w-5 h-5 text-white mx-auto" />
            </button>
            <button 
              className="flex-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 sidebar-settings-button"
              data-element-id="sidebar-settings-button"
            >
              <Settings className="w-5 h-5 text-white mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSidebar;
