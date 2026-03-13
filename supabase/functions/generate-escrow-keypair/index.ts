/**
 * Generate Escrow Keypair — One-time admin utility
 * 
 * Generates a valid Solana Keypair for use as the escrow wallet.
 * Returns the public key and secret key as a JSON array.
 * 
 * IMPORTANT: This is a one-time utility. After use:
 * 1. Copy secretKeyArray → save as `escrow_wallet` secret in Supabase Dashboard
 * 2. Copy publicKey → update ESCROW_WALLET_PUBLIC_KEY in src/config/marketplace.ts
 * 3. Copy publicKey → update ESCROW_PUBLIC_KEY in supabase/functions/buy_nft/index.ts
 * 4. Fund the wallet on devnet: solana airdrop 2 <publicKey> --url devnet
 * 5. Delete or restrict access to this function after use
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[generate-escrow-keypair] 🔑 Generating new Solana keypair...');

    const web3 = await import('npm:@solana/web3.js@1.98.2');
    const keypair = web3.Keypair.generate();

    const publicKey = keypair.publicKey.toString();
    const secretKeyArray = Array.from(keypair.secretKey); // 64-byte array

    console.log('[generate-escrow-keypair] ✅ Generated publicKey:', publicKey);
    console.log('[generate-escrow-keypair] ⚠️  Secret key length:', secretKeyArray.length, 'bytes');

    return new Response(
      JSON.stringify({
        success: true,
        publicKey,
        secretKeyArray,
        instructions: [
          '1. Copy the secretKeyArray value (the full JSON array of 64 numbers)',
          '2. Go to Supabase Dashboard → Settings → Edge Functions → Secrets',
          '3. Update the "escrow_wallet" secret with the JSON array value',
          '4. Update ESCROW_WALLET_PUBLIC_KEY in src/config/marketplace.ts with the publicKey',
          '5. Update ESCROW_PUBLIC_KEY in supabase/functions/buy_nft/index.ts with the publicKey',
          '6. Fund on devnet: solana airdrop 2 ' + publicKey + ' --url devnet',
          '7. Delete or restrict this function after use',
        ],
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error: any) {
    console.error('[generate-escrow-keypair] ❌ Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
