
import React from 'react';
import { X, Plus, Pencil, Settings } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const AccountSidebar = () => {
  const {
    accounts,
    activeAccountId,
    setActiveAccount,
    showAccountSidebar,
    setShowAccountSidebar,
    walletStyle,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const handleAccountSelect = (accountId: string) => {
    setActiveAccount(accountId);
    setShowAccountSidebar(false);
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 1500);
  };

  const handleClose = () => {
    setShowAccountSidebar(false);
    triggerAiPetInteraction();
  };

  const handleIconClick = (iconType: string) => {
    console.log(`${iconType} clicked`);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 1500);
  };

  if (!showAccountSidebar) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 z-50 flex flex-col animate-slide-in-right"
        style={{
          backgroundColor: walletStyle.backgroundColor || '#181818',
          fontFamily: walletStyle.font || 'Inter'
        }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Accounts</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Accounts List */}
        <div className="flex-1 p-4 space-y-3 overflow-auto">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleAccountSelect(account.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                activeAccountId === account.id ? 'bg-white/10 ring-1 ring-purple-500/50' : ''
              }`}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src="" alt={account.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium">
                  {account.name.charAt(account.name.length - 1)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium text-white">
                  {account.name}
                </div>
                <div className="text-xs text-gray-400">
                  {account.address}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => handleIconClick('add')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors"
              title="Add Account"
            >
              <Plus className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => handleIconClick('edit')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors"
              title="Edit Account"
            >
              <Pencil className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => handleIconClick('settings')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSidebar;
