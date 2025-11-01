/**
 * Runtime Mapping Engine
 * Applies styles from JSON theme to DOM elements based on json_path mappings
 */

import { jsonBridge } from '@/services/jsonBridgeService';
import { useThemeStore } from '@/state/themeStore';

export interface AppliedStyle {
  elementId: string;
  selector: string;
  appliedProperties: string[];
  success: boolean;
}

const WALLET_ROOT_SELECTOR = '[data-wallet-container]';

/**
 * Get value from theme JSON by path
 */
function getThemeValueByPath(theme: any, jsonPath: string): any {
  if (!jsonPath || !theme) return null;
  
  // Remove leading slash if present
  const path = jsonPath.startsWith('/') ? jsonPath.slice(1) : jsonPath;
  
  // Split by / and traverse the object
  const parts = path.split('/');
  let current = theme;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  
  return current;
}

// ============================================================================
// Helpers
// ============================================================================

const getKeyFromPath = (jsonPath: string): string =>
  (jsonPath.split('/').pop() || '').toLowerCase();

const parentPath = (jsonPath: string): string =>
  jsonPath.includes('/') ? jsonPath.split('/').slice(0, -1).join('/') : '';

const getByPath = (obj: any, path: string): any => {
  if (!path) return obj;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath.split('/').filter(Boolean).reduce((acc, k) => acc?.[k], obj);
};

const hasBackgroundImageAtSameNode = (theme: any, jsonPath: string): boolean => {
  const key = getKeyFromPath(jsonPath);
  if (key !== 'backgroundcolor') return false;
  
  const base = parentPath(jsonPath);
  const node = getByPath(theme, base);
  const bgImg = node?.backgroundImage;
  return Boolean(bgImg && String(bgImg).trim() !== '');
};

// ============================================================================
// ЕДИНЫЙ МЭППЕР - применяет значение к DOM элементу
// ============================================================================

export function applyValueToNodeUnified(
  el: HTMLElement,
  jsonPath: string,
  value: any,
  theme: any
) {
  const key = getKeyFromPath(jsonPath);
  const isGradient = typeof value === 'string' && value.includes('gradient(');

  // 🛡️ ЗАЩИТА ФОНА: не затирать backgroundImage
  if (key === 'backgroundcolor' && hasBackgroundImageAtSameNode(theme, jsonPath)) {
    console.log('[Runtime] 🛡️ skip bgColor (backgroundImage present)', { jsonPath });
    return;
  }

  if (key === 'background') {
    el.style.background = String(value);
    el.style.removeProperty('background-color');
    console.log('[Runtime] ✅ Applied background');
    return;
  }

  if (key === 'backgroundcolor') {
    const isLockLayer = jsonPath.includes('/lockLayer/');
    const important = isLockLayer ? 'important' : '';
    
    if (isGradient) {
      el.style.setProperty('background', String(value), important);
      el.style.removeProperty('background-color');
      console.log('[Runtime] ✅ Applied gradient', isLockLayer ? '(!important)' : '');
    } else {
      el.style.setProperty('background-color', String(value), important);
      el.style.removeProperty('background');
      console.log('[Runtime] ✅ Applied backgroundColor', isLockLayer ? '(!important)' : '');
    }
    
    if (isLockLayer) {
      el.setAttribute('data-wcc-inline', '1');
    }
    return;
  }

  // ✅ ДОБАВЛЕНО: backgroundImage
  if (key === 'backgroundimage') {
    if (value && String(value).trim() !== '') {
      el.style.backgroundImage = `url(${value})`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.style.backgroundRepeat = 'no-repeat';
      console.log('[Runtime] ✅ Applied backgroundImage:', value);
    } else {
      el.style.removeProperty('background-image');
      console.log('[Runtime] ✅ Removed backgroundImage');
    }
    return;
  }

  if (key === 'textcolor' || key === 'color') {
    const isLockLayer = jsonPath.includes('/lockLayer/');
    const important = isLockLayer ? 'important' : '';
    
    el.style.setProperty('color', String(value), important);
    console.log('[Runtime] ✅ Applied textColor', isLockLayer ? '(!important)' : '');
    
    if (isLockLayer) {
      el.setAttribute('data-wcc-inline', '1');
    }
    return;
  }

  if (key === 'bordercolor') {
    const isLockLayer = jsonPath.includes('/lockLayer/');
    const important = isLockLayer ? 'important' : '';
    
    el.style.setProperty('border-color', String(value), important);
    console.log('[Runtime] ✅ Applied borderColor', isLockLayer ? '(!important)' : '');
    
    if (isLockLayer) {
      el.setAttribute('data-wcc-inline', '1');
    }
    return;
  }

  if (key === 'placeholdercolor') {
    el.style.setProperty('--placeholder-color', String(value));
    console.log('[Runtime] ✅ Applied placeholderColor');
    return;
  }

  if (key === 'iconcolor') {
    el.style.color = String(value);
    console.log('[Runtime] ✅ Applied iconColor');
    return;
  }

  // ✅ ДОБАВЛЕНО: activeColor для active состояния иконок
  if (key === 'activecolor') {
    el.style.color = String(value);
    console.log('[Runtime] ✅ Applied activeColor');
    return;
  }

  // ✅ ДОБАВЛЕНО: containerColor → backgroundColor
  if (key === 'containercolor') {
    if (isGradient) {
      el.style.background = String(value);
      el.style.removeProperty('background-color');
    } else {
      el.style.backgroundColor = String(value);
      el.style.removeProperty('background');
    }
    console.log('[Runtime] ✅ Applied containerColor');
    return;
  }

  // ✅ ДОБАВЛЕНО: labelColor → color
  if (key === 'labelcolor') {
    el.style.color = String(value);
    console.log('[Runtime] ✅ Applied labelColor');
    return;
  }

  // Unmapped key
  console.log('[Runtime] ⚠️ unmapped key', { key, jsonPath, value });
}

