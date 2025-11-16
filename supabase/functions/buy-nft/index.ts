import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listing_id, buyer_wallet } = await req.json();
    
    console.log('[buy-nft] Request:', { listing_id, buyer_wallet });
    
    if (!listing_id || !buyer_wallet) {
      throw new Error('Missing required fields: listing_id, buyer_wallet');
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get listing
    const { data: listing, error: fetchError } = await supabase
      .from('nft_listings')
      .select('*')
      .eq('id', listing_id)
      .eq('status', 'active')
      .single();
    
    if (fetchError || !listing) {
      console.error('[buy-nft] Listing not found:', fetchError);
      throw new Error('Listing not found or inactive');
    }
    
    // Validation
    if (listing.seller_wallet === buyer_wallet) {
      throw new Error('Cannot buy your own NFT');
    }
    
    // ===== STUB VERSION: No real Solana transactions =====
    // TODO: Replace with actual Solana transaction:
    // 1. Transfer price_lamports * 0.9 to seller_wallet
    // 2. Transfer price_lamports * 0.1 to PLATFORM_FEE_WALLET
    // 3. Transfer NFT ownership from seller to buyer
    
    const stub_tx_signature = `stub_${Date.now()}_${listing_id.slice(0, 8)}`;
    
    console.log('[buy-nft] STUB MODE: Simulating purchase:', {
      nft_mint: listing.nft_mint,
      price_lamports: listing.price_lamports,
      seller_receives: listing.seller_receives_lamports,
      platform_fee: listing.fee_lamports,
      buyer: buyer_wallet
    });
    
    // Update listing as sold
    const { error: updateListingError } = await supabase
      .from('nft_listings')
      .update({
        status: 'sold',
        buyer_wallet,
        tx_signature: stub_tx_signature,
        updated_at: new Date().toISOString()
      })
      .eq('id', listing_id);
    
    if (updateListingError) {
      console.error('[buy-nft] Update listing error:', updateListingError);
      throw updateListingError;
    }
    
    // Update owner in minted_themes
    const { error: updateOwnerError } = await supabase
      .from('minted_themes')
      .update({
        owner_address: buyer_wallet,
        is_listed: false,
        price_lamports: null,
        listing_id: null
      })
      .eq('mint_address', listing.nft_mint);
    
    if (updateOwnerError) {
      console.error('[buy-nft] Update owner error:', updateOwnerError);
      throw updateOwnerError;
    }
    
    console.log('[buy-nft] Success:', stub_tx_signature);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        tx_signature: stub_tx_signature,
        warning: 'STUB MODE: No real blockchain transaction' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[buy-nft] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
