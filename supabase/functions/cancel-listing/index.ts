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
    const { listing_id, seller_wallet } = await req.json();
    
    console.log('[cancel-listing] Request:', { listing_id, seller_wallet });
    
    if (!listing_id || !seller_wallet) {
      throw new Error('Missing required fields: listing_id, seller_wallet');
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
      console.error('[cancel-listing] Listing not found:', fetchError);
      throw new Error('Listing not found or inactive');
    }
    
    // Validation: only seller can cancel
    if (listing.seller_wallet !== seller_wallet) {
      throw new Error('Only the seller can cancel this listing');
    }
    
    // Update listing as cancelled
    const { error: updateListingError } = await supabase
      .from('nft_listings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', listing_id);
    
    if (updateListingError) {
      console.error('[cancel-listing] Update listing error:', updateListingError);
      throw updateListingError;
    }
    
    // Update minted_themes
    const { error: updateNftError } = await supabase
      .from('minted_themes')
      .update({
        is_listed: false,
        price_lamports: null,
        listing_id: null
      })
      .eq('mint_address', listing.nft_mint);
    
    if (updateNftError) {
      console.error('[cancel-listing] Update NFT error:', updateNftError);
      throw updateNftError;
    }
    
    console.log('[cancel-listing] Success:', listing_id);
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[cancel-listing] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
