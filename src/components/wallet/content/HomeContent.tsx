
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletStyles } from '@/hooks/useWalletStyles';
import WalletAssetItem from '../preview/WalletAssetItem';
import WalletActionButtons from '../preview/WalletActionButtons';

interface HomeContentProps {
  showAccountDropdown?: boolean;
}

const HomeContent: React.FC<HomeContentProps> = ({ showAccountDropdown = false }) => {
  const { 
    tokens, 
    totalBalance, 
    totalChange, 
    isBalancePositive,
    setCurrentLayer 
  } = useWalletCustomizationStore();
  const { getComponentStyle, getTokenColorStyle, tokenColors, getTransition } = useWalletStyles();

  const handleAssetClick = (tokenName: string) => {
    console.log(`Clicked on ${tokenName}`);
  };

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
    switch (action) {
      case 'Receive':
        setCurrentLayer('receive');
        break;
      case 'Send':
        setCurrentLayer('send');
        break;
      case 'Buy':
        setCurrentLayer('buy');
        break;
      case 'Swap':
        setCurrentLayer('swap');
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const balanceStyle = getComponentStyle('global');
  const changeStyle = getTokenColorStyle(totalChange);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      {/* Balance Section */}
      <div className="pt-4 pb-6 text-center">
        <div 
          className="text-sm opacity-70 mb-1"
          style={{ color: balanceStyle.color }}
        >
          Total Balance
        </div>
        <div 
          className="text-3xl font-bold mb-1"
          style={{ 
            color: balanceStyle.color,
            fontFamily: balanceStyle.fontFamily 
          }}
        >
          {totalBalance}
        </div>
        <div 
          className="text-sm font-medium"
          style={changeStyle}
        >
          {totalChange}
        </div>
      </div>

      {/* Action Buttons with conditional z-index */}
      <WalletActionButtons 
        onAction={handleAction} 
        style={{ 
          accentColor: tokenColors.info,
          borderRadius: String(getComponentStyle('buttons').borderRadius || '12px')
        }}
        showAccountDropdown={showAccountDropdown}
      />

      {/* Assets Section */}
      <div className="mt-6">
        <div 
          className="flex justify-between items-center mb-4"
          style={{ color: balanceStyle.color }}
        >
          <span className="font-medium">Assets</span>
          <span 
            className="text-sm opacity-70 cursor-pointer hover:opacity-100"
            style={{ 
              color: tokenColors.info,
              transition: getTransition('global')
            }}
          >
            See all
          </span>
        </div>
        
        <div className="space-y-3">
          {tokens.map(token => (
            <WalletAssetItem
              key={token.id}
              image={`/lovable-uploads/placeholder-${token.symbol.toLowerCase()}.png`}
              name={token.name}
              ticker={token.symbol}
              amount={token.amount}
              value={token.value}
              change={token.change}
              color={token.isPositive ? tokenColors.positive : tokenColors.negative}
              onClick={() => handleAssetClick(token.name)}
              style={{
                backgroundColor: getComponentStyle('cards').backgroundColor,
                borderRadius: String(getComponentStyle('cards').borderRadius || '16px'),
                accentColor: tokenColors.info,
                textColor: balanceStyle.color
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
