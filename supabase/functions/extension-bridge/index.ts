import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, Authorization',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Supabase client for DB operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// In-memory storage for connected extensions (ephemeral, but that's OK)
interface ExtensionInfo {
  name: string;
  version: string;
  connectedAt: number;
}
const connectedExtensions = new Map<string, ExtensionInfo>();

// Helper to get path from URL
function getSubPath(url: URL): string {
  const fullPath = url.pathname;
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
    // Returns current bridge state including latest snapshot from DB
    // ============================================================
    if (req.method === 'GET' && (subPath === '' || subPath === '/' || subPath === '/state')) {
      console.log('[ExtensionBridge] GET state request');
      
      // Get latest snapshot from database
      const { data: latestSnapshot, error: dbError } = await supabase
        .from('extension_bridge_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (dbError) {
        console.error('[ExtensionBridge] DB error:', dbError);
      }
      
      const extensions = Array.from(connectedExtensions.entries()).map(([id, ext]) => ({
        id,
        ...ext,
      }));
      
      // Include a preview of the snapshot for debugging
      const snapshotPreview = latestSnapshot?.snapshot 
        ? JSON.stringify(latestSnapshot.snapshot).slice(0, 500) + '...'
        : null;
      
      return new Response(JSON.stringify({
        success: true,
        extensions,
        hasSnapshot: latestSnapshot !== null,
        lastSnapshotFrom: latestSnapshot?.extension_id || null,
        lastSnapshotAt: latestSnapshot ? new Date(latestSnapshot.created_at).getTime() : null,
        lastScreen: latestSnapshot?.screen || null,
        elementsCount: latestSnapshot?.elements_count || 0,
        snapshotId: latestSnapshot?.id || null,
        snapshotPreview,
        snapshot: latestSnapshot?.snapshot || null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // ============================================================
    // POST /extension-bridge/snapshot
    // Direct endpoint for extensions to send UI snapshots
    // Persists to database for durability
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
      const elementsCount = body.snapshot?.elements?.length || 0;
      
      // Save to database for persistence
      const { data: savedSnapshot, error: insertError } = await supabase
        .from('extension_bridge_snapshots')
        .insert({
          extension_id: body.extension,
          screen: screen,
          snapshot: body.snapshot,
          elements_count: elementsCount,
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('[ExtensionBridge] ❌ DB insert error:', insertError);
        return new Response(JSON.stringify({
          ok: false,
          error: `Database error: ${insertError.message}`,
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`[ExtensionBridge] ✅ SNAPSHOT saved to DB: id=${savedSnapshot.id}, extension=${body.extension}, screen=${screen}, elements=${elementsCount}, size=${snapshotSize} bytes`);
      
      return new Response(JSON.stringify({
        ok: true,
        id: savedSnapshot.id,
        storedAt: new Date(savedSnapshot.created_at).getTime(),
        snapshotSize,
        elementsCount,
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
          
          connectedExtensions.set(id, {
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
            snapshotEndpoint: '/snapshot',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        case 'EXT_UI_SNAPSHOT': {
          const { extension, screen, snapshot } = body;
          const snapshotSize = JSON.stringify(snapshot).length;
          const elementsCount = snapshot?.elements?.length || 0;
          
          // Save to database
          const { data: savedSnapshot, error: insertError } = await supabase
            .from('extension_bridge_snapshots')
            .insert({
              extension_id: extension,
              screen: screen || 'unknown',
              snapshot: snapshot,
              elements_count: elementsCount,
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('[ExtensionBridge] ❌ DB insert error:', insertError);
            return new Response(JSON.stringify({
              success: false,
              error: `Database error: ${insertError.message}`,
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          console.log(`[ExtensionBridge] ✅ SNAPSHOT via message saved to DB: id=${savedSnapshot.id}, extension=${extension}, screen=${screen || 'unknown'}, elements=${elementsCount}`);
          
          return new Response(JSON.stringify({
            success: true,
            type: 'WCC_SNAPSHOT_ACK',
            message: 'Snapshot received and saved',
            id: savedSnapshot.id,
            snapshotSize,
            elementsCount,
            storedAt: new Date(savedSnapshot.created_at).getTime(),
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
            connectedExtensions.delete(clientId);
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
        version: '2.0.0',
        description: 'Persistent bridge for browser extension UI snapshots',
        endpoints: {
          'GET /': 'Get current bridge state with latest snapshot from DB',
          'GET /state': 'Same as GET /',
          'POST /snapshot': 'Submit UI snapshot from extension (persisted to DB)',
          'POST /': 'Legacy message-based protocol (EXT_HELLO, EXT_UI_SNAPSHOT, etc)',
          'GET /info': 'This API documentation',
        },
        snapshotPayload: {
          extension: 'string (required) - extension name, e.g. "proton-vpn"',
          screen: 'string (optional) - screen name, e.g. "popup"',
          ts: 'number (optional) - timestamp',
          snapshot: 'object (required) - UI snapshot data with elements array',
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
              url: 'chrome-extension://...',
              elements: [
                { tag: 'BUTTON', id: 'connect-btn', classes: ['btn', 'primary'], text: 'Connect' },
              ],
            },
          },
        },
        response: {
          ok: true,
          id: 'uuid-of-saved-snapshot',
          storedAt: 1733700000000,
          snapshotSize: 1234,
          elementsCount: 15,
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
