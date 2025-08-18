import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportThemeRequest {
  themeId: string;
}

interface ExportThemeResponse {
  url: string;
  themeId: string;
  walletTarget: 'phantom' | 'metamask' | 'demo';
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

function logRequest(themeId: string, startTime: number, status: number) {
  const duration = Date.now() - startTime;
  console.log(`[export_theme] themeId=${themeId}, duration_ms=${duration}, status=${status}`);
}

Deno.serve(async (req) => {
  const startTime = Date.now();
  let themeId = '';

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get authorization header for RLS
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      logRequest(themeId || 'unknown', startTime, 401);
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create client with user's auth for RLS
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          authorization: authHeader,
        },
      },
    });

    // Handle GET request - direct JSON response
    if (req.method === 'GET') {
      const url = new URL(req.url);
      themeId = url.searchParams.get('themeId') || '';

      if (!themeId) {
        logRequest('', startTime, 400);
        return new Response(
          JSON.stringify({ error: 'themeId parameter is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Validate UUID format
      if (!validateUUID(themeId)) {
        logRequest(themeId, startTime, 400);
        return new Response(
          JSON.stringify({ error: 'Invalid themeId format. Must be a valid UUID.' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`[GET] Fetching theme: ${themeId}`);

      // Fetch theme with RLS (user can only access their own themes)
      const { data: theme, error: themeError } = await supabaseClient
        .from('themes')
        .select('current_theme')
        .eq('id', themeId)
        .single();

      if (themeError) {
        console.error('Theme fetch error:', themeError);
        const status = themeError.code === 'PGRST116' ? 404 : 403;
        const errorMessage = themeError.code === 'PGRST116' ? 'Theme not found' : 'Theme not found or access denied';
        
        logRequest(themeId, startTime, status);
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { 
            status, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!theme || !theme.current_theme) {
        logRequest(themeId, startTime, 404);
        return new Response(
          JSON.stringify({ error: 'Theme not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      logRequest(themeId, startTime, 200);
      
      // Return current_theme directly as JSON
      return new Response(
        JSON.stringify(theme.current_theme),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle POST request - existing behavior (unchanged)
    if (req.method !== 'POST') {
      logRequest(themeId, startTime, 405);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body for POST
    const { themeId: postThemeId }: ExportThemeRequest = await req.json();
    themeId = postThemeId;

    if (!themeId) {
      logRequest('', startTime, 400);
      return new Response(
        JSON.stringify({ error: 'themeId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate UUID format for POST as well
    if (!validateUUID(themeId)) {
      logRequest(themeId, startTime, 400);
      return new Response(
        JSON.stringify({ error: 'Invalid themeId format. Must be a valid UUID.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[POST] Fetching theme: ${themeId}`);

    // Create service role client for storage operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch theme with RLS (user can only access their own themes)
    const { data: theme, error: themeError } = await supabaseClient
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();

    if (themeError) {
      console.error('Theme fetch error:', themeError);
      logRequest(themeId, startTime, 404);
      return new Response(
        JSON.stringify({ error: 'Theme not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!theme) {
      logRequest(themeId, startTime, 404);
      return new Response(
        JSON.stringify({ error: 'Theme not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine wallet target from theme metadata
    const walletTarget = theme.current_theme?.meta?.walletTarget || 'demo';

    // Prepare export payload
    const exportPayload = {
      theme: theme.current_theme,
      walletTarget,
      exportedAt: new Date().toISOString(),
      themeId: theme.id,
      name: theme.name,
    };

    console.log('Preparing export for wallet target:', walletTarget);

    // Get user ID for file path
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      logRequest(themeId, startTime, 401);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Upload to storage bucket with user ID in path for RLS
    const filePath = `${user.id}/exports/${themeId}.json`;
    const fileContent = JSON.stringify(exportPayload, null, 2);

    console.log('Uploading to storage path:', filePath);

    const { error: uploadError } = await supabaseService.storage
      .from('exports')
      .upload(filePath, fileContent, {
        contentType: 'application/json',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      logRequest(themeId, startTime, 500);
      return new Response(
        JSON.stringify({ error: 'Failed to save export file' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate signed URL (7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabaseService.storage
      .from('exports')
      .createSignedUrl(filePath, 7 * 24 * 60 * 60); // 7 days in seconds

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      logRequest(themeId, startTime, 500);
      return new Response(
        JSON.stringify({ error: 'Failed to generate download URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response: ExportThemeResponse = {
      url: signedUrlData.signedUrl,
      themeId,
      walletTarget: walletTarget as 'phantom' | 'metamask' | 'demo',
    };

    console.log('Export successful for theme:', themeId, 'wallet target:', walletTarget);

    logRequest(themeId, startTime, 200);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Export theme error:', error);
    logRequest(themeId || 'unknown', startTime, 500);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
