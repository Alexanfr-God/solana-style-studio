/**
 * Extension Bridge Module
 * 
 * Модуль для подключения внешних браузерных расширений к WCC Admin AI Scanner.
 * 
 * ## Использование (NEW - без локального сервера!)
 * 
 * ### В расширении (ProtonVPN форк):
 * ```javascript
 * // URL Edge Function (работает в Lovable Preview!)
 * const BRIDGE_URL = 'https://ggllvfepstfnfnpptths.supabase.co/functions/v1/extension-bridge';
 * 
 * // Отправляем HELLO
 * async function connectToBridge() {
 *   const response = await fetch(BRIDGE_URL, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       type: 'EXT_HELLO',
 *       extension: 'proton-vpn',
 *       version: '1.0.0'
 *     })
 *   });
 *   const data = await response.json();
 *   console.log('Connected:', data);
 *   return data.clientId;
 * }
 * 
 * // Отправляем снапшот UI
 * async function sendSnapshot(clientId) {
 *   await fetch(BRIDGE_URL, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({
 *       type: 'EXT_UI_SNAPSHOT',
 *       clientId,
 *       extension: 'proton-vpn',
 *       screen: 'CONNECTED',
 *       snapshot: {
 *         elements: [...],
 *         theme: { backgroundColor: '#1a1a2e' }
 *       }
 *     })
 *   });
 * }
 * ```
 * 
 * ### В WCC Admin AI Scanner:
 * - Выберите Scan Source: "Bridge"
 * - Нажмите "Connect Bridge"
 * - Откройте попап расширения (оно автоматически отправит снапшот)
 * - Нажмите "Start Scan"
 */

// NEW: Realtime Bridge Client (uses Edge Function, no local server needed!)
export { realtimeBridgeClient, getExtensionBridgeUrl } from './RealtimeBridgeClient';

// Legacy: WebSocket client (requires local server)
export { extensionBridgeClient, type BridgeMetrics } from './ExtensionBridgeClient';

export { 
  EXTENSION_BRIDGE_WS_URL,
  EXTENSION_BRIDGE_FALLBACK_PORTS,
  EXTENSION_BRIDGE_CONNECT_TIMEOUT,
  EXTENSION_BRIDGE_HEARTBEAT_INTERVAL,
  getExtensionBridgeApiUrl,
  type ExtensionBridgeMessage,
  type ExtensionHelloMessage,
  type ExtensionSnapshotMessage,
  type ExtensionPingMessage,
} from './config';
