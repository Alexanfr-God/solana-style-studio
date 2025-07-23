
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { useEffect } from 'react';

export const useWalletButtonStyles = () => {
  const { theme, getTransition } = useWalletTheme();

  useEffect(() => {
    // Extract button styles from walletActionButton section
    const actionButtonStyles = theme.walletActionButton || {};
    
    // Fallback to extracting from different layers if walletActionButton is not defined
    const buttonStyles = {
      backgroundColor: actionButtonStyles.backgroundColor ||
                       theme.receiveLayer?.footer?.closeButton?.backgroundColor ||
                       theme.sendLayer?.footer?.closeButton?.backgroundColor ||
                       theme.buyLayer?.footer?.closeButton?.backgroundColor ||
                       '#FFD166',
      textColor: actionButtonStyles.textColor ||
                theme.receiveLayer?.footer?.closeButton?.textColor ||
                theme.sendLayer?.footer?.closeButton?.textColor ||
                theme.buyLayer?.footer?.closeButton?.textColor ||
                '#181818',
      borderRadius: actionButtonStyles.borderRadius ||
                   theme.receiveLayer?.footer?.closeButton?.borderRadius ||
                   theme.sendLayer?.footer?.closeButton?.borderRadius ||
                   theme.buyLayer?.footer?.closeButton?.borderRadius ||
                   '12px',
      fontFamily: actionButtonStyles.fontFamily ||
                 theme.receiveLayer?.footer?.closeButton?.fontFamily ||
                 theme.sendLayer?.footer?.closeButton?.fontFamily ||
                 theme.buyLayer?.footer?.closeButton?.fontFamily ||
                 'Inter, sans-serif',
      fontWeight: actionButtonStyles.fontWeight ||
                 theme.receiveLayer?.footer?.closeButton?.fontWeight ||
                 theme.sendLayer?.footer?.closeButton?.fontWeight ||
                 theme.buyLayer?.footer?.closeButton?.fontWeight ||
                 'bold',
      fontSize: actionButtonStyles.fontSize ||
               theme.receiveLayer?.footer?.closeButton?.fontSize ||
               theme.sendLayer?.footer?.closeButton?.fontSize ||
               theme.buyLayer?.footer?.closeButton?.fontSize ||
               '16px',
      padding: actionButtonStyles.padding || '12px 16px',
      border: actionButtonStyles.border || 'none',
      boxShadow: actionButtonStyles.boxShadow || 'none',
      hoverOpacity: actionButtonStyles.hoverOpacity || '0.9',
      iconColor: actionButtonStyles.icon?.color || actionButtonStyles.textColor || '#181818',
      iconSize: actionButtonStyles.icon?.size || '20px'
    };

    // Apply styles as CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--wallet-button-bg', buttonStyles.backgroundColor);
    root.style.setProperty('--wallet-button-text', buttonStyles.textColor);
    root.style.setProperty('--wallet-button-radius', buttonStyles.borderRadius);
    root.style.setProperty('--wallet-button-font', buttonStyles.fontFamily);
    root.style.setProperty('--wallet-button-weight', buttonStyles.fontWeight);
    root.style.setProperty('--wallet-button-size', buttonStyles.fontSize);
    root.style.setProperty('--wallet-button-padding', buttonStyles.padding);
    root.style.setProperty('--wallet-button-border', buttonStyles.border);
    root.style.setProperty('--wallet-button-shadow', buttonStyles.boxShadow);
    root.style.setProperty('--wallet-button-hover-opacity', buttonStyles.hoverOpacity);
    root.style.setProperty('--wallet-button-icon-color', buttonStyles.iconColor);
    root.style.setProperty('--wallet-button-icon-size', buttonStyles.iconSize);
  }, [theme]);

  return {
    getTransition
  };
};
