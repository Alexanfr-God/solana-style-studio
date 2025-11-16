import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { nft_mint, user_wallet, rating } = await req.json();

    // Validate required fields
    if (!nft_mint || !user_wallet || rating === undefined) {
      console.error('[rate_nft] Missing required fields:', { nft_mint, user_wallet, rating });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: nft_mint, user_wallet, rating' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate rating range
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.error('[rate_nft] Invalid rating value:', rating);
      return new Response(
        JSON.stringify({ error: 'Rating must be a number between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[rate_nft] Processing rating:', { nft_mint, user_wallet, rating });

    // UPSERT rating (insert new or update existing)
    const { data, error } = await supabase
      .from('nft_ratings')
      .upsert({
        nft_mint,
        user_wallet,
        rating,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'nft_mint,user_wallet' // unique index on these columns
      })
      .select()
      .single();

    if (error) {
      console.error('[rate_nft] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save rating', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[rate_nft] Rating saved successfully:', data);

    // Fetch updated statistics (calculated by trigger)
    const { data: nftData, error: nftError } = await supabase
      .from('minted_themes')
      .select('rating_avg, rating_count')
      .eq('mint_address', nft_mint)
      .maybeSingle();

    if (nftError) {
      console.warn('[rate_nft] Failed to fetch updated stats:', nftError);
    }

    console.log('[rate_nft] Updated stats:', nftData);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully rated ${rating} stars`,
        rating: data,
        updated_stats: nftData || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[rate_nft] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
