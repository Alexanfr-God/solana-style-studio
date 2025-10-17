import { create } from 'zustand';

export type ProbeStatus = 'OK' | 'AMBIGUOUS' | 'UNMAPPED' | 'NON_SCALAR';

export interface ProbeResultItem {
  id: string;
  bestPath?: string;
  status: ProbeStatus;
  confidence?: number;
  changedProps?: string[];
}

export interface ProbeResult {
  screen: string;
  items: ProbeResultItem[];
  coverage?: number;
  totalElements?: number;
}

interface ThemeProbeStore {
  result: ProbeResult | null;
  overlayEnabled: boolean;
  activeFilters: Set<ProbeStatus>;
  setProbeResult: (result: ProbeResult) => void;
  clearResults: () => void;
  toggleOverlay: () => void;
  setOverlayEnabled: (enabled: boolean) => void;
  toggleFilter: (status: ProbeStatus) => void;
  setFilters: (filters: Set<ProbeStatus>) => void;
}

export const useThemeProbeStore = create<ThemeProbeStore>((set) => ({
  result: null,
  overlayEnabled: false,
  activeFilters: new Set<ProbeStatus>(['OK', 'AMBIGUOUS', 'UNMAPPED', 'NON_SCALAR']),
  
  setProbeResult: (result) => {
    // Calculate coverage
    const okCount = result.items.filter(i => i.status === 'OK').length;
    const totalMapped = result.items.filter(i => 
      i.status === 'OK' || i.status === 'AMBIGUOUS' || i.status === 'UNMAPPED'
    ).length;
    const coverage = totalMapped > 0 ? Math.round((okCount / totalMapped) * 100) : 0;
    
    set({ 
      result: { 
        ...result, 
        coverage,
        totalElements: result.items.length 
      } 
    });
  },
  
  clearResults: () => set({ result: null }),
  
  toggleOverlay: () => set((state) => ({ overlayEnabled: !state.overlayEnabled })),
  
  setOverlayEnabled: (enabled) => set({ overlayEnabled: enabled }),
  
  toggleFilter: (status) => set((state) => {
    const newFilters = new Set(state.activeFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    return { activeFilters: newFilters };
  }),
  
  setFilters: (filters) => set({ activeFilters: filters }),
}));
