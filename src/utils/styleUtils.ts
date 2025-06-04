
import { ComponentStyle, InteractiveStates, AnimationConfig } from '@/types/walletStyleSchema';

export const createInteractiveStyle = (
  baseStyle: ComponentStyle,
  states?: InteractiveStates
): React.CSSProperties => {
  const style: React.CSSProperties = {
    backgroundColor: baseStyle.backgroundColor,
    color: baseStyle.textColor,
    fontFamily: baseStyle.fontFamily,
    fontSize: baseStyle.fontSize,
    fontWeight: baseStyle.fontWeight,
    borderRadius: baseStyle.borderRadius,
    border: baseStyle.border,
    boxShadow: baseStyle.boxShadow,
    backgroundImage: baseStyle.backgroundImage,
    backdropFilter: baseStyle.backdropFilter,
    opacity: baseStyle.opacity,
  };

  // Add animation properties
  if (baseStyle.animation) {
    style.transition = baseStyle.animation.transition || 'all 0.2s ease';
    style.animationDuration = baseStyle.animation.duration;
    style.animationTimingFunction = baseStyle.animation.easing;
    style.animationDelay = baseStyle.animation.delay;
  }

  return style;
};

export const getHoverStyle = (states?: InteractiveStates): React.CSSProperties => {
  if (!states?.hover) return {};
  
  return {
    backgroundColor: states.hover.backgroundColor,
    color: states.hover.textColor,
    transform: 'scale(1.02)',
    boxShadow: states.hover.boxShadow,
  };
};

export const getActiveStyle = (states?: InteractiveStates): React.CSSProperties => {
  if (!states?.active) return {};
  
  return {
    backgroundColor: states.active.backgroundColor,
    color: states.active.textColor,
    transform: 'scale(0.98)',
  };
};

export const createTokenColorStyle = (
  change: string,
  tokenColors: { positive: string; negative: string; neutral: string }
): React.CSSProperties => {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');
  
  return {
    color: isPositive ? tokenColors.positive : isNegative ? tokenColors.negative : tokenColors.neutral
  };
};

export const createStatusStyle = (
  status: 'success' | 'error' | 'pending' | 'inactive',
  statusColors: { success: string; error: string; pending: string; inactive: string }
): React.CSSProperties => {
  return {
    color: statusColors[status]
  };
};
