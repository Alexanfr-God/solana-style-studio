/**
 * WCC WebSocket Broadcast Server
 * Simple message relay between admin UI and wallet clients
 * Port: 3001 (Vite uses 8080)
 */

import { WebSocketServer } from 'ws';
import http from 'http';

const PORT = 3001;

// HTTP server for health checks
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', clients: wss.clients.size }));
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

// WebSocket server
const wss = new WebSocketServer({ server: httpServer });

// Connected clients registry
const clients = new Map();
let clientIdCounter = 0;

wss.on('connection', (ws, req) => {
  const clientId = ++clientIdCounter;
  const clientIp = req.socket.remoteAddress;
  
  console.log(`[WS] 🟢 Client #${clientId} connected from ${clientIp}`);
  console.log(`[WS] Total clients: ${wss.clients.size}`);
  
  clients.set(ws, { id: clientId, connectedAt: Date.now(), source: 'unknown' });
  
  // Handle incoming messages
  ws.on('message', (rawMessage) => {
    let message;
    try {
      message = JSON.parse(rawMessage.toString());
      
      // Store client source on hello
      if (message.type === 'hello' && message.source) {
        const clientInfo = clients.get(ws);
        if (clientInfo) {
          clientInfo.source = message.source;
          console.log(`[WS] 👋 Client #${clientId} identified as: ${message.source}`);
        }
      }
      
      console.log(`[WS] 📨 Client #${clientId} (${clients.get(ws)?.source || 'unknown'}):`, message.type);
      
      // Broadcast to all other clients
      let broadcastCount = 0;
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) { // 1 = OPEN
          client.send(rawMessage);
          broadcastCount++;
        }
      });
      
      console.log(`[WS] 📡 Broadcasted to ${broadcastCount} clients`);
      
      // Handle ping/pong
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
      
    } catch (error) {
      console.error(`[WS] ❌ Failed to parse message from client #${clientId}:`, error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid JSON message' 
      }));
    }
  });
  
  // Handle client disconnect
  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    console.log(`[WS] 🔴 Client #${clientId} (${clientInfo?.source || 'unknown'}) disconnected`);
    console.log(`[WS] Total clients: ${wss.clients.size}`);
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`[WS] ❌ Client #${clientId} error:`, error.message);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({ 
    type: 'connected', 
    clientId,
    message: 'Connected to WCC WS Server',
    timestamp: Date.now()
  }));
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 WCC WebSocket Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WebSocket: ws://localhost:${PORT}
  Health:    http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[WS] 🛑 Shutting down...');
  wss.clients.forEach(client => {
    client.close(1000, 'Server shutting down');
  });
  httpServer.close(() => {
    console.log('[WS] ✅ Server closed');
    process.exit(0);
  });
});
