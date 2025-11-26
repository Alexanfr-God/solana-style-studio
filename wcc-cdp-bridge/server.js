/**
 * WCC CDP Bridge Server
 * 
 * Launches Chrome with MetaMask/Phantom, connects via CDP,
 * streams DOM/styles/screenshots to Admin via WebSocket
 */

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const puppeteer = require('puppeteer-core');
const { launch } = require('chrome-launcher');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Configuration
const PORT = 4000;
const METAMASK_ID = process.env.METAMASK_ID || 'nkbihfbeogaeaoehlefnkodbefgpgknn';
const PHANTOM_ID = process.env.PHANTOM_ID || 'bfnaelmomeimhlpmgjnjophhpkkoljpa';

// Chrome profile path - allows extensions!
const CHROME_PROFILE_PATH = path.join(os.homedir(), 'Desktop', 'wcc-cdp-bridge', 'chrome-profile');

// State
let chromeInstance = null;
let browser = null;
let currentPage = null;

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    connected: !!browser,
    hasPage: !!currentPage 
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Start Chrome with wallet extension
  socket.on('startChrome', async (data) => {
    const { walletType = 'metamask' } = data || {};
    
    try {
      socket.emit('log', `Starting Chrome with ${walletType}...`);

      // If browser already running, close it
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.log('Browser already closed');
        }
        browser = null;
        currentPage = null;
      }

      if (chromeInstance) {
        try {
          await chromeInstance.kill();
        } catch (e) {
          console.log('Chrome already killed');
        }
        chromeInstance = null;
      }

      socket.emit('log', `Using profile: ${CHROME_PROFILE_PATH}`);

      // Launch Chrome with debugging port AND user profile
      chromeInstance = await launch({
        chromeFlags: [
          '--no-first-run',
          '--no-default-browser-check',
          `--user-data-dir=${CHROME_PROFILE_PATH}`,
          '--profile-directory=Default',
          '--disable-background-networking',
          '--disable-client-side-phishing-detection',
          '--disable-default-apps',
          '--disable-hang-monitor',
          '--disable-popup-blocking',
          '--disable-prompt-on-repost',
          '--disable-sync',
          '--disable-translate',
          '--metrics-recording-only',
          '--safebrowsing-disable-auto-update',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--excludeSwitches=enable-automation',
        ],
      });

      // ВАЖНО: Используем порт от chrome-launcher!
      const cdpPort = chromeInstance.port;
      socket.emit('log', `Chrome launched on port ${cdpPort}, connecting via CDP...`);
      console.log(`🚀 Chrome running on port: ${cdpPort}`);

      // Connect Puppeteer using the ACTUAL port from chrome-launcher
      browser = await puppeteer.connect({
        browserURL: `http://localhost:${cdpPort}`,
        defaultViewport: { width: 400, height: 600 }
      });

      socket.emit('log', 'Connected to Chrome via CDP ✅');
      socket.emit('log', '');
      socket.emit('log', '📌 ВАЖНО: Теперь установи MetaMask в этом Chrome!');
      socket.emit('log', '1. Открой metamask.io/download');
      socket.emit('log', '2. Установи расширение');
      socket.emit('log', '3. Создай/восстанови кошелёк');
      socket.emit('log', '4. Потом нажми Scan DOM');

      // Open a blank page for now
      currentPage = await browser.newPage();
      await currentPage.goto('https://metamask.io/download/', { waitUntil: 'networkidle2' });

      socket.emit('log', '');
      socket.emit('log', '✅ Готово! Chrome открыт на metamask.io/download');

    } catch (error) {
      console.error('❌ Error starting Chrome:', error);
      socket.emit('log', `Error: ${error.message}`);
    }
  });

  // Open MetaMask popup (after extension is installed)
  socket.on('openWalletPopup', async (data) => {
    const { walletType = 'metamask' } = data || {};
    
    try {
      if (!browser) {
        socket.emit('log', 'Error: Start Chrome first!');
        return;
      }

      const extensionId = walletType === 'phantom' ? PHANTOM_ID : METAMASK_ID;
      const popupUrl = `chrome-extension://${extensionId}/popup.html`;
      
      socket.emit('log', `Opening ${walletType} popup...`);
      currentPage = await browser.newPage();
      
      try {
        await currentPage.goto(popupUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        socket.emit('log', `${walletType} popup opened successfully ✅`);
      } catch (e) {
        socket.emit('log', `⚠️ Не удалось открыть popup. Убедись что MetaMask установлен!`);
        socket.emit('log', `Extension ID: ${extensionId}`);
      }

    } catch (error) {
      console.error('❌ Error opening wallet:', error);
      socket.emit('log', `Error: ${error.message}`);
    }
  });

  // Scan DOM and capture screenshot
  socket.on('scanDom', async () => {
    try {
      if (!currentPage) {
        socket.emit('log', 'Error: No page open. Start Chrome first.');
        return;
      }

      socket.emit('log', 'Scanning DOM...');

      // Get HTML content
      const html = await currentPage.content();
      socket.emit('domSnapshot', { html });

      socket.emit('log', 'Capturing screenshot...');

      // Capture screenshot
      const screenshot = await currentPage.screenshot({ 
        encoding: 'base64',
        type: 'png'
      });
      const dataUrl = `data:image/png;base64,${screenshot}`;
      socket.emit('screenshot', { dataUrl });

      socket.emit('log', 'Scan complete ✅');

    } catch (error) {
      console.error('❌ Error scanning DOM:', error);
      socket.emit('log', `Error: ${error.message}`);
    }
  });

  // Apply theme (inject CSS)
  socket.on('applyTheme', async (data) => {
    const { cssRules = [] } = data || {};

    try {
      if (!currentPage) {
        socket.emit('themeApplied', { 
          ok: false, 
          error: 'No page open. Start Chrome first.' 
        });
        return;
      }

      socket.emit('log', `Injecting ${cssRules.length} CSS rules...`);

      // Inject CSS into page
      await currentPage.evaluate((rules) => {
        let styleTag = document.getElementById('wcc-theme');
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'wcc-theme';
          document.head.appendChild(styleTag);
        }
        styleTag.textContent = rules.join('\n');
      }, cssRules);

      socket.emit('log', 'Theme CSS injected successfully ✅');
      socket.emit('themeApplied', { ok: true });

    } catch (error) {
      console.error('❌ Error applying theme:', error);
      socket.emit('log', `Error: ${error.message}`);
      socket.emit('themeApplied', { 
        ok: false, 
        error: error.message 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          🚀 WCC CDP Bridge Server v2.0                    ║
║                                                            ║
║          Server: http://localhost:${PORT}                   ║
║          Profile: ${CHROME_PROFILE_PATH}
║                                                            ║
║          Ready to connect WCC Admin Panel!                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down CDP Bridge...');
  
  if (browser) {
    try { await browser.close(); } catch (e) {}
  }
  
  if (chromeInstance) {
    try { await chromeInstance.kill(); } catch (e) {}
  }
  
  process.exit(0);
});
