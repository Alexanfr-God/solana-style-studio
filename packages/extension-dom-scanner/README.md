# WCC Extension DOM Scanner

Universal content script that scans browser extension UI and sends snapshots to WCC Admin.

## How to Use

### Option 1: Add to your own extension

1. Copy `content-script.js` to your extension folder
2. Add to your `manifest.json`:

```json
{
  "content_scripts": [
    {
      "matches": ["chrome-extension://*/*"],
      "js": ["content-script.js"],
      "run_at": "document_idle"
    }
  ],
  "host_permissions": [
    "https://opxordptvpvzmhakvdde.supabase.co/*"
  ]
}
```

### Option 2: Load as separate extension

1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select this folder

### Option 3: Inject via DevTools

1. Open the extension popup
2. Right-click → Inspect
3. In Console, paste the content of `content-script.js`
4. Press Enter

## Manual Triggering

Once loaded, you can trigger a scan manually:

```javascript
// In extension's DevTools console:
window.WCC_DOM_SCANNER.send()

// Just scan without sending:
window.WCC_DOM_SCANNER.scan()

// Get detected extension name:
window.WCC_DOM_SCANNER.getExtension()

// Get detected screen:
window.WCC_DOM_SCANNER.getScreen()
```

## What Gets Scanned

- **Elements**: buttons, links, inputs, headings, text, icons
- **Styles**: colors, fonts, sizes, borders, padding
- **Theme**: background, text color, accent color
- **Layout**: positions and dimensions

## Data Format

```json
{
  "extension": "proton-vpn",
  "screen": "login",
  "timestamp": 1702934400000,
  "snapshot": {
    "elements": [
      {
        "id": "connect-btn",
        "tag": "button",
        "type": "button",
        "text": "Quick Connect",
        "rect": { "x": 10, "y": 100, "width": 200, "height": 48 },
        "styles": {
          "backgroundColor": "rgb(106, 57, 255)",
          "color": "rgb(255, 255, 255)"
        }
      }
    ],
    "theme": {
      "background": "#1a1a2e",
      "color": "#ffffff",
      "accent": "#6a39ff"
    }
  }
}
```

## Viewing Results

1. Go to WCC Admin → AI Scanner
2. The snapshot will appear in the "Bridge" tab
3. Visual preview shows in "Visual" tab
4. Raw JSON in "Raw" tab
