

import { useEffect, useState } from 'react';

// Компонент для инициализации темы по умолчанию
export default function AppBootstrap() {
  const [useThemeStore, setUseThemeStore] = useState<any>(null);
  const [storeInstanceId, setStoreInstanceId] = useState<string>('loading');
  const [setTheme, setSetTheme] = useState<any>(null);

  useEffect(() => {
    // Динамический импорт store внутри useEffect
    const loadThemeStore = async () => {
      try {
        const themeStoreModule = await import('@/state/themeStore');
        setUseThemeStore(() => themeStoreModule.useThemeStore);
        setStoreInstanceId(themeStoreModule.THEME_STORE_INSTANCE_ID);
        console.log('[Bootstrap] Theme store loaded, instance ID:', themeStoreModule.THEME_STORE_INSTANCE_ID);
      } catch (error) {
        console.error('[Bootstrap] Failed to import theme store:', error);
        setStoreInstanceId('error');
      }
    };

    loadThemeStore();
  }, []);

  // Extract setTheme from the store once it's loaded
  useEffect(() => {
    if (!useThemeStore) return;
    
    try {
      // Use the store hook properly with a selector function
      const themeSetterFunction = useThemeStore((state: any) => state.setTheme);
      setSetTheme(() => themeSetterFunction);
      console.log('[Bootstrap] Theme setter extracted successfully');
    } catch (error) {
      console.error('[Bootstrap] Error extracting theme setter:', error);
    }
  }, [useThemeStore]);

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

