
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import WalletAssetItem from '../WalletAssetItem';
import WalletActionButtons from '../WalletActionButtons';

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
  const { getHomeLayer, getAssetCard, getUnifiedTokenColor, tokenColors, getTransition } = useWalletTheme();

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

  const homeStyle = getHomeLayer();
  const assetCard = getAssetCard();
  const changeStyle = getUnifiedTokenColor(totalChange);

  return (
    <div className="relative flex-1 overflow-y-auto px-4 pb-4 z-[1]">
      {/* Balance Section */}
      <div className="pt-4 pb-6 text-center home-balance-section" data-element-id="home-balance-section">
        <div 
          className="text-sm opacity-70 mb-1 home-balance-label"
          data-element-id="home-balance-label"
          style={{ color: homeStyle.totalBalanceLabel?.textColor }}
        >
          Total Balance
        </div>
        <div 
          className="text-3xl font-bold mb-1 home-sol-amount"
          data-element-id="home-sol-amount"
          style={{ 
            color: homeStyle.totalBalanceValue?.textColor,
            fontFamily: homeStyle.totalBalanceValue?.fontFamily 
          }}
        >
          {totalBalance}
        </div>
        <div 
          className="text-sm font-medium home-usd-value"
          data-element-id="home-usd-value"
          style={changeStyle}
        >
          {totalChange}
        </div>
      </div>

      {/* Action Buttons with proper z-index isolation */}
      <div className="relative z-[2] home-actions-row" data-element-id="home-actions-row">
        <WalletActionButtons 
          onAction={handleAction} 
          style={{ 
            accentColor: tokenColors.info,
            borderRadius: homeStyle.actionButtons?.receiveButton?.borderRadius || '12px'
          }}
          showAccountDropdown={showAccountDropdown}
        />
      </div>

      {/* Assets Section */}
      <div className="mt-6 home-assets-section" data-element-id="home-assets-section">
        <div 
          className="flex justify-between items-center mb-4 home-assets-header"
          data-element-id="home-assets-header"
          style={{ color: homeStyle.totalBalanceValue?.textColor }}
        >
          <span className="font-medium home-assets-title" data-element-id="home-assets-title">Assets</span>
          <span 
            className="text-sm opacity-70 cursor-pointer hover:opacity-100 home-see-all"
            data-element-id="home-see-all"
            style={{ 
              color: homeStyle.seeAll?.textColor || tokenColors.info,
              transition: getTransition('default')
            }}
          >
            See all
          </span>
        </div>
        
        <div className="space-y-3 home-assets-list" data-element-id="home-assets-list">
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
                backgroundColor: assetCard.backgroundColor,
                borderRadius: assetCard.borderRadius || '16px',
                accentColor: tokenColors.info,
                textColor: assetCard.title?.textColor
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
