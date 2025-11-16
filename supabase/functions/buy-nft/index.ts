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
    const { listing_id, buyer_wallet } = await req.json();
    
    console.log('[buy-nft] 🎯 Request:', { listing_id, buyer_wallet });
    
    if (!listing_id || !buyer_wallet) {
      throw new Error('Missing required fields: listing_id, buyer_wallet');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('[buy-nft] 📡 Fetching listing...');
    
    // Get listing
    const listingResponse = await fetch(
      `${supabaseUrl}/rest/v1/nft_listings?id=eq.${listing_id}&status=eq.active&select=*`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        }
      }
    );
    
    if (!listingResponse.ok) {
      throw new Error('Failed to fetch listing');
    }
    
    const listings = await listingResponse.json();
    
    if (listings.length === 0) {
      throw new Error('Listing not found or inactive');
    }
    
    const listing = listings[0];
    
    // Validation: buyer cannot be seller
    if (listing.seller_wallet === buyer_wallet) {
      throw new Error('Cannot buy your own NFT');
    }
    
    console.log('[buy-nft] ✅ Listing found');
    console.log('[buy-nft] 💰 Processing purchase (STUB MODE)...');
    
    // STUB: In production, here would be Solana transaction
    const stubTxSignature = `stub_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('[buy-nft] 🔄 Updating listing to sold...');
    
    // Update listing as sold
    const updateListingResponse = await fetch(
      `${supabaseUrl}/rest/v1/nft_listings?id=eq.${listing_id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'sold',
          buyer_wallet,
          tx_signature: stubTxSignature,
          updated_at: new Date().toISOString()
        })
      }
    );
    
    if (!updateListingResponse.ok) {
      const error = await updateListingResponse.text();
      console.error('[buy-nft] ❌ Failed to update listing:', error);
      throw new Error(`Failed to update listing: ${error}`);
    }
    
    console.log('[buy-nft] ✅ Listing marked as sold');
    console.log('[buy-nft] 🔄 Updating NFT owner...');
    
    // Update minted_themes
    const updateNftResponse = await fetch(
      `${supabaseUrl}/rest/v1/minted_themes?mint_address=eq.${listing.nft_mint}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_address: buyer_wallet,
          is_listed: false,
          price_lamports: null,
          listing_id: null
        })
      }
    );
    
    if (!updateNftResponse.ok) {
      const error = await updateNftResponse.text();
      console.error('[buy-nft] ❌ Failed to update NFT:', error);
      throw new Error(`Failed to update NFT: ${error}`);
    }
    
    console.log('[buy-nft] ✅ Purchase complete (STUB MODE)');
    console.log('[buy-nft] ⚠️ Note: No actual blockchain transaction was made');
    
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
