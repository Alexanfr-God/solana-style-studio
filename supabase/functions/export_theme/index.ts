
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Parse request body
    const { themeId }: ExportThemeRequest = await req.json();

    if (!themeId) {
      return new Response(
        JSON.stringify({ error: 'themeId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get authorization header for RLS
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
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

    // Create service role client for storage operations
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching theme:', themeId);

    // Fetch theme with RLS (user can only access their own themes)
    const { data: theme, error: themeError } = await supabaseClient
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();

    if (themeError) {
      console.error('Theme fetch error:', themeError);
      return new Response(
        JSON.stringify({ error: 'Theme not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!theme) {
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

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Export theme error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
