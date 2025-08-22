
import { useEffect } from 'react';
import { useThemeStore, THEME_STORE_INSTANCE_ID } from '@/state/themeStore';

// Компонент для инициализации темы по умолчанию
export default function AppBootstrap() {
  const setTheme = useThemeStore(s => s.setTheme);

  // Диагностика store instance при монтировании
  console.log('[Bootstrap] Theme store instance ID:', THEME_STORE_INSTANCE_ID);

  useEffect(() => {
    // Загружаем defaultTheme.json только один раз при старте
    const loadDefaultTheme = async () => {
      try {
        console.log('[Bootstrap] Starting to load default theme');
        const response = await fetch('/themes/defaultTheme.json');
        if (response.ok) {
          const defaultTheme = await response.json();
          console.log('[Bootstrap] Loading default theme');
          setTheme(defaultTheme);
        } else {
          console.warn('[Bootstrap] Failed to load default theme');
        }
      } catch (error) {
        console.error('[Bootstrap] Error loading default theme:', error);
      }
    };

    loadDefaultTheme();
  }, [setTheme]);

  return null; // Этот компонент не рендерит UI
}
