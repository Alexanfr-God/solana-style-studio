/**
 * WCC MetaMask Bridge - Content Script
 * Injected into MetaMask extension pages
 * Provides DOM scanning and style extraction
 */

console.log('[WCC MetaMask Bridge Content] 🚀 Loaded in:', window.location.href);

// Listen for requests from admin page
window.addEventListener('message', async (event) => {
  const msg = event.data;
  
  // Only process messages from wcc-admin
  if (msg.source !== 'wcc-admin' || msg.type !== 'WALLET_REQ') {
    return;
  }
  
  console.log('[Content] 📨 Received request:', msg.method, msg.id);
  
  try {
    let result;
    
    switch (msg.method) {
      case 'ping':
        result = { status: 'ok', timestamp: Date.now() };
        break;
        
      case 'fetchDOM':
        result = { dom: await fetchDOMStructure() };
        break;
        
      case 'fetchScreenshot':
        result = { screenshot: await captureScreenshot() };
        break;
        
      case 'getElementStyle':
        result = { styles: await getComputedStyles(msg.params.selector) };
        break;
        
      case 'getCurrentScreen':
        result = { screen: detectCurrentScreen() };
        break;
        
      case 'clickElement':
        result = { success: await clickElement(msg.params.selector) };
        break;
        
      default:
        throw new Error(`Unknown method: ${msg.method}`);
    }
    
    // Send response back
    console.log('[Content] ✅ Sending response:', msg.id);
    window.postMessage({
      source: 'wallet-bridge',
      type: 'WALLET_RES',
      id: msg.id,
      result,
      error: null
    }, '*');
    
  } catch (error) {
    console.error('[Content] ❌ Error:', error);
    
    window.postMessage({
      source: 'wallet-bridge',
      type: 'WALLET_RES',
      id: msg.id,
      result: null,
      error: error.message
    }, '*');
  }
});

/**
 * Extract DOM structure from MetaMask page
 */
async function fetchDOMStructure() {
  console.log('[Content] 📡 Extracting DOM structure...');
  
  const elements = [];
  const allNodes = document.querySelectorAll('*');
  
  allNodes.forEach((node, index) => {
    const rect = node.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     window.getComputedStyle(node).visibility !== 'hidden';
    
    if (isVisible) {
      const styles = window.getComputedStyle(node);
      
      elements.push({
        id: node.id || `element-${index}`,
        tag: node.tagName.toLowerCase(),
        classes: Array.from(node.classList),
        selector: getSelector(node),
        text: node.textContent?.trim().substring(0, 50) || '',
        isVisible,
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          border: styles.border,
          fontFamily: styles.fontFamily,
          fontSize: styles.fontSize,
          padding: styles.padding,
          margin: styles.margin
        }
      });
    }
  });
  
  console.log(`[Content] ✅ Extracted ${elements.length} visible elements`);
  
  return {
    walletType: 'MetaMask',
    currentScreen: detectCurrentScreen(),
    timestamp: Date.now(),
    allElements: elements
  };
}

/**
 * Capture screenshot of current page
 */
async function captureScreenshot() {
  console.log('[Content] 📸 Capturing screenshot...');
  
  // Note: html2canvas would need to be bundled with the extension
  // For now, return null - implement later with proper screenshot library
  console.warn('[Content] ⚠️ Screenshot capture not yet implemented');
  return null;
}

/**
 * Get computed styles for specific element
 */
async function getComputedStyles(selector) {
  console.log(`[Content] 🎨 Getting styles for: ${selector}`);
  
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  const computed = window.getComputedStyle(element);
  
  return {
    backgroundColor: computed.backgroundColor,
    color: computed.color,
    borderRadius: computed.borderRadius,
    border: computed.border,
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    padding: computed.padding,
    margin: computed.margin,
    width: computed.width,
    height: computed.height
  };
}

/**
 * Click element by selector
 */
async function clickElement(selector) {
  console.log(`[Content] 👆 Clicking: ${selector}`);
  
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  element.click();
  return true;
}

/**
 * Detect current screen (home, send, etc.)
 */
function detectCurrentScreen() {
  const url = window.location.href;
  
  if (url.includes('home.html')) return 'home';
  if (url.includes('popup.html')) return 'popup';
  if (url.includes('send')) return 'send';
  if (url.includes('receive')) return 'receive';
  
  return 'home';
}

/**
 * Generate CSS selector for element
 */
function getSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className) {
    const classes = Array.from(element.classList).join('.');
    if (classes) return `.${classes}`;
  }
  return element.tagName.toLowerCase();
}

// Notify that content script is ready
console.log('[WCC MetaMask Bridge Content] ✅ Ready to receive messages');
