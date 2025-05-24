
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { LoginScreen, WalletScreen } from './WalletScreens';

interface UnifiedWalletRendererProps {
  style: WalletStyle;
  type: 'login' | 'wallet';
  className?: string;
  renderMode?: 'standalone' | 'preview' | 'mask';
}

/**
 * Unified wallet renderer to prevent duplication and ensure consistent rendering
 * across different contexts (preview, mask overlay, dual view, etc.)
 */
export const UnifiedWalletRenderer = ({ 
  style, 
  type, 
  className = "",
  renderMode = "standalone"
}: UnifiedWalletRendererProps) => {
  
  // Base container styles for consistency
  const containerStyle = {
    width: '320px',
    height: '569px',
    backgroundColor: style.backgroundColor || '#131313',
    backgroundImage: style.backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: style.textColor || '#FFFFFF',
    fontFamily: style.fontFamily,
    borderRadius: '16px',
    boxShadow: style.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  };

  // Add render mode specific adjustments
  const modeSpecificClass = {
    standalone: 'relative',
    preview: 'relative',
    mask: 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  }[renderMode];

  const WalletComponent = type === 'login' ? LoginScreen : WalletScreen;

  return (
    <div 
      className={`wallet-unified-renderer ${modeSpecificClass} ${className}`}
      style={containerStyle}
      data-render-mode={renderMode}
      data-wallet-type={type}
    >
      <WalletComponent style={style} />
    </div>
  );
};

export default UnifiedWalletRenderer;
