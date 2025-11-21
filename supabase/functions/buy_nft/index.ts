/**
 * Buy NFT Edge Function with Escrow & 10% Commission
 * 
 * Flow:
 * 1. Buyer transfers 100% to escrow wallet
 * 2. Verify buyer → escrow transaction
 * 3. Escrow transfers 90% to seller
 * 4. 10% remains as platform commission
 * 5. Update database
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from 'npm:@solana/web3.js@1.98.2';
import bs58 from 'npm:bs58@6.0.0';

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
    const escrowWalletSecret = Deno.env.get('escrow_wallet');
    
    if (!supabaseUrl || !serviceKey || !escrowWalletSecret) {
      throw new Error('Missing environment configuration');
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
    console.log('[buy_nft] 💰 Price:', listing.price_lamports, 'lamports');
    console.log('[buy_nft] 🔍 Verifying buyer → escrow transaction...');

    // Parse escrow keypair
    const escrowSecretKey = bs58.decode(escrowWalletSecret);
    const escrowKeypair = Keypair.fromSecretKey(escrowSecretKey);
    const escrowPublicKey = escrowKeypair.publicKey.toString();

    console.log('[buy_nft] 🏦 Escrow wallet:', escrowPublicKey);

    // Verify the transaction on Solana blockchain
    const solanaRpcUrl = 'https://api.devnet.solana.com';
    const connection = new Connection(solanaRpcUrl, 'confirmed');
    
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

    // Find buyer and escrow account indices
    let buyerFound = false;
    let escrowFound = false;
    let transferredAmount = 0;

    for (let i = 0; i < accountKeys.length; i++) {
      const key = typeof accountKeys[i] === 'string' ? accountKeys[i] : accountKeys[i].pubkey;
      
      if (key === buyer_wallet) {
        buyerFound = true;
        const buyerDecrease = preBalances[i] - postBalances[i];
        transferredAmount = buyerDecrease;
        console.log('[buy_nft] 👤 Buyer decreased:', buyerDecrease, 'lamports');
      }
      
      if (key === escrowPublicKey) {
        escrowFound = true;
        const escrowIncrease = postBalances[i] - preBalances[i];
        console.log('[buy_nft] 🏦 Escrow increased:', escrowIncrease, 'lamports');
        
        // Verify escrow received the expected amount (with small tolerance for network fees)
        if (escrowIncrease < listing.price_lamports * 0.95) {
          throw new Error(`Escrow received ${escrowIncrease} but expected ${listing.price_lamports}`);
        }
      }
    }

    if (!buyerFound) {
      throw new Error('Buyer wallet not found in transaction');
    }
    
    if (!escrowFound) {
      throw new Error('Escrow wallet not found in transaction - payment must go to escrow first');
    }

    console.log('[buy_nft] ✅ Buyer → Escrow transfer verified!');
    console.log('[buy_nft] 💸 Now transferring 90% to seller...');

    // Calculate amounts
    const sellerAmount = Math.floor(listing.price_lamports * 0.9);  // 90% to seller
    const platformFee = listing.price_lamports - sellerAmount;       // 10% stays in escrow

    console.log('[buy_nft] 💰 Seller gets:', sellerAmount, 'lamports');
    console.log('[buy_nft] 💎 Platform fee:', platformFee, 'lamports');

    // Create transaction: Escrow → Seller (90%)
    const sellerPubkey = new PublicKey(listing.seller_wallet);
    
    const escrowToSellerTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: escrowKeypair.publicKey,
        toPubkey: sellerPubkey,
        lamports: sellerAmount,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    escrowToSellerTx.recentBlockhash = blockhash;
    escrowToSellerTx.feePayer = escrowKeypair.publicKey;

    // Sign with escrow keypair
    escrowToSellerTx.sign(escrowKeypair);

    // Send escrow → seller transaction
    const sellerTxSignature = await connection.sendRawTransaction(escrowToSellerTx.serialize());
    
    console.log('[buy_nft] 📡 Escrow → Seller tx sent:', sellerTxSignature);

    // Wait for confirmation
    await connection.confirmTransaction(sellerTxSignature, 'confirmed');

    console.log('[buy_nft] ✅ Seller payment confirmed!');
    console.log('[buy_nft] 🔄 Updating database...');
    
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
          fee_lamports: platformFee,
          seller_receives_lamports: sellerAmount,
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
    
    console.log('[buy_nft] ✅ NFT ownership updated!');
    console.log('[buy_nft] 🎉 Purchase complete!');
    console.log('[buy_nft] 📊 Summary:');
    console.log('  - Buyer paid:', listing.price_lamports, 'lamports');
    console.log('  - Seller received:', sellerAmount, 'lamports (90%)');
    console.log('  - Platform fee:', platformFee, 'lamports (10%)');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        tx_signature,
        seller_tx_signature: sellerTxSignature,
        seller_received: sellerAmount,
        platform_fee: platformFee,
        message: 'NFT purchased successfully with 10% platform fee'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[buy_nft] ❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
