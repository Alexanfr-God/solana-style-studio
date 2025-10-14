/**
 * ZustandThemeAdapter - Zustand store implementation of ThemeAdapter
 * Works with existing themeStore
 */

import { ThemeAdapter } from './ThemeAdapter';
import { useThemeStore } from '@/state/themeStore';

export class ZustandThemeAdapter implements ThemeAdapter {
  getTheme(): any {
    // Return live reference, not a copy
    return useThemeStore.getState().theme;
  }

  setScalar(path: string, nextValue: any): void {
    const theme = this.getTheme();
    
    // Mutate in-place for immediate effect
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const keys = cleanPath.split('/').filter(Boolean);
    
    let current = theme;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = nextValue;
    
    // Trigger update
    this.forceRerender();
  }

  restoreScalar(path: string, prevValue: any): void {
    this.setScalar(path, prevValue);
  }

  forceRerender(): void {
    // Get current theme reference
    const theme = useThemeStore.getState().theme;
    
    // Force new reference for Zustand to detect change
    useThemeStore.setState({ theme: { ...theme } });
    
    // Trigger theme-updated event for runtimeMappingEngine
    window.dispatchEvent(new CustomEvent('theme-updated', {
      detail: { source: 'ThemeProbe' }
    }));
  }
}
