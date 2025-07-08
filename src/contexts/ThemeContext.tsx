import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WalletTheme {
  name: string;
  version: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  components: {
    global: ComponentStyle;
    header: ComponentStyle;
    buttons: ComponentStyle;
    cards: ComponentStyle;
    navigation: ComponentStyle;
    containers: ComponentStyle;
    overlays: ComponentStyle;
    searchInputs: ComponentStyle;
    layerHeaders: ComponentStyle;
    networkItems: ComponentStyle;
    lockScreen: ComponentStyle;
  };
  tokenColors: {
    positive: string;
    negative: string;
    neutral: string;
    warning: string;
    info: string;
  };
  transitions: {
    default: string;
    hover: string;
    focus: string;
  };
}

export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  color?: string;
  fontFamily?: string;
  borderRadius?: string;
  boxShadow?: string;
  backdropFilter?: string;
  border?: string;
  fontSize?: string;
  fontWeight?: string;
  transition?: string;
  gradient?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  // For nested lockScreen structure
  titleStyle?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    fontFamily?: string;
  };
  inputStyle?: {
    backgroundColor?: string;
    textColor?: string;
    placeholderColor?: string;
    borderRadius?: string;
    border?: string;
    padding?: string;
  };
  primaryButton?: {
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    fontWeight?: string;
    fontSize?: string;
    padding?: string;
  };
  secondaryText?: {
    color?: string;
    fontSize?: string;
    fontFamily?: string;
  };
  accentColor?: string;
  logoBackground?: {
    backgroundColor?: string;
    opacity?: string;
  };
  footerText?: {
    color?: string;
    fontSize?: string;
  };
}

interface ThemeContextType {
  theme: WalletTheme;
  setTheme: (theme: WalletTheme) => void;
  getComponentStyle: (component: keyof WalletTheme['components']) => ComponentStyle;
  getTokenColor: (type: keyof WalletTheme['tokenColors']) => string;
  getTransition: (type: keyof WalletTheme['transitions']) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: WalletTheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme 
}) => {
  const [theme, setTheme] = useState<WalletTheme | null>(null);

  useEffect(() => {
    const loadDefaultTheme = async () => {
      if (initialTheme) {
        setTheme(initialTheme);
        return;
      }

      try {
        console.log('🔄 Loading theme from /themes/defaultTheme.json...');
        const response = await fetch('/themes/defaultTheme.json');
        const defaultTheme = await response.json();
        console.log('✅ Theme loaded successfully:', defaultTheme);
        setTheme(defaultTheme);
      } catch (error) {
        console.error('Failed to load default theme:', error);
        // Fallback theme
        setTheme({
          name: 'Fallback Theme',
          version: '1.0.0',
          colors: {
            primary: '#a390f5',
            primaryForeground: '#FFFFFF',
            secondary: '#282828',
            secondaryForeground: '#FFFFFF',
            background: '#181818',
            foreground: '#FFFFFF',
            muted: '#2D2D3F',
            mutedForeground: '#9CA3AF',
            accent: '#9945FF',
            accentForeground: '#FFFFFF',
            border: 'rgba(255, 255, 255, 0.1)',
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
          },
          components: {
            global: {
              backgroundColor: '#181818',
              textColor: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              borderRadius: '12px',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)'
            },
            header: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              textColor: '#FFFFFF',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, sans-serif'
            },
            buttons: {
              backgroundColor: '#a390f5',
              textColor: '#FFFFFF',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            },
            cards: {
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              textColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, sans-serif'
            },
            navigation: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              textColor: '#FFFFFF',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, sans-serif'
            },
            containers: {
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              textColor: '#FFFFFF',
              borderRadius: '16px',
              fontFamily: 'Inter, sans-serif'
            },
            overlays: {
              backgroundColor: 'rgba(24, 24, 24, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            },
            searchInputs: {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              textColor: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            },
            layerHeaders: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              textColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, sans-serif'
            },
            networkItems: {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              textColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease'
            },
            lockScreen: {
              backgroundColor: '#181818',
              textColor: '#FFFFFF',
              titleStyle: {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif'
              },
              inputStyle: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                textColor: '#FFFFFF',
                placeholderColor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                border: 'none',
                padding: '12px 16px'
              },
              primaryButton: {
                backgroundColor: '#a390f5',
                textColor: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
                padding: '12px 0'
              },
              secondaryText: {
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
              },
              accentColor: '#9945FF',
              logoBackground: {
                backgroundColor: '#9945FF',
                opacity: '0.2'
              },
              footerText: {
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '12px'
              }
            }
          },
          tokenColors: {
            positive: '#10B981',
            negative: '#EF4444',
            neutral: '#6B7280',
            warning: '#F59E0B',
            info: '#3B82F6'
          },
          transitions: {
            default: 'all 0.2s ease',
            hover: 'all 0.3s ease',
            focus: 'all 0.15s ease'
          }
        });
      }
    };

    loadDefaultTheme();
  }, [initialTheme]);

  const getComponentStyle = (component: keyof WalletTheme['components']): ComponentStyle => {
    return theme?.components[component] || {};
  };

  const getTokenColor = (type: keyof WalletTheme['tokenColors']): string => {
    return theme?.tokenColors[type] || '#FFFFFF';
  };

  const getTransition = (type: keyof WalletTheme['transitions']): string => {
    return theme?.transitions[type] || 'all 0.2s ease';
  };

  if (!theme) {
    return <div>Loading theme...</div>;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      getComponentStyle,
      getTokenColor,
      getTransition
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};