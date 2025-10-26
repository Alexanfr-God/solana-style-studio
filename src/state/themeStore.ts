
import { create } from 'zustand';
import type { Operation } from 'fast-json-patch';
import { applyJsonPatch } from '@/services/llmPatchService';

// Diagnostic marker for store instance tracking
export const THEME_STORE_INSTANCE_ID = 'themeStore#A42F';

export interface ThemePatch {
  id: string;
  operations: Operation[];
  userPrompt: string;
  pageId: string;
  presetId?: string;
  timestamp: Date;
  theme: any; // Theme state after applying this patch
}

interface ThemeState {
  // Current theme data
  theme: any;
  
  // Preview system
  previewTheme: any | null;
  activeThemeId: string | null;
  
  // History management
  history: ThemePatch[];
  currentIndex: number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Circuit breaker
  _busy: boolean;
  
  // Actions
  setTheme: (theme: any) => void;
  setActiveThemeId: (themeId: string | null) => void;
  updateThemeValue: (jsonPath: string, value: any, userId?: string, options?: { mode?: 'full' | 'targeted' }) => Promise<void>;
  applyPatch: (patch: ThemePatch) => void;
  applyPreviewPatch: (patch: Operation[]) => void;
  commitPreview: () => void;
  clearPreview: () => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  canUndo: () => boolean;
  canRedo: () => boolean;
  getCurrentPatch: () => ThemePatch | null;
  getDisplayTheme: () => any;
  getActiveTheme: () => any; // Compatibility adapter
}

let updateCounter = 0;

