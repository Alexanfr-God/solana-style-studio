
import React, { useState } from 'react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

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
  const [imageError, setImageError] = useState(false);
  const { getHomeLayer, getTransition, tokenColors, getTokenElements } = useWalletTheme();

  const homeStyle = getHomeLayer();
  const tokenElements = getTokenElements();
  
  // Prioritize tokenElements styles over legacy styles
  const nameTextColor = tokenElements.name?.textColor || style.textColor || homeStyle.assetCard?.textColor || '#FFFFFF';
  const amountTextColor = tokenElements.amount?.textColor || style.textColor || homeStyle.assetCard?.textColor || '#FFFFFF';
  const valueTextColor = tokenElements.dollarValue?.textColor || style.textColor || homeStyle.assetCard?.textColor || '#FFFFFF';
  
  const interactiveStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || homeStyle.assetCard?.backgroundColor,
    borderRadius: style.borderRadius || homeStyle.assetCard?.borderRadius,
    color: nameTextColor,
    cursor: 'pointer',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    transition: getTransition('hover')
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get change color using tokenElements styles
  const getChangeColor = (changeValue?: string) => {
    if (!changeValue) return valueTextColor;
    
    const isPositive = changeValue.startsWith('+');
    const isNegative = changeValue.startsWith('-');
    const isZero = changeValue === '0' || changeValue === '$0.00' || changeValue === '0.0%';
    
    if (color) return color; // Use prop color if provided (backward compatibility)
    
    return isZero 
      ? tokenElements.percentChange?.neutralColor || '#FFFFFF'
      : isPositive 
      ? tokenElements.percentChange?.positiveColor || '#13e163'
      : isNegative
      ? tokenElements.percentChange?.negativeColor || '#ff5959'
      : tokenElements.percentChange?.neutralColor || '#FFFFFF';
  };

  return (
    <div 
      className="mb-3 p-4 rounded-xl flex justify-between items-center home-asset-item"
      data-element-id="home-asset-item"
      style={interactiveStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        <div className="mr-3 relative home-asset-icon" data-element-id="home-asset-icon">
          {!imageError ? (
            <img
              src={image}
              alt={name}
              className="h-10 w-10 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: style.accentColor || tokenColors.info }}
            >
              {name[0]}
            </div>
          )}
          {isLocked && (
            <div 
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border"
              style={{ 
                backgroundColor: homeStyle.assetCard?.backgroundColor,
                borderColor: nameTextColor + '40'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: nameTextColor }}>
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div 
            className="font-medium home-asset-name"
            data-element-id="home-asset-name"
            style={{ 
              color: nameTextColor,
              fontFamily: tokenElements.name?.fontFamily || homeStyle.assetCard?.fontFamily,
              fontWeight: tokenElements.name?.fontWeight || 'bold',
              fontSize: tokenElements.name?.fontSize || '16px'
            }}
          >
            {name}
          </div>
          <div 
            className="text-xs opacity-70 home-asset-symbol"
            data-element-id="home-asset-symbol"
            style={{ 
              color: amountTextColor,
              fontFamily: tokenElements.amount?.fontFamily || homeStyle.assetCard?.fontFamily
            }}
          >
            {amount} {ticker}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div 
          className="font-medium home-asset-value"
          data-element-id="home-asset-value"
          style={{ 
            color: valueTextColor,
            fontFamily: tokenElements.dollarValue?.fontFamily || homeStyle.assetCard?.fontFamily,
            fontSize: tokenElements.dollarValue?.fontSize || '15px'
          }}
        >
          {value}
        </div>
        {change && (
          <div 
            className="text-xs home-asset-balance"
            data-element-id="home-asset-balance"
            style={{ 
              color: getChangeColor(change),
              fontFamily: tokenElements.percentChange?.fontFamily || homeStyle.assetCard?.fontFamily,
              fontSize: tokenElements.percentChange?.fontSize || '14px'
            }}
          >
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletAssetItem;
