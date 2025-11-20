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
    const { listing_id, buyer_wallet, tx_signature } = await req.json();
    
    console.log('[buy_nft] 🎯 Request:', { listing_id, buyer_wallet, tx_signature });
    
    if (!listing_id || !buyer_wallet || !tx_signature) {
      throw new Error('Missing required fields: listing_id, buyer_wallet, tx_signature');
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('[buy_nft] 📡 Fetching listing...');
    
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
    
    console.log('[buy_nft] ✅ Listing found');
    console.log('[buy_nft] 🔍 Verifying transaction on-chain...');

    // Verify the transaction on Solana blockchain
    const solanaRpcUrl = 'https://api.devnet.solana.com';
    const txResponse = await fetch(solanaRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          tx_signature,
          { encoding: 'json', maxSupportedTransactionVersion: 0 }
        ]
      })
    });

    const txData = await txResponse.json();
    
    if (!txData.result) {
      throw new Error('Transaction not found on blockchain');
    }

    // Verify transaction details
    const meta = txData.result.meta;
    if (meta.err) {
      throw new Error('Transaction failed on blockchain');
    }

    // Extract pre and post balances to verify transfer
    const accountKeys = txData.result.transaction.message.accountKeys;
    const preBalances = meta.preBalances;
    const postBalances = meta.postBalances;

    // Find buyer and seller account indices
    let buyerFound = false;
    let sellerFound = false;
    let transferredAmount = 0;

    for (let i = 0; i < accountKeys.length; i++) {
      const key = typeof accountKeys[i] === 'string' ? accountKeys[i] : accountKeys[i].pubkey;
      
      if (key === buyer_wallet) {
        buyerFound = true;
        const buyerDecrease = preBalances[i] - postBalances[i];
        transferredAmount = buyerDecrease;
      }
      
      if (key === listing.seller_wallet) {
        sellerFound = true;
        const sellerIncrease = postBalances[i] - preBalances[i];
        // Verify seller received the expected amount
        if (sellerIncrease < listing.price_lamports * 0.99) { // Allow 1% tolerance for fees
          throw new Error('Seller did not receive expected amount');
        }
      }
    }

    if (!buyerFound || !sellerFound) {
      throw new Error('Transaction does not involve buyer and seller');
    }

    console.log('[buy_nft] ✅ Transaction verified on-chain');
    console.log('[buy_nft] 💰 Amount transferred:', transferredAmount, 'lamports');
    console.log('[buy_nft] 🔄 Updating listing to sold...');
    
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
          tx_signature,
          updated_at: new Date().toISOString()
        })
      }
    );
    
    if (!updateListingResponse.ok) {
      const error = await updateListingResponse.text();
      console.error('[buy_nft] ❌ Failed to update listing:', error);
      throw new Error(`Failed to update listing: ${error}`);
    }
    
    console.log('[buy_nft] ✅ Listing marked as sold');
    console.log('[buy_nft] 🔄 Updating NFT owner...');
    
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
      console.error('[buy_nft] ❌ Failed to update NFT:', error);
      throw new Error(`Failed to update NFT: ${error}`);
    }
    
    console.log('[buy_nft] ✅ Purchase complete!');
    console.log('[buy_nft] 🎉 Blockchain transaction verified and NFT ownership transferred');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        tx_signature,
        message: 'NFT purchased successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[buy_nft] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});