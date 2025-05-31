
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
    getStyleForComponent,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  // Get component-specific styles
  const overlayStyle = getStyleForComponent('overlays');
  const containerStyle = getStyleForComponent('containers');
  const buttonStyle = getStyleForComponent('buttons');
  const globalStyle = getStyleForComponent('global');

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
        className="fixed inset-0 z-40"
        onClick={handleClose}
        style={{
          backgroundColor: overlayStyle.backgroundColor?.replace('E6', '80') || 'rgba(0, 0, 0, 0.5)',
          backdropFilter: overlayStyle.backdropFilter || 'blur(8px)'
        }}
      />
      
      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-80 z-50 flex flex-col animate-slide-in-right"
        style={{
          backgroundColor: overlayStyle.backgroundColor || 'rgba(24, 24, 24, 0.95)',
          backdropFilter: overlayStyle.backdropFilter || 'blur(20px)',
          fontFamily: globalStyle.fontFamily || 'Inter',
          borderRight: overlayStyle.border || '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header with close button */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <h2 
            className="text-lg font-medium text-white"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            Accounts
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{
              borderRadius: buttonStyle.borderRadius || '8px',
              transition: buttonStyle.transition
            }}
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
                activeAccountId === account.id ? 'ring-1' : ''
              }`}
              style={{
                backgroundColor: activeAccountId === account.id 
                  ? containerStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)' 
                  : 'transparent',
                borderRadius: containerStyle.borderRadius || '12px',
                ringColor: buttonStyle.backgroundColor || '#9945FF',
                transition: containerStyle.transition
              }}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src="" alt={account.name} />
                <AvatarFallback 
                  className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-medium"
                  style={{
                    background: buttonStyle.gradient || 'linear-gradient(135deg, #9945FF, #14F195)'
                  }}
                >
                  {account.name.charAt(account.name.length - 1)}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div 
                  className="text-sm font-medium text-white"
                  style={{
                    color: globalStyle.textColor || '#FFFFFF',
                    fontFamily: globalStyle.fontFamily
                  }}
                >
                  {account.name}
                </div>
                <div 
                  className="text-xs text-gray-400"
                  style={{ fontFamily: globalStyle.fontFamily }}
                >
                  {account.address}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div 
          className="p-4 border-t"
          style={{
            borderColor: overlayStyle.border?.split(' ')[2] || 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={() => handleIconClick('add')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors"
              title="Add Account"
              style={{
                borderRadius: buttonStyle.borderRadius || '12px',
                transition: buttonStyle.transition
              }}
            >
              <Plus className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => handleIconClick('edit')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors"
              title="Edit Account"
              style={{
                borderRadius: buttonStyle.borderRadius || '12px',
                transition: buttonStyle.transition
              }}
            >
              <Pencil className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => handleIconClick('settings')}
              className="p-3 rounded-lg hover:bg-white/10 transition-colors"
              title="Settings"
              style={{
                borderRadius: buttonStyle.borderRadius || '12px',
                transition: buttonStyle.transition
              }}
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
