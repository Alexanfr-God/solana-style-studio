
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { userId, styleData } = await req.json();

    // Validate input
    if (!userId || !styleData) {
      console.error('Missing required fields:', { userId, styleData });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if a similar record already exists
    const { data: existingData, error: searchError } = await supabase
      .from('wallet_skins')
      .select('id')
      .eq('user_id', userId)
      .eq('style_data', styleData);

    if (searchError) {
      console.error('Error searching for existing wallet skin:', searchError);
      return new Response(JSON.stringify({ error: searchError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If a matching record exists, return the existing skinId
    if (existingData && existingData.length > 0) {
      console.log('Found existing wallet skin, returning:', existingData[0].id);
      return new Response(JSON.stringify({ 
        skinId: existingData[0].id, 
        success: true,
        isExisting: true
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If no matching record exists, create a new one
    // Generate a unique ID for the skin
    const skinId = nanoid();

    // Insert the wallet skin into the database
    const { data, error } = await supabase
      .from('wallet_skins')
      .insert({
        id: skinId,
        user_id: userId,
        style_data: styleData
      });

    if (error) {
      console.error('Error inserting wallet skin:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Successfully created new wallet skin with ID:', skinId);
    
    // Return success response with skinId
    return new Response(JSON.stringify({ 
      skinId, 
      success: true 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
