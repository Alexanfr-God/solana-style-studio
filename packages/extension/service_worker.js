/**
 * WCC Overlay Extension - Service Worker
 * Управляет native messaging и PING timeout
 */

const NATIVE_HOST = 'dev.wcc.overlay';
const PING_TIMEOUT = 1200; // ms - если PING не пришёл за это время, отправляем CLOSE

let port = null;
let lastPingTime = {};
let closeTimers = {};
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000;

function log(msg, data = {}) {
  const ts = new Date().toISOString();
  console.log(`[WCC SW][${ts}] ${msg}`, JSON.stringify(data));
}

/**
 * Подключиться к native host
 */
function connectNative() {
  if (port) {
    log('Already connected to native host');
    return port;
  }
  
  try {
    log('Connecting to native host', { host: NATIVE_HOST, attempt: reconnectAttempts + 1 });
    port = chrome.runtime.connectNative(NATIVE_HOST);
    reconnectAttempts = 0;
    
    port.onMessage.addListener((msg) => {
      log('Native response:', msg);
    });
    
    port.onDisconnect.addListener(() => {
      const error = chrome.runtime.lastError;
      log('Native disconnected:', { error: error?.message });
      port = null;
      
      // Retry reconnection с backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * reconnectAttempts;
        log('Scheduling reconnect', { attempt: reconnectAttempts, delayMs: delay });
        setTimeout(connectNative, delay);
      } else {
        log('Max reconnect attempts reached');
      }
    });
    
    log('Connected to native host successfully');
    return port;
  } catch (e) {
    log('Failed to connect to native host:', { error: e.message });
    return null;
  }
}

/**
 * Отправить сообщение в native host
 */
function sendNative(payload) {
  const p = connectNative();
  if (p) {
    log('Sending to native:', payload);
    try {
      p.postMessage(payload);
      return true;
    } catch (e) {
      log('Error posting message:', { error: e.message });
      port = null;
      return false;
    }
  }
  log('No native connection, message not sent');
  return false;
}

/**
 * Слушаем сообщения от popup
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action !== 'NATIVE_SEND') {
    return false;
  }
  
  const { payload } = msg;
  const { popupId, type } = payload;
  
  log('Received from popup:', { type, popupId });
  
  // Обновить время последнего PING
  if (type === 'PING' || type === 'OPEN') {
    lastPingTime[popupId] = Date.now();
    
    // Сбросить таймер CLOSE
    if (closeTimers[popupId]) {
      clearTimeout(closeTimers[popupId]);
      log('Cleared close timer', { popupId });
    }
    
    // Установить новый таймер: если PING не придёт за PING_TIMEOUT — отправить CLOSE
    closeTimers[popupId] = setTimeout(() => {
      log('PING timeout, sending CLOSE', { popupId, timeoutMs: PING_TIMEOUT });
      sendNative({ type: 'CLOSE', popupId, ts: Date.now(), reason: 'ping_timeout' });
      delete lastPingTime[popupId];
      delete closeTimers[popupId];
    }, PING_TIMEOUT);
  }
  
  // Если явный CLOSE — очистить таймер
  if (type === 'CLOSE') {
    if (closeTimers[popupId]) {
      clearTimeout(closeTimers[popupId]);
      delete closeTimers[popupId];
      log('Cleared close timer on explicit CLOSE', { popupId });
    }
    delete lastPingTime[popupId];
  }
  
  const success = sendNative(payload);
  sendResponse({ success, ts: Date.now() });
  return true; // Keep channel open for async response
});

// Инициализация
log('Service worker started');
connectNative();
