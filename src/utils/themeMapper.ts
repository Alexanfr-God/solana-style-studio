
import { WalletStyle } from '@/stores/customizationStore';

export const mapThemeToWalletStyle = (theme: any): { loginStyle: WalletStyle; walletStyle: WalletStyle } => {
  console.log('🗺️ Mapping theme to wallet styles:', theme);

  // Защита от пустых или некорректных данных
  if (!theme || typeof theme !== 'object') {
    console.warn('⚠️ Invalid theme data, using defaults');
    theme = {};
  }

  // Извлекаем данные из lockLayer для login стиля
  const lockLayer = theme.lockLayer || {};
  const unlockButton = lockLayer.unlockButton || {};
  
  // Извлекаем данные из homeLayer для wallet стиля  
  const homeLayer = theme.homeLayer || {};
  const primaryButton = homeLayer.primaryButton || {};

  const loginStyle: WalletStyle = {
    backgroundColor: lockLayer.backgroundColor || '#000000',
    backgroundImage: lockLayer.backgroundImage || undefined,
    accentColor: unlockButton.backgroundColor || '#9333ea',
    textColor: lockLayer.textColor || '#ffffff',
    buttonColor: unlockButton.backgroundColor || '#9333ea',
    buttonTextColor: unlockButton.textColor || '#ffffff',
    borderRadius: unlockButton.borderRadius || '12px',
    fontFamily: lockLayer.fontFamily || 'Inter, sans-serif',
    boxShadow: unlockButton.boxShadow || undefined,
    primaryColor: unlockButton.backgroundColor || '#9333ea',
    font: lockLayer.fontFamily || 'Inter, sans-serif',
    gradient: lockLayer.backgroundImage || undefined
  };

  const walletStyle: WalletStyle = {
    backgroundColor: homeLayer.backgroundColor || '#000000',
    backgroundImage: homeLayer.backgroundImage || undefined,
    accentColor: primaryButton.backgroundColor || '#9333ea',
    textColor: homeLayer.textColor || '#ffffff',
    buttonColor: primaryButton.backgroundColor || '#9333ea',
    buttonTextColor: primaryButton.textColor || '#ffffff',
    borderRadius: primaryButton.borderRadius || '12px',
    fontFamily: homeLayer.fontFamily || 'Inter, sans-serif',
    boxShadow: primaryButton.boxShadow || undefined,
    primaryColor: primaryButton.backgroundColor || '#9333ea',
    font: homeLayer.fontFamily || 'Inter, sans-serif',
    gradient: homeLayer.backgroundImage || undefined
  };

  console.log('✅ Mapped styles:', { loginStyle, walletStyle });
  
  return { loginStyle, walletStyle };
};
