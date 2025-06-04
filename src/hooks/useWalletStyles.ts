
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { createInteractiveStyle, createTokenColorStyle, createStatusStyle } from '@/utils/styleUtils';
import { ComponentStyle } from '@/types/walletStyleSchema';

export const useWalletStyles = () => {
  const { getStyleForComponent, getTokenColors, getStatusColors } = useWalletCustomizationStore();

  const getComponentStyle = (component: keyof Omit<import('@/types/walletStyleSchema').WalletStyleSet, 'aiPet' | 'tokenColors' | 'statusColors'>) => {
    const style = getStyleForComponent(component);
    return createInteractiveStyle(style, style.states);
  };

  const getTokenColorStyle = (change: string) => {
    const tokenColors = getTokenColors();
    return createTokenColorStyle(change, tokenColors);
  };

  const getStatusStyle = (status: 'success' | 'error' | 'pending' | 'inactive') => {
    const statusColors = getStatusColors();
    return createStatusStyle(status, statusColors);
  };

  const getButtonStyle = (variant: 'primary' | 'secondary' = 'primary') => {
    const buttonStyle = getStyleForComponent('buttons');
    const style = createInteractiveStyle(buttonStyle, buttonStyle.states);
    
    if (variant === 'secondary') {
      return {
        ...style,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: buttonStyle.textColor || '#FFFFFF'
      };
    }
    
    return style;
  };

  return {
    getComponentStyle,
    getTokenColorStyle,
    getStatusStyle,
    getButtonStyle,
    tokenColors: getTokenColors(),
    statusColors: getStatusColors()
  };
};
