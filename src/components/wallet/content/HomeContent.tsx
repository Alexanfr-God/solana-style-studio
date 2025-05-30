
import React from 'react';
import { Download, Send, ArrowRightLeft, DollarSign, Plus } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const HomeContent = () => {
  const {
    getStyleForComponent,
    tokens,
    totalBalance,
    totalChange,
    totalChangePercent,
    isBalancePositive,
    setCurrentLayer,
    setShowAccountDropdown,
    triggerAiPetInteraction,
    setTemporaryEmotion
  } = useWalletCustomizationStore();

  // Get component-specific styles
  const buttonStyle = getStyleForComponent('buttons');
  const panelStyle = getStyleForComponent('panels');
  const globalStyle = getStyleForComponent('global');

  const handleAction = (action: string) => {
    console.log(`${action} clicked`);
    
    if (action === 'Receive') {
      setCurrentLayer('receive');
    } else if (action === 'Send') {
      setCurrentLayer('send');
    } else if (action === 'Swap') {
      setCurrentLayer('swap');
    } else if (action === 'Buy') {
      setCurrentLayer('buy');
    }
    
    triggerAiPetInteraction();
    setTemporaryEmotion('excited', 2000);
  };

  const handleTokenClick = (tokenName: string) => {
    console.log(`${tokenName} token clicked`);
    triggerAiPetInteraction();
    setTemporaryEmotion('happy', 2000);
  };

  return (
    <>
      {/* Balance Section */}
      <div className="px-6 py-6">
        <div className="text-center">
          <div 
            className="text-3xl font-bold text-white mb-2"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily || 'Inter'
            }}
          >
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
              style={{
                borderRadius: panelStyle.borderRadius || '4px'
              }}
            >
              {totalChangePercent}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons with AI-generated styles */}
      <div className="grid grid-cols-4 gap-3 px-4 pb-4">
        {[
          { id: 'receive', icon: Download, label: 'Receive' },
          { id: 'send', icon: Send, label: 'Send' },
          { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
          { id: 'buy', icon: DollarSign, label: 'Buy' }
        ].map(action => (
          <div key={action.id} className="flex flex-col items-center">
            <button 
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                background: buttonStyle.gradient || buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                borderRadius: buttonStyle.borderRadius || '16px',
                boxShadow: buttonStyle.boxShadow,
                color: buttonStyle.textColor || '#FFFFFF'
              }}
              onClick={() => handleAction(action.label)}
            >
              <action.icon 
                className="w-5 h-5" 
                style={{ 
                  color: buttonStyle.textColor || buttonStyle.backgroundColor || '#9945FF'
                }} 
              />
            </button>
            <span 
              className="text-xs text-gray-400"
              style={{
                color: globalStyle.textColor || '#9CA3AF',
                fontFamily: globalStyle.fontFamily
              }}
            >
              {action.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Tokens Section with panel styles */}
      <div className="flex-1 px-4 pb-20 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <span 
            className="font-medium text-white"
            style={{
              color: globalStyle.textColor || '#FFFFFF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            Assets
          </span>
          <span 
            className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors"
            style={{
              color: globalStyle.textColor || '#9CA3AF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            See all
          </span>
        </div>
        
        {/* Token List with panel styles */}
        <div className="space-y-2">
          {tokens.map(token => (
            <div 
              key={token.id}
              className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              style={{
                backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                background: panelStyle.gradient || panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
                borderRadius: panelStyle.borderRadius || '12px',
                border: panelStyle.border,
                boxShadow: panelStyle.boxShadow,
                backdropFilter: panelStyle.backdropFilter
              }}
              onClick={() => handleTokenClick(token.name)}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: buttonStyle.backgroundColor || 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%'
                  }}
                >
                  <span className="text-lg">{token.icon}</span>
                </div>
                <div>
                  <div 
                    className="font-medium text-white text-sm"
                    style={{
                      color: panelStyle.textColor || '#FFFFFF',
                      fontFamily: globalStyle.fontFamily
                    }}
                  >
                    {token.name}
                  </div>
                  <div className="text-xs text-gray-400">{token.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div 
                  className="font-medium text-white text-sm"
                  style={{
                    color: panelStyle.textColor || '#FFFFFF',
                    fontFamily: globalStyle.fontFamily
                  }}
                >
                  {token.amount}
                </div>
                <div className="text-xs text-gray-400">{token.value}</div>
                <div className={`text-xs ${token.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Manage Token List with panel styles */}
        <button 
          className="w-full mt-6 p-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
          style={{
            backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            background: panelStyle.gradient || panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.05)',
            borderRadius: panelStyle.borderRadius || '12px',
            border: panelStyle.border,
            boxShadow: panelStyle.boxShadow,
            backdropFilter: panelStyle.backdropFilter
          }}
          onClick={() => handleAction('Manage Token List')}
        >
          <Plus className="w-4 h-4 text-gray-400" />
          <span 
            className="text-sm text-gray-400"
            style={{
              color: panelStyle.textColor || '#9CA3AF',
              fontFamily: globalStyle.fontFamily
            }}
          >
            Manage Token List
          </span>
        </button>
      </div>
    </>
  );
};

export default HomeContent;
