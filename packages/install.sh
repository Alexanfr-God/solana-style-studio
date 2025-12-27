#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$HOME/Library/Logs/WCCOverlay"

echo "========================================="
echo "WCC Overlay MVP Installation"
echo "========================================="
echo ""

# Создать директорию логов
mkdir -p "$LOG_DIR"
echo "✓ Created log directory: $LOG_DIR"

# 1. Native Messaging Host
echo ""
echo "=== Step 1: Native Messaging Host ==="
cd "$SCRIPT_DIR/native-host"
chmod +x install.sh
./install.sh

# 2. SAM2 Service
echo ""
echo "=== Step 2: SAM2 Service ==="
cd "$SCRIPT_DIR/sam2-service"

if [ ! -d "vendor/sam2" ]; then
    echo "Cloning SAM2 repository..."
    git clone https://github.com/facebookresearch/sam2.git vendor/sam2
    echo "✓ Cloned SAM2"
    
    echo "Installing SAM2..."
    cd vendor/sam2
    pip install -e .
    cd ../..
    echo "✓ Installed SAM2"
fi

if [ ! -f "checkpoints/sam2.1_hiera_tiny.pt" ]; then
    echo "Downloading checkpoint..."
    chmod +x download_checkpoint.sh
    ./download_checkpoint.sh
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "✓ SAM2 Service ready"

# 3. macOS Overlay App
echo ""
echo "=== Step 3: macOS Overlay App ==="
echo ""
echo "⚠️  Manual build required in Xcode:"
echo ""
echo "   1. Open Xcode and create new project:"
echo "      File → New → Project → macOS → App"
echo "      Product Name: WCCOverlay"
echo "      Bundle Identifier: dev.wcc.overlay"
echo "      Language: Swift"
echo ""
echo "   2. Copy Swift files from:"
echo "      $SCRIPT_DIR/macos-overlay/WCCOverlay/"
echo ""
echo "   3. Copy Info.plist settings"
echo ""
echo "   4. Add ScreenCaptureKit.framework to project"
echo ""
echo "   5. Build & Run (Cmd+R)"
echo ""
echo "   6. Grant Screen Recording permission in:"
echo "      System Preferences → Privacy & Security → Screen Recording"
echo ""

# 4. Chrome Extension
echo "=== Step 4: Chrome Extension ==="
echo ""
echo "⚠️  Manual installation required:"
echo ""
echo "   1. Open chrome://extensions"
echo "   2. Enable Developer Mode (toggle in top right)"
echo "   3. Click 'Load unpacked'"
echo "   4. Select folder: $SCRIPT_DIR/extension/"
echo "   5. Copy the Extension ID shown"
echo "   6. Edit file:"
echo "      ~/Library/Application Support/Google/Chrome/NativeMessagingHosts/dev.wcc.overlay.json"
echo "   7. Replace YOUR_EXTENSION_ID_HERE with actual ID"
echo ""

# Summary
echo "========================================="
echo "Installation Summary"
echo "========================================="
echo ""
echo "Logs location:"
echo "  • Native Host:  $LOG_DIR/native-host.log"
echo "  • macOS App:    $LOG_DIR/wcc.log"
echo "  • SAM2 Service: $LOG_DIR/sam2-service.log"
echo ""
echo "Start commands:"
echo ""
echo "  # Terminal 1: SAM2 Service"
echo "  cd $SCRIPT_DIR/sam2-service"
echo "  python sam2_server.py"
echo ""
echo "  # Terminal 2: Monitor logs"
echo "  tail -f $LOG_DIR/*.log"
echo ""
echo "  # Then: Run WCCOverlay.app from Xcode"
echo "  # Then: Click extension icon in Chrome"
echo ""
echo "========================================="
echo "Verify sockets are listening:"
echo "  ls -la /tmp/wcc-overlay.sock"
echo "  ls -la /tmp/wcc-sam2.sock"
echo "========================================="
