# WCC Overlay Debug Checklist

## Quick Verification Commands

```bash
# Check all sockets
ls -la /tmp/wcc-*.sock

# Monitor all logs
tail -f ~/Library/Logs/WCCOverlay/*.log

# Check native host is installed
cat ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/dev.wcc.overlay.json
```

## Step-by-Step Verification

### 1. Chrome Extension

**Check:** Extension loaded and popup works

```
1. Open chrome://extensions
2. Find "WCC Overlay Bridge"
3. Click "Inspect views: popup.html" to open DevTools
4. Click extension icon to open popup
5. Check console for logs
```

**Expected logs:**
```
[WCC Popup][abc12345] Popup opened, sending OPEN
[WCC Popup][abc12345] Sent OPEN, response: {success: true}
[WCC Popup][abc12345] Sending PING
```

**Common issues:**
- "Native host not found" → Run `packages/native-host/install.sh`
- "Could not connect" → Check Extension ID in host manifest

---

### 2. Service Worker

**Check:** Native messaging connection

```
1. Open chrome://serviceworker-internals
2. Find WCC Overlay service worker
3. Click "Inspect"
4. Check console for logs
```

**Expected logs:**
```
[WCC SW] Service worker started
[WCC SW] Connecting to native host
[WCC SW] Connected to native host successfully
[WCC SW] Sending to native: {type: "OPEN", ...}
```

---

### 3. Native Messaging Host

**Check:** Messages forwarded to overlay

```bash
tail -f ~/Library/Logs/WCCOverlay/native-host.log
```

**Expected logs:**
```json
{"ts":"...","msg":"Native host started","data":{"pid":12345}}
{"ts":"...","msg":"Reading message","data":{"length":64}}
{"ts":"...","msg":"Received message","data":{"type":"OPEN","popupId":"abc12345"}}
{"ts":"...","msg":"Forwarded to overlay","data":{"type":"OPEN"}}
```

**Common issues:**
- "Socket error" → Overlay app not running
- No logs → Extension ID mismatch in manifest

---

### 4. macOS Overlay App - Socket

**Check:** Socket server listening

```bash
# Check socket exists
ls -la /tmp/wcc-overlay.sock

# Test connection
nc -U /tmp/wcc-overlay.sock
# (Should connect, then hang waiting for data)
```

**Expected in wcc.log:**
```json
{"ts":"...","msg":"Socket server started","data":{"path":"/tmp/wcc-overlay.sock"}}
{"ts":"...","msg":"Received message","data":{"type":"OPEN","popupId":"abc12345"}}
```

---

### 5. macOS Overlay App - Screen Capture

**Check:** Permission and capture working

```bash
tail -f ~/Library/Logs/WCCOverlay/wcc.log | grep -E "(permission|capture|frame)"
```

**Expected logs:**
```json
{"ts":"...","msg":"Screen Recording permission","data":{"hasAccess":true}}
{"ts":"...","msg":"Screen capture STARTED","data":{"fps":15}}
{"ts":"...","msg":"Capture stats","data":{"frameCount":30,"avgFps":14.9}}
```

**Common issues:**
- "permissionStatus: denied" → Grant in System Preferences
- No frame logs → ROI might be outside screen

---

### 6. Marker Detection

**Check:** Magenta markers detected

```bash
tail -f ~/Library/Logs/WCCOverlay/wcc.log | grep -i marker
```

**Expected logs:**
```json
{"ts":"...","msg":"Markers detected","data":{"rect":{"x":10,"y":10,"w":330,"h":480},"points":42}}
```

**Common issues:**
- "Not all corners found" → Marker opacity too low or popup not in ROI
- No marker logs → Check popup CSS markers

---

### 7. SAM2 Service

**Check:** Model loaded and serving

```bash
tail -f ~/Library/Logs/WCCOverlay/sam2-service.log
```

**Expected logs:**
```json
{"ts":"...","msg":"Model loaded successfully","loadTimeMs":2345.6,"device":"mps"}
{"ts":"...","msg":"Server listening","socket":"/tmp/wcc-sam2.sock"}
{"ts":"...","msg":"Received request","requestId":"abc12345","hasBbox":true}
{"ts":"...","msg":"Inference complete","inferenceTimeMs":87.3,"maskCoverage":65.2}
```

**Common issues:**
- "Checkpoint not found" → Run `./download_checkpoint.sh`
- "CUDA out of memory" → Use CPU or smaller model
- High inference time → Normal on CPU (~500ms)

---

### 8. Overlay Render

**Check:** Skin rendered with mask

```bash
tail -f ~/Library/Logs/WCCOverlay/wcc.log | grep -E "(render|clip|overlay)"
```

**Expected logs:**
```json
{"ts":"...","msg":"SAM2 response received","maskSize":198000}
{"ts":"...","msg":"Overlay updated","rect":"(810,10,400,600)"}
{"ts":"...","msg":"Rendered skin with mask clip"}
```

---

## Component → Log Location → Key Events

| Component | Log Location | Key Events |
|-----------|-------------|------------|
| Extension (popup) | Chrome DevTools Console | `OPEN sent`, `PING tick`, `CLOSE` |
| Extension (SW) | chrome://serviceworker-internals | `Connected`, `Sending to native` |
| Native Host | `~/Library/Logs/WCCOverlay/native-host.log` | `Received message`, `Forwarded to overlay` |
| macOS App | `~/Library/Logs/WCCOverlay/wcc.log` | `OPEN received`, `capture start`, `markers detected`, `render ok` |
| SAM2 Service | `~/Library/Logs/WCCOverlay/sam2-service.log` | `model loaded`, `inference complete` |

---

## Troubleshooting Scenarios

### Popup opens but no skin appears

1. Check native host logs - is OPEN received?
2. Check overlay app logs - is socket message received?
3. Check capture logs - is Screen Recording granted?
4. Check marker logs - are markers detected?
5. Check SAM2 logs - is mask generated?

### Skin appears but position is wrong

1. Check ROI configuration in AppDelegate.swift
2. Verify popup is within captureROI bounds
3. Check coordinate conversion in didCaptureFrame

### High latency (>500ms)

1. Check SAM2 device (should be `cuda` or `mps`, not `cpu`)
2. Reduce capture FPS if needed
3. Use smaller SAM2 model (tiny recommended)

### Skin doesn't follow popup movement

1. Verify PING messages are being sent (every 400ms)
2. Check marker detection is working continuously
3. Look for dropped frames in capture stats

---

## Reset Everything

```bash
# Kill processes
pkill -f sam2_server
pkill -f WCCOverlay

# Remove sockets
rm -f /tmp/wcc-*.sock

# Clear logs
rm -f ~/Library/Logs/WCCOverlay/*.log

# Restart fresh
python packages/sam2-service/sam2_server.py &
# Run WCCOverlay from Xcode
# Reload extension in Chrome
```
