
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
  const { getHomeLayer, getTransition, tokenColors } = useWalletTheme();

  const homeStyle = getHomeLayer();
  const textColor = style.textColor || homeStyle.assetCard?.textColor || '#FFFFFF';
  
  const interactiveStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || homeStyle.assetCard?.backgroundColor,
    borderRadius: style.borderRadius || homeStyle.assetCard?.borderRadius,
    color: textColor,
    cursor: 'pointer',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    transition: getTransition('hover')
  };

  const handleImageError = () => {
    setImageError(true);
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
            className="font-medium home-asset-name"
            data-element-id="home-asset-name"
            style={{ 
              color: textColor,
              fontFamily: homeStyle.assetCard?.fontFamily 
            }}
          >
            {name}
          </div>
          <div 
            className="text-xs opacity-70 home-asset-symbol"
            data-element-id="home-asset-symbol"
            style={{ color: textColor }}
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
            color: textColor,
            fontFamily: homeStyle.assetCard?.fontFamily 
          }}
        >
          {value}
        </div>
        {change && (
          <div 
            className="text-xs home-asset-balance"
            data-element-id="home-asset-balance"
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
