import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// In-memory storage for bridge state
interface BridgeState {
  extensions: Map<string, { name: string; version: string; connectedAt: number }>;
  lastSnapshot: any | null;
  lastSnapshotFrom: string | null;
  lastSnapshotAt: number | null;
  lastScreen: string | null;
  snapshotCount: number;
}

const state: BridgeState = {
  extensions: new Map(),
  lastSnapshot: null,
  lastSnapshotFrom: null,
  lastSnapshotAt: null,
  lastScreen: null,
  snapshotCount: 0,
};

// Helper to get path from URL (handles both /extension-bridge and /extension-bridge/snapshot)
function getSubPath(url: URL): string {
  const fullPath = url.pathname;
  // Extract path after /extension-bridge
  const match = fullPath.match(/\/extension-bridge(\/.*)?$/);
  return match?.[1] || '';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const subPath = getSubPath(url);
  
  console.log(`[ExtensionBridge] ${req.method} ${subPath || '/'}`);
  
  try {
    // ============================================================
    // GET /extension-bridge OR GET /extension-bridge/state
    // Returns current bridge state for Admin Scanner polling
    // ============================================================
    if (req.method === 'GET' && (subPath === '' || subPath === '/' || subPath === '/state')) {
      console.log('[ExtensionBridge] GET state request');
      
      const extensions = Array.from(state.extensions.entries()).map(([id, ext]) => ({
        id,
        ...ext,
      }));
      
      // Include a preview of the snapshot (first 500 chars) for debugging
      const snapshotPreview = state.lastSnapshot 
        ? JSON.stringify(state.lastSnapshot).slice(0, 500) + '...'
        : null;
      
      return new Response(JSON.stringify({
        success: true,
        extensions,
        hasSnapshot: state.lastSnapshot !== null,
        lastSnapshotFrom: state.lastSnapshotFrom,
        lastSnapshotAt: state.lastSnapshotAt,
        lastScreen: state.lastScreen,
        snapshotCount: state.snapshotCount,
        snapshotPreview,
        snapshot: state.lastSnapshot,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // ============================================================
    // POST /extension-bridge/snapshot
    // Direct endpoint for extensions to send UI snapshots
    // ============================================================
    if (req.method === 'POST' && subPath === '/snapshot') {
      const body = await req.json();
      
      // Validate required fields
      if (!body.extension) {
        console.error('[ExtensionBridge] SNAPSHOT rejected: missing extension field');
        return new Response(JSON.stringify({
          ok: false,
          error: 'Missing required field: extension',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!body.snapshot) {
        console.error('[ExtensionBridge] SNAPSHOT rejected: missing snapshot field');
        return new Response(JSON.stringify({
          ok: false,
          error: 'Missing required field: snapshot',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const snapshotSize = JSON.stringify(body.snapshot).length;
      const screen = body.screen || 'unknown';
      
      // Store the snapshot
      state.lastSnapshot = body.snapshot;
      state.lastSnapshotFrom = body.extension;
      state.lastSnapshotAt = Date.now();
      state.lastScreen = screen;
      state.snapshotCount++;
      
      console.log(`[ExtensionBridge] ✅ SNAPSHOT received from ${body.extension} (screen=${screen}, size=${snapshotSize} bytes, total=${state.snapshotCount})`);
      
      return new Response(JSON.stringify({
        ok: true,
        storedAt: state.lastSnapshotAt,
        snapshotSize,
        snapshotCount: state.snapshotCount,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // ============================================================
    // POST /extension-bridge (legacy message-based protocol)
    // Handles typed messages: EXT_HELLO, EXT_UI_SNAPSHOT, EXT_PING, EXT_GOODBYE
    // ============================================================
    if (req.method === 'POST' && (subPath === '' || subPath === '/')) {
      const body = await req.json();
      console.log('[ExtensionBridge] POST message:', body.type);
      
      switch (body.type) {
        case 'EXT_HELLO': {
          const { extension, version, clientId } = body;
          const id = clientId || `ext-${Date.now()}`;
          
          state.extensions.set(id, {
            name: extension,
            version: version,
            connectedAt: Date.now(),
          });
          
          console.log(`[ExtensionBridge] ✅ Extension connected: ${extension} v${version}`);
          
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_WELCOME',
            clientId: id,
            message: `Welcome ${extension} v${version}`,
            // Tell the extension where to POST snapshots
            snapshotEndpoint: '/snapshot',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        case 'EXT_UI_SNAPSHOT': {
          const { extension, screen, snapshot } = body;
          
          const snapshotSize = JSON.stringify(snapshot).length;
          
          state.lastSnapshot = snapshot;
          state.lastSnapshotFrom = extension;
          state.lastSnapshotAt = Date.now();
          state.lastScreen = screen || 'unknown';
          state.snapshotCount++;
          
          console.log(`[ExtensionBridge] ✅ SNAPSHOT via message from ${extension} (screen=${screen || 'unknown'}, size=${snapshotSize} bytes)`);
          
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_SNAPSHOT_ACK',
            message: 'Snapshot received',
            snapshotSize,
            storedAt: state.lastSnapshotAt,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        case 'EXT_PING': {
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_PONG',
            ts: Date.now(),
            originalTs: body.ts,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        case 'EXT_GOODBYE': {
          const { extension, clientId } = body;
          
          if (clientId) {
            state.extensions.delete(clientId);
          }
          
          console.log(`[ExtensionBridge] Extension disconnected: ${extension}`);
          
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_GOODBYE_ACK',
            message: `Goodbye ${extension}`,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        default:
          console.log(`[ExtensionBridge] Unknown message type: ${body.type}`);
          return new Response(JSON.stringify({
            success: false,
            error: `Unknown message type: ${body.type}`,
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
      }
    }
    
    // ============================================================
    // GET /extension-bridge/info
    // API documentation for clients
    // ============================================================
    if (req.method === 'GET' && subPath === '/info') {
      return new Response(JSON.stringify({
        name: 'WCC Extension Bridge',
        version: '1.0.0',
        endpoints: {
          'GET /': 'Get current bridge state (for Admin Scanner)',
          'GET /state': 'Same as GET /',
          'POST /snapshot': 'Submit UI snapshot from extension',
          'POST /': 'Legacy message-based protocol (EXT_HELLO, EXT_UI_SNAPSHOT, etc)',
          'GET /info': 'This API documentation',
        },
        snapshotPayload: {
          extension: 'string (required) - extension name, e.g. "proton-vpn"',
          screen: 'string (optional) - screen name, e.g. "popup"',
          ts: 'number (optional) - timestamp',
          snapshot: 'object (required) - UI snapshot data',
        },
        example: {
          method: 'POST',
          url: '/snapshot',
          body: {
            extension: 'proton-vpn',
            screen: 'popup',
            ts: Date.now(),
            snapshot: {
              title: 'ProtonVPN',
              elements: [{ type: 'button', text: 'Connect' }],
            },
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Method not allowed or unknown path',
      path: subPath,
      availablePaths: ['/', '/state', '/snapshot', '/info'],
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('[ExtensionBridge] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
