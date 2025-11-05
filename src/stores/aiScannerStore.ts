import { create } from 'zustand';

export type ScanMode = 'vision' | 'snapshot' | 'json-build' | 'verify';
export type ElementStatus = 'found' | 'copied' | 'verified';
export type LogType = 'scanning' | 'found' | 'snapshot' | 'verified' | 'error' | 'vision';

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
  // AI Vision insights
  aiComment?: string; // AI-generated description
  aiConfidence?: number; // 0-1 confidence score
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
  setWalletConnected: (connected: boolean) => void;
  
  // Progress
  progress: { current: number; total: number; path: string };
  
  // AI Vision summary
  aiSummary?: string;
  
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
  isWalletConnected: false, // Changed to false - requires explicit connection
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
    const state = get();
    
    // Calculate coverage
    const verifiedCount = state.foundElements.filter(el => el.status === 'verified').length;
    const coverage = state.foundElements.length > 0 
      ? Math.round((verifiedCount / state.foundElements.length) * 100)
      : 0;
    
    const exportData = {
      meta: {
        source: state.walletType,
        scanMode: state.scanMode,
        screen: state.currentScreen,
        timestamp: new Date().toISOString(),
        totalElements: state.foundElements.length,
        verifiedElements: verifiedCount,
        coverage: `${coverage}%`,
        aiSummary: state.aiSummary || 'No AI analysis available'
      },
      elements: state.foundElements.map(el => ({
        id: el.id,
        role: el.role,
        type: el.type,
        status: el.status,
        style: el.style,
        metrics: el.metrics,
        // Include AI insights if available
        ...(el.aiComment && { aiComment: el.aiComment }),
        ...(el.aiConfidence && { aiConfidence: el.aiConfidence })
      })),
      comments: state.foundElements
        .filter(el => el.aiComment)
        .map(el => `${el.role}: ${el.aiComment}`)
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.walletType}-${state.currentScreen}-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    get().addLog('verified', '✅', `JSON exported with ${coverage}% coverage`);
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
  },
  
  setWalletConnected: (connected) => {
    set({ isWalletConnected: connected });
    if (connected) {
      get().addLog('verified', '✅', 'Wallet connected successfully');
    } else {
      get().addLog('error', '❌', 'Wallet disconnected');
    }
  }
}));
