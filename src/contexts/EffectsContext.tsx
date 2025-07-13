
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EffectsContextType {
  isSplashCursorEnabled: boolean;
  toggleSplashCursor: () => void;
  setSplashCursorEnabled: (enabled: boolean) => void;
}

const EffectsContext = createContext<EffectsContextType | undefined>(undefined);

interface EffectsProviderProps {
  children: ReactNode;
}

export const EffectsProvider: React.FC<EffectsProviderProps> = ({ children }) => {
  const [isSplashCursorEnabled, setIsSplashCursorEnabled] = useState(() => {
    // Load from localStorage with default false
    const saved = localStorage.getItem('splashCursorEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Persist to localStorage whenever the state changes
    localStorage.setItem('splashCursorEnabled', JSON.stringify(isSplashCursorEnabled));
  }, [isSplashCursorEnabled]);

  const toggleSplashCursor = () => {
    setIsSplashCursorEnabled(prev => !prev);
  };

  const setSplashCursorEnabled = (enabled: boolean) => {
    setIsSplashCursorEnabled(enabled);
  };

  return (
    <EffectsContext.Provider value={{
      isSplashCursorEnabled,
      toggleSplashCursor,
      setSplashCursorEnabled
    }}>
      {children}
    </EffectsContext.Provider>
  );
};

export const useEffects = (): EffectsContextType => {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within an EffectsProvider');
  }
  return context;
};
