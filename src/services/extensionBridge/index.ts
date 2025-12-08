/**
 * Extension Bridge Module
 * 
 * Модуль для подключения внешних браузерных расширений к WCC Admin AI Scanner.
 * 
 * ## Использование
 * 
 * ### 1. Запустить локальный WebSocket сервер:
 * ```bash
 * node scripts/extension-bridge-server.js
 * ```
 * Сервер слушает на: ws://localhost:4000/extension-bridge
 * 
 * ### 2. В расширении (ProtonVPN форк):
 * ```javascript
 * const ws = new WebSocket('ws://localhost:4000/extension-bridge');
 * 
 * ws.onopen = () => {
 *   // Отправляем приветствие
 *   ws.send(JSON.stringify({
 *     type: 'EXT_HELLO',
 *     extension: 'proton-vpn',
 *     version: '1.0.0'
 *   }));
 * };
 * 
 * // Отправляем снапшот UI
 * function sendSnapshot() {
 *   ws.send(JSON.stringify({
 *     type: 'EXT_UI_SNAPSHOT',
 *     extension: 'proton-vpn',
 *     screen: 'CONNECTED',
 *     timestamp: Date.now(),
 *     snapshot: {
 *       elements: [...],
 *       theme: { backgroundColor: '#1a1a2e' }
 *     }
 *   }));
 * }
 * ```
 * 
 * ### 3. В WCC Admin AI Scanner:
 * - Выберите Scan Source: "extension-bridge"
 * - Нажмите "Connect Bridge"
 * - Дождитесь подключения расширения
 * - Нажмите "Start Scan"
 */

export { extensionBridgeClient, type BridgeMetrics } from './ExtensionBridgeClient';
export { 
  EXTENSION_BRIDGE_WS_URL,
  EXTENSION_BRIDGE_FALLBACK_PORTS,
  EXTENSION_BRIDGE_CONNECT_TIMEOUT,
  EXTENSION_BRIDGE_HEARTBEAT_INTERVAL,
  type ExtensionBridgeMessage,
  type ExtensionHelloMessage,
  type ExtensionSnapshotMessage,
  type ExtensionPingMessage,
} from './config';
