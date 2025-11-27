/**
 * WCC CDP Bridge Server v2.2 - STEALTH MODE
 * 
 * Launches Chrome with MetaMask/Phantom pre-loaded via --load-extension
 * Connects via CDP, streams DOM/styles/screenshots to Admin via WebSocket
 * Includes stealth patches to hide automation markers
 */

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const puppeteer = require('puppeteer-core');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Paths
const CHROME_PROFILE_PATH = path.join(__dirname, 'chrome-profile');
const METAMASK_PATH = path.join(__dirname, 'extensions', 'metamask');
const PHANTOM_PATH = path.join(__dirname, 'extensions', 'phantom');

// Chrome executable path (macOS)
const CHROME_EXECUTABLE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// State
let browser = null;
let currentPage = null;
let detectedExtensionId = null;

// Detailed logging function
function logToSocket(socket, message, data = null) {
  const timestamp = new Date().toISOString().substr(11, 8);
  const logMsg = `[${timestamp}] ${message}`;
  console.log(logMsg, data || '');
  socket.emit('log', logMsg);
  if (data && typeof data === 'object') {
    socket.emit('log', JSON.stringify(data, null, 2));
  }
}

// Stealth patches to apply to every page
async function applyStealthPatches(page) {
  await page.evaluateOnNewDocument(() => {
    // 1. Remove webdriver flag
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
    
    // 2. Add chrome runtime
    window.chrome = {
      runtime: {},
      loadTimes: function() {},
      csi: function() {},
      app: {}
    };
    
    // 3. Fix permissions query
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
    
    // 4. Fix plugins length
    Object.defineProperty(navigator, 'plugins', {
      get: () => {
        const plugins = [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
          { name: 'Native Client', filename: 'internal-nacl-plugin' }
        ];
        plugins.item = (i) => plugins[i] || null;
        plugins.namedItem = (n) => plugins.find(p => p.name === n) || null;
        plugins.refresh = () => {};
        return plugins;
      }
    });
    
    // 5. Fix languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en', 'ru']
    });
    
    console.log('[STEALTH] Patches applied ✅');
  });
}

