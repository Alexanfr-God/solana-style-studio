
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
  avatarHeader: {
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    fontWeight: string;
    fontSize: string;
  };
  sidebarLayer: {
    header: {
      backgroundColor: string;
      accountTitle: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      closeIcon: {
        color: string;
        type: string;
      };
    };
    center: {
      backgroundColor: string;
      accountList: {
        avatar: {
          backgroundColor: string;
          textColor: string;
          fontFamily: string;
          fontWeight: string;
          fontSize: string;
        };
        accountName: {
          textColor: string;
          fontFamily: string;
          fontWeight: string;
          fontSize: string;
        };
        accountAddress: {
          textColor: string;
          fontFamily: string;
          fontSize: string;
        };
        selectedAnimation: {
          color: string;
          type: string;
        };
      };
    };
    footer: {
      backgroundColor: string;
      footerIcons: {
        addIcon: { color: string; type: string; };
        editIcon: { color: string; type: string; };
        settingsIcon: { color: string; type: string; };
      };
    };
  };
  homeLayer: {
    backgroundImage?: string;
    backgroundColor?: string;
    boxShadow?: string;
    header: {
      backgroundColor: string;
      backgroundImage?: string;
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
      backdropFilter?: string;
      border?: string;
      borderRadius?: string;
      boxShadow?: string;
      gradient?: string;
      searchIcon?: {
        color: string;
        type: string;
      };
    };
    footer: {
      backgroundColor: string;
      backgroundImage?: string;
      iconColor: string;
      activeIconColor: string;
      textColor: string;
      activeTextColor: string;
      fontFamily: string;
      fontSize: string;
      navigationIcons?: {
        homeIcon: { color: string; activeColor: string; type: string; };
        appsIcon: { color: string; activeColor: string; type: string; };
        swapIcon: { color: string; activeColor: string; type: string; };
        historyIcon: { color: string; activeColor: string; type: string; };
        searchIcon: { color: string; activeColor: string; type: string; };
      };
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
    actionButtons?: {
      receiveButton: {
        containerColor: string;
        iconColor: string;
        labelColor: string;
        labelFontFamily: string;
        labelFontSize: string;
        borderRadius: string;
      };
      sendButton: {
        containerColor: string;
        iconColor: string;
        labelColor: string;
        labelFontFamily: string;
        labelFontSize: string;
        borderRadius: string;
      };
      swapButton: {
        containerColor: string;
        iconColor: string;
        labelColor: string;
        labelFontFamily: string;
        labelFontSize: string;
        borderRadius: string;
      };
      buyButton: {
        containerColor: string;
        iconColor: string;
        labelColor: string;
        labelFontFamily: string;
        labelFontSize: string;
        borderRadius: string;
      };
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
    accountDropdown?: {
      containerBackgroundColor: string;
      containerBorderRadius: string;
      headerText: {
        selectAccountColor: string;
        selectAccountFontFamily: string;
        selectAccountFontSize: string;
      };
      accountItems: {
        mainAccountColor: string;
        mainAccountFontFamily: string;
        mainAccountFontSize: string;
        tradingAccountColor: string;
        tradingAccountFontFamily: string;
        tradingAccountFontSize: string;
      };
      actionButtons: {
        addAccountColor: string;
        addAccountFontFamily: string;
        addAccountFontSize: string;
        manageCollectibleColor: string;
        manageCollectibleFontFamily: string;
        manageCollectibleFontSize: string;
      };
      icons: {
        copyAddressIcon: {
          color: string;
          type: string;
        };
      };
    };
  };
  appsLayer: {
    title: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    subtitle: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    collectibleCard: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    collectibleName: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    manageCollectibleList: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
  };
  swapLayer: {
    mainContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    swapTitle: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    settingsIcon: {
      color: string;
      type: string;
    };
    fromContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    fromLabel: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    fromBalance: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    fromCoinTag: {
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      fontSize: string;
      borderRadius: string;
    };
    toContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    toLabel: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    toBalance: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    toCoinTag: {
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      fontSize: string;
      borderRadius: string;
    };
    arrowIcon: {
      color: string;
      type: string;
    };
    rateContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    rateLabel: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    rateValue: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    infoIcon: {
      color: string;
      type: string;
    };
  };
  historyLayer: {
    recentActivityTitle: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    menuIcon: {
      color: string;
      type: string;
    };
    activityCard: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    activityText: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    activityStatus: {
      successColor: string;
      failedColor: string;
      pendingColor: string;
      fontWeight: string;
    };
    activityDate: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    loadMore: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
  };
  searchLayer: {
    searchInput: {
      backgroundColor: string;
      textColor: string;
      placeholderColor: string;
      borderRadius: string;
      border: string;
      fontFamily: string;
      iconSearch: { color: string; type: string; };
      iconClose: { color: string; type: string; };
    };
    searchInputFont: {
      fontFamily: string;
      fontSize: string;
      textColor: string;
    };
    recentSearchesLabel: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
      iconTime: { color: string; type: string; };
    };
    trendingLabel: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
      iconTrending: { color: string; type: string; };
    };
    tokenTag: {
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      fontSize: string;
      borderRadius: string;
    };
    tokenCard: {
      backgroundColor: string;
      borderRadius: string;
    };
    tokenCardText: {
      nameColor: string;
      tickerColor: string;
      priceColor: string;
      percentPositiveColor: string;
      percentNegativeColor: string;
      fontFamily: string;
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
  getAvatarHeaderStyle: () => WalletTheme['avatarHeader'];
  getSidebarLayerStyle: () => WalletTheme['sidebarLayer'];
  getHomeLayerStyle: () => WalletTheme['homeLayer'];
  getAppsLayerStyle: () => WalletTheme['appsLayer'];
  getSwapLayerStyle: () => WalletTheme['swapLayer'];
  getHistoryLayerStyle: () => WalletTheme['historyLayer'];
  getSearchLayerStyle: () => WalletTheme['searchLayer'];
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
        // Fallback theme with new layers
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
          avatarHeader: {
            backgroundColor: '#7B6CFF',
            textColor: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontSize: '20px'
          },
          sidebarLayer: {
            header: {
              backgroundColor: '#181818',
              accountTitle: {
                textColor: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '19px'
              },
              closeIcon: {
                color: '#aaa',
                type: 'x'
              }
            },
            center: {
              backgroundColor: '#232323',
              accountList: {
                avatar: {
                  backgroundColor: '#7B6CFF',
                  textColor: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '20px'
                },
                accountName: {
                  textColor: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '17px'
                },
                accountAddress: {
                  textColor: '#aaa',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px'
                },
                selectedAnimation: {
                  color: '#a259ff',
                  type: 'glow'
                }
              }
            },
            footer: {
              backgroundColor: '#181818',
              footerIcons: {
                addIcon: { color: '#aaa', type: 'plus' },
                editIcon: { color: '#aaa', type: 'pencil' },
                settingsIcon: { color: '#aaa', type: 'settings' }
              }
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
            actionButtons: {
              receiveButton: {
                containerColor: 'rgba(32,32,32,0.7)',
                iconColor: '#6a55ff',
                labelColor: '#ffd600',
                labelFontFamily: 'Inter, sans-serif',
                labelFontSize: '14px',
                borderRadius: '12px'
              },
              sendButton: {
                containerColor: 'rgba(32,32,32,0.7)',
                iconColor: '#6a55ff',
                labelColor: '#ffd600',
                labelFontFamily: 'Inter, sans-serif',
                labelFontSize: '14px',
                borderRadius: '12px'
              },
              swapButton: {
                containerColor: 'rgba(32,32,32,0.7)',
                iconColor: '#6a55ff',
                labelColor: '#ffd600',
                labelFontFamily: 'Inter, sans-serif',
                labelFontSize: '14px',
                borderRadius: '12px'
              },
              buyButton: {
                containerColor: 'rgba(32,32,32,0.7)',
                iconColor: '#6a55ff',
                labelColor: '#ffd600',
                labelFontFamily: 'Inter, sans-serif',
                labelFontSize: '14px',
                borderRadius: '12px'
              }
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
          appsLayer: {
            title: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '26px'
            },
            subtitle: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px'
            },
            collectibleCard: {
              backgroundColor: '#232323',
              backgroundImage: '',
              borderRadius: '16px'
            },
            collectibleName: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '17px'
            },
            manageCollectibleList: {
              textColor: '#FFD700',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            }
          },
          swapLayer: {
            mainContainer: {
              backgroundColor: '#242424',
              backgroundImage: '',
              borderRadius: '20px'
            },
            swapTitle: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '22px'
            },
            settingsIcon: {
              color: '#aaa',
              type: 'settings'
            },
            fromContainer: {
              backgroundColor: '#1a1a1a',
              backgroundImage: '',
              borderRadius: '15px'
            },
            fromLabel: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            fromBalance: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            fromCoinTag: {
              backgroundColor: '#232323',
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              borderRadius: '10px'
            },
            toContainer: {
              backgroundColor: '#1a1a1a',
              backgroundImage: '',
              borderRadius: '15px'
            },
            toLabel: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            toBalance: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px'
            },
            toCoinTag: {
              backgroundColor: '#232323',
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              borderRadius: '10px'
            },
            arrowIcon: {
              color: '#fff',
              type: 'arrow-up-down'
            },
            rateContainer: {
              backgroundColor: '#232323',
              backgroundImage: '',
              borderRadius: '12px'
            },
            rateLabel: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            rateValue: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px'
            },
            infoIcon: {
              color: '#aaa',
              type: 'info'
            }
          },
          historyLayer: {
            recentActivityTitle: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '19px'
            },
            menuIcon: {
              color: '#fff',
              type: 'more-vertical'
            },
            activityCard: {
              backgroundColor: '#232323',
              backgroundImage: '',
              borderRadius: '15px'
            },
            activityText: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            activityStatus: {
              successColor: '#13e163',
              failedColor: '#ff5959',
              pendingColor: '#ffd600',
              fontWeight: '500'
            },
            activityDate: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px'
            },
            loadMore: {
              textColor: '#b03fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            }
          },
          searchLayer: {
            searchInput: {
              backgroundColor: '#181818',
              textColor: '#fff',
              placeholderColor: '#aaa',
              borderRadius: '12px',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              iconSearch: { color: '#aaa', type: 'search' },
              iconClose: { color: '#aaa', type: 'x' }
            },
            searchInputFont: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px',
              textColor: '#fff'
            },
            recentSearchesLabel: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '17px',
              iconTime: { color: '#fff', type: 'clock' }
            },
            trendingLabel: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '17px',
              iconTrending: { color: '#13e163', type: 'trending-up' }
            },
            tokenTag: {
              backgroundColor: '#232323',
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '10px'
            },
            tokenCard: {
              backgroundColor: '#232323',
              borderRadius: '15px'
            },
            tokenCardText: {
              nameColor: '#fff',
              tickerColor: '#aaa',
              priceColor: '#fff',
              percentPositiveColor: '#13e163',
              percentNegativeColor: '#ff5959',
              fontFamily: 'Inter, sans-serif'
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

  const getAvatarHeaderStyle = () => {
    return theme?.avatarHeader || {} as WalletTheme['avatarHeader'];
  };

  const getSidebarLayerStyle = () => {
    return theme?.sidebarLayer || {} as WalletTheme['sidebarLayer'];
  };

  const getHomeLayerStyle = () => {
    return theme?.homeLayer || {} as WalletTheme['homeLayer'];
  };

  const getAppsLayerStyle = () => {
    return theme?.appsLayer || {} as WalletTheme['appsLayer'];
  };

  const getSwapLayerStyle = () => {
    return theme?.swapLayer || {} as WalletTheme['swapLayer'];
  };

  const getHistoryLayerStyle = () => {
    return theme?.historyLayer || {} as WalletTheme['historyLayer'];
  };

  const getSearchLayerStyle = () => {
    return theme?.searchLayer || {} as WalletTheme['searchLayer'];
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
      getAvatarHeaderStyle,
      getSidebarLayerStyle,
      getHomeLayerStyle,
      getAppsLayerStyle,
      getSwapLayerStyle,
      getHistoryLayerStyle,
      getSearchLayerStyle,
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
