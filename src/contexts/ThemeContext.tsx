
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WalletTheme {
  name: string;
  version: string;
  lockLayer: {
    backgroundImage?: string;
    backgroundColor?: string;
    title: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    passwordInput: {
      backgroundColor: string;
      textColor: string;
      placeholderColor: string;
      borderRadius: string;
      border: string;
      fontFamily: string;
      iconEyeColor: string;
    };
    forgotPassword: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    unlockButton: {
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
      borderRadius: string;
    };
  };
  homeLayer: {
    backgroundImage?: string;
    backgroundColor?: string;
    header: {
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    footer: {
      backgroundColor: string;
      iconColor: string;
      activeIconColor: string;
      textColor: string;
      activeTextColor: string;
      fontFamily: string;
      fontSize: string;
    };
    mainContainer: {
      backgroundColor: string;
      borderRadius: string;
    };
    totalBalanceLabel: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    totalBalanceValue: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    totalBalanceChange: {
      positiveColor: string;
      negativeColor: string;
      zeroColor: string;
      fontFamily: string;
      fontSize: string;
    };
    mainButtons: {
      backgroundColor: string;
      iconColor: string;
      textColor: string;
      borderRadius: string;
      fontFamily: string;
      fontSize: string;
    };
    assetCard: {
      backgroundColor: string;
      textColor: string;
      borderRadius: string;
      fontFamily: string;
    };
    assetName: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    assetValue: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    assetChange: {
      positiveColor: string;
      negativeColor: string;
      zeroColor: string;
      fontFamily: string;
      fontSize: string;
    };
    seeAll: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
  };
  inputs: {
    passwordInput: {
      backgroundColor: string;
      textColor: string;
      placeholderColor: string;
      iconEyeColor: string;
      borderRadius: string;
      border: string;
      fontFamily: string;
    };
    searchInput: {
      backgroundColor: string;
      textColor: string;
      placeholderColor: string;
      borderRadius: string;
      border: string;
      fontFamily: string;
    };
  };
  global: {
    fontFamily: string;
    borderRadius: string;
    transition: string;
  };
}

interface ThemeContextType {
  theme: WalletTheme;
  setTheme: (theme: WalletTheme) => void;
  getLockLayerStyle: () => WalletTheme['lockLayer'];
  getHomeLayerStyle: () => WalletTheme['homeLayer'];
  getInputsStyle: () => WalletTheme['inputs'];
  getGlobalStyle: () => WalletTheme['global'];
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
          lockLayer: {
            backgroundColor: '#181818',
            title: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '28px'
            },
            passwordInput: {
              backgroundColor: 'rgba(30,30,30,0.8)',
              textColor: '#fff',
              placeholderColor: '#aaa',
              borderRadius: '12px',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              iconEyeColor: '#aaa'
            },
            forgotPassword: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            unlockButton: {
              backgroundColor: '#13e163',
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: '19px',
              borderRadius: '14px'
            }
          },
          homeLayer: {
            backgroundColor: '#181818',
            header: {
              backgroundColor: 'rgba(24,24,24,0.92)',
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '17px'
            },
            footer: {
              backgroundColor: 'rgba(24,24,24,0.9)',
              iconColor: '#6a55ff',
              activeIconColor: '#fff',
              textColor: '#fff',
              activeTextColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            mainContainer: {
              backgroundColor: 'rgba(40,40,40,0.7)',
              borderRadius: '18px'
            },
            totalBalanceLabel: {
              textColor: '#c8c8c8',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'normal',
              fontSize: '17px'
            },
            totalBalanceValue: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '32px'
            },
            totalBalanceChange: {
              positiveColor: '#13e163',
              negativeColor: '#ff5959',
              zeroColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px'
            },
            mainButtons: {
              backgroundColor: 'rgba(32,32,32,0.7)',
              iconColor: '#6a55ff',
              textColor: '#ffd600',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            assetCard: {
              backgroundColor: 'rgba(40,40,40,0.9)',
              textColor: '#fff',
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif'
            },
            assetName: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '16px'
            },
            assetValue: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '17px'
            },
            assetChange: {
              positiveColor: '#13e163',
              negativeColor: '#ff5959',
              zeroColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            seeAll: {
              textColor: '#6a55ff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px'
            }
          },
          inputs: {
            passwordInput: {
              backgroundColor: 'rgba(30,30,30,0.8)',
              textColor: '#fff',
              placeholderColor: '#aaa',
              iconEyeColor: '#aaa',
              borderRadius: '12px',
              border: 'none',
              fontFamily: 'Inter, sans-serif'
            },
            searchInput: {
              backgroundColor: '#191919',
              textColor: '#fff',
              placeholderColor: '#666',
              borderRadius: '10px',
              border: '1px solid #2a2a2a',
              fontFamily: 'Inter, sans-serif'
            }
          },
          global: {
            fontFamily: 'Inter, sans-serif',
            borderRadius: '14px',
            transition: 'all 0.2s ease'
          }
        });
      }
    };

    loadDefaultTheme();
  }, [initialTheme]);

  const getLockLayerStyle = () => {
    return theme?.lockLayer || {} as WalletTheme['lockLayer'];
  };

  const getHomeLayerStyle = () => {
    return theme?.homeLayer || {} as WalletTheme['homeLayer'];
  };

  const getInputsStyle = () => {
    return theme?.inputs || {} as WalletTheme['inputs'];
  };

  const getGlobalStyle = () => {
    return theme?.global || {} as WalletTheme['global'];
  };

  if (!theme) {
    return <div>Loading theme...</div>;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      getLockLayerStyle,
      getHomeLayerStyle,
      getInputsStyle,
      getGlobalStyle
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
