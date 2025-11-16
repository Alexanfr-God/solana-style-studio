import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const { nft_mint, user_wallet, rating } = await req.json();
    
    console.log('[rate-nft] Request:', { nft_mint, user_wallet, rating });
    
    // Validation
    if (!nft_mint || !user_wallet || !rating) {
      throw new Error('Missing required fields: nft_mint, user_wallet, rating');
    }
    
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Upsert rating (insert or update if exists)
    const { error: upsertError } = await supabase
      .from('nft_ratings')
      .upsert({
        nft_mint,
        user_wallet,
        rating,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'nft_mint,user_wallet'
      });
    
    if (upsertError) {
      console.error('[rate-nft] Upsert error:', upsertError);
      throw upsertError;
    }
    
    // Stats will be updated automatically via trigger
    console.log('[rate-nft] Success:', { nft_mint, user_wallet, rating });
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[rate-nft] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
