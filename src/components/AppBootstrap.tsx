
import { useEffect } from 'react';

// Safe theme store access with fallback
let useThemeStoreSafe: any = null;
let THEME_STORE_INSTANCE_ID_SAFE: string = 'fallback';

try {
  const themeStoreModule = await import('@/state/themeStore');
  useThemeStoreSafe = themeStoreModule.useThemeStore;
  THEME_STORE_INSTANCE_ID_SAFE = themeStoreModule.THEME_STORE_INSTANCE_ID;
} catch (error) {
  console.error('[Bootstrap] Failed to import theme store:', error);
}

// Компонент для инициализации темы по умолчанию
export default function AppBootstrap() {
  // Safe store access - return early if store isn't available
  if (!useThemeStoreSafe) {
    console.warn('[Bootstrap] Theme store not available, skipping initialization');
    return null;
  }

  let setTheme: any = null;
  
  try {
    setTheme = useThemeStoreSafe((s: any) => s.setTheme);
    // Диагностика store instance при монтировании
    console.log('[Bootstrap] Theme store instance ID:', THEME_STORE_INSTANCE_ID_SAFE);
  } catch (error) {
    console.error('[Bootstrap] Error accessing theme store:', error);
    return null;
  }

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

  return null; // Этот компонент не рендерит UI
}
