
import React, { useState } from 'react';
import { Download, Send, ArrowRightLeft, DollarSign } from 'lucide-react';

interface IndexWalletActionButtonsProps {
  onAction: (action: string) => void;
  style: {
    accentColor?: string;
    borderRadius?: string;
    buttonColor?: string;
  };
}

const IndexWalletActionButtons: React.FC<IndexWalletActionButtonsProps> = ({ 
  onAction, 
  style
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions = [
    { id: 'receive', icon: Download, label: 'Receive' },
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
    { id: 'buy', icon: DollarSign, label: 'Buy' }
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-0 pb-4">
      {actions.map(action => {
        const isHovered = hoveredAction === action.id;
        const actionButtonStyle: React.CSSProperties = {
          height: '56px',
          width: '56px',
          borderRadius: style.borderRadius || '16px',
          backgroundColor: 'rgba(40, 40, 40, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? `0 4px 12px ${style.accentColor || '#9b87f5'}40` : 'none'
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
                color: '#FFFFFF',
                fontFamily: 'inherit'
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

export default IndexWalletActionButtons;
