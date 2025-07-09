
import React, { useState } from 'react';
import { Download, Send, ArrowRightLeft, DollarSign } from 'lucide-react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

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
  const { getHomeLayer, getTransition, tokenColors } = useWalletTheme();

  const actions = [
    { id: 'receive', icon: Download, label: 'Receive' },
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
    { id: 'buy', icon: DollarSign, label: 'Buy' }
  ];

  const homeStyle = getHomeLayer();
  
  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-0 pb-4">
      {actions.map(action => {
        const isHovered = hoveredAction === action.id;
        const actionButtonStyle: React.CSSProperties = {
          height: '56px',
          width: '56px',
          borderRadius: style.borderRadius || homeStyle.mainButtons?.borderRadius || '16px',
          backgroundColor: homeStyle.mainButtons?.backgroundColor || 'rgba(40, 40, 40, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: getTransition('default'),
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? `0 4px 12px ${style.accentColor}40` : 'none'
        };

        return (
          <div key={action.id} className="flex flex-col items-center">
            <button 
              className={`home-${action.id}-button`}
              data-element-id={`home-${action.id}-button`}
              style={actionButtonStyle}
              onClick={() => onAction(action.label)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <action.icon 
                className={`h-5 w-5 home-${action.id}-icon`}
                data-element-id={`home-${action.id}-icon`}
                style={{ color: style.accentColor || tokenColors.info }} 
              />
            </button>
            <span 
              className={`text-xs mt-2 home-${action.id}-label`}
              data-element-id={`home-${action.id}-label`}
              style={{ 
                color: homeStyle.mainButtons?.textColor || '#FFFFFF',
                fontFamily: homeStyle.mainButtons?.fontFamily 
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