// ============================================================================
// CSS Variables Writer (lockLayer)
// ============================================================================

function writeLockLayerVars(theme: any): void {
  const root = document.documentElement;
  const lockLayer = theme?.lockLayer;
  
  if (!lockLayer) {
    console.log('[Runtime] ⚠️ No lockLayer in theme');
    return;
  }
  
  // Password Input
  if (lockLayer.passwordInput) {
    const { backgroundColor, textColor, iconEyeColor, placeholderColor, fontFamily, borderRadius, border } = lockLayer.passwordInput;
    if (backgroundColor) root.style.setProperty('--wcc-lock-password-bg', backgroundColor);
    if (textColor) root.style.setProperty('--wcc-lock-password-fg', textColor);
    if (iconEyeColor) root.style.setProperty('--wcc-lock-password-icon', iconEyeColor);
    if (placeholderColor) root.style.setProperty('--wcc-lock-password-placeholder', placeholderColor);
    if (fontFamily) root.style.setProperty('--wcc-lock-password-font', fontFamily);
    if (borderRadius) root.style.setProperty('--wcc-lock-password-radius', borderRadius);
    if (border) root.style.setProperty('--wcc-lock-password-border', border);
  }
  
  // Unlock Button
  if (lockLayer.unlockButton) {
    const { backgroundColor, textColor, fontFamily, fontWeight, fontSize, borderRadius } = lockLayer.unlockButton;
    if (backgroundColor) root.style.setProperty('--wcc-lock-unlock-bg', backgroundColor);
    if (textColor) root.style.setProperty('--wcc-lock-unlock-fg', textColor);
    if (fontFamily) root.style.setProperty('--wcc-lock-unlock-font', fontFamily);
    if (fontWeight) root.style.setProperty('--wcc-lock-unlock-weight', fontWeight);
    if (fontSize) root.style.setProperty('--wcc-lock-unlock-size', fontSize);
    if (borderRadius) root.style.setProperty('--wcc-lock-unlock-radius', borderRadius);
  }
  
  // Title
  if (lockLayer.title) {
    const { textColor, fontFamily, fontSize, fontWeight } = lockLayer.title;
    if (textColor) root.style.setProperty('--wcc-lock-title-fg', textColor);
    if (fontFamily) root.style.setProperty('--wcc-lock-title-font', fontFamily);
    if (fontSize) root.style.setProperty('--wcc-lock-title-size', fontSize);
    if (fontWeight) root.style.setProperty('--wcc-lock-title-weight', fontWeight);
  }
  
  // Forgot Password
  if (lockLayer.forgotPassword) {
    const { textColor, fontFamily, fontSize } = lockLayer.forgotPassword;
    if (textColor) root.style.setProperty('--wcc-lock-forgot-fg', textColor);
    if (fontFamily) root.style.setProperty('--wcc-lock-forgot-font', fontFamily);
    if (fontSize) root.style.setProperty('--wcc-lock-forgot-size', fontSize);
  }
  
  console.log('[Runtime] 🎨 CSS Variables written for lockLayer');
}

