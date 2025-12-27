/**
 * WCC Overlay Extension - Popup Script
 * Отправляет OPEN/PING/CLOSE в service worker
 */

const PING_INTERVAL = 400;
const popupId = crypto.randomUUID().slice(0, 8);

function log(msg, data = {}) {
  const ts = new Date().toISOString();
  console.log(`[WCC Popup][${popupId}][${ts}] ${msg}`, data);
}

function updateStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

/**
 * Отправить событие в service worker
 */
function sendToBackground(payload) {
  chrome.runtime.sendMessage({ 
    action: 'NATIVE_SEND', 
    payload: { ...payload, popupId, ts: Date.now() } 
  }, (response) => {
    if (chrome.runtime.lastError) {
      log('Error sending to background:', { error: chrome.runtime.lastError.message });
      updateStatus(`Error: ${chrome.runtime.lastError.message}`);
    } else {
      log(`Sent ${payload.type}, response:`, response);
      if (response?.success) {
        updateStatus(`Connected (${payload.type})`);
      }
    }
  });
}

// При открытии popup
log('Popup opened, sending OPEN');
updateStatus('Sending OPEN...');
sendToBackground({ type: 'OPEN' });

// Ping каждые 400ms
const pingInterval = setInterval(() => {
  log('Sending PING');
  sendToBackground({ type: 'PING' });
}, PING_INTERVAL);

// При закрытии popup (beforeunload)
window.addEventListener('beforeunload', () => {
  log('Popup closing (beforeunload), sending CLOSE');
  clearInterval(pingInterval);
  sendToBackground({ type: 'CLOSE' });
});

// Также обработать visibilitychange
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    log('Visibility hidden, sending CLOSE');
    clearInterval(pingInterval);
    sendToBackground({ type: 'CLOSE' });
  }
});

// Обработать unload
window.addEventListener('unload', () => {
  log('Popup unload, sending CLOSE');
  clearInterval(pingInterval);
  sendToBackground({ type: 'CLOSE' });
});

log('Popup script initialized', { popupId });
