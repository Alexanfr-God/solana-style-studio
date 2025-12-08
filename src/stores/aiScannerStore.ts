import { create } from 'zustand';

export type ScanMode = 'vision' | 'snapshot' | 'json-build' | 'verify';
export type ElementStatus = 'found' | 'copied' | 'verified';
export type LogType = 'scanning' | 'found' | 'snapshot' | 'verified' | 'error' | 'vision';
export type ScanSource = 'local' | 'external' | 'extension-bridge';

export interface ExtensionUISnapshot {
  type: string;
  extension: string;
  version?: string;
  timestamp: number;
  screen: string;
  state?: Record<string, unknown>;
  ui?: {
    elements?: Array<{
      id: string;
      selector: string;
      tagName: string;
      className?: string;
      textContent?: string;
      attributes?: Record<string, string>;
      rect?: { x: number; y: number; width: number; height: number };
      styles?: Record<string, string>;
    }>;
    theme?: Record<string, string>;
  };
}

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

export interface WsMetrics {
  connectedClients: number;
  avgLatency: number | null;
  throughput: number;
  isConnected: boolean;
  lastMessageTime: number | null;
}

interface AiScannerState {
  // Scan process
  isScanning: boolean;
  currentScreen: 'login' | 'home' | 'send' | 'receive' | 'buy' | 'apps';
  currentLayer: number;
  scanMode: ScanMode;
  
  // Scan target mode
  targetMode: 'local' | 'external';
  scanSource: ScanSource;
  
  // Extension bridge state
  extensionSnapshot: ExtensionUISnapshot | null;
  lastExtensionMessage: number | null;
  
  // Results
  foundElements: ElementItem[];
  currentElement: ElementItem | null;
  scanLogs: ScanLogEntry[];
  
  // Wallet connection
  walletType: 'WS' | 'MetaMask' | 'Phantom';
  isWalletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  
  // Progress
  progress: { current: number; total: number; path: string };
  
  // AI Vision summary
  aiSummary?: string;
  
  // AI Commentary
  aiComments: AiComment[];
  
  // WS Metrics
  wsMetrics: WsMetrics | null;
  
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
  setWalletType: (type: 'WS' | 'MetaMask' | 'Phantom') => void;
  updateWsMetrics: (metrics: Partial<WsMetrics>) => void;
  setTargetMode: (mode: 'local' | 'external') => void;
  setScanSource: (source: ScanSource) => void;
  setExtensionSnapshot: (snapshot: ExtensionUISnapshot) => void;
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
  walletType: 'WS',
  isWalletConnected: false, // Changed to false - requires explicit connection
  progress: { current: 0, total: 0, path: '' },
  aiComments: [],
  wsMetrics: null,
  targetMode: 'local',
  scanSource: 'local',
  extensionSnapshot: null,
  lastExtensionMessage: null,
  
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
  },
  
  updateWsMetrics: (metrics) => {
    set(state => ({
      wsMetrics: {
        ...(state.wsMetrics || {
          connectedClients: 0,
          avgLatency: null,
          throughput: 0,
          isConnected: false,
          lastMessageTime: null
        }),
        ...metrics
      }
    }));
  },
  
  setTargetMode: (mode) => {
    set({ targetMode: mode });
    get().addLog('scanning', '🟢', `Switched to ${mode} mode`);
  },
  
  setScanSource: (source) => {
    set({ scanSource: source });
    get().addLog('scanning', '🟢', `Scan source: ${source}`);
  },
  
  setExtensionSnapshot: (snapshot) => {
    set({ 
      extensionSnapshot: snapshot,
      lastExtensionMessage: Date.now()
    });
    get().addLog('snapshot', '🔵', `Extension snapshot received: ${snapshot.extension} - ${snapshot.screen}`);
  }
}));
