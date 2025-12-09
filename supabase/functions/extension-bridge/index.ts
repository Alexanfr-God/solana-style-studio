import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// In-memory storage for bridge state
// Note: This persists only within a single edge function instance
// For production, consider using Supabase Realtime or a database
interface BridgeState {
  extensions: Map<string, { name: string; version: string; connectedAt: number }>;
  lastSnapshot: any | null;
  lastSnapshotFrom: string | null;
  lastSnapshotAt: number | null;
}

const state: BridgeState = {
  extensions: new Map(),
  lastSnapshot: null,
  lastSnapshotFrom: null,
  lastSnapshotAt: null,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  try {
    // GET /extension-bridge - Get current state
    if (req.method === 'GET') {
      console.log('[ExtensionBridge] GET state request');
      
      const extensions = Array.from(state.extensions.entries()).map(([id, ext]) => ({
        id,
        ...ext,
      }));
      
      return new Response(JSON.stringify({
        success: true,
        extensions,
        hasSnapshot: state.lastSnapshot !== null,
        lastSnapshotFrom: state.lastSnapshotFrom,
        lastSnapshotAt: state.lastSnapshotAt,
        snapshot: state.lastSnapshot,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // POST /extension-bridge - Receive messages from extensions
    if (req.method === 'POST') {
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
          
          console.log(`[ExtensionBridge] Extension connected: ${extension} v${version}`);
          
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_WELCOME',
            clientId: id,
            message: `Welcome ${extension} v${version}`,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        case 'EXT_UI_SNAPSHOT': {
          const { extension, screen, snapshot, clientId } = body;
          
          state.lastSnapshot = snapshot;
          state.lastSnapshotFrom = extension;
          state.lastSnapshotAt = Date.now();
          
          console.log(`[ExtensionBridge] Snapshot received from ${extension}, screen: ${screen}, size: ${JSON.stringify(snapshot).length} bytes`);
          
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_SNAPSHOT_ACK',
            message: 'Snapshot received',
            snapshotSize: JSON.stringify(snapshot).length,
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
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
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
