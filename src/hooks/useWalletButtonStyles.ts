
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { useEffect } from 'react';

export const useWalletButtonStyles = () => {
  const { theme, getTransition } = useWalletTheme();

  useEffect(() => {
    // Extract button styles from different layers
    const buttonStyles = {
      backgroundColor: theme.receiveLayer?.footer?.closeButton?.backgroundColor ||
                       theme.sendLayer?.footer?.closeButton?.backgroundColor ||
                       theme.buyLayer?.footer?.closeButton?.backgroundColor ||
                       '#FFD166',
      textColor: theme.receiveLayer?.footer?.closeButton?.textColor ||
                theme.sendLayer?.footer?.closeButton?.textColor ||
                theme.buyLayer?.footer?.closeButton?.textColor ||
                '#181818',
      borderRadius: theme.receiveLayer?.footer?.closeButton?.borderRadius ||
                   theme.sendLayer?.footer?.closeButton?.borderRadius ||
                   theme.buyLayer?.footer?.closeButton?.borderRadius ||
                   '12px',
      fontFamily: theme.receiveLayer?.footer?.closeButton?.fontFamily ||
                 theme.sendLayer?.footer?.closeButton?.fontFamily ||
                 theme.buyLayer?.footer?.closeButton?.fontFamily ||
                 'Inter, sans-serif',
      fontWeight: theme.receiveLayer?.footer?.closeButton?.fontWeight ||
                 theme.sendLayer?.footer?.closeButton?.fontWeight ||
                 theme.buyLayer?.footer?.closeButton?.fontWeight ||
                 'bold',
      fontSize: theme.receiveLayer?.footer?.closeButton?.fontSize ||
               theme.sendLayer?.footer?.closeButton?.fontSize ||
               theme.buyLayer?.footer?.closeButton?.fontSize ||
               '16px'
    };

    // Apply styles as CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--wallet-button-bg', buttonStyles.backgroundColor);
    root.style.setProperty('--wallet-button-text', buttonStyles.textColor);
    root.style.setProperty('--wallet-button-radius', buttonStyles.borderRadius);
    root.style.setProperty('--wallet-button-font', buttonStyles.fontFamily);
    root.style.setProperty('--wallet-button-weight', buttonStyles.fontWeight);
    root.style.setProperty('--wallet-button-size', buttonStyles.fontSize);
  }, [theme]);

  return {
    getTransition
  };
};
