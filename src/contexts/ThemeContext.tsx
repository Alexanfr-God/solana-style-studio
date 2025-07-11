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
  receiveLayer: {
    header: {
      backgroundColor: string;
      backgroundImage?: string;
      backIcon: { color: string; type: string; };
      title: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      qrIcon: { color: string; type: string; };
    };
    selectNetworkLabel: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    selectNetworkDescription: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    networksContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    networkItem: {
      backgroundColor: string;
      borderRadius: string;
      mainNameColor: string;
      mainNameFontFamily: string;
      mainNameFontWeight: string;
      mainNameFontSize: string;
      secondaryNameColor: string;
      secondaryNameFontFamily: string;
      secondaryNameFontSize: string;
      addressColor: string;
      addressFontFamily: string;
      addressFontSize: string;
      qrIcon: { color: string; type: string; };
      copyIcon: { color: string; type: string; };
    };
    footer: {
      backgroundColor: string;
      backgroundImage?: string;
    };
  };
  sendLayer: {
    headerContainer: {
      backgroundColor: string;
      backgroundImage?: string;
    };
    header: {
      backIcon: { color: string; type: string; };
      title: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      qrIcon: { color: string; type: string; };
    };
    searchInputContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    searchInput: {
      textColor: string;
      placeholderColor: string;
      fontFamily: string;
      fontSize: string;
      iconSearch: { color: string; type: string; };
    };
    centerContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    selectNetworkLabel: {
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
    };
    selectNetworkDescription: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    networkList: {
      container: {
        backgroundColor: string;
        borderRadius: string;
      };
      networkItem: {
        backgroundColor: string;
        borderRadius: string;
      };
      coinName: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      coinTicker: {
        textColor: string;
        fontFamily: string;
        fontSize: string;
      };
      balance: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      fiatValue: {
        textColor: string;
        fontFamily: string;
        fontSize: string;
      };
      icons: {
        qrIcon: { color: string; type: string; };
        copyIcon: { color: string; type: string; };
      };
    };
    emptyState: {
      textColor: string;
      fontFamily: string;
      fontSize: string;
    };
    footerContainer: {
      backgroundColor: string;
      backgroundImage?: string;
    };
    footer: {
      closeButton: {
        backgroundColor: string;
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        icon: { color: string; type: string; };
        borderRadius: string;
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
  buyLayer: {
    headerContainer: {
      backgroundColor: string;
      backgroundImage?: string;
      borderRadius: string;
    };
    header: {
      backButton: {
        backgroundColor: string;
        borderRadius: string;
        text: {
          textColor: string;
          fontFamily: string;
          fontWeight: string;
          fontSize: string;
        };
        icon: { color: string; type: string; };
      };
      title: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
    };
    searchInputContainer: {
      backgroundColor: string;
      borderRadius: string;
    };
    searchInput: {
      textColor: string;
      placeholderColor: string;
      fontFamily: string;
      fontSize: string;
      iconSearch: { color: string; type: string; };
    };
    centerContainer: {
      backgroundColor: string;
      borderRadius: string;
    };
    sectionLabel: {
      getStarted: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      popular: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
    };
    tokenCard: {
      backgroundColor: string;
      borderRadius: string;
    };
    tokenCardContent: {
      tokenName: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
      tokenDescription: {
        textColor: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
      };
    };
    buyButton: {
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
      fontWeight: string;
      fontSize: string;
      borderRadius: string;
    };
    footerContainer: {
      backgroundColor: string;
      borderRadius: string;
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
  getReceiveLayerStyle: () => WalletTheme['receiveLayer'];
  getSendLayerStyle: () => WalletTheme['sendLayer'];
  getAppsLayerStyle: () => WalletTheme['appsLayer'];
  getBuyLayerStyle: () => WalletTheme['buyLayer'];
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
          receiveLayer: {
            header: {
              backgroundColor: '#181818',
              backgroundImage: '',
              backIcon: { color: '#ad7e26', type: 'arrow-left' },
              title: {
                textColor: '#ad7e26',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '21px'
              },
              qrIcon: { color: '#ad7e26', type: 'qr-code' }
            },
            selectNetworkLabel: {
              textColor: '#ad7e26',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '17px'
            },
            selectNetworkDescription: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            networksContainer: {
              backgroundColor: '#232323',
              backgroundImage: '',
              borderRadius: '15px'
            },
            networkItem: {
              backgroundColor: '#232323',
              borderRadius: '13px',
              mainNameColor: '#ad7e26',
              mainNameFontFamily: 'Inter, sans-serif',
              mainNameFontWeight: 'bold',
              mainNameFontSize: '16px',
              secondaryNameColor: '#aaa',
              secondaryNameFontFamily: 'Inter, sans-serif',
              secondaryNameFontSize: '14px',
              addressColor: '#fff',
              addressFontFamily: 'Inter, sans-serif',
              addressFontSize: '15px',
              qrIcon: { color: '#ad7e26', type: 'qr-code' },
              copyIcon: { color: '#ad7e26', type: 'copy' }
            },
            footer: {
              backgroundColor: '#181818',
              backgroundImage: ''
            }
          },
          sendLayer: {
            headerContainer: {
              backgroundColor: '#181818',
              backgroundImage: ''
            },
            header: {
              backIcon: { color: '#ad7e26', type: 'arrow-left' },
              title: {
                textColor: '#643800',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '23px'
              },
              qrIcon: { color: '#ad7e26', type: 'qr-code' }
            },
            searchInputContainer: {
              backgroundColor: '#13e163',
              backgroundImage: '',
              borderRadius: '16px'
            },
            searchInput: {
              textColor: '#fff',
              placeholderColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              iconSearch: { color: '#fff', type: 'search' }
            },
            centerContainer: {
              backgroundColor: '#232323',
              backgroundImage: '',
              borderRadius: '18px'
            },
            selectNetworkLabel: {
              textColor: '#ad7e26',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '19px'
            },
            selectNetworkDescription: {
              textColor: '#aaa',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            networkList: {
              container: {
                backgroundColor: '#232323',
                borderRadius: '16px'
              },
              networkItem: {
                backgroundColor: '#181818',
                borderRadius: '13px'
              },
              coinName: {
                textColor: '#ad7e26',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '17px'
              },
              coinTicker: {
                textColor: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px'
              },
              balance: {
                textColor: '#ad7e26',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: '15px'
              },
              fiatValue: {
                textColor: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px'
              },
              icons: {
                qrIcon: { color: '#aaa', type: 'qr-code' },
                copyIcon: { color: '#aaa', type: 'copy' }
              }
            },
            emptyState: {
              textColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '15px'
            },
            footerContainer: {
              backgroundColor: '#181818',
              backgroundImage: ''
            },
            footer: {
              closeButton: {
                backgroundColor: '#FFD166',
                textColor: '#181818',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '19px',
                icon: { color: '#ad7e26', type: 'x' },
                borderRadius: '16px'
              }
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
          buyLayer: {
            headerContainer: {
              backgroundColor: '#181818',
              backgroundImage: '',
              borderRadius: '0px'
            },
            header: {
              backButton: {
                backgroundColor: '#FFD166',
                borderRadius: '14px',
                text: {
                  textColor: '#181818',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 'bold',
                  fontSize: '17px'
                },
                icon: { color: '#181818', type: 'arrow-left' }
              },
              title: {
                textColor: '#FFD166',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '26px'
              }
            },
            searchInputContainer: {
              backgroundColor: '#13e163',
              borderRadius: '14px'
            },
            searchInput: {
              textColor: '#fff',
              placeholderColor: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              iconSearch: { color: '#fff', type: 'search' }
            },
            centerContainer: {
              backgroundColor: '#232323',
              borderRadius: '0px'
            },
            sectionLabel: {
              getStarted: {
                textColor: '#5f4025',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '18px'
              },
              popular: {
                textColor: '#5f4025',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'bold',
                fontSize: '18px'
              }
            },
            tokenCard: {
              backgroundColor: '#613c19',
              borderRadius: '18px'
            },
            tokenCardContent: {
              tokenName: {
                textColor: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'normal',
                fontSize: '16px'
              },
              tokenDescription: {
                textColor: '#d0d0d0',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'normal',
                fontSize: '15px'
              }
            },
            buyButton: {
              backgroundColor: '#FFD166',
              textColor: '#181818',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: '18px',
              borderRadius: '14px'
            },
            footerContainer: {
              backgroundColor: '#181818',
              borderRadius: '0px'
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

  const getReceiveLayerStyle = () => {
    return theme?.receiveLayer || {} as WalletTheme['receiveLayer'];
  };

  const getSendLayerStyle = () => {
    return theme?.sendLayer || {} as WalletTheme['sendLayer'];
  };

  const getAppsLayerStyle = () => {
    return theme?.appsLayer || {} as WalletTheme['appsLayer'];
  };

  const getBuyLayerStyle = () => {
    return theme?.buyLayer || {} as WalletTheme['buyLayer'];
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
      getReceiveLayerStyle,
      getSendLayerStyle,
      getAppsLayerStyle,
      getBuyLayerStyle,
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
