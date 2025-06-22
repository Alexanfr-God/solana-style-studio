
import React from 'react';
import { useCustomizationStore } from '@/stores/customizationStore';
import WalletPreview from '../WalletPreview';

const WalletPreviewContainer = () => {
  const { activeLayer, loginStyle, walletStyle } = useCustomizationStore();
  const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;

  // Создаем стиль для единой границы
  const borderStyle = {
    border: `${currentStyle.borderWidth || '2px'} solid ${currentStyle.borderColor || '#FFFFFF'}`,
    animation: currentStyle.borderAnimation || 'none',
    borderRadius: currentStyle.borderRadius,
    overflow: 'hidden' // Исправляем закругление углов
  };

  return (
    <div className="flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm rounded-lg">
      <div 
        className="wallet-container"
        style={borderStyle}
      >
        <WalletPreview />
      </div>
    </div>
  );
};

export default WalletPreviewContainer;
