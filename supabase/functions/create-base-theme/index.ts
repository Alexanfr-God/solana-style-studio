import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load defaultTheme.json from the public folder
    const defaultThemeUrl = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-assets/defaultTheme.json';
    
    let themeData;
    try {
      const themeResponse = await fetch(defaultThemeUrl);
      if (!themeResponse.ok) {
        throw new Error(`Failed to fetch default theme: ${themeResponse.statusText}`);
      }
      themeData = await themeResponse.json();
    } catch (error) {
      console.error('Error loading default theme:', error);
      // Fallback to a minimal theme structure
      themeData = {
        name: "Default Theme",
        version: "1.0.0",
        homeLayer: {
          background: { backgroundColor: "#1A1A1A" }
        }
      };
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Upsert theme (create or update)
    const { data, error } = await supabase
      .from('user_themes')
      .upsert({
        user_id: userId,
        theme_data: themeData,
        version: 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Theme initialized for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        theme: data,
        message: 'Theme initialized successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-base-theme:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create theme',
        details: error.toString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
