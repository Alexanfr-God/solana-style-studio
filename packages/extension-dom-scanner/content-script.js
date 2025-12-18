/**
 * Universal Extension DOM Scanner
 * Content script that scans extension UI and sends snapshot to WCC Admin
 * 
 * Usage: Include this script in your extension's manifest.json content_scripts
 */

(function() {
  'use strict';
  
  const BRIDGE_URL = 'https://opxordptvpvzmhakvdde.supabase.co/functions/v1/extension-bridge';
  const EXTENSION_NAME = detectExtensionName();
  
  console.log(`[DOM Scanner] 🚀 Loaded for: ${EXTENSION_NAME}`);
  
  /**
   * Auto-detect extension name from page title or URL
   */
  function detectExtensionName() {
    const title = document.title?.toLowerCase() || '';
    const url = window.location.href.toLowerCase();
    
    if (title.includes('proton') || url.includes('proton')) return 'proton-vpn';
    if (title.includes('metamask') || url.includes('metamask')) return 'metamask';
    if (title.includes('phantom') || url.includes('phantom')) return 'phantom';
    if (title.includes('rabby') || url.includes('rabby')) return 'rabby';
    
    // Extract from chrome-extension:// URL
    const match = url.match(/chrome-extension:\/\/([a-z]+)/);
    if (match) return match[1].substring(0, 16);
    
    return 'unknown-extension';
  }
  
  /**
   * Detect current screen based on content
   */
  function detectScreen() {
    const text = document.body?.innerText?.toLowerCase() || '';
    const url = window.location.href.toLowerCase();
    
    // Login/Auth screens
    if (text.includes('sign in') || text.includes('log in') || text.includes('войти')) return 'login';
    if (text.includes('create account') || text.includes('sign up')) return 'signup';
    if (text.includes('unlock') || text.includes('password')) return 'unlock';
    
    // VPN specific
    if (text.includes('connect') && text.includes('vpn')) return 'home';
    if (text.includes('quick connect')) return 'home';
    if (text.includes('connected to')) return 'connected';
    if (text.includes('server') || text.includes('country')) return 'servers';
    
    // Wallet specific
    if (text.includes('send') && text.includes('receive')) return 'home';
    if (text.includes('swap')) return 'swap';
    if (text.includes('settings')) return 'settings';
    
    // URL based
    if (url.includes('popup')) return 'popup';
    if (url.includes('home')) return 'home';
    
    return 'main';
  }
  
  /**
   * Extract theme colors from the page
   */
  function extractTheme() {
    const bodyStyles = window.getComputedStyle(document.body);
    const rootStyles = window.getComputedStyle(document.documentElement);
    
    // Try to find accent/primary colors
    const buttons = document.querySelectorAll('button');
    let accentColor = '#6366f1';
    
    for (const btn of buttons) {
      const styles = window.getComputedStyle(btn);
      const bg = styles.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        accentColor = bg;
        break;
      }
    }
    
    return {
      background: bodyStyles.backgroundColor || rootStyles.backgroundColor || '#1a1a2e',
      color: bodyStyles.color || rootStyles.color || '#ffffff',
      accent: accentColor,
      fontFamily: bodyStyles.fontFamily || 'system-ui'
    };
  }
  
  /**
   * Generate unique selector for element
   */
  function getSelector(element, index) {
    if (element.id) return `#${element.id}`;
    
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).filter(c => c && !c.includes('--')).slice(0, 3);
    
    if (classes.length > 0) {
      return `${tag}.${classes.join('.')}`;
    }
    
    return `${tag}[data-index="${index}"]`;
  }
  
  /**
   * Determine element type for categorization
   */
  function getElementType(element) {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const type = element.getAttribute('type');
    
    if (tag === 'button' || role === 'button') return 'button';
    if (tag === 'a' || role === 'link') return 'link';
    if (tag === 'input') return type || 'input';
    if (tag === 'img' || tag === 'svg') return 'icon';
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') return 'heading';
    if (tag === 'p' || tag === 'span' || tag === 'div') {
      const text = element.textContent?.trim();
      if (text && text.length < 100) return 'text';
    }
    
    return 'container';
  }
  
  /**
   * Scan DOM and extract all visible elements
   */
  function scanDOM() {
    console.log('[DOM Scanner] 📸 Scanning DOM...');
    
    const elements = [];
    const allNodes = document.querySelectorAll('*');
    let index = 0;
    
    allNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const styles = window.getComputedStyle(node);
      
      // Skip invisible/tiny elements
      const isVisible = rect.width > 5 && rect.height > 5 && 
                       styles.visibility !== 'hidden' &&
                       styles.display !== 'none' &&
                       styles.opacity !== '0';
      
      if (!isVisible) return;
      
      const tag = node.tagName.toLowerCase();
      const text = node.textContent?.trim().substring(0, 100) || '';
      const directText = Array.from(node.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent?.trim())
        .join(' ')
        .substring(0, 100);
      
      // Only include meaningful elements
      const isMeaningful = 
        tag === 'button' || tag === 'a' || tag === 'input' || tag === 'img' || tag === 'svg' ||
        tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' ||
        (directText.length > 0 && directText.length < 200) ||
        node.getAttribute('role');
      
      if (!isMeaningful) return;
      
      const elementData = {
        id: node.id || `el-${index}`,
        tag,
        type: getElementType(node),
        selector: getSelector(node, index),
        classes: Array.from(node.classList).slice(0, 5),
        text: directText || text.substring(0, 50),
        rect: {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        },
        styles: {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          border: styles.border
        },
        isVisible: true
      };
      
      // Add SVG content for icons
      if (tag === 'svg') {
        elementData.svgContent = node.outerHTML.substring(0, 500);
      }
      
      // Add image src
      if (tag === 'img') {
        elementData.src = node.src;
      }
      
      elements.push(elementData);
      index++;
    });
    
    console.log(`[DOM Scanner] ✅ Found ${elements.length} meaningful elements`);
    
    return {
      extension: EXTENSION_NAME,
      screen: detectScreen(),
      timestamp: Date.now(),
      snapshot: {
        elements,
        theme: extractTheme(),
        dimensions: {
          width: document.documentElement.scrollWidth || window.innerWidth,
          height: document.documentElement.scrollHeight || window.innerHeight
        },
        title: document.title,
        url: window.location.href
      }
    };
  }
  
  /**
   * Send snapshot to WCC Admin bridge
   */
  async function sendSnapshot(data) {
    console.log('[DOM Scanner] 📤 Sending snapshot to bridge...');
    
    try {
      const response = await fetch(BRIDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'EXT_UI_SNAPSHOT',
          ...data
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('[DOM Scanner] ✅ Snapshot sent successfully:', result);
      return result;
      
    } catch (error) {
      console.error('[DOM Scanner] ❌ Failed to send snapshot:', error);
      throw error;
    }
  }
  
  /**
   * Main scan and send function
   */
  async function scanAndSend() {
    try {
      const data = scanDOM();
      await sendSnapshot(data);
      return data;
    } catch (error) {
      console.error('[DOM Scanner] Error:', error);
      return null;
    }
  }
  
  // Auto-scan on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(scanAndSend, 500); // Wait for dynamic content
    });
  } else {
    setTimeout(scanAndSend, 500);
  }
  
  // Re-scan on significant DOM changes
  const observer = new MutationObserver((mutations) => {
    const significantChange = mutations.some(m => 
      m.addedNodes.length > 3 || m.removedNodes.length > 3
    );
    if (significantChange) {
      console.log('[DOM Scanner] 🔄 DOM changed, re-scanning...');
      setTimeout(scanAndSend, 300);
    }
  });
  
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
  });
  
  // Expose for manual triggering
  window.WCC_DOM_SCANNER = {
    scan: scanDOM,
    send: scanAndSend,
    getExtension: () => EXTENSION_NAME,
    getScreen: detectScreen
  };
  
  console.log('[DOM Scanner] ✅ Ready. Use window.WCC_DOM_SCANNER.send() to trigger manually.');
})();
