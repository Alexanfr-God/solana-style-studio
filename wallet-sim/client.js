/**
 * Wallet Simulator WS Client
 * Responds to admin UI requests via WS protocol
 */

const WS_URL = 'ws://localhost:3001';
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// DOM elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const logs = document.getElementById('logs');
const walletFrame = document.getElementById('walletFrame');

// Logging helper
function log(message, type = 'info') {
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
  logs.appendChild(entry);
  logs.scrollTop = logs.scrollHeight;
  console.log(`[WalletSim] ${message}`);
}

// Connect to WS server
function connect() {
  log('🔌 Connecting to WCC WS Server...');
  
  ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    log('✅ Connected to WCC WS Server', 'received');
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected to WCC Server';
    reconnectAttempts = 0;
    
    // Send hello message
    sendMessage({
      type: 'hello',
      source: 'wallet-sim',
      timestamp: Date.now()
    });
  };
  
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      log(`📨 Received: ${message.type}`, 'received');
      handleMessage(message);
    } catch (error) {
      log(`❌ Failed to parse message: ${error.message}`);
    }
  };
  
  ws.onerror = (error) => {
    log(`❌ WebSocket error: ${error.message}`);
  };
  
  ws.onclose = () => {
    log('🔴 Disconnected from WCC WS Server');
    statusDot.classList.remove('connected');
    statusText.textContent = 'Disconnected from WCC Server';
    
    // Attempt reconnection
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      log(`🔄 Reconnecting... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(connect, 2000 * reconnectAttempts);
    } else {
      log('❌ Max reconnection attempts reached');
    }
  };
}

// Send message via WS
function sendMessage(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
    log(`📤 Sent: ${message.type}`, 'sent');
  } else {
    log('❌ WebSocket not connected');
  }
}

// Handle incoming messages
function handleMessage(message) {
  switch (message.type) {
    case 'connected':
      log(`✅ Server assigned client ID: ${message.clientId}`);
      break;
      
    case 'ping':
      sendMessage({ type: 'pong', timestamp: Date.now() });
      break;
      
    case 'getUIMap':
      log('🗺️ Generating UI Map...');
      sendUIMap();
      break;
      
    case 'getScreenshot':
      log('📸 Generating screenshot...');
      sendScreenshot();
      break;
      
    case 'applyTheme':
      log('🎨 Applying theme...');
      applyTheme(message.data);
      break;
      
    default:
      log(`⚠️ Unknown message type: ${message.type}`);
  }
}

// Send UI Map to admin
function sendUIMap() {
  const elements = [];
  
  // Scan all elements with data-wcc-role
  const roleElements = document.querySelectorAll('[data-wcc-role]');
  
  roleElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    
    elements.push({
      role: el.getAttribute('data-wcc-role'),
      selector: `[data-wcc-role="${el.getAttribute('data-wcc-role')}"]`,
      text: el.textContent.trim().substring(0, 50),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      styles: {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: styles.borderRadius,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        border: styles.border
      }
    });
  });
  
  sendMessage({
    type: 'uiMap',
    data: {
      screen: 'home',
      walletType: 'wallet-sim',
      elements
    }
  });
  
  log(`✅ Sent UI Map with ${elements.length} elements`, 'sent');
}

// Send screenshot to admin
function sendScreenshot() {
  // Generate placeholder screenshot (in real wallet, this would be actual screenshot)
  const canvas = document.createElement('canvas');
  canvas.width = 360;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  // Draw wallet frame content
  ctx.fillStyle = '#2d2d3f';
  ctx.fillRect(0, 0, 360, 600);
  
  // Draw balance card
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.roundRect(20, 60, 320, 100, 16);
  ctx.fill();
  
  // Draw buttons
  const buttonY = 210;
  const buttonColors = ['rgb(59, 130, 246)', 'rgba(168, 85, 247, 0.9)', 'rgba(16, 185, 129, 0.9)'];
  buttonColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.roundRect(20 + i * 110, buttonY, 100, 60, 12);
    ctx.fill();
  });
  
  // Draw asset items
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.roundRect(20, 340, 320, 60, 12);
  ctx.fill();
  ctx.roundRect(20, 410, 320, 60, 12);
  ctx.fill();
  
  const screenshot = canvas.toDataURL('image/png');
  
  sendMessage({
    type: 'screenshot',
    data: screenshot
  });
  
  log('✅ Sent screenshot', 'sent');
}

// Apply theme from admin
function applyTheme(themeData) {
  try {
    log('🎨 Applying theme data...');
    console.log('Theme data:', themeData);
    
    // Apply actual CSS vars from theme data
    if (themeData && themeData.elements) {
      themeData.elements.forEach((element) => {
        const el = document.querySelector(element.selector);
        if (el && element.style) {
          // Apply styles
          if (element.style.bg) {
            el.style.backgroundColor = element.style.bg;
          }
          if (element.style.color) {
            el.style.color = element.style.color;
          }
          if (element.style.radius) {
            el.style.borderRadius = element.style.radius;
          }
          if (element.style.font) {
            el.style.fontFamily = element.style.font;
          }
          if (element.style.fontSize) {
            el.style.fontSize = element.style.fontSize;
          }
          
          log(`✅ Applied styles to ${element.role}`, 'received');
        }
      });
    }
    
    // Visual feedback
    walletFrame.style.transition = 'all 0.3s';
    walletFrame.style.transform = 'scale(0.98)';
    setTimeout(() => {
      walletFrame.style.transform = 'scale(1)';
    }, 200);
    
    sendMessage({
      type: 'applyAck',
      ok: true,
      message: 'Theme applied successfully',
      timestamp: Date.now()
    });
    
    log('✅ Theme applied with live preview', 'sent');
    
  } catch (error) {
    log(`❌ Failed to apply theme: ${error.message}`);
    sendMessage({
      type: 'applyAck',
      ok: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
}

// Polyfill for roundRect if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.arcTo(x + width, y, x + width, y + radius, radius);
    this.lineTo(x + width, y + height - radius);
    this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    this.lineTo(x + radius, y + height);
    this.arcTo(x, y + height, x, y + height - radius, radius);
    this.lineTo(x, y + radius);
    this.arcTo(x, y, x + radius, y, radius);
    this.closePath();
  };
}

// Start connection
connect();
