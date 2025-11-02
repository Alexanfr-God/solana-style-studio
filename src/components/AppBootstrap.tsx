
import { useEffect, useState } from 'react';

// Компонент для инициализации темы по умолчанию
export default function AppBootstrap() {
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [storeInstanceId, setStoreInstanceId] = useState<string>('loading');

  useEffect(() => {
    // Динамический импорт store внутри useEffect
    const loadThemeStore = async () => {
      try {
        const themeStoreModule = await import('@/state/themeStore');
        setStoreInstanceId(themeStoreModule.THEME_STORE_INSTANCE_ID);
        setStoreLoaded(true);
        console.log('[Bootstrap] Theme store loaded, instance ID:', themeStoreModule.THEME_STORE_INSTANCE_ID);
        
        // Загружаем defaultTheme.json только один раз при старте
        try {
          console.log('[Bootstrap] Starting to load default theme');
          const response = await fetch('/themes/defaultTheme.json');
          if (response.ok) {
            const defaultTheme = await response.json();
            console.log('[Bootstrap] Loading default theme');
            // Используем getState() вместо хука для получения setTheme
            themeStoreModule.useThemeStore.getState().setTheme(defaultTheme);
          } else {
            console.warn('[Bootstrap] Failed to load default theme');
          }
        } catch (error) {
          console.error('[Bootstrap] Error loading default theme:', error);
        }

        // Подключаем Runtime Mapping Engine для автоматического обновления DOM
        try {
          const { setupMappingWatcher } = await import('@/services/runtimeMappingEngine');
          setupMappingWatcher(() => themeStoreModule.useThemeStore.getState().theme);
          console.log('[Bootstrap] 🔌 Runtime Mapping Engine connected');
          
          // Загружаем маппинги элементов для Runtime Engine
          const { jsonBridge } = await import('@/services/jsonBridgeService');
          await jsonBridge.loadElementMappings();
          console.log('[Bootstrap] 🗺️ Element mappings loaded:', jsonBridge.getAllMappings().length);
        } catch (error) {
          console.error('[Bootstrap] ❌ Failed to connect Runtime Mapping Engine:', error);
        }
      } catch (error) {
        console.error('[Bootstrap] Failed to import theme store:', error);
        setStoreInstanceId('error');
      }
    };

    loadThemeStore();
  }, []);

  // Диагностический лог
  useEffect(() => {
    if (storeInstanceId !== 'loading' && storeInstanceId !== 'error') {
      console.log('[Bootstrap] Theme store instance ID:', storeInstanceId);
    }
  }, [storeInstanceId]);

  return null; // Этот компонент не рендерит UI
}
