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
    const { listing_id, seller_wallet } = await req.json();
    
    console.log('[cancel-listing] 🎯 Request:', { listing_id, seller_wallet });
    
    if (!listing_id || !seller_wallet) {
      throw new Error('Missing required fields: listing_id, seller_wallet');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('[cancel-listing] 📡 Fetching listing...');
    
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
    
    // Validation: only seller can cancel
    if (listing.seller_wallet !== seller_wallet) {
      throw new Error('Only the seller can cancel this listing');
    }
    
    console.log('[cancel-listing] ✅ Listing found');
    console.log('[cancel-listing] 🔄 Cancelling listing...');
    
    // Update listing as cancelled
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
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
      }
    );
    
    if (!updateListingResponse.ok) {
      const error = await updateListingResponse.text();
      console.error('[cancel-listing] ❌ Failed to update listing:', error);
      throw new Error(`Failed to update listing: ${error}`);
    }
    
    console.log('[cancel-listing] ✅ Listing cancelled');
    console.log('[cancel-listing] 🔄 Updating NFT status...');
    
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
          is_listed: false,
          price_lamports: null,
          listing_id: null
        })
      }
    );
    
    if (!updateNftResponse.ok) {
      const error = await updateNftResponse.text();
      console.error('[cancel-listing] ❌ Failed to update NFT:', error);
      throw new Error(`Failed to update NFT: ${error}`);
    }
    
    console.log('[cancel-listing] ✅ Success');
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[cancel-listing] ❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
