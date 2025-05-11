
import React from 'react';
import { Download, Send, ArrowRightLeft, DollarSign } from 'lucide-react';
import { WalletStyle } from '@/stores/customizationStore';

interface WalletActionButtonsProps {
  onAction: (action: string) => void;
  style: WalletStyle;
}

const WalletActionButtons: React.FC<WalletActionButtonsProps> = ({ onAction, style }) => {
  const actions = [
    { id: 'receive', icon: Download, label: 'Receive' },
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'swap', icon: ArrowRightLeft, label: 'Swap' },
    { id: 'buy', icon: DollarSign, label: 'Buy' }
  ];
  
  return (
    <div className="grid grid-cols-4 gap-2 px-4 pt-0 pb-4">
      {actions.map(action => (
        <div key={action.id} className="flex flex-col items-center">
          <button 
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(40, 40, 40, 0.8)' }}
            onClick={() => onAction(action.label)}
          >
            <action.icon className="h-5 w-5" style={{ color: style.accentColor || '#9b87f5' }} />
          </button>
          <span className="text-xs text-gray-400">{action.label}</span>
        </div>
      ))}
    </div>
  );
};

export default WalletActionButtons;
