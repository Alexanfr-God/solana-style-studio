/**
 * ZustandThemeAdapter - Zustand store implementation of ThemeAdapter
 * Works with existing themeStore
 */

import { ThemeAdapter } from './ThemeAdapter';
import { useThemeStore } from '@/state/themeStore';

export class ZustandThemeAdapter implements ThemeAdapter {
  getTheme(): any {
    return useThemeStore.getState().theme;
  }

  setScalar(path: string, nextValue: any): void {
    const theme = this.getTheme();
    const updated = this.setByPath(theme, path, nextValue);
    useThemeStore.setState({ theme: updated });
  }

  restoreScalar(path: string, prevValue: any): void {
    this.setScalar(path, prevValue);
  }

  forceRerender(): void {
    // Trigger theme-updated event for runtimeMappingEngine
    window.dispatchEvent(new CustomEvent('theme-updated', {
      detail: { source: 'ThemeProbe' }
    }));
    
    // Also trigger store notification
    useThemeStore.setState({ theme: { ...this.getTheme() } });
  }

  private setByPath(obj: any, path: string, value: any): any {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const keys = cleanPath.split('/').filter(Boolean);
    
    const result = JSON.parse(JSON.stringify(obj)); // deep clone
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  }
}
