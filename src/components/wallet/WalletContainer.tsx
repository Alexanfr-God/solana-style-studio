
import React, { ReactNode } from 'react';
import { WalletStyle } from '@/stores/customizationStore';

interface WalletContainerProps {
  style: WalletStyle;
  children: ReactNode;
  className?: string;
}

/**
 * Unified container for wallet UI that maintains consistent dimensions
 * for both the login and wallet screens - 320px width and ~569px height (9:16 ratio)
 */
export const WalletContainer = ({ style, children, className = "" }: WalletContainerProps) => {
  return (
    <div 
      className={`wallet-preview flex flex-col rounded-2xl overflow-hidden w-[320px] ${className}`}
      style={{
        backgroundColor: style.backgroundColor || '#131313',
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: style.textColor || '#FFFFFF',
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow,
        // Set fixed dimensions to ensure consistency
        height: '569px', // Approximately 9:16 ratio with 320px width
      }}
    >
      {children}
    </div>
  );
};

export default WalletContainer;
