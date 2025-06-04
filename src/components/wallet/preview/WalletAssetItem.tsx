
import React, { useState } from 'react';
import { useWalletStyles } from '@/hooks/useWalletStyles';

interface WalletAssetItemProps {
  image: string;
  name: string;
  ticker: string;
  amount: string;
  value: string;
  change?: string;
  color?: string;
  isLocked?: boolean;
  onClick: () => void;
  style: {
    backgroundColor?: string;
    borderRadius?: string;
    accentColor?: string;
    textColor?: string;
  };
}

const WalletAssetItem: React.FC<WalletAssetItemProps> = ({
  image,
  name,
  ticker,
  amount,
  value,
  change,
  color,
  isLocked = false,
  onClick,
  style
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { getComponentStyle, getTransition } = useWalletStyles();

  const cardStyle = getComponentStyle('cards');
  const textColor = style.textColor || cardStyle.textColor || '#FFFFFF';
  
  const interactiveStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || cardStyle.backgroundColor,
    borderRadius: style.borderRadius || cardStyle.borderRadius,
    color: textColor,
    cursor: 'pointer',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    transition: getTransition('cards')
  };

  return (
    <div 
      className="mb-3 p-4 rounded-xl flex justify-between items-center"
      style={interactiveStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        <div className="mr-3 relative">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: style.accentColor || '#9945FF' }}
          >
            {name[0]}
          </div>
          {isLocked && (
            <div 
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border"
              style={{ 
                backgroundColor: cardStyle.backgroundColor,
                borderColor: textColor + '40'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: textColor }}>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div 
            className="font-medium"
            style={{ 
              color: textColor,
              fontFamily: cardStyle.fontFamily 
            }}
          >
            {name}
          </div>
          <div 
            className="text-xs opacity-70"
            style={{ color: textColor }}
          >
            {amount} {ticker}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div 
          className="font-medium"
          style={{ 
            color: textColor,
            fontFamily: cardStyle.fontFamily 
          }}
        >
          {value}
        </div>
        {change && (
          <div 
            className="text-xs"
            style={{ color: color || textColor }}
          >
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletAssetItem;
