
import React, { ReactNode } from 'react';
import { WalletStyle } from '@/stores/customizationStore';

interface WalletSceneContainerProps {
  style: WalletStyle;
  children: ReactNode;
  className?: string;
  renderMode?: 'scene' | 'direct';
}

/**
 * Container for wallet UI with extended area for external masks
 * Now supports both scene mode (with larger container) and direct mode
 */
export const WalletSceneContainer = ({ 
  style, 
  children, 
  className = "",
  renderMode = 'scene'
}: WalletSceneContainerProps) => {
  
  if (renderMode === 'direct') {
    // Direct rendering without scene wrapper (for V3 mask mode)
    return (
      <div className={`wallet-scene-direct ${className}`}>
        {children}
      </div>
    );
  }

  // Original scene mode with larger container
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;
  const SCENE_WIDTH = WALLET_WIDTH * 1.5;
  const SCENE_HEIGHT = WALLET_HEIGHT * 1.5;

  return (
    <div 
      className={`wallet-scene-container relative ${className}`}
      style={{
        width: `${SCENE_WIDTH}px`,
        height: `${SCENE_HEIGHT}px`,
      }}
    >
      {/* Background area for external mask elements */}
      <div className="absolute inset-0 bg-black/30 rounded-3xl overflow-hidden"></div>
      
      {/* Central wallet container with fixed dimensions */}
      <div 
        className="wallet-inner-container absolute"
        style={{
          width: `${WALLET_WIDTH}px`,
          height: `${WALLET_HEIGHT}px`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: style.backgroundColor || '#131313',
          backgroundImage: style.backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: style.textColor || '#FFFFFF',
          fontFamily: style.fontFamily,
          borderRadius: '16px',
          boxShadow: style.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default WalletSceneContainer;
