
import { useEffect } from 'react';
import { useThemeStore } from '@/state/themeStore';
import { useCustomizationStore } from '@/stores/customizationStore';

/**
 * Синхронизирует изменения между themeStore и customizationStore
 * Когда themeStore.theme обновляется -> автоматически обновляем стили кошелька
 */
export const useThemeSynchronizer = () => {
  const theme = useThemeStore(state => state.theme);
  const setStyleForLayer = useCustomizationStore(state => state.setStyleForLayer);

  useEffect(() => {
    if (!theme || Object.keys(theme).length === 0) return;

    console.log('🔄 Синхронизация темы с кошельком...', theme);

    // Извлекаем стили для login экрана
    const loginStyle = {
      backgroundColor: theme.lockLayer?.backgroundColor || theme.global?.backgroundColor || '#131313',
      backgroundImage: theme.lockLayer?.backgroundImage || theme.global?.backgroundImage,
      textColor: theme.lockLayer?.textColor || theme.global?.textColor || '#FFFFFF',
      accentColor: theme.lockLayer?.accentColor || theme.global?.accentColor || '#FFD166',
      buttonColor: theme.lockLayer?.buttonColor || theme.global?.buttonColor || '#FFD166',
      buttonTextColor: theme.lockLayer?.buttonTextColor || theme.global?.buttonTextColor || '#181818',
      borderRadius: theme.lockLayer?.borderRadius || theme.global?.borderRadius || '12px',
      fontFamily: theme.lockLayer?.fontFamily || theme.global?.fontFamily || 'Inter, sans-serif',
      boxShadow: theme.lockLayer?.boxShadow || theme.global?.boxShadow
    };

    // Извлекаем стили для wallet экрана
    const walletStyle = {
      backgroundColor: theme.homeLayer?.backgroundColor || theme.global?.backgroundColor || '#131313',
      backgroundImage: theme.homeLayer?.backgroundImage || theme.global?.backgroundImage,
      textColor: theme.homeLayer?.textColor || theme.global?.textColor || '#FFFFFF',
      accentColor: theme.homeLayer?.accentColor || theme.global?.accentColor || '#FFD166',
      buttonColor: theme.homeLayer?.buttonColor || theme.global?.buttonColor || '#FFD166',
      buttonTextColor: theme.homeLayer?.buttonTextColor || theme.global?.buttonTextColor || '#181818',
      borderRadius: theme.homeLayer?.borderRadius || theme.global?.borderRadius || '12px',
      fontFamily: theme.homeLayer?.fontFamily || theme.global?.fontFamily || 'Inter, sans-serif',
      boxShadow: theme.homeLayer?.boxShadow || theme.global?.boxShadow
    };

    // Синхронизируем стили с customizationStore
    setStyleForLayer('login', loginStyle);
    setStyleForLayer('wallet', walletStyle);

    console.log('✅ Синхронизация завершена:', { loginStyle, walletStyle });
  }, [theme, setStyleForLayer]);
};
