
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
  
  // History management
  history: ThemePatch[];
  currentIndex: number;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTheme: (theme: any) => void;
  applyPatch: (patch: ThemePatch) => void;
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  canUndo: () => boolean;
  canRedo: () => boolean;
  getCurrentPatch: () => ThemePatch | null;
}

export const useThemeStore = create<ThemeState>()((set, get) => ({
  // Initial state
  theme: {},
  history: [],
  currentIndex: -1,
  isLoading: false,
  error: null,

  // Set base theme (without adding to history) - SINGLE ATOMIC UPDATE
  setTheme: (theme: any) => {
    const state = get();
    
    // Simple comparison to prevent redundant updates
    try {
      const currentThemeStr = JSON.stringify(state.theme);
      const newThemeStr = JSON.stringify(theme);
      
      if (currentThemeStr === newThemeStr) {
        console.log('🔄 Theme unchanged, skipping update');
        return;
      }
    } catch (error) {
      // If comparison fails, proceed with update
      console.warn('Theme comparison failed, proceeding with update');
    }
    
    // Single atomic update - no intermediate states
    set({
      theme,
      error: null
    });
    
    console.log('🎨 Theme set successfully');
  },

  // Apply patch and add to history - SINGLE ATOMIC UPDATE
  applyPatch: (patch: ThemePatch) => {
    const state = get();
    
    try {
      // Apply patch to current theme
      const newTheme = applyJsonPatch(state.theme, patch.operations);
      
      // Update patch with the resulting theme
      const patchWithTheme = { ...patch, theme: newTheme };
      
      // Remove any future history if we're not at the end
      const newHistory = state.history.slice(0, state.currentIndex + 1);
      newHistory.push(patchWithTheme);
      
      // Single atomic state update - everything at once
      set({
        theme: newTheme,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        error: null
      });
      
      console.log('🎨 Patch applied:', patch.userPrompt);
    } catch (error) {
      console.error('💥 Error applying patch:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to apply patch'
      });
    }
  },

  // Undo last patch - SINGLE ATOMIC UPDATE
  undo: () => {
    const state = get();
    if (state.currentIndex < 0) return false;
    
    try {
      const newIndex = state.currentIndex - 1;
      const targetTheme = newIndex >= 0 
        ? state.history[newIndex].theme 
        : {}; // Base theme if we go before first patch
      
      // Single atomic update
      set({
        theme: targetTheme,
        currentIndex: newIndex,
        error: null
      });
      
      console.log('↶ Undo applied, index:', newIndex);
      return true;
    } catch (error) {
      console.error('💥 Error during undo:', error);
      set({
        error: error instanceof Error ? error.message : 'Undo failed'
      });
      return false;
    }
  },

  // Redo next patch - SINGLE ATOMIC UPDATE
  redo: () => {
    const state = get();
    if (state.currentIndex >= state.history.length - 1) return false;
    
    try {
      const newIndex = state.currentIndex + 1;
      const targetTheme = state.history[newIndex].theme;
      
      // Single atomic update
      set({
        theme: targetTheme,
        currentIndex: newIndex,
        error: null
      });
      
      console.log('↷ Redo applied, index:', newIndex);
      return true;
    } catch (error) {
      console.error('💥 Error during redo:', error);
      set({
        error: error instanceof Error ? error.message : 'Redo failed'
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
  }
}));

// Selector hooks for performance - pure selectors only
export const useTheme = () => useThemeStore(state => state.theme);
export const useThemeHistory = () => useThemeStore(state => ({
  history: state.history,
  currentIndex: state.currentIndex,
  canUndo: state.canUndo(),
  canRedo: state.canRedo()
}));
export const useThemeActions = () => useThemeStore(state => ({
  applyPatch: state.applyPatch,
  undo: state.undo,
  redo: state.redo,
  setTheme: state.setTheme,
  clearHistory: state.clearHistory
}));
