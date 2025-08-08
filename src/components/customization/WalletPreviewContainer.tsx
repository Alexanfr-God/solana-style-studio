
import React from 'react';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import WalletContainer from '@/components/wallet/WalletContainer';

interface WalletPreviewContainerProps {
  className?: string;
}

const WalletPreviewContainer: React.FC<WalletPreviewContainerProps> = ({ 
  className = "" 
}) => {
  const { theme } = useWalletTheme();

  // Convert theme data to WalletStyle format for WalletSceneContainer
  const walletStyle = {
    backgroundColor: theme.homeLayer?.backgroundColor || '#181818',
    backgroundImage: theme.homeLayer?.backgroundImage,
    accentColor: theme.homeLayer?.actionButtons?.receiveButton?.containerColor || '#a390f5',
    textColor: theme.homeLayer?.header?.textColor || '#FFFFFF',
    buttonColor: theme.homeLayer?.actionButtons?.sendButton?.containerColor || '#a390f5',
    buttonTextColor: theme.homeLayer?.actionButtons?.sendButton?.iconColor || '#FFFFFF',
    borderRadius: theme.global?.borderRadius || '12px',
    fontFamily: theme.global?.fontFamily || 'Inter, sans-serif',
    boxShadow: theme.global?.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)'
  };

  return (
    <div className={`wallet-preview-container ${className}`}>
      <WalletSceneContainer 
        style={walletStyle}
        renderMode="scene"
      >
        <WalletContainer />
      </WalletSceneContainer>
    </div>
  );
};

export default WalletPreviewContainer;
