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

// Generate request ID for tracing
function generateRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Helper to get path from URL
function getSubPath(url: URL): string {
  const fullPath = url.pathname;
  const match = fullPath.match(/\/extension-bridge(\/.*)?$/);
  return match?.[1] || '';
}

serve(async (req) => {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const subPath = getSubPath(url);
  const contentType = req.headers.get('content-type') || 'none';
  const contentLength = req.headers.get('content-length') || '0';
  
  console.log(`[ExtensionBridge] ============================================`);
  console.log(`[ExtensionBridge] ${req.method} ${subPath || '/'}`);
  console.log(`[ExtensionBridge] Request ID: ${requestId}`);
  console.log(`[ExtensionBridge] Content-Type: ${contentType}`);
  console.log(`[ExtensionBridge] Content-Length: ${contentLength}`);
  
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
        requestId,
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
      console.log(`[ExtensionBridge] 📥 POST /snapshot received`);
      
      let body: any;
      try {
        const rawBody = await req.text();
        console.log(`[ExtensionBridge] Raw body size: ${rawBody.length} bytes`);
        body = JSON.parse(rawBody);
      } catch (parseError) {
        console.error(`[ExtensionBridge] ❌ JSON parse error:`, parseError);
        return new Response(JSON.stringify({
          ok: false,
          requestId,
          error: 'Invalid JSON in request body',
          hint: 'Ensure Content-Type: application/json and valid JSON body',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Log received fields
      console.log(`[ExtensionBridge] 📊 Payload analysis:`);
      console.log(`[ExtensionBridge]   - extension: ${body.extension || 'MISSING'}`);
      console.log(`[ExtensionBridge]   - screen: ${body.screen || 'not set'}`);
      console.log(`[ExtensionBridge]   - snapshot present: ${!!body.snapshot}`);
      
      if (body.snapshot) {
        const s = body.snapshot;
        const elementsTotal = s.elements?.length || 0;
        const elementsWithRect = s.elements?.filter((e: any) => e.rect && e.rect.width > 0)?.length || 0;
        const hasScreenshot = !!s.screenshotDataUrl;
        const screenshotSize = s.screenshotDataUrl?.length || 0;
        
        console.log(`[ExtensionBridge]   - snapshot.url: ${s.url || 'MISSING'}`);
        console.log(`[ExtensionBridge]   - snapshot.viewport: ${JSON.stringify(s.viewport) || 'MISSING'}`);
        console.log(`[ExtensionBridge]   - snapshot.devicePixelRatio: ${s.devicePixelRatio || 'MISSING'}`);
        console.log(`[ExtensionBridge]   - hasScreenshotDataUrl: ${hasScreenshot} (${screenshotSize} chars)`);
        console.log(`[ExtensionBridge]   - elementsTotal: ${elementsTotal}`);
        console.log(`[ExtensionBridge]   - elementsWithRect: ${elementsWithRect}`);
        
        // Warnings for missing critical fields
        if (!hasScreenshot) {
          console.warn(`[ExtensionBridge] ⚠️ WARNING: No screenshotDataUrl - canvas will show wireframe only`);
        }
        if (elementsWithRect === 0) {
          console.warn(`[ExtensionBridge] ⚠️ WARNING: No elements have rect - cannot render overlays`);
        }
        if (!s.url) {
          console.warn(`[ExtensionBridge] ⚠️ WARNING: No snapshot.url - cannot verify source`);
        }
      }
      
      // Validate required fields
      if (!body.extension) {
        console.error('[ExtensionBridge] ❌ SNAPSHOT rejected: missing extension field');
        return new Response(JSON.stringify({
          ok: false,
          requestId,
          error: 'Missing required field: extension',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!body.snapshot) {
        console.error('[ExtensionBridge] ❌ SNAPSHOT rejected: missing snapshot field');
        return new Response(JSON.stringify({
          ok: false,
          requestId,
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
          requestId,
          error: `Database error: ${insertError.message}`,
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const duration = Date.now() - startTime;
      console.log(`[ExtensionBridge] ✅ SNAPSHOT saved to DB in ${duration}ms`);
      console.log(`[ExtensionBridge]   - id: ${savedSnapshot.id}`);
      console.log(`[ExtensionBridge]   - extension: ${body.extension}`);
      console.log(`[ExtensionBridge]   - screen: ${screen}`);
      console.log(`[ExtensionBridge]   - elements: ${elementsCount}`);
      console.log(`[ExtensionBridge]   - size: ${snapshotSize} bytes`);
      console.log(`[ExtensionBridge] ============================================`);
      
      return new Response(JSON.stringify({
        ok: true,
        requestId,
        id: savedSnapshot.id,
        storedAt: new Date(savedSnapshot.created_at).getTime(),
        snapshotSize,
        elementsCount,
        duration,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // ============================================================
    // POST /extension-bridge (legacy message-based protocol)
    // Handles typed messages: EXT_HELLO, EXT_UI_SNAPSHOT, EXT_PING, EXT_GOODBYE
    // ============================================================
    if (req.method === 'POST' && (subPath === '' || subPath === '/')) {
      console.log(`[ExtensionBridge] 📥 POST / (legacy protocol)`);
      
      let body: any;
      try {
        body = await req.json();
      } catch (parseError) {
        console.error(`[ExtensionBridge] ❌ JSON parse error:`, parseError);
        return new Response(JSON.stringify({
          success: false,
          requestId,
          error: 'Invalid JSON',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`[ExtensionBridge] Message type: ${body.type}`);
      
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
            requestId,
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
          const elementsWithRect = snapshot?.elements?.filter((e: any) => e.rect)?.length || 0;
          
          console.log(`[ExtensionBridge] 📊 EXT_UI_SNAPSHOT analysis:`);
          console.log(`[ExtensionBridge]   - extension: ${extension}`);
          console.log(`[ExtensionBridge]   - screen: ${screen}`);
          console.log(`[ExtensionBridge]   - snapshot.url: ${snapshot?.url || 'MISSING'}`);
          console.log(`[ExtensionBridge]   - hasScreenshot: ${!!snapshot?.screenshotDataUrl}`);
          console.log(`[ExtensionBridge]   - elementsTotal: ${elementsCount}`);
          console.log(`[ExtensionBridge]   - elementsWithRect: ${elementsWithRect}`);
          
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
              requestId,
              error: `Database error: ${insertError.message}`,
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          console.log(`[ExtensionBridge] ✅ SNAPSHOT via EXT_UI_SNAPSHOT saved: id=${savedSnapshot.id}`);
          
          return new Response(JSON.stringify({
            success: true,
            requestId,
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
            requestId,
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
            requestId,
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
            requestId,
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
        version: '2.1.0',
        description: 'Persistent bridge for browser extension UI snapshots',
        requestId,
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
          snapshot: {
            url: 'string (required) - source URL, e.g. chrome-extension://...',
            screenshotDataUrl: 'string (optional) - base64 PNG screenshot',
            viewport: '{ width, height } (required)',
            devicePixelRatio: 'number (required)',
            elements: 'array of { tag, id, selector, classes, text, rect: {x,y,width,height}, styles }',
          },
        },
        example: {
          method: 'POST',
          url: '/snapshot',
          body: {
            extension: 'proton-vpn',
            screen: 'popup',
            ts: Date.now(),
            snapshot: {
              url: 'chrome-extension://jplgfhpmjnbigmhklmmbgecoobifkmpa/popup.html',
              viewport: { width: 360, height: 600 },
              devicePixelRatio: 2,
              elements: [
                { tag: 'BUTTON', id: 'connect-btn', selector: 'button#connect-btn', classes: ['btn', 'primary'], text: 'Connect', rect: { x: 100, y: 200, width: 120, height: 40 } },
              ],
            },
          },
        },
        response: {
          ok: true,
          requestId: 'req-abc123',
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
      requestId,
      path: subPath,
      availablePaths: ['/', '/state', '/snapshot', '/info'],
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error(`[ExtensionBridge] ❌ Error:`, error);
    return new Response(JSON.stringify({
      success: false,
      requestId,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
