
import React from 'react';
import { Search, MoreVertical, Download, Send, ArrowRightLeft, DollarSign, Plus } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import WalletBottomNavigation from '../WalletBottomNavigation';
import { SidebarTrigger } from '@/components/ui/sidebar';

const WalletHomeLayer = () => {
  const {
    walletStyle,
    accounts,
    activeAccountId,
    tokens,
    totalBalance,
    totalChange,
    totalChangePercent,
    isBalancePositive,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  const activeAccount = accounts.find(acc => acc.id === activeAccountId);

  const handleAction = (action: string) => {
    console.log(`${action} clicked`);
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  const handleTokenClick = (tokenName: string) => {
    console.log(`${tokenName} token clicked`);
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 2000);
  };

  const handleSearchHover = () => {
    triggerAiPetInteraction();
  };

  return (
    <div className="h-full flex flex-col" style={{
      backgroundColor: walletStyle.backgroundColor || '#181818',
      fontFamily: walletStyle.font || 'Inter'
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <SidebarTrigger />
          
          {/* Account Info */}
          <div>
            <div className="font-medium text-white text-sm">
              {activeAccount?.name || 'Account 8'}
            </div>
            <div className="text-xs text-gray-400">
              {activeAccount?.address || 'A8...5Gh3'}
            </div>
          </div>
        </div>
        
        {/* Search Icon */}
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 group"
          onMouseEnter={handleSearchHover}
          onClick={() => handleAction('Search')}
        >
          <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>
      
      {/* Balance Section */}
      <div className="px-6 py-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {totalBalance}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span 
              className={`font-medium ${isBalancePositive ? 'text-green-400' : 'text-red-400'}`}
            >
              {totalChange}
            </span>
            <span 
              className={`text-sm px-2 py-0.5 rounded ${
                isBalancePositive 
                  ? 'bg-green-400/20 text-green-400' 
                  : 'bg-red-400/20 text-red-400'
              }`}
            >
              {totalChangePercent}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-3 px-4 pb-4">
        {[
          { id: 'receive', icon: Download, label: 'Receive' },
          { id: 'send', icon: Send, label: 'Send' },
          { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
          { id: 'buy', icon: DollarSign, label: 'Buy' }
        ].map(action => (
          <div key={action.id} className="flex flex-col items-center">
            <button 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105"
              onClick={() => handleAction(action.label)}
            >
              <action.icon 
                className="w-5 h-5" 
                style={{ color: walletStyle.primaryColor || '#9945FF' }} 
              />
            </button>
            <span className="text-xs text-gray-400">{action.label}</span>
          </div>
        ))}
      </div>
      
      {/* Tokens Section */}
      <div className="flex-1 px-4 pb-20 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-white">Assets</span>
          <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            See all
          </span>
        </div>
        
        {/* Token List */}
        <div className="space-y-2">
          {tokens.map(token => (
            <div 
              key={token.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              onClick={() => handleTokenClick(token.name)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-lg">{token.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{token.name}</div>
                  <div className="text-xs text-gray-400">{token.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white text-sm">{token.amount}</div>
                <div className="text-xs text-gray-400">{token.value}</div>
                <div className={`text-xs ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Manage Token List */}
        <button 
          className="w-full mt-6 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
          onClick={() => handleAction('Manage Token List')}
        >
          <Plus className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Manage Token List</span>
        </button>
      </div>
      
      {/* Bottom Navigation */}
      <WalletBottomNavigation />
    </div>
  );
};

export default WalletHomeLayer;
