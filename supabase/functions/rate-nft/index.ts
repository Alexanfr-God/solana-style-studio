import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nft_mint, user_wallet, rating } = await req.json();
    
    console.log('[rate-nft] 🎯 Request:', { nft_mint, user_wallet, rating });
    
    // Validation
    if (!nft_mint || !user_wallet || !rating) {
      console.log('[rate-nft] ❌ Missing fields');
      throw new Error('Missing required fields: nft_mint, user_wallet, rating');
    }
    
    if (rating < 1 || rating > 5) {
      console.log('[rate-nft] ❌ Invalid rating');
      throw new Error('Rating must be between 1 and 5');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('[rate-nft] 📡 Upserting to database...');
    
    // Upsert rating using REST API with merge-duplicates
    const response = await fetch(`${supabaseUrl}/rest/v1/nft_ratings`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        nft_mint,
        user_wallet,
        rating,
        updated_at: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('[rate-nft] ❌ Database error:', error);
      throw new Error(`Database error: ${error}`);
    }
    
    console.log('[rate-nft] ✅ Rating saved successfully');
    console.log('[rate-nft] 🔄 Trigger will update minted_themes stats');
    
    return new Response(
      JSON.stringify({ success: true }),
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
