import { useTheme } from '@/contexts/ThemeContext';

export const useWalletTheme = () => {
  const { theme, getComponentStyle, getTokenColor, getTransition } = useTheme();

  // FIXED: Only use theme system - no more fallback to old store
  const getUnifiedComponentStyle = (component: string) => {
    const themeStyle = getComponentStyle(component as any);
    console.log(`🎨 Theme style for ${component}:`, themeStyle);
    return themeStyle;
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