import { useTheme } from '@/contexts/ThemeContext';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

export const useWalletTheme = () => {
  const { theme, getComponentStyle, getTokenColor, getTransition } = useTheme();
  const { getTokenColors, getStatusColors } = useWalletCustomizationStore();

  // Create a unified interface that works with both old and new systems
  const getUnifiedComponentStyle = (component: string) => {
    // First try new theme system
    const themeStyle = getComponentStyle(component as any);
    if (themeStyle && Object.keys(themeStyle).length > 0) {
      return themeStyle;
    }

    // Fallback to old system for backward compatibility
    const store = useWalletCustomizationStore.getState();
    return store.getStyleForComponent(component);
  };

  const getUnifiedTokenColor = (change: string) => {
    // Determine if positive or negative change
    const isPositive = change.includes('+') || parseFloat(change) > 0;
    const colorType = isPositive ? 'positive' : 'negative';
    
    return {
      color: getTokenColor(colorType),
      fontFamily: theme.components.global.fontFamily
    };
  };

  return {
    theme,
    getComponentStyle: getUnifiedComponentStyle,
    getTokenColor,
    getTransition,
    getUnifiedTokenColor,
    // Legacy compatibility
    tokenColors: {
      positive: getTokenColor('positive'),
      negative: getTokenColor('negative'),
      neutral: getTokenColor('neutral'),
      warning: getTokenColor('warning'),
      info: getTokenColor('info')
    }
  };
};