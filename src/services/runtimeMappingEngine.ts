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
      if (isLockLayer) console.log('[RME:WRITE]', { jsonPath, cssProp: 'background', value });
    } else {
      el.style.setProperty('background-color', String(value), important);
      el.style.removeProperty('background');
      console.log('[Runtime] ✅ Applied backgroundColor', isLockLayer ? '(!important)' : '');
      if (isLockLayer) console.log('[RME:WRITE]', { jsonPath, cssProp: 'background-color', value });
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
    if (isLockLayer) console.log('[RME:WRITE]', { jsonPath, cssProp: 'color', value });
    
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

// 🗑️ Removed: writeLockLayerVars (CSS Variables) - now using only inline !important styles

// ============================================================================
// Apply theme to DOM (полное применение)
// ============================================================================

export async function applyThemeToDOM(theme: any): Promise<AppliedStyle[]> {
  const results: AppliedStyle[] = [];
  
  try {
    // 1) Load all mappings once
    await jsonBridge.loadElementMappings();
    const mappings = jsonBridge.getAllMappings() || [];
    const lockLayerMappings = mappings.filter((m: any) => m.json_path?.startsWith('/lockLayer/'));
    console.log('[RME:START]', { 
      totalMappings: mappings.length,
      lockLayerPaths: lockLayerMappings.length 
    });
    
    if (mappings.length === 0) {
      console.log('[RME:DONE]');
      return results;
    }
    
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) {
      console.warn('[RME] ⚠️ Wallet container not found');
      console.log('[RME:DONE]');
      return results;
    }
    
    // 2) Apply all valid mappings
    for (const m of mappings as any[]) {
      if (!m?.selector || !m?.json_path) continue;
      
      // 🔍 TRACE для lockLayer (диагностика)
      const isLockPath = m.json_path.startsWith('/lockLayer/');
      
      try {
        const els = walletRoot.querySelectorAll(m.selector);
        const value = getByPath(theme, m.json_path);
        
        // Trace lockLayer paths before checking value
        if (isLockPath) {
          console.log('[RME:TRACE]', {
            path: m.json_path,
            selector: m.selector,
            value,
            domCount: els.length
          });
        }
        
        // Skip if value is undefined
        if (value === null || value === undefined) {
          console.log('[RME:SKIP]', { 
            path: m.json_path, 
            selector: m.selector, 
            reason: 'undefined_value', 
            found: els.length 
          });
          continue;
        }
        
        els.forEach((el: Element) => {
          if (el instanceof HTMLElement) {
            applyValueToNodeUnified(el, m.json_path, value, theme);
          }
        });
        
        console.log('[RME:APPLY]', { 
          path: m.json_path, 
          selector: m.selector, 
          value, 
          count: els.length 
        });
        
        results.push({
          elementId: m.id,
          selector: m.selector,
          appliedProperties: [getKeyFromPath(m.json_path)],
          success: true
        });
        
      } catch (err) {
        console.error('[RME] ❌ Error for', m.name, err);
      }
    }
    
    const lockLayerApplied = results.filter(r => r.elementId.startsWith('lock-')).length;
    console.log('[RME:DONE]', { 
      totalApplied: results.length, 
      lockLayerApplied 
    });
    
  } catch (error) {
    console.error('[RME:ERROR]', error);
  }
  
  return results;
}

// ============================================================================
// Apply to specific path (точечное обновление)
// ============================================================================

function applyStyleToPath(theme: any, jsonPath: string) {
  try {
    // 🗑️ Removed: writeLockLayerVars call
    
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
// Event-driven theme update handler (для Manual Editor)
// ============================================================================

let lastManualEditAt = 0;

/**
 * Handle targeted updates from Manual Editor
 * @internal Used by theme-updated event for targeted style updates
 */
function handleThemeUpdateEvent(event: CustomEvent) {
  const { theme, updatedPath, forceFullApply } = event.detail;
  
  if (!theme) return;
  
  // ✅ forceFullApply = true → full apply (Manual mode)
  if (forceFullApply) {
    console.log('[RME] 🔄 FORCED full apply (Manual mode)');
    applyThemeToDOM(theme);
    return;
  }
  
  // 🎯 Targeted update for specific path
  if (updatedPath) {
    lastManualEditAt = Date.now();
    console.log('[RME] 🎯 Targeted update:', { updatedPath });
    applyStyleToPath(theme, updatedPath);
    return;
  }
  
  // 🔄 Full apply (fallback)
  console.log('[RME] 🔄 Full theme apply');
  applyThemeToDOM(theme);
}

// Register event listener once
if (typeof window !== 'undefined') {
  window.addEventListener('theme-updated', handleThemeUpdateEvent as EventListener);
  console.log('[RME] ✅ Event listener registered');
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
