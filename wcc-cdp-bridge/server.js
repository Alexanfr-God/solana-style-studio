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
        await browser.close();
        browser = null;
        currentPage = null;
      }

      if (chromeInstance) {
        await chromeInstance.kill();
        chromeInstance = null;
      }

      // Launch Chrome with debugging port
      chromeInstance = await launch({
        chromeFlags: [
          '--remote-debugging-port=9222',
          '--no-first-run',
          '--no-default-browser-check',
        ],
      });

      socket.emit('log', 'Chrome launched, connecting via CDP...');

      // Connect Puppeteer to Chrome
      browser = await puppeteer.connect({
        browserWSEndpoint: `ws://localhost:9222/devtools/browser`,
        defaultViewport: { width: 400, height: 600 }
      });

      socket.emit('log', 'Connected to Chrome via CDP');

      // Open wallet popup
      const extensionId = walletType === 'phantom' ? PHANTOM_ID : METAMASK_ID;
      const popupUrl = `chrome-extension://${extensionId}/popup.html`;
      
      socket.emit('log', `Opening ${walletType} popup...`);
      currentPage = await browser.newPage();
      await currentPage.goto(popupUrl, { waitUntil: 'networkidle2' });

      socket.emit('log', `${walletType} popup opened successfully`);
      socket.emit('log', 'Ready to scan DOM');

    } catch (error) {
      console.error('❌ Error starting Chrome:', error);
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

      socket.emit('log', 'Scan complete');

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
        // Create or update style tag
        let styleTag = document.getElementById('wcc-theme');
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'wcc-theme';
          document.head.appendChild(styleTag);
        }
        styleTag.textContent = rules.join('\n');
      }, cssRules);

      socket.emit('log', 'Theme CSS injected successfully');
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
║          🚀 WCC CDP Bridge Server                         ║
║                                                            ║
║          Server running on: http://localhost:${PORT}        ║
║          WebSocket ready for connections                   ║
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
    await browser.close();
  }
  
  if (chromeInstance) {
    await chromeInstance.kill();
  }
  
  process.exit(0);
});
