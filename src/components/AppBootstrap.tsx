
import { useEffect, useState } from 'react';

// Компонент для инициализации темы по умолчанию
export default function AppBootstrap() {
  const [themeStore, setThemeStore] = useState<any>(null);
  const [storeInstanceId, setStoreInstanceId] = useState<string>('loading');

  useEffect(() => {
    // Динамический импорт store внутри useEffect
    const loadThemeStore = async () => {
      try {
        const themeStoreModule = await import('@/state/themeStore');
        setThemeStore(themeStoreModule.useThemeStore);
        setStoreInstanceId(themeStoreModule.THEME_STORE_INSTANCE_ID);
        console.log('[Bootstrap] Theme store loaded, instance ID:', themeStoreModule.THEME_STORE_INSTANCE_ID);
      } catch (error) {
        console.error('[Bootstrap] Failed to import theme store:', error);
        setStoreInstanceId('error');
      }
    };

    loadThemeStore();
  }, []);

  // Используем store только после успешной загрузки
  const setTheme = themeStore ? themeStore((s: any) => s.setTheme) : null;

  useEffect(() => {
    if (!setTheme) return;
    
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

  // Диагностический лог
  useEffect(() => {
    if (storeInstanceId !== 'loading' && storeInstanceId !== 'error') {
      console.log('[Bootstrap] Theme store instance ID:', storeInstanceId);
    }
  }, [storeInstanceId]);

  return null; // Этот компонент не рендерит UI
}