// ============================================================================
// Apply theme to DOM (полное применение)
// ============================================================================

export async function applyThemeToDOM(theme: any): Promise<AppliedStyle[]> {
  // ✅ Write CSS Variables first
  writeLockLayerVars(theme);
  const results: AppliedStyle[] = [];
  
  try {
    await jsonBridge.loadElementMappings();
    const mappings = jsonBridge.getAllMappings();
    
    console.log('[Runtime] 🔄 Full apply:', mappings.length, 'mappings');
    
    if (mappings.length === 0) return results;
    
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) {
      console.warn('[Runtime] Wallet container not found');
      return results;
    }
    
    for (const mapping of mappings as any[]) {
      if (!mapping.selector || !mapping.json_path) continue;
      
      try {
        const domElements = walletRoot.querySelectorAll(mapping.selector);
        if (domElements.length === 0) continue;
        
        const value = getByPath(theme, mapping.json_path);
        
        // 🛡️ Protection: Don't overwrite inline styles if theme value is undefined
        if (value === null || value === undefined) {
          continue;
        }
        
        domElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            console.log('[Runtime] 🎨 Applying:', {
              selector: mapping.selector,
              jsonPath: mapping.json_path,
              key: getKeyFromPath(mapping.json_path),
              value: value
            });
            applyValueToNodeUnified(el, mapping.json_path, value, theme);
          }
        });
        
        results.push({
          elementId: mapping.id,
          selector: mapping.selector,
          appliedProperties: [getKeyFromPath(mapping.json_path)],
          success: true
        });
        
      } catch (err) {
        console.error('[Runtime] Error for', mapping.name, err);
      }
    }
    
    console.log('[Runtime] ✅ Full apply complete:', results.filter(r => r.success).length);
    
    // 🔁 Reapply lockLayer to catch late React commits
    const reapplyLockLayer = () => {
      const lockMappings = (mappings as any[]).filter((m: any) => 
        m.json_path?.startsWith('/lockLayer')
      );
      
      for (const m of lockMappings) {
        const nodes = walletRoot?.querySelectorAll(m.selector);
        if (!nodes) continue;
        
        const val = getByPath(theme, m.json_path);
        if (val == null) continue;
        
        nodes.forEach((n) => {
          if (n instanceof HTMLElement) {
            applyValueToNodeUnified(n, m.json_path, val, theme);
          }
        });
      }
      console.log('[Runtime] 🔁 lockLayer re-applied');
    };
    
    // Apply on next frame and after 120ms delay
    requestAnimationFrame(() => reapplyLockLayer());
    setTimeout(() => reapplyLockLayer(), 120);
    
  } catch (error) {
    console.error('[Runtime] Fatal error:', error);
  }
  
  return results;
}

// ============================================================================
// Apply to specific path (точечное обновление)
// ============================================================================

function applyStyleToPath(theme: any, jsonPath: string) {
  try {
    // ✅ Update CSS Variables if lockLayer path
    if (jsonPath.startsWith('/lockLayer')) {
      writeLockLayerVars(theme);
    }
    
    console.log('[Runtime] 🎯 Targeted update:', jsonPath);
    
    const mappings = jsonBridge.getAllMappings();
    console.log('[Runtime] 🔍 Searching mapping for:', { path: jsonPath, totalMappings: mappings.length });
    
    // Ищем mapping: точное совпадение или prefix
    const mapping = mappings.find((m: any) =>
      jsonPath === m.json_path || jsonPath.startsWith(m.json_path + '/')
    );
    
    if (!mapping) {
      console.warn('[Runtime] ⚠️ mapping not found', { jsonPath });
      console.log('[Runtime] Available paths (sample):', 
        mappings.slice(0, 5).map((m: any) => m.json_path));
      return;
    }
    
    console.log('[Runtime] 📍 Found mapping:', {
      mapPath: mapping.json_path,
      selector: mapping.selector,
      name: mapping.name
    });
    
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) {
      console.warn('[Runtime] Wallet container not found');
      return;
    }
    
    const elements = walletRoot.querySelectorAll(mapping.selector);
    const value = getByPath(theme, jsonPath);
    
    console.log('[Runtime] 🎨 Applying to', elements.length, 'nodes:', value);
    
    if (value === null || value === undefined) {
      console.warn('[Runtime] ⚠️ No value at path:', jsonPath);
      return;
    }
    
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        applyValueToNodeUnified(el, jsonPath, value, theme);
      }
    });
    
    console.log('[Runtime] ✅ Applied to nodes:', elements.length, 'selector:', mapping.selector);
  } catch (err) {
    console.error('[Runtime] Error in applyStyleToPath:', err);
  }
}

