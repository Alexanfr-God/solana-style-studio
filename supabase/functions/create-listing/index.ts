import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MIN_PRICE_LAMPORTS = 100000000; // 0.1 SOL

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nft_mint, seller_wallet, price_lamports } = await req.json();
    
    console.log('[create-listing] 🎯 Request:', { nft_mint, seller_wallet, price_lamports });
    
    // Validation
    if (!nft_mint || !seller_wallet || !price_lamports) {
      throw new Error('Missing required fields: nft_mint, seller_wallet, price_lamports');
    }
    
    if (price_lamports < MIN_PRICE_LAMPORTS) {
      throw new Error(`Price must be at least ${MIN_PRICE_LAMPORTS} lamports (0.1 SOL)`);
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('[create-listing] 📡 Checking NFT ownership...');
    
    // Check NFT ownership and listing status
    const nftResponse = await fetch(
      `${supabaseUrl}/rest/v1/minted_themes?mint_address=eq.${nft_mint}&select=*`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        }
      }
    );
    
    if (!nftResponse.ok) {
      throw new Error('Failed to fetch NFT');
    }
    
    const nfts = await nftResponse.json();
    
    if (nfts.length === 0) {
      throw new Error('NFT not found');
    }
    
    const nft = nfts[0];
    
    if (nft.owner_address !== seller_wallet) {
      throw new Error('You do not own this NFT');
    }
    
    if (nft.is_listed) {
      throw new Error('NFT is already listed');
    }
    
    console.log('[create-listing] ✅ Ownership verified');
    console.log('[create-listing] 💾 Creating listing...');
    
    // Create listing
    const listingResponse = await fetch(`${supabaseUrl}/rest/v1/nft_listings`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nft_mint,
        seller_wallet,
        price_lamports,
        status: 'active'
      })
    });
    
    if (!listingResponse.ok) {
      const error = await listingResponse.text();
      console.error('[create-listing] ❌ Failed to create listing:', error);
      throw new Error(`Failed to create listing: ${error}`);
    }
    
    const listings = await listingResponse.json();
    const listing = listings[0];
    
    console.log('[create-listing] ✅ Listing created:', listing.id);
    console.log('[create-listing] 🔄 Updating NFT status...');
    
    // Update minted_themes
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/minted_themes?mint_address=eq.${nft_mint}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_listed: true,
          price_lamports,
          listing_id: listing.id
        })
      }
    );
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('[create-listing] ❌ Failed to update NFT:', error);
      throw new Error(`Failed to update NFT: ${error}`);
    }
    
    console.log('[create-listing] ✅ Success');
    
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
