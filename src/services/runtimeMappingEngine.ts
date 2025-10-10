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

/**
 * Apply a single value to an element based on jsonPath suffix
 * This handles gradients, colors, text colors, and placeholders intelligently
 */
function applyValueToElement(element: HTMLElement, value: string, jsonPath: string): string[] {
  const appliedProps: string[] = [];
  
  // Определяем CSS свойство по последней части пути
  const pathParts = jsonPath.split('/');
  const propertyName = pathParts[pathParts.length - 1];
  
  console.log('[RuntimeMapping] 🎯 Applying value to element:', { propertyName, value });
  
  // Определяем является ли значение градиентом
  const isGradient = value.includes('gradient(');
  
  // Применяем соответствующее CSS свойство
  if (propertyName === 'backgroundColor') {
    if (isGradient) {
      element.style.background = value;
      appliedProps.push('background');
      console.log('[RuntimeMapping] ✅ Applied gradient to background');
    } else {
      element.style.backgroundColor = value;
      appliedProps.push('background-color');
      console.log('[RuntimeMapping] ✅ Applied solid color to backgroundColor');
    }
  } else if (propertyName === 'textColor' || propertyName === 'color') {
    element.style.color = value;
    appliedProps.push('color');
    console.log('[RuntimeMapping] ✅ Applied text color');
  } else if (propertyName === 'placeholderColor') {
    element.style.setProperty('--placeholder-color', value);
    appliedProps.push('--placeholder-color');
    console.log('[RuntimeMapping] ✅ Applied placeholder color');
  } else if (propertyName === 'borderColor') {
    element.style.borderColor = value;
    appliedProps.push('border-color');
  } else {
    // Fallback для других свойств
    const cssProperty = propertyName.replace(/([A-Z])/g, '-$1').toLowerCase();
    element.style.setProperty(cssProperty, value);
    appliedProps.push(cssProperty);
    console.log('[RuntimeMapping] ✅ Applied generic property:', cssProperty);
  }
  
  return appliedProps;
}

/**
 * Apply style object to DOM element
 */
function applyStylesToElement(element: HTMLElement, styleObj: any): string[] {
  const appliedProps: string[] = [];
  
  if (!styleObj || typeof styleObj !== 'object') return appliedProps;
  
  // 🛡️ ЗАЩИТА: если есть backgroundImage, не трогаем backgroundColor
  if (styleObj.backgroundColor && styleObj.backgroundImage) {
    console.log('[RuntimeMapping] 🛡️ Skipping backgroundColor (backgroundImage present)');
    const { backgroundColor, ...rest } = styleObj;
    styleObj = rest;
  }
  
  // Map of theme properties to CSS properties
  const propertyMap: Record<string, string> = {
    backgroundColor: 'background-color',
    textColor: 'color',
    fontSize: 'font-size',
    fontFamily: 'font-family',
    fontWeight: 'font-weight',
    borderRadius: 'border-radius',
    border: 'border',
    boxShadow: 'box-shadow',
    padding: 'padding',
    margin: 'margin',
    opacity: 'opacity',
    backgroundImage: 'background-image',
    backdropFilter: 'backdrop-filter',
  };
  
  Object.entries(styleObj).forEach(([key, value]) => {
    if (key === 'states' || key === 'animation') return; // Skip nested objects for now
    
    const cssProperty = propertyMap[key] || key;
    if (value !== undefined && value !== null) {
      element.style.setProperty(cssProperty, String(value));
      appliedProps.push(cssProperty);
    }
  });
  
  return appliedProps;
}

/**
 * Apply theme to DOM elements (main public API)
 */
export async function applyThemeToDOM(theme: any): Promise<AppliedStyle[]> {
  const results: AppliedStyle[] = [];
  
  try {
    // Используем jsonBridge для единого источника данных
    await jsonBridge.loadElementMappings();
    const mappings = jsonBridge.getAllMappings();
    
    console.log('[RuntimeMapping] 🎨 Applying theme to DOM');
    console.log('[RuntimeMapping] 📋 Found mappings from jsonBridge:', mappings.length);
    
    if (mappings.length === 0) {
      console.log('[RuntimeMapping] No mapped elements found');
      return results;
    }
    
    // Get wallet root container
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) {
      console.warn('[RuntimeMapping] Wallet container not found:', WALLET_ROOT_SELECTOR);
      return results;
    }
    
    console.log(`[RuntimeMapping] Processing ${mappings.length} mapped elements`);
    
    // Apply each mapping
    for (const element of mappings as any[]) {
      if (!element.selector || !element.json_path) {
        console.log('[RuntimeMapping] ⚠️ Skipping element without selector/json_path:', element.id);
        continue;
      }
      
      try {
        // Find DOM elements within wallet container
        const domElements = walletRoot.querySelectorAll(element.selector);
        
        console.log(`[RuntimeMapping] 🔍 Selector: ${element.selector} → ${domElements.length} elements`);
        
        if (domElements.length === 0) {
          console.warn(`[RuntimeMapping] ⚠️ No DOM elements found for selector: ${element.selector}`);
          continue;
        }
        
        // Get style from theme by json_path
        const styleValue = getThemeValueByPath(theme, element.json_path);
        
        if (!styleValue) {
          console.warn(`[RuntimeMapping] ⚠️ No theme value found for path: ${element.json_path}`);
          continue;
        }
        
        console.log(`[RuntimeMapping] 🎨 Applying style from ${element.json_path}:`, styleValue);
        
        // Apply to all matching elements
        domElements.forEach((domEl) => {
          if (!(domEl instanceof HTMLElement)) return;
          
          const appliedProps = applyStylesToElement(domEl, styleValue);
          
          if (appliedProps.length > 0) {
            results.push({
              elementId: element.id,
              selector: element.selector,
              appliedProperties: appliedProps,
              success: true
            });
            
            console.log(`[RuntimeMapping] ✅ Applied ${appliedProps.length} properties to ${element.name}: ${appliedProps.join(', ')}`);
          }
        });
        
      } catch (err) {
        console.error(`[RuntimeMapping] Error applying mapping for ${element.name}:`, err);
        results.push({
          elementId: element.id,
          selector: element.selector,
          appliedProperties: [],
          success: false
        });
      }
    }
    
    console.log(`[RuntimeMapping] ✅ Applied mappings to ${results.filter(r => r.success).length} elements`);
    
  } catch (error) {
    console.error('[RuntimeMapping] Fatal error:', error);
  }
  
  return results;
}