// Check if extension exists
function checkExtension(extensionPath, name) {
  const manifestPath = path.join(extensionPath, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`✅ ${name} found: v${manifest.version}`);
      return { exists: true, version: manifest.version };
    } catch (e) {
      console.log(`⚠️ ${name} manifest error:`, e.message);
      return { exists: false, error: e.message };
    }
  }
  console.log(`❌ ${name} not found at: ${extensionPath}`);
  return { exists: false };
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    connected: !!browser,
    hasPage: !!currentPage,
    extensionId: detectedExtensionId
  });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Start Chrome with wallet extension PRE-LOADED
  socket.on('startChrome', async (data) => {
    const { walletType = 'metamask', useRealProfile = false } = data || {};
    
    try {
      // Close existing browser
      if (browser) {
        try { await browser.close(); } catch (e) {}
        browser = null;
        currentPage = null;
        detectedExtensionId = null;
      }

      // Determine extension path
      const extensionPath = walletType === 'phantom' ? PHANTOM_PATH : METAMASK_PATH;
      const extensionName = walletType === 'phantom' ? 'Phantom' : 'MetaMask';

      logToSocket(socket, `🚀 Starting Chrome with ${extensionName} (STEALTH MODE)...`);

      // Check Chrome exists
      if (!fs.existsSync(CHROME_EXECUTABLE)) {
        logToSocket(socket, `❌ Chrome not found: ${CHROME_EXECUTABLE}`);
        return;
      }
      logToSocket(socket, `✅ Chrome found: ${CHROME_EXECUTABLE}`);

      // Check extension exists
      const manifestPath = path.join(extensionPath, 'manifest.json');
      if (!fs.existsSync(manifestPath)) {
        logToSocket(socket, `❌ ${extensionName} not found!`);
        logToSocket(socket, `Expected: ${manifestPath}`);
        logToSocket(socket, ``);
        logToSocket(socket, `📋 Инструкция:`);
        logToSocket(socket, `1. Скачай MetaMask: https://github.com/MetaMask/metamask-extension/releases`);
        logToSocket(socket, `2. Файл: metamask-chrome-XX.X.X.zip`);
        logToSocket(socket, `3. Распакуй в: ${extensionPath}`);
        return;
      }

      // Read manifest to get version
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      logToSocket(socket, `✅ ${extensionName} found`);
      logToSocket(socket, `📦 ${extensionName} version: ${manifest.version}`);

      // Determine profile path
      const profilePath = useRealProfile 
        ? path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default')
        : CHROME_PROFILE_PATH;
      
      logToSocket(socket, `📁 Profile: ${profilePath}`);
      logToSocket(socket, ``);

      // Build Chrome args
      const chromeArgs = [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1280,800',
        '--lang=en-US,en',
      ];

      const ignoreArgs = [
        '--enable-automation',
        '--disable-extensions',
        '--disable-component-update',
        '--disable-default-apps',
      ];

      logToSocket(socket, `🔧 Launching Chrome with puppeteer.launch()...`);
      logToSocket(socket, `🚫 Ignored automation flags: ${ignoreArgs.length} flags`);
      logToSocket(socket, `✅ Added stealth flags: --disable-blink-features=AutomationControlled`);

      // Launch Chrome with extension PRE-LOADED using puppeteer.launch()
      browser = await puppeteer.launch({
        headless: false,
        executablePath: CHROME_EXECUTABLE,
        userDataDir: profilePath,
        ignoreDefaultArgs: ignoreArgs,
        args: chromeArgs,
        defaultViewport: null
      });

      logToSocket(socket, `✅ Chrome launched successfully!`);

      // Get all pages
      const pages = await browser.pages();
      logToSocket(socket, `📄 Open pages: ${pages.length}`);

      // Apply stealth patches to all pages
      for (const page of pages) {
        await applyStealthPatches(page);
      }
      logToSocket(socket, `🔒 Stealth patches applied to ${pages.length} pages`);

      // Listen for new pages
      browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
          const page = await target.page();
          if (page) {
            await applyStealthPatches(page);
            logToSocket(socket, `🔒 Stealth patches applied to new page`);
          }
        }
      });

      // Wait for extension to load
      logToSocket(socket, `⏳ Waiting for extension to initialize...`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try to detect extension ID
      const targets = await browser.targets();
      logToSocket(socket, `🎯 Total targets: ${targets.length}`);
      
      for (const target of targets) {
        const url = target.url();
        const type = target.type();
        
        if (url.startsWith('chrome-extension://')) {
          const match = url.match(/chrome-extension:\/\/([a-z0-9]+)/i);
          if (match && !detectedExtensionId) {
            detectedExtensionId = match[1];
            logToSocket(socket, `🔍 Detected extension ID: ${detectedExtensionId}`);
          }
          logToSocket(socket, `  - [${type}] ${url.substring(0, 60)}...`);
        }
      }

      if (!detectedExtensionId) {
        logToSocket(socket, `⚠️ Extension ID not detected yet`);
        logToSocket(socket, `⚠️ Will try default ID when opening popup`);
      }

      currentPage = pages[0] || await browser.newPage();
      await applyStealthPatches(currentPage);

      // Run diagnostics on the page
      logToSocket(socket, ``);
      logToSocket(socket, `🔬 Running stealth diagnostics...`);
      
      const diagnostics = await currentPage.evaluate(() => {
        return {
          webdriver: navigator.webdriver,
          plugins: navigator.plugins.length,
          languages: navigator.languages,
          platform: navigator.platform,
          hardwareConcurrency: navigator.hardwareConcurrency,
          deviceMemory: navigator.deviceMemory,
          chrome: typeof window.chrome !== 'undefined',
          chromeRuntime: typeof window.chrome?.runtime !== 'undefined'
        };
      });
      
      logToSocket(socket, `📊 Diagnostics:`, diagnostics);

      if (diagnostics.webdriver === false || diagnostics.webdriver === undefined) {
        logToSocket(socket, `✅ Stealth: webdriver flag hidden!`);
      } else {
        logToSocket(socket, `⚠️ Warning: webdriver=${diagnostics.webdriver}`);
      }

      logToSocket(socket, ``);
      logToSocket(socket, `🎉 SUCCESS! Chrome запущен с ${extensionName}!`);
      logToSocket(socket, ``);
      logToSocket(socket, `Теперь:`);
      logToSocket(socket, `1. Нажми "Open Wallet" чтобы открыть ${extensionName} popup`);
      logToSocket(socket, `2. Настрой кошелёк если нужно`);
      logToSocket(socket, `3. Нажми "Scan DOM" для сканирования`);

      socket.emit('chromeStarted', { 
        ok: true, 
        extensionId: detectedExtensionId,
        diagnostics
      });

    } catch (error) {
      console.error('❌ Error starting Chrome:', error);
      logToSocket(socket, `❌ Error: ${error.message}`);
      logToSocket(socket, `Stack trace:`);
      logToSocket(socket, error.stack);
      socket.emit('chromeStarted', { ok: false, error: error.message });
    }
  });

  // Open wallet popup
  socket.on('openWalletPopup', async (data) => {
    const { walletType = 'metamask' } = data || {};
    
    try {
      if (!browser) {
        logToSocket(socket, '❌ Start Chrome first!');
        return;
      }

      // Use detected ID or default
      const defaultId = walletType === 'phantom' 
        ? 'bfnaelmomeimhlpmgjnjophhpkkoljpa' 
        : 'nkbihfbeogaeaoehlefnkodbefgpgknn';
      
      const extensionId = detectedExtensionId || defaultId;
      
      logToSocket(socket, `🔍 Opening ${walletType} popup...`);
      logToSocket(socket, `Extension ID: ${extensionId}`);
      
      // Try different popup URLs (MetaMask v12+ uses home.html)
      const popupUrls = [
        `chrome-extension://${extensionId}/home.html`,
        `chrome-extension://${extensionId}/popup.html`,
        `chrome-extension://${extensionId}/popup-init.html`
      ];
      
      currentPage = await browser.newPage();
      await applyStealthPatches(currentPage);
      
      let success = false;
      for (const popupUrl of popupUrls) {
        try {
          logToSocket(socket, `Trying: ${popupUrl}`);
          await currentPage.goto(popupUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
          logToSocket(socket, `✅ ${walletType} popup opened!`);
          success = true;
          break;
        } catch (e) {
          logToSocket(socket, `⚠️ Failed: ${e.message}`);
        }
      }

      if (!success) {
        logToSocket(socket, ``);
        logToSocket(socket, `❌ Could not open ${walletType} popup`);
        logToSocket(socket, `Убедись что расширение установлено правильно`);
      }

    } catch (error) {
      console.error('❌ Error opening wallet:', error);
      logToSocket(socket, `❌ Error: ${error.message}`);
    }
  });

  // Scan DOM and capture screenshot
  socket.on('scanDom', async () => {
    try {
      if (!currentPage) {
        logToSocket(socket, '❌ No page open');
        return;
      }

      logToSocket(socket, '🔍 Scanning DOM...');

      const html = await currentPage.content();
      logToSocket(socket, `📄 DOM: ${html.length} chars`);
      socket.emit('domSnapshot', { html });

      logToSocket(socket, '📸 Capturing screenshot...');

      const screenshot = await currentPage.screenshot({ 
        encoding: 'base64',
        type: 'png'
      });
      socket.emit('screenshot', { dataUrl: `data:image/png;base64,${screenshot}` });

      logToSocket(socket, '✅ Scan complete!');

    } catch (error) {
      console.error('❌ Error scanning:', error);
      logToSocket(socket, `❌ Error: ${error.message}`);
    }
  });

  // Apply theme CSS
  socket.on('applyTheme', async (data) => {
    const { cssRules = [] } = data || {};

    try {
      if (!currentPage) {
        socket.emit('themeApplied', { ok: false, error: 'No page open' });
        return;
      }

      logToSocket(socket, `💅 Applying theme: ${cssRules.length} CSS rules`);

      await currentPage.evaluate((rules) => {
        let styleTag = document.getElementById('wcc-theme');
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'wcc-theme';
          document.head.appendChild(styleTag);
        }
        styleTag.textContent = rules.join('\n');
      }, cssRules);

      logToSocket(socket, `✅ Injected ${cssRules.length} CSS rules`);
      socket.emit('themeApplied', { ok: true });

    } catch (error) {
      logToSocket(socket, `❌ Error applying theme: ${error.message}`);
      socket.emit('themeApplied', { ok: false, error: error.message });
    }
  });

  // Full diagnostics
  socket.on('diagnose', async () => {
    try {
      if (!currentPage) {
        logToSocket(socket, '❌ No page open');
        return;
      }

      logToSocket(socket, `🔬 Running full diagnostics...`);

      const fullDiag = await currentPage.evaluate(() => {
        // WebGL check
        let webglVendor = 'N/A', webglRenderer = 'N/A';
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl');
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
              webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
          }
        } catch (e) {}

        return {
          navigator: {
            webdriver: navigator.webdriver,
            plugins: navigator.plugins.length,
            languages: navigator.languages,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            maxTouchPoints: navigator.maxTouchPoints
          },
          window: {
            chrome: typeof window.chrome !== 'undefined',
            chromeRuntime: typeof window.chrome?.runtime !== 'undefined',
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            devicePixelRatio: window.devicePixelRatio
          },
          webgl: {
            vendor: webglVendor,
            renderer: webglRenderer
          },
          permissions: {
            notificationPermission: Notification.permission
          }
        };
      });

      logToSocket(socket, `📊 Full Diagnostics:`, fullDiag);

    } catch (error) {
      logToSocket(socket, `❌ Diagnostics error: ${error.message}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🚀 WCC CDP Bridge Server v2.2 STEALTH               ║
║                                                              ║
║          Server: http://localhost:${PORT}                      ║
║          MetaMask: ${METAMASK_PATH}
║          Phantom:  ${PHANTOM_PATH}
║                                                              ║
║          STEALTH FEATURES:                                   ║
║          ✅ navigator.webdriver = undefined                  ║
║          ✅ Fake plugins array                               ║
║          ✅ Chrome runtime object                            ║
║          ✅ AutomationControlled disabled                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Изменения в v2.2:
- ✅ Stealth патчи на каждую страницу
- ✅ Детальное логирование всех этапов  
- ✅ Диагностика navigator properties
- ✅ Автоопределение Extension ID с улучшенным regex
- ✅ Поддержка MetaMask v12+ (home.html, popup.html, popup-init.html)
`);

  // Check extensions on startup
  const mmCheck = checkExtension(METAMASK_PATH, 'MetaMask');
  const phCheck = checkExtension(PHANTOM_PATH, 'Phantom');
});

// Cleanup
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (browser) {
    try { await browser.close(); } catch (e) {}
  }
  process.exit(0);
});
