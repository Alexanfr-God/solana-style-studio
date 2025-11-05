import { create } from 'zustand';

export type ScanMode = 'vision' | 'snapshot' | 'json-build' | 'verify';
export type ElementStatus = 'found' | 'copied' | 'verified';
export type LogType = 'scanning' | 'found' | 'snapshot' | 'verified' | 'error';

export interface ElementItem {
  id: string;
  role: string; // 'button.send', 'input.password'
  type: 'button' | 'input' | 'icon' | 'background';
  status: ElementStatus;
  style: {
    bg?: string;
    radius?: string;
    text?: string;
    border?: string;
  };
  metrics?: {
    width: number;
    height: number;
    radius?: string;
    font?: string;
    bg?: string;
  };
  domElement?: HTMLElement;
}

export interface ScanLogEntry {
  id: string;
  type: LogType;
  icon: '🟢' | '🔵' | '🟣' | '✅' | '❌';
  message: string;
  details?: any;
  timestamp: number;
}

export interface AiComment {
  elementId: string;
  comment: string;
  timestamp: number;
}

interface AiScannerState {
  // Scan process
  isScanning: boolean;
  currentScreen: 'login' | 'home' | 'send' | 'receive' | 'buy' | 'apps';
  currentLayer: number;
  scanMode: ScanMode;
  
  // Results
  foundElements: ElementItem[];
  currentElement: ElementItem | null;
  scanLogs: ScanLogEntry[];
  
  // Wallet connection
  walletType: 'WCC' | 'MetaMask' | 'Phantom';
  isWalletConnected: boolean;
  
  // Progress
  progress: { current: number; total: number; path: string };
  
  // AI Commentary
  aiComments: AiComment[];
  
  // Actions
  startScan: (screen?: 'login' | 'home') => void;
  stopScan: () => void;
  nextLayer: () => void;
  reviewPass2: () => void;
  exportJSON: () => void;
  addLog: (type: LogType, icon: ScanLogEntry['icon'], message: string, details?: any) => void;
  addElement: (element: ElementItem) => void;
  updateElement: (id: string, updates: Partial<ElementItem>) => void;
  setCurrentElement: (element: ElementItem | null) => void;
  setScanMode: (mode: ScanMode) => void;
  clearLogs: () => void;
  setWalletType: (type: 'WCC' | 'MetaMask' | 'Phantom') => void;
}

export const useAiScannerStore = create<AiScannerState>((set, get) => ({
  // Initial state
  isScanning: false,
  currentScreen: 'home',
  currentLayer: 1,
  scanMode: 'vision',
  foundElements: [],
  currentElement: null,
  scanLogs: [],
  walletType: 'WCC',
  isWalletConnected: true,
  progress: { current: 0, total: 0, path: '' },
  aiComments: [],
  
  // Actions
  startScan: (screen = 'home') => {
    set({ 
      isScanning: true, 
      currentScreen: screen,
      currentLayer: 1,
      scanMode: 'vision',
      foundElements: [],
      scanLogs: []
    });
    
    get().addLog('scanning', '🟢', `Starting scan on ${screen} screen...`);
  },
  
  stopScan: () => {
    set({ isScanning: false });
    get().addLog('verified', '✅', 'Scan stopped by user');
  },
  
  nextLayer: () => {
    const currentLayer = get().currentLayer;
    set({ currentLayer: currentLayer + 1 });
    get().addLog('scanning', '🟢', `Moving to layer ${currentLayer + 1}...`);
  },
  
  reviewPass2: () => {
    get().addLog('scanning', '🟢', 'Starting verification pass 2...');
  },
  
  exportJSON: () => {
    const { foundElements, currentScreen, walletType } = get();
    
    const exportData = {
      meta: {
        source: walletType,
        scanMode: 'visual+DOM',
        timestamp: new Date().toISOString(),
        screen: currentScreen
      },
      elements: foundElements.map(el => ({
        id: el.id,
        role: el.role,
        type: el.type,
        style: el.style,
        metrics: el.metrics
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${walletType}-${currentScreen}-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    get().addLog('verified', '✅', 'JSON exported successfully');
  },
  
  addLog: (type, icon, message, details) => {
    set(state => ({
      scanLogs: [...state.scanLogs, {
        id: `log-${Date.now()}-${Math.random()}`,
        type,
        icon,
        message,
        details,
        timestamp: Date.now()
      }]
    }));
  },
  
  addElement: (element) => {
    set(state => ({
      foundElements: [...state.foundElements, element]
    }));
  },
  
  updateElement: (id, updates) => {
    set(state => ({
      foundElements: state.foundElements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  },
  
  setCurrentElement: (element) => {
    set({ currentElement: element });
  },
  
  setScanMode: (mode) => {
    set({ scanMode: mode });
  },
  
  clearLogs: () => {
    set({ scanLogs: [] });
  },
  
  setWalletType: (type) => {
    set({ walletType: type });
    get().addLog('scanning', '🟢', `Switched to ${type} wallet`);
  }
}));
