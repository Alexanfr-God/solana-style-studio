/**
 * Buy NFT Edge Function
 * 
 * Handles NFT purchase verification and database updates.
 * Frontend sends a transaction with TWO transfers:
 *   - 90% to seller
 *   - 10% to escrow (platform fee)
 * 
 * This function:
 * 1. Verifies the transaction on-chain (via RPC fetch)
 * 2. Checks that buyer paid, seller received 90%, escrow received 10%
 * 3. Updates database (nft_listings, minted_themes)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Validation
    if (!listing_id || !buyer_wallet || !tx_signature) {
      throw new Error('Missing required fields: listing_id, buyer_wallet, tx_signature');
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Hardcoded escrow public key (must match frontend MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY)
    const ESCROW_PUBLIC_KEY = 'HzVB3L8hRALUq37WRNbj3RDjfm2fYRBVJQvxMYCQ6Qfx';

    console.log('[buy_nft] 🏦 Escrow public key:', ESCROW_PUBLIC_KEY);

    // Validate: buyer cannot be escrow itself
    if (buyer_wallet === ESCROW_PUBLIC_KEY) {
      throw new Error('Cannot purchase NFT using the escrow wallet itself. Please use a different wallet.');
    }

    // Fetch the NFT listing
    const { data: listing, error: listingError } = await supabase
      .from('nft_listings')
      .select('*')
      .eq('id', listing_id)
      .eq('status', 'active')
      .single();

    if (listingError || !listing) {
      throw new Error(`Listing not found or already sold: ${listingError?.message}`);
    }

    console.log('[buy_nft] 📦 NFT:', listing.nft_mint);
    console.log('[buy_nft] 👤 Seller:', listing.seller_wallet);
    console.log('[buy_nft] 💰 Price:', listing.price_lamports, 'lamports');

    // Validate: buyer cannot be seller
    if (listing.seller_wallet === buyer_wallet) {
      throw new Error('Cannot buy your own NFT');
    }

    // Calculate expected amounts
    const sellerLamports = Math.floor(listing.price_lamports * 0.9);
    const feeLamports = listing.price_lamports - sellerLamports;

    console.log('[buy_nft] 💵 Expected seller amount:', sellerLamports, 'lamports (90%)');
    console.log('[buy_nft] 💵 Expected platform fee:', feeLamports, 'lamports (10%)');
    console.log('[buy_nft] 🔍 Verifying transaction on-chain...');

    // Verify transaction on Solana devnet via RPC
    const solanaRpcUrl = 'https://api.devnet.solana.com';
    const rpcResponse = await fetch(solanaRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          tx_signature,
          {
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0
          }
        ]
      })
    });

    const rpcData = await rpcResponse.json();

    if (rpcData.error) {
      throw new Error(`Failed to fetch transaction: ${rpcData.error.message}`);
    }

    const txData = rpcData.result;

    if (!txData) {
      throw new Error('Transaction not found on-chain');
    }

    // Check transaction success
    if (txData.meta?.err) {
      throw new Error(`Transaction failed on-chain: ${JSON.stringify(txData.meta.err)}`);
    }

    console.log('[buy_nft] ✅ Transaction confirmed on-chain');

    // Parse account keys and balances
    const accountKeys = txData.transaction.message.accountKeys.map((key: any) => 
      typeof key === 'string' ? key : key.pubkey
    );
    const preBalances = txData.meta.preBalances;
    const postBalances = txData.meta.postBalances;

    console.log('[buy_nft] 📊 Account keys:', accountKeys);
    console.log('[buy_nft] 📊 Pre-balances:', preBalances);
    console.log('[buy_nft] 📊 Post-balances:', postBalances);

    // Find account indices
    const buyerIndex = accountKeys.indexOf(buyer_wallet);
    const sellerIndex = accountKeys.indexOf(listing.seller_wallet);
    const escrowIndex = accountKeys.indexOf(ESCROW_PUBLIC_KEY);

    console.log('[buy_nft] 🔍 Buyer index:', buyerIndex);
    console.log('[buy_nft] 🔍 Seller index:', sellerIndex);
    console.log('[buy_nft] 🔍 Escrow index:', escrowIndex);

    if (buyerIndex === -1) {
      throw new Error('Buyer wallet not found in transaction');
    }

    if (sellerIndex === -1) {
      throw new Error('Seller wallet not found in transaction');
    }

    if (escrowIndex === -1) {
      throw new Error('Escrow wallet not found in transaction');
    }

    // Calculate balance changes
    const buyerBalanceChange = postBalances[buyerIndex] - preBalances[buyerIndex];
    const sellerBalanceChange = postBalances[sellerIndex] - preBalances[sellerIndex];
    const escrowBalanceChange = postBalances[escrowIndex] - preBalances[escrowIndex];

    console.log('[buy_nft] 💸 Buyer balance change:', buyerBalanceChange, 'lamports');
    console.log('[buy_nft] 💸 Seller balance change:', sellerBalanceChange, 'lamports');
    console.log('[buy_nft] 💸 Escrow balance change:', escrowBalanceChange, 'lamports');

    // Verify buyer paid (allowing for network fees ~5000-10000 lamports)
    const minBuyerPayment = -(listing.price_lamports + 15000); // Price + max network fee buffer
    if (buyerBalanceChange > minBuyerPayment) {
      throw new Error(
        `Buyer did not pay enough. Expected: ${-listing.price_lamports}, Got: ${buyerBalanceChange}`
      );
    }

    // Verify seller received 90% (allowing 1% tolerance for rounding)
    const sellerTolerance = Math.floor(sellerLamports * 0.01);
    if (sellerBalanceChange < sellerLamports - sellerTolerance) {
      throw new Error(
        `Seller did not receive correct amount. Expected: ${sellerLamports}, Got: ${sellerBalanceChange}`
      );
    }

    // Verify escrow received 10% (allowing 1% tolerance for rounding)
    const escrowTolerance = Math.floor(feeLamports * 0.01);
    if (escrowBalanceChange < feeLamports - escrowTolerance) {
      throw new Error(
        `Escrow did not receive correct fee. Expected: ${feeLamports}, Got: ${escrowBalanceChange}`
      );
    }

    console.log('[buy_nft] ✅ All balance changes verified');

    // Update nft_listings
    const { error: updateListingError } = await supabase
      .from('nft_listings')
      .update({
        status: 'sold',
        buyer_wallet,
        tx_signature,
        fee_lamports: feeLamports,
        seller_receives_lamports: sellerLamports,
        updated_at: new Date().toISOString()
      })
      .eq('id', listing_id);

    if (updateListingError) {
      throw new Error(`Failed to update listing: ${updateListingError.message}`);
    }

    console.log('[buy_nft] ✅ Listing updated');

    // Update minted_themes
    const { error: updateThemeError } = await supabase
      .from('minted_themes')
      .update({
        owner_address: buyer_wallet,
        is_listed: false,
        price_lamports: null,
        listing_id: null
      })
      .eq('mint_address', listing.nft_mint);

    if (updateThemeError) {
      throw new Error(`Failed to update NFT owner: ${updateThemeError.message}`);
    }

    console.log('[buy_nft] ✅ NFT ownership transferred');

    return new Response(
      JSON.stringify({
        success: true,
        tx_signature,
        seller_receives: sellerLamports,
        platform_fee: feeLamports,
        message: 'NFT purchased successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (e) {
    console.error('[buy_nft] ❌ Error:', e);
    return new Response(
      JSON.stringify({ 
        error: e instanceof Error ? e.message : 'Unknown error occurred' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
