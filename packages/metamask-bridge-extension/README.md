# WCC MetaMask Bridge Extension

Chrome extension that enables the WCC Admin AI Scanner to connect to MetaMask and analyze its UI structure.

## 🚀 Installation

### Step 1: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `packages/metamask-bridge-extension` folder
5. Extension should appear in your extensions list

### Step 2: Verify Installation

- Extension icon should appear in Chrome toolbar
- Click the extension icon to see status
- Console should show: `[WCC MetaMask Bridge] Background service worker loaded`

## 📖 Usage

### Connect to MetaMask from Admin AI Scanner

1. Open MetaMask extension popup (keep it open)
2. Navigate to `/admin/ai-scanner` in your WCC app
3. Select **MetaMask** from wallet type selector
4. Click **Connect to MetaMask** button
5. Extension will establish connection via `postMessage`
6. You should see: `✅ Connected to MetaMask` in logs

### Start Scanning

1. Click **Start Scan** button
2. Watch the canvas as elements are discovered and rendered
3. Logs will show progress through phases:
   - 🔌 Connect Wallet
   - 📡 Fetch DOM
   - 🟢 Vision Analysis
   - 🔵 Snapshot Capture
   - 🟣 JSON Build
   - ✅ Verify Mapping
4. Click **Export JSON** to download theme data

## 🔧 Debugging

### Content Script Console

1. Right-click on MetaMask extension popup
2. Select **Inspect**
3. Open Console tab
4. Look for messages like:
   ```
   [WCC MetaMask Bridge Content] 🚀 Loaded in: chrome-extension://...
   [Content] 📨 Received request: fetchDOM
   [Content] ✅ Extracted 45 visible elements
   ```

### Background Service Worker

1. Go to `chrome://extensions`
2. Find "WCC MetaMask Bridge"
3. Click **Service worker** link
4. Check console for routing messages

### Admin Page Console

1. Open DevTools on your WCC app
2. Look for MetaMaskBridge messages:
   ```
   [MetaMaskBridge] 🔌 Connecting to MetaMask extension...
   [MetaMaskBridge] ✅ Connected to MetaMask extension
   [MetaMaskBridge] 📡 Fetching DOM from MetaMask...
   ```

## 🔒 Security

- **Read-only access**: Extension only reads DOM structure and computed styles
- **No private keys**: Never accesses wallet accounts or private keys
- **Isolated messaging**: Uses Chrome's secure `postMessage` API
- **No network requests**: All communication is local via extension messaging

## 🐛 Troubleshooting

### "MetaMask extension not available"

- ✅ Verify extension is installed and enabled
- ✅ Make sure MetaMask popup is open
- ✅ Check content script is injected (inspect MetaMask popup console)

### "Request timeout"

- ✅ Check MetaMask is not frozen or crashed
- ✅ Verify content script console shows no errors
- ✅ Try reloading MetaMask extension

### No elements found

- ✅ Ensure MetaMask is on home screen (not settings or other pages)
- ✅ Check content script console for DOM extraction logs
- ✅ Verify elements are visible (not hidden by CSS)

## 📝 Message Protocol

### Request Format (Admin → Content Script)

```javascript
{
  source: 'wcc-admin',
  type: 'WALLET_REQ',
  id: 'uuid-v4',
  method: 'fetchDOM' | 'getElementStyle' | 'ping',
  params: { ... }
}
```

### Response Format (Content Script → Admin)

```javascript
{
  source: 'wallet-bridge',
  type: 'WALLET_RES',
  id: 'uuid-v4',
  result: { ... },
  error: null | string
}
```

## 🔮 Future Enhancements

- [ ] Screenshot capture (requires html2canvas bundling)
- [ ] Multi-tab support
- [ ] Navigation automation
- [ ] Element interaction recording
- [ ] Phantom wallet support

## 📄 License

Part of the WCC project. See main project LICENSE.