// ============================================================================
// Watch for theme changes (с защитой от эхо)
// ============================================================================

let lastManualEditAt = 0;

export function setupMappingWatcher(getTheme: () => any) {
  let lastTheme: any = null;
  
  const checkAndApply = () => {
    const currentTheme = getTheme();
    
    // 🛡️ Skip full apply if recent manual edit
    const timeSinceEdit = Date.now() - lastManualEditAt;
    if (timeSinceEdit < 500) {
      console.log('[Runtime] ⏭️ Skipping full apply (recent manual edit, elapsed:', timeSinceEdit, 'ms)');
      return;
    }
    
    if (currentTheme && currentTheme !== lastTheme) {
      lastTheme = currentTheme;
      console.log('[Runtime] 🔄 Theme changed, applying full theme');
      applyThemeToDOM(currentTheme);
    }
  };
  
  const interval = setInterval(checkAndApply, 500);
  
  const handleThemeUpdate = (event: CustomEvent) => {
    const { theme, updatedPath, forceFullApply } = event.detail;
    
    if (!theme) return;
    lastTheme = theme;
    
    // ✅ НОВАЯ ЛОГИКА: forceFullApply = true → полный apply БЕЗ блокировки
    if (forceFullApply) {
      console.log('[Runtime] 🔄 FORCED full apply (Manual mode)');
      applyThemeToDOM(theme);
      return;
    }
    
    if (updatedPath) {
      // 🎯 Точечное обновление (старое поведение)
      lastManualEditAt = Date.now();
      console.log('[Runtime] 🎨 Targeted update:', { updatedPath });
      applyStyleToPath(theme, updatedPath);
    } else {
      // 🔄 Полное обновление (GitHub или другие источники)
      console.log('[Runtime] 🔄 Full theme apply');
      applyThemeToDOM(theme);
    }
  };
  
  window.addEventListener('theme-updated', handleThemeUpdate as EventListener);
  
  console.log('[Runtime] 👀 Mapping watcher initialized');
  checkAndApply();
  
  return () => {
    clearInterval(interval);
    window.removeEventListener('theme-updated', handleThemeUpdate as EventListener);
    console.log('[Runtime] 🛑 Mapping watcher stopped');
  };
}


// ============================================================================
// Global WCC API for debugging and manual theme control
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).wcc = {
    /**
     * Apply new theme and update UI
     * @example window.wcc.applyTheme({ lockLayer: { backgroundColor: '#ff0000' } })
     */
    applyTheme: (newTheme: any) => {
      console.log('[WCC] 📥 Applying theme via window.wcc.applyTheme');
      useThemeStore.getState().setTheme(newTheme);
      applyThemeToDOM(newTheme);
      return { success: true, theme: newTheme };
    },
    
    /**
     * Get current theme from store
     * @example window.wcc.getCurrentTheme()
     */
    getCurrentTheme: () => {
      return useThemeStore.getState().theme;
    },
    
    /**
     * Reapply current theme to DOM (useful for debugging)
     * @example window.wcc.reapplyStyles()
     */
    reapplyStyles: () => {
      console.log('[WCC] 🔄 Reapplying styles via window.wcc.reapplyStyles');
      const theme = useThemeStore.getState().theme;
      applyThemeToDOM(theme);
      return { success: true };
    },
    
    /**
     * Get store state for debugging
     * @example window.wcc.getStoreState()
     */
    getStoreState: () => {
      const state = useThemeStore.getState();
      return {
        hasTheme: !!state.theme,
        themeKeys: Object.keys(state.theme || {}),
        activeThemeId: state.activeThemeId,
        isLoading: state.isLoading,
        error: state.error
      };
    }
  };
  
  console.log('[WCC] ✅ Global API initialized: window.wcc');
  console.log('[WCC] 📖 Available methods:', Object.keys((window as any).wcc));
}
