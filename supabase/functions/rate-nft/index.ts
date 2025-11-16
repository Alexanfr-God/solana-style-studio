import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    const body = await req.json();
    
    console.log('[rate-nft] ✅ MINIMAL TEST VERSION');
    console.log('[rate-nft] Request received:', body);
    console.log('[rate-nft] Method:', req.method);
    console.log('[rate-nft] Headers:', Object.fromEntries(req.headers.entries()));
    
    const { nft_mint, user_wallet, rating } = body;
    
    // Validation
    if (!nft_mint || !user_wallet || !rating) {
      console.log('[rate-nft] ❌ Validation failed: missing fields');
      throw new Error('Missing required fields: nft_mint, user_wallet, rating');
    }
    
    if (rating < 1 || rating > 5) {
      console.log('[rate-nft] ❌ Validation failed: invalid rating');
      throw new Error('Rating must be between 1 and 5');
    }
    
    console.log('[rate-nft] ✅ Validation passed');
    console.log('[rate-nft] ⚠️ SKIPPING DATABASE OPERATIONS (test mode)');
    console.log('[rate-nft] Would upsert:', { nft_mint, user_wallet, rating });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Minimal test version works - function deployed successfully!',
        received: { nft_mint, user_wallet, rating }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[rate-nft] ❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
