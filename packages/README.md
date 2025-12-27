# WCC Overlay MVP

Real-time popup skinning system for Chrome extensions using AI segmentation.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Chrome Extension│────▶│ Native Messaging │────▶│ macOS Overlay   │
│ (popup + markers│     │ Host (Python)    │     │ App (Swift)     │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
                                              ┌───────────────────────┐
                                              │ ScreenCaptureKit      │
                                              │ (ROI only, 15fps)     │
                                              └───────────┬───────────┘
                                                          │
                                                          ▼
                                              ┌───────────────────────┐
                                              │ Marker Detection      │
                                              │ (Magenta corners)     │
                                              └───────────┬───────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐  ┌───────────────────────┐
│ SAM2 Service    │◀────│ Unix Socket      │◀─┤ Crop bbox + send      │
│ (facebookresearch│     │ /tmp/wcc-sam2    │  │ to SAM2               │
│ /sam2)          │     └──────────────────┘  └───────────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ Binary Mask     │────▶│ Overlay Window   │
│ (segmentation)  │     │ (PNG + clip)     │
└─────────────────┘     └──────────────────┘
```

## Components

### 1. Chrome Extension (`packages/extension/`)
- Manifest V3 with native messaging
- Popup with magenta corner markers (opacity 0.6)
- OPEN/PING/CLOSE protocol
- Service worker manages native port

### 2. Native Messaging Host (`packages/native-host/`)
- Python script with proper length-prefix protocol
- Forwards messages to overlay via Unix socket
- Retry with exponential backoff

### 3. macOS Overlay App (`packages/macos-overlay/`)
- Swift/Xcode project
- Borderless, transparent, click-through window
- ScreenCaptureKit for ROI-only capture
- Marker detection (magenta color threshold)
- CGContext.clip for mask rendering

### 4. SAM2 Service (`packages/sam2-service/`)
- Official facebookresearch/sam2
- Unix socket API
- Box prompt for stable segmentation
- Supports CUDA, MPS, CPU

## Quick Start

```bash
# 1. Install all components
cd packages
chmod +x install.sh
./install.sh

# 2. Start SAM2 service
cd sam2-service
python sam2_server.py &

# 3. Build and run macOS app in Xcode
# (See install.sh output for details)

# 4. Load extension in Chrome
# chrome://extensions → Load unpacked → packages/extension/

# 5. Update Extension ID in native host manifest
# ~/Library/Application Support/Google/Chrome/NativeMessagingHosts/dev.wcc.overlay.json

# 6. Click extension icon to test!
```

## Logs

```bash
# All logs
tail -f ~/Library/Logs/WCCOverlay/*.log

# Specific component
tail -f ~/Library/Logs/WCCOverlay/native-host.log
tail -f ~/Library/Logs/WCCOverlay/wcc.log
tail -f ~/Library/Logs/WCCOverlay/sam2-service.log
```

## Requirements

- macOS 12.0+
- Chrome 88+
- Python 3.10+
- Xcode 14+
- Screen Recording permission

## Performance

- Target: <200ms from popup open to skin render
- Capture: 15 FPS, ROI only
- SAM2 tiny: ~50ms on M1, ~30ms on CUDA
- End-to-end: ~100-150ms typical

## Known Limitations

- Lovable cannot compile Swift or run Python ML
- Manual Xcode build required
- Screen Recording permission must be granted manually
- Extension ID must be updated in host manifest after installation
