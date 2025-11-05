/**
 * WCC MetaMask Bridge - Background Service Worker
 * Routes messages between content script and admin page
 */

console.log('[WCC MetaMask Bridge] 🚀 Background service worker loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', {
    type: message.type,
    method: message.method,
    from: sender.tab ? 'content-script' : 'extension'
  });
  
  // Forward messages to all tabs (admin page will filter)
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    });
  });
  
  return true; // Keep channel open for async response
});

// Log installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[WCC MetaMask Bridge] ✅ Extension installed:', details.reason);
});
