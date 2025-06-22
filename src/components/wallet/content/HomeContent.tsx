
import React from 'react';
import { useCustomizationStore } from '@/stores/customizationStore'; // Изменено!
import WalletAssetItem from '../preview/WalletAssetItem';
import WalletActionButtons from '../preview/WalletActionButtons';

interface HomeContentProps {
  showAccountDropdown?: boolean;
}

const HomeContent: React.FC<HomeContentProps> = ({ showAccountDropdown = false }) => {
  const { activeLayer, loginStyle, walletStyle } = useCustomizationStore(); // Изменено!
  const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;

  // Используем токены из store (пока заглушка, потом можно расширить)
  const tokens = [
    { id: 1, name: 'Solana', symbol: 'SOL', amount: '32.4', value: '$2,405.23', change: '+5.2%', isPositive: true },
    { id: 2, name: 'Bitcoin', symbol: 'BTC', amount: '0.023', value: '$127.19', change: '-2.1%', isPositive: false }
  ];

  const totalBalance = '$2,532.42';
  const totalChange = '+3.8%';
  const isBalancePositive = true;

  const handleAssetClick = (tokenName: string) => {
    console.log(`Clicked on ${tokenName}`);
  };

  const handleAction = (action: string) => {
    console.log(`Action: ${action}`);
  };

  return (
    <div 
      className="relative flex-1 overflow-y-auto px-4 pb-4 z-[1]"
      style={{ 
        borderRadius: currentStyle.borderRadius,
        overflow: 'hidden' // Исправляем закругление углов
      }}
    >
      {/* Balance Section */}
      <div className="pt-4 pb-6 text-center">
        <div 
          className="text-sm opacity-70 mb-1"
          style={{ color: currentStyle.textColor }}
        >
          Total Balance
        </div>
        <div 
          className="text-3xl font-bold mb-1"
          style={{ 
            color: currentStyle.textColor,
            fontFamily: currentStyle.fontFamily 
          }}
        >
          {totalBalance}
        </div>
        <div 
          className="text-sm font-medium"
          style={{ color: isBalancePositive ? '#4ade80' : '#ef4444' }}
        >
          {totalChange}
        </div>
      </div>

      {/* Action Buttons с правильными стилями */}
      <div className="relative z-[2]">
        <WalletActionButtons 
          onAction={handleAction} 
          style={{ 
            accentColor: currentStyle.accentColor,
            borderRadius: currentStyle.borderRadius,
            buttonColor: currentStyle.buttonColor,
            buttonTextColor: currentStyle.buttonTextColor
          }}
          showAccountDropdown={showAccountDropdown}
        />
      </div>

      {/* Assets Section */}
      <div className="mt-6">
        <div 
          className="flex justify-between items-center mb-4"
          style={{ color: currentStyle.textColor }}
        >
          <span className="font-medium">Assets</span>
          <span 
            className="text-sm opacity-70 cursor-pointer hover:opacity-100"
            style={{ 
              color: currentStyle.accentColor,
              transition: 'opacity 0.2s ease'
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
              color={token.isPositive ? '#4ade80' : '#ef4444'}
              onClick={() => handleAssetClick(token.name)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: currentStyle.borderRadius,
                accentColor: currentStyle.accentColor,
                textColor: currentStyle.textColor
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
