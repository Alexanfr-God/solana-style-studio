import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MIN_PRICE = 100_000_000; // 0.1 SOL

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nft_mint, seller_wallet, price_lamports } = await req.json();
    
    console.log('[create-listing] Request:', { nft_mint, seller_wallet, price_lamports });
    
    // Validation
    if (!nft_mint || !seller_wallet || !price_lamports) {
      throw new Error('Missing required fields: nft_mint, seller_wallet, price_lamports');
    }
    
    if (price_lamports < MIN_PRICE) {
      throw new Error(`Price too low. Minimum: ${MIN_PRICE} lamports (0.1 SOL)`);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check if NFT exists and verify ownership
    const { data: nftData, error: nftError } = await supabase
      .from('minted_themes')
      .select('owner_address, is_listed')
      .eq('mint_address', nft_mint)
      .single();
    
    if (nftError || !nftData) {
      console.error('[create-listing] NFT not found:', nftError);
      throw new Error('NFT not found');
    }
    
    if (nftData.owner_address !== seller_wallet) {
      throw new Error('You are not the owner of this NFT');
    }
    
    if (nftData.is_listed) {
      throw new Error('NFT is already listed');
    }
    
    // Create listing
    const { data: listing, error: insertError } = await supabase
      .from('nft_listings')
      .insert({
        nft_mint,
        seller_wallet,
        price_lamports,
        currency: 'SOL',
        status: 'active'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[create-listing] Insert error:', insertError);
      throw insertError;
    }
    
    // Update minted_themes
    const { error: updateError } = await supabase
      .from('minted_themes')
      .update({
        is_listed: true,
        price_lamports,
        listing_id: listing.id
      })
      .eq('mint_address', nft_mint);
    
    if (updateError) {
      console.error('[create-listing] Update error:', updateError);
      throw updateError;
    }
    
    console.log('[create-listing] Success:', listing.id);
    
    return new Response(
      JSON.stringify({ success: true, listing }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[create-listing] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
