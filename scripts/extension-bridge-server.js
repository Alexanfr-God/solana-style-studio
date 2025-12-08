#!/usr/bin/env node

/**
 * Extension Bridge WebSocket Server
 * 
 * Локальный сервер для разработки, который принимает соединения
 * от браузерных расширений (ProtonVPN, MetaMask форки и т.д.)
 * и пересылает их в WCC Admin AI Scanner.
 * 
 * ЗАПУСК:
 *   node scripts/extension-bridge-server.js
 *   
 * ИЛИ с указанием порта:
 *   PORT=4001 node scripts/extension-bridge-server.js
 * 
 * ENDPOINT:
 *   ws://localhost:4000/extension-bridge
 * 
 * ФОРМАТ СООБЩЕНИЙ ОТ РАСШИРЕНИЯ:
 * 
 *   1. Приветствие:
 *      { "type": "EXT_HELLO", "extension": "proton-vpn", "version": "1.0.0" }
 * 
 *   2. UI Snapshot:
 *      { 
 *        "type": "EXT_UI_SNAPSHOT", 
 *        "extension": "proton-vpn",
 *        "screen": "CONNECTED",
 *        "timestamp": 1699999999999,
 *        "snapshot": {
 *          "elements": [...],
 *          "theme": { "backgroundColor": "#1a1a2e", ... },
 *          "dimensions": { "width": 360, "height": 600 }
 *        }
 *      }
 * 
 *   3. Heartbeat:
 *      { "type": "EXT_PING", "ts": 1699999999999 }
 */

const { WebSocketServer } = require('ws');
const http = require('http');

const PORT = parseInt(process.env.PORT || '4000', 10);

// Создаём HTTP сервер для healthcheck
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok',
      clients: wss ? wss.clients.size : 0,
      extensions: Object.keys(connectedExtensions),
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// WebSocket сервер
const wss = new WebSocketServer({ 
  server,
  path: '/extension-bridge'
});

// Трекинг подключенных расширений
const connectedExtensions = {};
// Трекинг WCC Admin клиентов
const adminClients = new Set();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          WCC Extension Bridge Server                           ║
╠════════════════════════════════════════════════════════════════╣
║  WebSocket:  ws://localhost:${PORT}/extension-bridge             ║
║  Health:     http://localhost:${PORT}/health                     ║
╠════════════════════════════════════════════════════════════════╣
║  Waiting for connections...                                    ║
╚════════════════════════════════════════════════════════════════╝
`);

wss.on('connection', (ws, req) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  let extensionName = null;
  let isAdmin = false;
  
  console.log(`[${clientId}] 🔌 New connection from ${req.socket.remoteAddress}`);
  
  // Отправляем приветствие
  ws.send(JSON.stringify({
    type: 'BRIDGE_WELCOME',
    serverId: 'wcc-extension-bridge',
    timestamp: Date.now()
  }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      console.log(`[${clientId}] 📨 ${message.type}`, 
        message.extension ? `(${message.extension})` : '');
      
      // Обработка сообщений от расширений
      switch (message.type) {
        case 'EXT_HELLO':
          extensionName = message.extension;
          connectedExtensions[extensionName] = {
            clientId,
            ws,
            version: message.version,
            connectedAt: Date.now(),
            capabilities: message.capabilities || []
          };
          console.log(`[${clientId}] ✅ Extension registered: ${extensionName} v${message.version}`);
          
          // Уведомляем всех admin клиентов
          broadcastToAdmins({
            type: 'EXT_HELLO',
            extension: extensionName,
            version: message.version
          });
          break;
          
        case 'EXT_UI_SNAPSHOT':
          console.log(`[${clientId}] 📸 Snapshot from ${message.extension}: ${message.screen}`);
          // Пересылаем всем admin клиентам
          broadcastToAdmins(message);
          break;
          
        case 'EXT_PING':
          ws.send(JSON.stringify({ type: 'EXT_PONG', ts: message.ts }));
          break;
          
        case 'EXT_GOODBYE':
          console.log(`[${clientId}] 👋 Extension goodbye: ${extensionName}`);
          if (extensionName) {
            delete connectedExtensions[extensionName];
            broadcastToAdmins({ type: 'EXT_GOODBYE', extension: extensionName });
          }
          break;
          
        // Сообщения от WCC Admin
        case 'ADMIN_HELLO':
          isAdmin = true;
          adminClients.add(ws);
          console.log(`[${clientId}] 🎛️ Admin client connected`);
          
          // Отправляем текущее состояние
          ws.send(JSON.stringify({
            type: 'BRIDGE_STATUS',
            extensions: Object.entries(connectedExtensions).map(([name, info]) => ({
              name,
              version: info.version,
              connectedAt: info.connectedAt
            }))
          }));
          break;
          
        case 'WCC_REQUEST_SNAPSHOT':
          // Запрашиваем снапшот у всех расширений
          Object.values(connectedExtensions).forEach(ext => {
            if (ext.ws.readyState === 1) { // OPEN
              ext.ws.send(JSON.stringify({ type: 'WCC_REQUEST_SNAPSHOT' }));
            }
          });
          break;
          
        case 'WCC_APPLY_THEME':
          // Применяем тему к указанному расширению или ко всем
          const targetExt = message.extension 
            ? connectedExtensions[message.extension]
            : Object.values(connectedExtensions)[0];
            
          if (targetExt && targetExt.ws.readyState === 1) {
            targetExt.ws.send(JSON.stringify({
              type: 'WCC_APPLY_THEME',
              theme: message.theme
            }));
          }
          break;
          
        case 'WCC_PING':
          ws.send(JSON.stringify({ type: 'WCC_PONG', ts: message.ts }));
          break;
          
        default:
          console.log(`[${clientId}] ⚠️ Unknown message type: ${message.type}`);
      }
      
    } catch (error) {
      console.error(`[${clientId}] ❌ Failed to parse message:`, error.message);
    }
  });
  
  ws.on('close', () => {
    console.log(`[${clientId}] 🔴 Connection closed`);
    
    if (extensionName && connectedExtensions[extensionName]) {
      delete connectedExtensions[extensionName];
      broadcastToAdmins({ type: 'EXT_GOODBYE', extension: extensionName });
    }
    
    if (isAdmin) {
      adminClients.delete(ws);
    }
  });
  
  ws.on('error', (error) => {
    console.error(`[${clientId}] ❌ WebSocket error:`, error.message);
  });
});

function broadcastToAdmins(message) {
  const payload = JSON.stringify(message);
  adminClients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

server.listen(PORT, () => {
  console.log(`🚀 Extension Bridge Server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  
  // Уведомляем всех клиентов
  wss.clients.forEach(client => {
    client.send(JSON.stringify({ type: 'BRIDGE_SHUTDOWN' }));
    client.close();
  });
  
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});
