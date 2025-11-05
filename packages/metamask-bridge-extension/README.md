# WCC MetaMask Bridge Extension

Chrome extension that enables the WCC Admin AI Scanner to connect to and analyze external wallet UIs like MetaMask.

## Features

- 🔌 **Bridge Communication**: Enables secure messaging between WCC admin page and MetaMask extension
- 📸 **Screenshot Capture**: Uses Chrome API to capture wallet UI screenshots for AI analysis
- 🔍 **DOM Scanning**: Extracts DOM structure, styles, and element properties from wallet pages
- 🎨 **Style Extraction**: Captures computed CSS styles for accurate theme building
- 🤖 **AI-Ready**: Prepares data for AI Vision analysis and theme generation

## Installation

### Method 1: Load Unpacked (Development)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `packages/metamask-bridge-extension` folder from your project
5. The extension should appear in your extensions list with a green checkmark

### Method 2: From .zip (Production)

1. Download the extension .zip file
2. Extract to a folder
3. Follow steps 1-4 from Method 1

## Usage

### Step 1: Open MetaMask
1. Click the MetaMask extension icon in your browser toolbar
2. Or right-click → **"Open in new window"** for better visibility
3. Navigate to the screen you want to scan (Home, Send, Receive, etc.)

### Step 2: Open WCC Admin AI Scanner
1. Navigate to `/admin/ai-scanner` in your WCC app
2. Select **"MetaMask"** from the wallet type selector
3. Extension status will be checked automatically
4. Green ✅ = Ready | Amber ⚠️ = Not installed

### Step 3: Connect and Scan
1. If status is green ✅, click **"Connect to MetaMask"**
2. Click **"Start Scan"** to begin the AI analysis
3. Wait for the scan to complete (typically 10-30 seconds)
4. Click **"Export JSON"** to save the theme mapping

## How It Works

### Architecture

```
WCC Admin Page (localhost:8080)
    ↕ postMessage
Background Script (Service Worker)
    ↕ chrome.runtime.sendMessage
Content Script (Injected in MetaMask)
    → DOM Scanning
    → Screenshot Capture (Chrome API)
    → Style Extraction
```

### Message Protocol

**Request Format:**
```javascript
{
  source: 'wcc-admin',
  type: 'WALLET_REQ',
  id: 'uuid',
  method: 'fetchDOM' | 'fetchScreenshot' | 'getElementStyle' | 'clickElement',
  params: { ... }
}
```

**Response Format:**
```javascript
{
  source: 'wallet-bridge',
  type: 'WALLET_RES',
  id: 'uuid',
  result: { ... },
  error: null | string
}
```

## Troubleshooting

### Extension Not Detected

**Symptom:** "Extension Not Found" message in WCC Admin

**Solutions:**
1. Verify extension is installed:
   - Go to `chrome://extensions`
   - Look for "WCC MetaMask Bridge"
   - Ensure it's **enabled** (toggle is ON)

2. Reload the extension:
   - Click the refresh icon (🔄) on the extension card
   - Or disable/enable the extension

3. Check permissions:
   - Extension requires `activeTab` and `tabs` permissions
   - Click "Details" → Check permissions are granted

### Connection Timeout

**Symptom:** "Request timeout: ping (15000ms)"

**Solutions:**
1. **MetaMask must be open:**
   - Open MetaMask popup or extension page
   - Keep it open in a visible tab/window
   - The extension can only scan open pages

2. **Check extension injection:**
   - Open MetaMask
   - Right-click → **"Inspect"**
   - Console should show: `[WCC MetaMask Bridge Content] 🚀 Loaded in: ...`
   - If not present, reload MetaMask page

3. **Verify message passing:**
   - In WCC admin page console, look for:
     ```
     [MetaMaskBridge] 📤 Sending request: ping (uuid)
     [MetaMaskBridge] 📥 Received response: uuid
     ```
   - If messages are sent but not received, check background script logs

### Screenshot Capture Fails

**Symptom:** AI Vision analysis skipped, no screenshot available

