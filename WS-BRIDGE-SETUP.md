# WCC WebSocket Bridge - Запуск

## Быстрый старт

### 1. Запустить WS-сервер (терминал 1)
```bash
node ws-server.js
```
✅ Запущен на ws://localhost:3001

### 2. Запустить Wallet Simulator (терминал 2)
```bash
node wallet-sim/server.js
```
✅ Открыть http://localhost:3002

### 3. Запустить Admin UI (терминал 3)
```bash
npm run dev
```
✅ Открыть http://localhost:8080/admin/ai-scanner

## Acceptance Criteria

### ✅ Connect
- В Admin UI выбрать "WS" wallet type
- Нажать "Connect" → Flow Step "Connect" становится зелёным
- Wallet Simulator покажет "Connected to WCC Server"

### ✅ Start Scan
- Нажать "Start Scan"
- Admin получит ≥5 элементов от wallet-sim
- Canvas отрисует прямоугольники с ролями

### ✅ Export JSON
- Нажать "Export JSON"
- Скачается файл формата:
```json
{
  "meta": { "source": "Wallet-SDK", "scanMode": "dom+styles", "screen": "home" },
  "elements": [{ "role": "button.send", "selector": "...", "style": {...} }]
}
```

### ✅ Apply Theme
- Нажать "Apply Theme" (опционально)
- Wallet-sim получит сообщение, вернёт applyAck
- Toast: "Theme applied"

## Протокол WS

### Admin → Wallet
```json
{"type":"getUIMap"}
{"type":"getScreenshot"}
{"type":"applyTheme","data":{...}}
```

### Wallet → Admin
```json
{"type":"uiMap","data":{"screen":"home","elements":[...]}}
{"type":"screenshot","data":"data:image/png;base64,..."}
{"type":"applyAck","ok":true}
```

## Безопасность
✅ Только визуальный слой (DOM + стили + скриншот)
❌ НЕТ приватных ключей, RPC, балансов
