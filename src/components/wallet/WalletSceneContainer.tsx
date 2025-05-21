
import React, { ReactNode } from 'react';
import { WalletStyle } from '@/stores/customizationStore';

interface WalletSceneContainerProps {
  style: WalletStyle;
  children: ReactNode;
  className?: string;
}

/**
 * Container for wallet UI with extended area for external masks
 * Central fixed size: 320px width x 569px height
 * Scene size is larger to accommodate decorative elements
 */
export const WalletSceneContainer = ({ style, children, className = "" }: WalletSceneContainerProps) => {
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;
  
  // Scene is larger than wallet to accommodate external masks
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
