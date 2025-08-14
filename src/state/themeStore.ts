
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
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

export const useThemeStore = create<ThemeState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    theme: {},
    history: [],
    currentIndex: -1,
    isLoading: false,
    error: null,

    // Set base theme (without adding to history)
    setTheme: (theme: any) => {
      set({ theme, error: null });
    },

    // Apply patch and add to history
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
        
        set({
          theme: newTheme,
          history: newHistory,
          currentIndex: newHistory.length - 1,
          error: null
        });
        
        console.log('🎨 Patch applied:', patch.userPrompt);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to apply patch';
        set({ error: errorMessage });
        console.error('❌ Patch application failed:', error);
      }
    },

    // Undo last patch
    undo: () => {
      const state = get();
      
      if (!state.canUndo()) {
        return false;
      }
      
      const newIndex = state.currentIndex - 1;
      const targetTheme = newIndex >= 0 
        ? state.history[newIndex].theme 
        : {}; // Base theme if we go before first patch
      
      set({
        theme: targetTheme,
        currentIndex: newIndex,
        error: null
      });
      
      console.log('↶ Undo applied, index:', newIndex);
      return true;
    },

    // Redo next patch
    redo: () => {
      const state = get();
      
      if (!state.canRedo()) {
        return false;
      }
      
      const newIndex = state.currentIndex + 1;
      const targetTheme = state.history[newIndex].theme;
      
      set({
        theme: targetTheme,
        currentIndex: newIndex,
        error: null
      });
      
      console.log('↷ Redo applied, index:', newIndex);
      return true;
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

    // Check if undo is possible
    canUndo: () => {
      const state = get();
      return state.currentIndex >= 0;
    },

    // Check if redo is possible
    canRedo: () => {
      const state = get();
      return state.currentIndex < state.history.length - 1;
    },

    // Get current patch info
    getCurrentPatch: () => {
      const state = get();
      return state.currentIndex >= 0 ? state.history[state.currentIndex] : null;
    }
  }))
);

// Selector hooks for performance
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
