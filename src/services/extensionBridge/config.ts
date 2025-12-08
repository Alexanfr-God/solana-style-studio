/**
 * Extension Bridge Configuration
 * URL для подключения расширений к WCC Admin
 */

// WebSocket URL для локальной разработки
// Расширения подключаются к этому endpoint
export const EXTENSION_BRIDGE_WS_URL = 
  typeof window !== 'undefined' && (window as any).EXTENSION_BRIDGE_WS_URL
    ? (window as any).EXTENSION_BRIDGE_WS_URL
    : 'ws://localhost:4000/extension-bridge';

// Альтернативные порты если основной занят
export const EXTENSION_BRIDGE_FALLBACK_PORTS = [4000, 4001, 4002, 3999];

// Timeout для ожидания подключения расширения (ms)
export const EXTENSION_BRIDGE_CONNECT_TIMEOUT = 30000;

// Интервал heartbeat (ms)
export const EXTENSION_BRIDGE_HEARTBEAT_INTERVAL = 5000;

// Формат сообщений от расширения
export type ExtensionBridgeMessageType = 
  | 'EXT_HELLO'        // Расширение представляется
  | 'EXT_UI_SNAPSHOT'  // Полный снапшот UI
  | 'EXT_PING'         // Heartbeat от расширения
  | 'EXT_PONG'         // Ответ на PING от WCC
  | 'EXT_GOODBYE';     // Расширение отключается

export interface ExtensionHelloMessage {
  type: 'EXT_HELLO';
  extension: string;
  version: string;
  capabilities?: string[];
}

export interface ExtensionSnapshotMessage {
  type: 'EXT_UI_SNAPSHOT';
  extension: string;
  screen: string;
  timestamp: number;
  snapshot: {
    elements?: Array<{
      id: string;
      tag: string;
      selector: string;
      classes?: string[];
      text?: string;
      rect?: { x: number; y: number; width: number; height: number };
      styles?: Record<string, string>;
      isVisible?: boolean;
    }>;
    theme?: Record<string, string>;
    dimensions?: { width: number; height: number };
  };
}

export interface ExtensionPingMessage {
  type: 'EXT_PING';
  ts: number;
}

export interface ExtensionPongMessage {
  type: 'EXT_PONG';
  ts: number;
}

export interface ExtensionGoodbyeMessage {
  type: 'EXT_GOODBYE';
  extension: string;
}

export type ExtensionBridgeMessage = 
  | ExtensionHelloMessage
  | ExtensionSnapshotMessage
  | ExtensionPingMessage
  | ExtensionPongMessage
  | ExtensionGoodbyeMessage;

// Сообщения от WCC к расширению
export interface WccRequestSnapshot {
  type: 'WCC_REQUEST_SNAPSHOT';
}

export interface WccApplyTheme {
  type: 'WCC_APPLY_THEME';
  theme: Record<string, string>;
}

export interface WccPing {
  type: 'WCC_PING';
  ts: number;
}

export type WccBridgeMessage = 
  | WccRequestSnapshot
  | WccApplyTheme
  | WccPing;
