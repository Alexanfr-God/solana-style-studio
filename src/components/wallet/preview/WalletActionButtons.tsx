
import React, { useState } from 'react';
import { Download, Send, ArrowRightLeft, DollarSign } from 'lucide-react';
import { useWalletStyles } from '@/hooks/useWalletStyles';

interface WalletActionButtonsProps {
  onAction: (action: string) => void;
  style: {
    accentColor?: string;
    borderRadius?: string;
  };
  showAccountDropdown?: boolean;
}

const WalletActionButtons: React.FC<WalletActionButtonsProps> = ({ 
  onAction, 
  style, 
  showAccountDropdown = false 
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const { getComponentStyle, getTransition } = useWalletStyles();

  const actions = [
    { id: 'receive', icon: Download, label: 'Receive' },
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
    { id: 'buy', icon: DollarSign, label: 'Buy' }
  ];

  const buttonStyle = getComponentStyle('buttons');
  const containerStyle = getComponentStyle('containers');
  
  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-0 pb-4">
      {actions.map(action => {
        const isHovered = hoveredAction === action.id;
        const actionButtonStyle: React.CSSProperties = {
          height: '56px',
          width: '56px',
          borderRadius: style.borderRadius || buttonStyle.borderRadius || '16px',
          backgroundColor: containerStyle.backgroundColor || 'rgba(40, 40, 40, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: getTransition('buttons'),
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? `0 4px 12px ${style.accentColor}40` : 'none'
        };

        return (
          <div key={action.id} className="flex flex-col items-center">
            <button 
              style={actionButtonStyle}
              onClick={() => onAction(action.label)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <action.icon 
                className="h-5 w-5" 
                style={{ color: style.accentColor || '#9b87f5' }} 
              />
            </button>
            <span 
              className="text-xs mt-2"
              style={{ 
                color: containerStyle.color || '#FFFFFF',
                fontFamily: containerStyle.fontFamily 
              }}
            >
              {action.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default WalletActionButtons;
