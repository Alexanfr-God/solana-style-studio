
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';

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
  style: WalletStyle;
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
  return (
    <div 
      className="mb-3 p-4 rounded-xl flex justify-between items-center cursor-pointer active:bg-opacity-80"
      style={{ 
        backgroundColor: 'rgba(40, 40, 40, 0.6)',
        borderRadius: style.borderRadius || '16px',
      }}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="mr-3 relative">
          <img src={image} alt={name} className="h-10 w-10" />
          {isLocked && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-gray-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-400">{amount} {ticker}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{value}</div>
        {change && (
          <div className={`text-xs ${color ? color : 'text-gray-400'}`}>{change}</div>
        )}
      </div>
    </div>
  );
};

export default WalletAssetItem;
