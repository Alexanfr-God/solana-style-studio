/**
 * Runtime Mapping Engine
 * Applies styles from JSON theme to DOM elements based on json_path mappings
 */

import { getAllMappedElements, type ElementMapping } from './elementToPathMapper';
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
 * Apply style object to DOM element
 */
function applyStylesToElement(element: HTMLElement, styleObj: any): string[] {
  const appliedProps: string[] = [];
  
  if (!styleObj || typeof styleObj !== 'object') return appliedProps;
  
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
    // Get all mapped elements from database
    const mappedElements = await getAllMappedElements();
    
    if (mappedElements.length === 0) {
      console.log('[RuntimeMapping] No mapped elements found');
      return results;
    }
    
    // Get wallet root container
    const walletRoot = document.querySelector(WALLET_ROOT_SELECTOR);
    if (!walletRoot) {
      console.warn('[RuntimeMapping] Wallet container not found:', WALLET_ROOT_SELECTOR);
      return results;
    }
    
    console.log(`[RuntimeMapping] Processing ${mappedElements.length} mapped elements`);
    
    // Apply each mapping
    for (const element of mappedElements) {
      if (!element.selector || !element.jsonPath) continue;
      
      try {
        // Find DOM elements within wallet container
        const domElements = walletRoot.querySelectorAll(element.selector);
        
        if (domElements.length === 0) {
          console.debug(`[RuntimeMapping] No DOM elements found for selector: ${element.selector}`);
          continue;
        }
        
        // Get style from theme by json_path
        const styleValue = getThemeValueByPath(theme, element.jsonPath);
        
        if (!styleValue) {
          console.debug(`[RuntimeMapping] No theme value found for path: ${element.jsonPath}`);
          continue;
        }
        
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
            
            console.log(`[RuntimeMapping] ✅ Applied ${appliedProps.length} properties to ${element.name}`);
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
  
  // Listen for JSON Bridge updates
  const handleThemeUpdate = (event: CustomEvent) => {
    console.log('🔗 Runtime Engine: Theme updated via JSON Bridge');
    const theme = event.detail.theme;
    if (theme) {
      lastTheme = theme;
      applyThemeToDOM(theme);
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
