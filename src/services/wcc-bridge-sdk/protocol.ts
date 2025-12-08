/**
 * WCC Bridge Protocol - типы сообщений для коммуникации между расширениями и WCC
 */

// ============= Base Types =============

export type ExtensionType = 'proton-vpn' | 'metamask' | 'phantom' | 'uniswap' | 'generic';

export type SnapshotEventType = 
  | 'EXTENSION_UI_SNAPSHOT'    // Полный снапшот UI
  | 'EXTENSION_UI_UPDATE'      // Дельта-обновление
  | 'EXTENSION_SCREEN_CHANGE'  // Смена экрана
  | 'EXTENSION_THEME_DETECTED' // Обнаружена тема
  | 'EXTENSION_CONNECTED'      // Расширение подключилось
  | 'EXTENSION_DISCONNECTED';  // Расширение отключилось

export type CommandType =
  | 'APPLY_THEME'              // Применить тему
  | 'GET_UI_SNAPSHOT'          // Запросить снапшот
  | 'GET_SCREENSHOT'           // Запросить скриншот
  | 'NAVIGATE_TO'              // Навигация
  | 'PING';                    // Проверка связи

// ============= Snapshot Structures =============

export interface ExtensionUIElement {
  id: string;
  tag: string;
  selector: string;
  classes: string[];
  text: string;
  role?: string;
  isVisible: boolean;
  isInteractive: boolean;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles: {
    backgroundColor?: string;
    color?: string;
    borderColor?: string;
    borderRadius?: string;
    fontSize?: string;
    fontFamily?: string;
    boxShadow?: string;
    opacity?: string;
  };
  children?: string[]; // IDs of child elements
  parentId?: string;
}

export interface ExtractedTheme {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  surfaceColor: string;
}

export interface ExtensionState {
  // Generic state (all extensions)
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // VPN-specific state
  connectionStatus?: 'connected' | 'disconnected' | 'connecting' | 'error';
  currentServer?: string;
  availableServers?: string[];
  
  // Wallet-specific state
  isUnlocked?: boolean;
  networkName?: string;
  accountAddress?: string;
  balance?: string;
}

export interface SecurityInfo {
  sanitized: boolean;
  redactedFields: string[];
  timestamp: number;
}

// ============= Message Payloads =============

export interface ExtensionUISnapshot {
  type: 'EXTENSION_UI_SNAPSHOT';
  extension: ExtensionType;
  version: string;
  timestamp: number;
  screen: string;
  state: ExtensionState;
  ui: {
    rootSelector: string;
    elements: ExtensionUIElement[];
    theme: ExtractedTheme;
    dimensions: {
      width: number;
      height: number;
    };
  };
  security: SecurityInfo;
}

export interface ExtensionUIUpdate {
  type: 'EXTENSION_UI_UPDATE';
  extension: ExtensionType;
  timestamp: number;
  changes: Array<{
    elementId: string;
    property: string;
    oldValue: string;
    newValue: string;
  }>;
}

export interface ExtensionScreenChange {
  type: 'EXTENSION_SCREEN_CHANGE';
  extension: ExtensionType;
  timestamp: number;
  previousScreen: string;
  currentScreen: string;
}

export interface ApplyThemeCommand {
  type: 'APPLY_THEME';
  theme: Record<string, string>;
  targetSelectors?: string[];
}

export interface GetSnapshotCommand {
  type: 'GET_UI_SNAPSHOT';
  includeScreenshot?: boolean;
}

// ============= Bridge Messages =============

export interface WCCBridgeMessage {
  id: string;
  source: 'extension' | 'wcc-admin';
  timestamp: number;
  payload: 
    | ExtensionUISnapshot 
    | ExtensionUIUpdate 
    | ExtensionScreenChange
    | ApplyThemeCommand
    | GetSnapshotCommand
    | { type: 'PING' }
    | { type: 'PONG' }
    | { type: 'ACK'; success: boolean; error?: string };
}

// ============= Screen Mappings =============

export const VPN_SCREEN_MAPPING: Record<string, string> = {
  'connected': 'CONNECTED',
  'disconnected': 'DISCONNECTED',
  'connecting': 'LOADING',
  'server-list': 'SERVER_SELECT',
  'settings': 'SETTINGS',
  'login': 'AUTH'
};

export const WALLET_SCREEN_MAPPING: Record<string, string> = {
  'home': 'HOME',
  'unlock': 'UNLOCK',
  'send': 'SEND',
  'swap': 'SWAP',
  'activity': 'ACTIVITY',
  'settings': 'SETTINGS',
  'network': 'NETWORK_SELECT',
  'account': 'ACCOUNT_SELECT'
};

// ============= Helper Functions =============

export function createSnapshotMessage(
  snapshot: Omit<ExtensionUISnapshot, 'type'>
): WCCBridgeMessage {
  return {
    id: `snap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: 'extension',
    timestamp: Date.now(),
    payload: {
      type: 'EXTENSION_UI_SNAPSHOT',
      ...snapshot
    }
  };
}

export function createUpdateMessage(
  update: Omit<ExtensionUIUpdate, 'type'>
): WCCBridgeMessage {
  return {
    id: `upd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    source: 'extension',
    timestamp: Date.now(),
    payload: {
      type: 'EXTENSION_UI_UPDATE',
      ...update
    }
  };
}
