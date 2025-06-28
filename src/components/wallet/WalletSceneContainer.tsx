
import React, { ReactNode } from 'react';
import { WalletStyle } from '@/stores/customizationStore';
import { WalletScanAnimation } from '@/components/animations/WalletScanAnimation';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import '@/styles/wallet-scan-animations.css';

interface WalletSceneContainerProps {
  style: WalletStyle;
  children: ReactNode;
  className?: string;
  renderMode?: 'scene' | 'direct';
}

export const WalletSceneContainer = ({ 
  style, 
  children, 
  className = "",
  renderMode = 'scene'
}: WalletSceneContainerProps) => {
  const { isCustomizing } = useWalletCustomizationStore();
  
  if (renderMode === 'direct') {
    return (
      <WalletScanAnimation isActive={isCustomizing}>
        <div className={`wallet-scene-direct wallet-style-transition ${className}`}>
          {children}
        </div>
      </WalletScanAnimation>
    );
  }

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
      <div className="absolute inset-0 bg-black/30 rounded-3xl overflow-hidden"></div>
      
      <WalletScanAnimation isActive={isCustomizing}>
        <div 
          className="wallet-inner-container absolute wallet-style-transition wallet-background-transition"
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
      </WalletScanAnimation>
    </div>
  );
};

export default WalletSceneContainer;