**Solutions:**
1. **Grant capture permissions:**
   - Extension needs access to capture visible tabs
   - Check `chrome://extensions` → Extension details → Permissions

2. **MetaMask window must be visible:**
   - Screenshot API only captures visible content
   - Make sure MetaMask window/tab is focused
   - Try opening MetaMask in a separate window (not popup)

3. **Check background script logs:**
   - Go to `chrome://extensions`
   - Click "Details" on WCC MetaMask Bridge
   - Click "Service worker" link
   - Look for screenshot capture logs

### No Elements Found

**Symptom:** Scan completes but 0 elements found

**Solutions:**
1. **MetaMask must be fully loaded:**
   - Wait for MetaMask UI to finish loading
   - Ensure you're on an actual screen (not settings/loading)

2. **Check visibility filters:**
   - Content script only scans visible elements
   - Elements must have `width > 0` and `height > 0`
   - Hidden elements are intentionally skipped

3. **Verify content script execution:**
   - Open MetaMask → Right-click → Inspect
   - Console should show: `[Content] ✅ Extracted N visible elements`

## Development

### File Structure
```
packages/metamask-bridge-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker (message router + screenshot)
├── content.js          # Injected script (DOM scanning)
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md          # This file
```

### Testing Locally

1. **Enable verbose logging:**
   - All scripts log with prefixes: `[Background]`, `[Content]`, `[MetaMaskBridge]`
   - Open DevTools in both WCC admin page and MetaMask

2. **Test ping connection:**
   ```javascript
   // In WCC admin page console:
   window.postMessage({
     source: 'wcc-admin',
     type: 'WALLET_REQ',
     id: 'test-123',
     method: 'ping',
     params: {}
   }, '*');
   ```

3. **Monitor message flow:**
   - WCC Admin: Check for `📤` (sent) and `📥` (received)
   - MetaMask: Check for `📨` (request) and `✅` (response)

### Debugging Tips

1. **Check Content Script Injection:**
   ```javascript
   // In MetaMask window console:
   console.log('Content script loaded?', window.__WCC_BRIDGE_LOADED__);
   ```

2. **Test Screenshot Capture:**
   ```javascript
   // In background service worker console:
   chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
     console.log('Screenshot captured:', dataUrl.length);
   });
   ```

3. **Verify DOM Extraction:**
   ```javascript
   // In MetaMask window console (after content script loads):
   const elements = document.querySelectorAll('*');
   console.log('Total elements:', elements.length);
   ```

## Security

### Permissions
- **activeTab**: Required for screenshot capture of current tab
- **tabs**: Required for tab communication
- **host_permissions**: `<all_urls>` allows injection into MetaMask extension pages

### Data Privacy
- ✅ **Read-only access**: Extension only reads DOM/styles, never modifies
- ✅ **No private keys**: Never accesses wallet private keys or seed phrases
- ✅ **Local processing**: All data stays on your machine
- ✅ **No external requests**: Extension doesn't send data to external servers

### Safe Operations
- DOM scanning (read-only)
- Screenshot capture (visible UI only)
- Style extraction (CSS properties)
- Element clicking (UI automation only)

## Limitations

- **Chrome/Edge only**: Uses Chrome Extension Manifest V3 API
- **MetaMask must be open**: Can only scan open extension pages
- **Visible content only**: Screenshot captures visible tab content
- **No background scanning**: Requires active user interaction
- **Single wallet at a time**: Cannot scan multiple wallets simultaneously

## Future Enhancements

- [ ] Support for Phantom wallet
- [ ] Automatic screen detection and navigation
- [ ] Real-time DOM change monitoring
- [ ] Batch screenshot capture for multiple screens
- [ ] Cross-browser support (Firefox, Safari)
- [ ] Automated testing suite

## Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ MetaMask DOM scanning
- ✅ Chrome API screenshot capture
- ✅ Auto-detection and error handling
- ✅ 15-second timeout handling
- ✅ Comprehensive error messages

## License

MIT License - See project root for details
