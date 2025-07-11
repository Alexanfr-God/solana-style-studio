import { useTheme } from '@/contexts/ThemeContext';

export const useWalletTheme = () => {
  const { theme, getLockLayerStyle, getAvatarHeaderStyle, getSidebarLayerStyle, getHomeLayerStyle, getReceiveLayerStyle, getSendLayerStyle, getAppsLayerStyle, getBuyLayerStyle, getSwapLayerStyle, getHistoryLayerStyle, getSearchLayerStyle, getInputsStyle, getGlobalStyle } = useTheme();

  const getLockLayer = () => {
    const lockStyle = getLockLayerStyle();
    console.log('🔒 Lock layer style:', lockStyle);
    return lockStyle;
  };

  const getAvatarHeader = () => {
    const avatarStyle = getAvatarHeaderStyle();
    console.log('👤 Avatar header style:', avatarStyle);
    return avatarStyle;
  };

  const getSidebarLayer = () => {
    const sidebarStyle = getSidebarLayerStyle();
    console.log('📱 Sidebar layer style:', sidebarStyle);
    return sidebarStyle;
  };

  const getHomeLayer = () => {
    const homeStyle = getHomeLayerStyle();
    console.log('🏠 Home layer style:', homeStyle);
    return homeStyle;
  };

  const getReceiveLayer = () => {
    const receiveStyle = getReceiveLayerStyle();
    console.log('📨 Receive layer style:', receiveStyle);
    return receiveStyle;
  };

  const getSendLayer = () => {
    const sendStyle = getSendLayerStyle();
    console.log('📤 Send layer style:', sendStyle);
    return sendStyle;
  };

  const getAppsLayer = () => {
    const appsStyle = getAppsLayerStyle();
    console.log('📱 Apps layer style:', appsStyle);
    return appsStyle;
  };

  const getBuyLayer = () => {
    const buyStyle = getBuyLayerStyle();
    console.log('🛒 Buy layer style:', buyStyle);
    return buyStyle;
  };

  const getSwapLayer = () => {
    const swapStyle = getSwapLayerStyle();
    console.log('🔄 Swap layer style:', swapStyle);
    return swapStyle;
  };

  const getHistoryLayer = () => {
    const historyStyle = getHistoryLayerStyle();
    console.log('📜 History layer style:', historyStyle);
    return historyStyle;
  };

  const getSearchLayer = () => {
    const searchStyle = getSearchLayerStyle();
    console.log('🔍 Search layer style:', searchStyle);
    return searchStyle;
  };

  const getInputs = () => {
    const inputsStyle = getInputsStyle();
    console.log('⌨️ Inputs style:', inputsStyle);
    return inputsStyle;
  };

  const getGlobal = () => {
    const globalStyle = getGlobalStyle();
    console.log('🌍 Global style:', globalStyle);
    return globalStyle;
  };

  const getComponentStyle = (component: string) => {
    switch (component) {
      case 'overlays':
        return {
          backgroundColor: 'rgba(24, 24, 24, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: getGlobal().borderRadius || '16px'
        };
      case 'containers':
        return {
          backgroundColor: getHomeLayer().mainContainer?.backgroundColor || 'rgba(40, 40, 40, 0.7)',
          borderRadius: getHomeLayer().mainContainer?.borderRadius || '16px',
          textColor: getHomeLayer().totalBalanceValue?.textColor || '#FFFFFF',
          fontFamily: getGlobal().fontFamily || 'Inter, sans-serif'
        };
      case 'buttons':
        return {
          backgroundColor: getHomeLayer().actionButtons?.receiveButton?.containerColor || 'rgba(32, 32, 32, 0.7)',
          borderRadius: getHomeLayer().actionButtons?.receiveButton?.borderRadius || '12px',
          textColor: getHomeLayer().actionButtons?.receiveButton?.labelColor || '#FFFFFF'
        };
      case 'cards':
        return {
          backgroundColor: getHomeLayer().assetCard?.backgroundColor || 'rgba(40, 40, 40, 0.9)',
          borderRadius: getHomeLayer().assetCard?.borderRadius || '14px',
          textColor: getHomeLayer().assetCard?.textColor || '#FFFFFF',
          fontFamily: getHomeLayer().assetCard?.fontFamily || 'Inter, sans-serif'
        };
      case 'navigation':
        return {
          backgroundColor: getHomeLayer().footer?.backgroundColor || 'rgba(24, 24, 24, 0.9)',
          textColor: getHomeLayer().footer?.textColor || '#FFFFFF',
          fontFamily: getHomeLayer().footer?.fontFamily || 'Inter, sans-serif',
          borderRadius: getGlobal().borderRadius || '8px'
        };
      case 'global':
        return {
          textColor: getHomeLayer().totalBalanceValue?.textColor || '#FFFFFF',
          fontFamily: getGlobal().fontFamily || 'Inter, sans-serif'
        };
      case 'layerHeaders':
        return {
          backgroundColor: getHomeLayer().header?.backgroundColor || 'rgba(24, 24, 24, 0.92)',
          textColor: getHomeLayer().header?.textColor || '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        };
      case 'searchInputs':
        return {
          backgroundColor: getInputs().searchInput?.backgroundColor || '#191919',
          textColor: getInputs().searchInput?.textColor || '#FFFFFF',
          borderRadius: getInputs().searchInput?.borderRadius || '10px',
          border: getInputs().searchInput?.border || '1px solid #2a2a2a'
        };
      case 'networkItems':
        return {
          backgroundColor: getReceiveLayer().networksContainer?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          borderRadius: getReceiveLayer().networksContainer?.borderRadius || '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)'
        };
      case 'panels':
        return {
          backgroundColor: getSwapLayer().fromContainer?.backgroundColor || 'rgba(255, 255, 255, 0.05)',
          borderRadius: getSwapLayer().fromContainer?.borderRadius || '12px'
        };
      case 'historyActivityCards':
        return {
          backgroundColor: getHistoryLayer().activityCard?.backgroundColor || '#232323',
          borderRadius: getHistoryLayer().activityCard?.borderRadius || '15px'
        };
      case 'searchTokenCards':
        return {
          backgroundColor: getSearchLayer().tokenCard?.backgroundColor || '#232323',
          borderRadius: getSearchLayer().tokenCard?.borderRadius || '15px'
        };
      case 'searchTokenTags':
        return {
          backgroundColor: getSearchLayer().tokenTag?.backgroundColor || '#232323',
          borderRadius: getSearchLayer().tokenTag?.borderRadius || '10px',
          textColor: getSearchLayer().tokenTag?.textColor || '#FFFFFF'
        };
      default:
        return {
          backgroundColor: 'rgba(40, 40, 40, 0.7)',
          borderRadius: '12px',
          textColor: '#FFFFFF'
        };
    }
  };

  const getTransition = (type: string = 'default') => {
    return getGlobal().transition || 'all 0.2s ease';
  };

  const tokenColors = {
    positive: getHomeLayer().totalBalanceChange?.positiveColor || '#13e163',
    negative: getHomeLayer().totalBalanceChange?.negativeColor || '#ff5959',
    info: getHomeLayer().footer?.iconColor || '#6a55ff'
  };

  const getUnifiedTokenColor = (change: string) => {
    const isPositive = change.startsWith('+');
    const isNegative = change.startsWith('-');
    
    if (isPositive) {
      return { color: tokenColors.positive };
    } else if (isNegative) {
      return { color: tokenColors.negative };
    } else {
      return { color: getHomeLayer().totalBalanceValue?.textColor || '#FFFFFF' };
    }
  };

  return {
    theme,
    getLockLayer,
    getAvatarHeader,
    getSidebarLayer,
    getHomeLayer,
    getReceiveLayer,
    getSendLayer,
    getAppsLayer,
    getBuyLayer,
    getSwapLayer,
    getHistoryLayer,
    getSearchLayer,
    getInputs,
    getGlobal,
    getComponentStyle,
    getTransition,
    tokenColors,
    getUnifiedTokenColor
  };
};
