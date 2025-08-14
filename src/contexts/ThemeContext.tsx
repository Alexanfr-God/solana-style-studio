
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWalletButtonStyles } from '@/hooks/useWalletButtonStyles';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// RENAMED: useTheme -> useAppTheme to avoid conflict
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  // Initialize wallet button styles
  useWalletButtonStyles();

  useEffect(() => {
    const root = document.documentElement;
    root.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