/**
 * Apply styles to a specific path (точечное обновление)
 */
function applyStyleToPath(theme: any, jsonPath: string) {
  try {
    console.log('[RuntimeMapping] 🎯 Applying style to path:', jsonPath);
    
    // Find mapping with EXACT match of json_path
    const mappings = jsonBridge.getAllMappings();
    const mapping = mappings.find((m: any) => m.json_path === jsonPath);
    
    if (!mapping) {
      console.warn('[RuntimeMapping] ⚠️ No exact mapping found for path:', jsonPath);
      return;
    }
    
    // Apply styles only to this selector
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) {
      console.warn('[RuntimeMapping] Wallet container not found');
      return;
    }
    
    const elements = walletRoot.querySelectorAll(mapping.selector);
    
    // Get value using the EXACT jsonPath
    const value = getThemeValueByPath(theme, jsonPath);
    
    console.log(`[RuntimeMapping] 🎨 Found ${elements.length} elements for selector:`, mapping.selector);
    console.log('[RuntimeMapping] 🎨 Value from theme:', value);
    
    if (value === null || value === undefined) {
      console.warn('[RuntimeMapping] ⚠️ No value found at path:', jsonPath);
      return;
    }
    
    // Apply value to each element using smart value application
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        const applied = typeof value === 'string' 
          ? applyValueToElement(el, value, jsonPath)
          : applyStylesToElement(el, value);
        console.log('[RuntimeMapping] ✅ Applied properties:', applied);
      }
    });
  } catch (err) {
    console.error('[RuntimeMapping] Error in applyStyleToPath:', err);
  }
}

/**
 * Watch for theme changes and reapply mappings
 */
export function setupMappingWatcher(getTheme: () => any) {
  let lastTheme: any = null;
  
  const checkAndApply = () => {
    const currentTheme = getTheme();
    if (currentTheme && currentTheme !== lastTheme) {
      lastTheme = currentTheme;
      applyThemeToDOM(currentTheme);
    }
  };
  
  // Check every 500ms for theme changes
  const interval = setInterval(checkAndApply, 500);
  
  // Listen for theme updates
  const handleThemeUpdate = (event: CustomEvent) => {
    console.log('[RuntimeEngine] 📢 Event received:', {
      updatedPath: event.detail.updatedPath,
      themeKeys: event.detail.theme ? Object.keys(event.detail.theme).slice(0, 5) : []
    });
    
    const { theme, updatedPath } = event.detail;
    
    if (theme) {
      lastTheme = theme;
      
      // 🎯 Точечное обновление если есть updatedPath
      if (updatedPath) {
        console.log('[RuntimeEngine] 🎯 Applying targeted update');
        applyStyleToPath(theme, updatedPath);
      } else {
        // Полное обновление (при загрузке темы)
        console.log('[RuntimeEngine] 🔄 Applying full theme');
        applyThemeToDOM(theme);
      }
    }
  };
  
  window.addEventListener('theme-updated', handleThemeUpdate as EventListener);
  
  // Initial apply
  checkAndApply();
  
  return () => {
    clearInterval(interval);
    window.removeEventListener('theme-updated', handleThemeUpdate as EventListener);
  };
}

/**
 * Apply single mapping rule manually (for Manual Editor)
 */
export function applyManualMapping(
  selector: string,
  jsonPath: string,
  theme: any
): boolean {
  try {
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) return false;
    
    const elements = walletRoot.querySelectorAll(selector);
    if (elements.length === 0) return false;
    
    const styleValue = getThemeValueByPath(theme, jsonPath);
    if (!styleValue) return false;
    
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        applyStylesToElement(el, styleValue);
      }
    });
    
    return true;
  } catch (err) {
    console.error('[RuntimeMapping] Manual apply error:', err);
    return false;
  }
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
