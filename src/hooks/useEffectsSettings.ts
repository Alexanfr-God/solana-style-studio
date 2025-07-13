
import { useEffects } from '@/contexts/EffectsContext';

export const useEffectsSettings = () => {
  const { isSplashCursorEnabled, toggleSplashCursor, setSplashCursorEnabled } = useEffects();

  return {
    splashCursor: {
      enabled: isSplashCursorEnabled,
      toggle: toggleSplashCursor,
      setEnabled: setSplashCursorEnabled,
    },
  };
};
