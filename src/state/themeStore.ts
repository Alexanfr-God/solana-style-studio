
import { create } from 'zustand';
import type { Operation } from 'fast-json-patch';
import { applyJsonPatch } from '@/services/llmPatchService';

interface ThemePatch {
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

  // Set active theme id
  setActiveThemeId: (themeId: string | null) => {
    set({ activeThemeId: themeId });
    console.log('🎯 Active theme ID set to:', themeId);
  },

  // Set base theme with circuit breaker protection
  setTheme: (theme: any) => {
    const state = get();
    
    // Circuit breaker - prevent re-entry
    if (state._busy) {
      console.warn('🚫 setTheme blocked - already busy');
      return;
    }
    
    updateCounter++;
    const callStack = new Error().stack;
    console.log(`🎨 setTheme called (#${updateCounter}) from:`, callStack?.split('\n')[2]);
    
    // Enhanced comparison to prevent redundant updates
    try {
      const currentThemeStr = JSON.stringify(state.theme);
      const newThemeStr = JSON.stringify(theme);
      
      if (currentThemeStr === newThemeStr) {
        console.log(`🔄 Theme unchanged (#${updateCounter}), skipping update`);
        return;
      }
    } catch (error) {
      console.warn(`Theme comparison failed (#${updateCounter}), proceeding with update`);
    }
    
    // Single atomic update with busy flag
    set({
      _busy: true,
      theme,
      error: null
    });
    
    // Release busy flag after update
    setTimeout(() => {
      set({ _busy: false });
    }, 0);
    
    console.log(`✅ Theme set successfully (#${updateCounter})`);
  },

  // Apply preview patch (temporary preview)
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

  // Commit preview to main theme
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

  // Clear preview
  clearPreview: () => {
    set({ previewTheme: null });
    console.log('🗑️ Preview cleared');
  },

  // Apply patch and add to history
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

  // Undo last patch
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

  // Redo next patch
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

  // Clear all history
  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
      error: null
    });
    console.log('🗑️ Theme history cleared');
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Set error state  
  setError: (error: string | null) => {
    set({ error });
  },

  // Pure getters - no side effects
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

  // Get display theme (preview or main)
  getDisplayTheme: () => {
    const state = get();
    return state.previewTheme || state.theme;
  },

  // Compatibility adapter for old getActiveTheme calls
  getActiveTheme: () => {
    const state = get();
    return state.previewTheme || state.theme;
  }
}));

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
