
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/state/themeStore';

// Компонент для инициализации темы по умолчанию
export default function AppBootstrap() {
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [storeInstanceId, setStoreInstanceId] = useState<string>('loading');

  // Load theme store and mappings once on mount
  useEffect(() => {
    const loadThemeStore = async () => {
      try {
        const themeStoreModule = await import('@/state/themeStore');
        setStoreInstanceId(themeStoreModule.THEME_STORE_INSTANCE_ID);
        setStoreLoaded(true);
        console.log('[Bootstrap] Theme store loaded, instance ID:', themeStoreModule.THEME_STORE_INSTANCE_ID);
        
        // Load default theme once at startup
        try {
          console.log('[Bootstrap] Starting to load default theme');
          const response = await fetch('/themes/defaultTheme.json');
          if (response.ok) {
            const defaultTheme = await response.json();
            console.log('[Bootstrap] Loading default theme');
            themeStoreModule.useThemeStore.getState().setTheme(defaultTheme);
          } else {
            console.warn('[Bootstrap] Failed to load default theme');
          }
        } catch (error) {
          console.error('[Bootstrap] Error loading default theme:', error);
        }

        // Load element mappings for Runtime Mapping Engine
        try {
          const { jsonBridge } = await import('@/services/jsonBridgeService');
          await jsonBridge.loadElementMappings();
          console.log('[Bootstrap] 🗺️ Element mappings loaded:', jsonBridge.getAllMappings().length);
          console.log('[Bootstrap] ✅ Runtime Mapping Engine ready (event-driven)');
        } catch (error) {
          console.error('[Bootstrap] ❌ Failed to load element mappings:', error);
        }
      } catch (error) {
        console.error('[Bootstrap] Failed to import theme store:', error);
        setStoreInstanceId('error');
      }
    };

    loadThemeStore();
  }, []);

  // Apply theme to DOM when theme.id changes (one-shot, no polling)
  const theme = useThemeStore(s => s.theme);
  useEffect(() => {
    if (!theme?.id) return;
    
    (async () => {
      console.log('[Bootstrap] 🎨 Theme changed, applying to DOM:', theme.id);
      const { applyThemeToDOM } = await import('@/services/runtimeMappingEngine');
      await applyThemeToDOM(theme);
    })();
  }, [theme?.id]);

  // Диагностический лог
  useEffect(() => {
    if (storeInstanceId !== 'loading' && storeInstanceId !== 'error') {
      console.log('[Bootstrap] Theme store instance ID:', storeInstanceId);
    }
  }, [storeInstanceId]);

  return null; // Этот компонент не рендерит UI
}
