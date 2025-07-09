
import { useTheme } from '@/contexts/ThemeContext';

export const useWalletTheme = () => {
  const { theme, getLockLayerStyle, getHomeLayerStyle, getInputsStyle, getGlobalStyle } = useTheme();

  const getLockLayer = () => {
    const lockStyle = getLockLayerStyle();
    console.log('🔒 Lock layer style:', lockStyle);
    return lockStyle;
  };

  const getHomeLayer = () => {
    const homeStyle = getHomeLayerStyle();
    console.log('🏠 Home layer style:', homeStyle);
    return homeStyle;
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

  return {
    theme,
    getLockLayer,
    getHomeLayer,
    getInputs,
    getGlobal
  };
};
