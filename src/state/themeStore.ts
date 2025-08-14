
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
  
  // Reentrancy protection with enhanced diagnostics
  _busy: boolean;
  _updateCount: number;
  _lastUpdateTime: number;
  
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

// Circuit breaker constants
const MAX_UPDATES_PER_SECOND = 5;
const UPDATE_WINDOW_MS = 1000;

// Enhanced circuit breaker with diagnostics
const withEnhancedCircuitBreaker = (operation: string, fn: () => void, set: any, get: any) => {
  const state = get();
  const now = Date.now();
  
  // Reset counter if enough time has passed
  if (now - state._lastUpdateTime > UPDATE_WINDOW_MS) {
    set({ _updateCount: 0, _lastUpdateTime: now });
  }
  
  // Check if we're exceeding the limit
  if (state._updateCount >= MAX_UPDATES_PER_SECOND) {
    console.error(`🚨 CIRCUIT BREAKER: ${operation} blocked - too many updates (${state._updateCount}/${MAX_UPDATES_PER_SECOND})`);
    console.trace('Circuit breaker activation stack trace');
    return false;
  }
  
  console.log(`🔄 ThemeStore.${operation} - update ${state._updateCount + 1}/${MAX_UPDATES_PER_SECOND}`);
  
  // Execute with incremented counter
  try {
    fn();
    set((prevState: ThemeState) => ({ 
      ...prevState,
      _updateCount: prevState._updateCount + 1,
      _lastUpdateTime: now
    }));
    return true;
  } catch (error) {
    console.error(`💥 Error in ${operation}:`, error);
    set({ error: error instanceof Error ? error.message : 'Unknown error' });
    return false;
  }
};

export const useThemeStore = create<ThemeState>()((set, get) => ({
  // Initial state
  theme: {},
  history: [],
  currentIndex: -1,
  isLoading: false,
  error: null,
  _busy: false,
  _updateCount: 0,
  _lastUpdateTime: 0,

  // Set base theme (without adding to history) - with enhanced protection
  setTheme: (theme: any) => {
    const state = get();
    if (state._busy) {
      console.warn('🚫 setTheme blocked - store is busy');
      return;
    }

    withEnhancedCircuitBreaker('setTheme', () => {
      // Single atomic update
      set((prevState) => ({
        ...prevState,
        _busy: true,
        theme,
        error: null,
        _busy: false
      }));
      
      console.log('🎨 Theme set successfully');
    }, set, get);
  },

  // Apply patch and add to history - with enhanced protection
  applyPatch: (patch: ThemePatch) => {
    const state = get();
    if (state._busy) {
      console.warn('🚫 applyPatch blocked - store is busy');
      return;
    }
    
    const success = withEnhancedCircuitBreaker('applyPatch', () => {
      // Apply patch to current theme
      const newTheme = applyJsonPatch(state.theme, patch.operations);
      
      // Update patch with the resulting theme
      const patchWithTheme = { ...patch, theme: newTheme };
      
      // Remove any future history if we're not at the end
      const newHistory = state.history.slice(0, state.currentIndex + 1);
      newHistory.push(patchWithTheme);
      
      // Single atomic state update
      set((prevState) => ({
        ...prevState,
        _busy: true,
        theme: newTheme,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        error: null,
        _busy: false
      }));
      
      console.log('🎨 Patch applied:', patch.userPrompt);
    }, set, get);
    
    if (!success) {
      console.error('❌ Patch application failed due to circuit breaker');
    }
  },

  // Undo last patch - with enhanced protection
  undo: () => {
    const state = get();
    if (state._busy) return false;
    if (state.currentIndex < 0) return false;
    
    return withEnhancedCircuitBreaker('undo', () => {
      const newIndex = state.currentIndex - 1;
      const targetTheme = newIndex >= 0 
        ? state.history[newIndex].theme 
        : {}; // Base theme if we go before first patch
      
      set((prevState) => ({
        ...prevState,
        theme: targetTheme,
        currentIndex: newIndex,
        error: null
      }));
      
      console.log('↶ Undo applied, index:', newIndex);
    }, set, get) || false;
  },

  // Redo next patch - with enhanced protection
  redo: () => {
    const state = get();
    if (state._busy) return false;
    if (state.currentIndex >= state.history.length - 1) return false;
    
    return withEnhancedCircuitBreaker('redo', () => {
      const newIndex = state.currentIndex + 1;
      const targetTheme = state.history[newIndex].theme;
      
      set((prevState) => ({
        ...prevState,
        theme: targetTheme,
        currentIndex: newIndex,
        error: null
      }));
      
      console.log('↷ Redo applied, index:', newIndex);
    }, set, get) || false;
  },

  // Clear all history
  clearHistory: () => {
    withEnhancedCircuitBreaker('clearHistory', () => {
      set((prevState) => ({
        ...prevState,
        history: [],
        currentIndex: -1,
        error: null
      }));
      console.log('🗑️ Theme history cleared');
    }, set, get);
  },

  // Set loading state
  setLoading: (loading: boolean) => {
    set((prevState) => ({ ...prevState, isLoading: loading }));
  },

  // Set error state  
  setError: (error: string | null) => {
    set((prevState) => ({ ...prevState, error }));
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
