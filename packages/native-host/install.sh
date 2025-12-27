#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
HOST_MANIFEST_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
LOG_DIR="$HOME/Library/Logs/WCCOverlay"

echo "========================================="
echo "Installing WCC Native Messaging Host"
echo "========================================="

# Создать директории
mkdir -p "$HOST_MANIFEST_DIR"
mkdir -p "$LOG_DIR"
echo "✓ Created directories"

# Установить Python скрипт
chmod +x "$SCRIPT_DIR/wcc-native-host.py"
sudo cp "$SCRIPT_DIR/wcc-native-host.py" /usr/local/bin/wcc-native-host
echo "✓ Installed /usr/local/bin/wcc-native-host"

# Установить host manifest
cp "$SCRIPT_DIR/dev.wcc.overlay.json" "$HOST_MANIFEST_DIR/"
echo "✓ Installed host manifest to $HOST_MANIFEST_DIR"

echo ""
echo "========================================="
echo "⚠️  ВАЖНО: Обновите Extension ID"
echo "========================================="
echo ""
echo "1. Загрузите extension в chrome://extensions (Developer mode)"
echo "2. Скопируйте Extension ID"
echo "3. Отредактируйте файл:"
echo "   $HOST_MANIFEST_DIR/dev.wcc.overlay.json"
echo ""
echo "   Замените YOUR_EXTENSION_ID_HERE на реальный ID"
echo ""
echo "Логи: $LOG_DIR/native-host.log"
echo ""
echo "Тест: tail -f $LOG_DIR/native-host.log"