export const useThemeStore = create<ThemeState>()((set, get) => ({
  // Initial state
  theme: {},
  previewTheme: null,
  activeThemeId: null,
  history: [],
  currentIndex: -1,
  isLoading: false,
  error: null,
  _busy: false,

  setActiveThemeId: (themeId: string | null) => {
    console.log('[STORE:theme setActive]', themeId, 'instanceId:', THEME_STORE_INSTANCE_ID);
    set({ activeThemeId: themeId });
    console.log('[STORE:theme] 🎯 Active theme ID set to:', themeId);
  },

  setTheme: (theme: any) => {
    const state = get();
    
    if (state._busy) {
      console.warn('[STORE:theme] 🚫 setTheme blocked - already busy');
      return;
    }
    
    updateCounter++;
    const callStack = new Error().stack;
    console.log(`[STORE:theme setTheme] (#${updateCounter}) instanceId:`, THEME_STORE_INSTANCE_ID, 'from:', callStack?.split('\n')[2]);
    console.log('[STORE:theme setTheme]', theme && Object.keys(theme));
    
    try {
      const currentThemeStr = JSON.stringify(state.theme);
      const newThemeStr = JSON.stringify(theme);
      
      if (currentThemeStr === newThemeStr) {
        console.log(`[STORE:theme] 🔄 Theme unchanged (#${updateCounter}), skipping update`);
        return;
      }
    } catch (error) {
      console.warn(`[STORE:theme] Theme comparison failed (#${updateCounter}), proceeding with update`);
    }
    
    set({
      _busy: true,
      theme,
      error: null
    });
    
    setTimeout(() => {
      set({ _busy: false });
    }, 0);
    
    console.log(`[STORE:theme] ✅ Theme set successfully (#${updateCounter})`);
    console.log('[STORE:theme] Theme preview keys:', theme ? Object.keys(theme).slice(0, 5) : []);
    
    // Dispatch event for runtime mapping engine
    window.dispatchEvent(new CustomEvent('theme-updated', { 
      detail: { theme, forceFullApply: true } 
    }));
  },

  updateThemeValue: async (
    jsonPath: string, 
    value: any, 
    userId: string = 'user-theme-manual-edit',
    options?: { mode?: 'full' | 'targeted' }
  ) => {
    const { theme } = get();
    
    const mode = options?.mode || 'targeted';
    console.log('[ThemeStore] 📝 Update:', { path: jsonPath, value, userId, mode });
    
    // 1) Update local theme
    const pathParts = jsonPath.replace(/^\/+/, '').split('/');
    const newTheme = JSON.parse(JSON.stringify(theme));
    let current = newTheme;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!part) continue;
      if (!current[part]) current[part] = {};
      current = current[part];
    }
    
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart) current[lastPart] = value;
    
    set({ theme: newTheme });
    
    // 2) Dispatch event
    if (mode === 'full') {
      // ✅ БЕЗ updatedPath → runtime вызовет applyThemeToDOM (полный apply)
      window.dispatchEvent(new CustomEvent('theme-updated', { 
        detail: { theme: newTheme, forceFullApply: true }
      }));
      console.log('[ThemeStore] 📢 Event: FULL apply');
    } else {
      // 🎯 С updatedPath → runtime вызовет applyStyleToPath (targeted)
      window.dispatchEvent(new CustomEvent('theme-updated', { 
        detail: { theme: newTheme, updatedPath: jsonPath }
      }));
      console.log('[ThemeStore] 📢 Event: TARGETED apply');
    }
    
    // 3) Save to DB async
    const { jsonBridge } = await import('@/services/jsonBridgeService');
    jsonBridge.updateThemeValue(jsonPath, value, userId).catch(err => {
      console.error('[ThemeStore] ❌ DB save failed:', err);
    });
  },

  applyPreviewPatch: (operations: Operation[]) => {
    const state = get();
    
    if (state._busy) {
      console.warn('🚫 applyPreviewPatch blocked - already busy');
      return;
    }
    
    try {
      set({ _busy: true });
      
      const previewTheme = applyJsonPatch(state.theme, operations);
      
      set({
        previewTheme,
        error: null,
        _busy: false
      });
      
      console.log('👁️ Preview patch applied');
    } catch (error) {
      console.error('💥 Error applying preview patch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to apply preview patch',
        _busy: false
      });
    }
  },

  commitPreview: () => {
    const state = get();
    
    if (!state.previewTheme) {
      console.warn('⚠️ No preview to commit');
      return;
    }
    
    if (state._busy) {
      console.warn('🚫 commitPreview blocked - already busy');
      return;
    }
    
    try {
      set({ _busy: true });
      
      set({
        theme: state.previewTheme,
        previewTheme: null,
        error: null,
        _busy: false
      });
      
      console.log('✅ Preview committed to main theme');
    } catch (error) {
      console.error('💥 Error committing preview:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to commit preview',
        _busy: false
      });
    }
  },

  clearPreview: () => {
    set({ previewTheme: null });
    console.log('🗑️ Preview cleared');
  },

  applyPatch: (patch: ThemePatch) => {
    const state = get();
    
    if (state._busy) {
      console.warn('🚫 applyPatch blocked - already busy');
      return;
    }
    
    try {
      set({ _busy: true });
      
      const newTheme = applyJsonPatch(state.theme, patch.operations);
      const patchWithTheme = { ...patch, theme: newTheme };
      const newHistory = state.history.slice(0, state.currentIndex + 1);
      newHistory.push(patchWithTheme);
      
      set({
        theme: newTheme,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        error: null,
        _busy: false
      });
      
      console.log('🎨 Patch applied:', patch.userPrompt);
    } catch (error) {
      console.error('💥 Error applying patch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to apply patch',
        _busy: false
      });
    }
  },

  undo: () => {
    const state = get();
    if (state.currentIndex < 0 || state._busy) return false;
    
    try {
      set({ _busy: true });
      
      const newIndex = state.currentIndex - 1;
      const targetTheme = newIndex >= 0 
        ? state.history[newIndex].theme 
        : {};
      
      set({
        theme: targetTheme,
        currentIndex: newIndex,
        error: null,
        _busy: false
      });
      
      console.log('↶ Undo applied, index:', newIndex);
      return true;
    } catch (error) {
      console.error('💥 Error during undo:', error);
      set({
        error: error instanceof Error ? error.message : 'Undo failed',
        _busy: false
      });
      return false;
    }
  },

  redo: () => {
    const state = get();
    if (state.currentIndex >= state.history.length - 1 || state._busy) return false;
    
    try {
      set({ _busy: true });
      
      const newIndex = state.currentIndex + 1;
      const targetTheme = state.history[newIndex].theme;
      
      set({
        theme: targetTheme,
        currentIndex: newIndex,
        error: null,
        _busy: false
      });
      
      console.log('↷ Redo applied, index:', newIndex);
      return true;
    } catch (error) {
      console.error('💥 Error during redo:', error);
      set({
        error: error instanceof Error ? error.message : 'Redo failed',
        _busy: false
      });
      return false;
    }
  },

  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
      error: null
    });
    console.log('🗑️ Theme history cleared');
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  canUndo: () => {
    const state = get();
    return state.currentIndex >= 0;
  },

  canRedo: () => {
    const state = get();
    return state.currentIndex < state.history.length - 1;
  },

  getCurrentPatch: () => {
    const state = get();
    return state.currentIndex >= 0 ? state.history[state.currentIndex] : null;
  },

  getDisplayTheme: () => {
    const state = get();
    return state.previewTheme || state.theme;
  },

  /**
   * @deprecated Use getDisplayTheme() instead. This method will be removed in v2.0
   * Legacy compatibility adapter for old getActiveTheme() calls
   */
  getActiveTheme: () => {
    const state = get();
    if (import.meta.env.DEV) {
      console.warn('⚠️ DEPRECATED: getActiveTheme() is deprecated, use getDisplayTheme() instead');
    }
    return state.previewTheme || state.theme;
  }
}));

// Unified theme selectors with compatibility
export const useWalletTheme = () => useThemeStore(state => state.getDisplayTheme());
export const useThemeHistory = () => useThemeStore(state => ({
  history: state.history,
  currentIndex: state.currentIndex,
  canUndo: state.canUndo(),
  canRedo: state.canRedo()
}));
export const useThemeActions = () => useThemeStore(state => ({
  applyPatch: state.applyPatch,
  applyPreviewPatch: state.applyPreviewPatch,
  commitPreview: state.commitPreview,
  clearPreview: state.clearPreview,
  undo: state.undo,
  redo: state.redo,
  setTheme: state.setTheme,
  setActiveThemeId: state.setActiveThemeId,
  clearHistory: state.clearHistory
}));

// Unified theme state selectors
export const useThemeState = () => useThemeStore(state => ({
  activeThemeId: state.activeThemeId,
  hasPreview: !!state.previewTheme,
  isLoading: state.isLoading,
  error: state.error
}));
