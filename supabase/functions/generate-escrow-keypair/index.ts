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
    const bs58mod = await import('npm:bs58@6.0.0');
    const bs58 = bs58mod.default || bs58mod;

    const keypair = web3.Keypair.generate();

    const publicKey = keypair.publicKey.toString();
    const secretKeyArray = Array.from(keypair.secretKey); // 64-byte array
    const secretKeyBase58 = bs58.encode(keypair.secretKey); // ~88 char string

    console.log('[generate-escrow-keypair] ✅ Generated publicKey:', publicKey);
    console.log('[generate-escrow-keypair] ⚠️  Secret key length:', secretKeyArray.length, 'bytes');
    console.log('[generate-escrow-keypair] ⚠️  Base58 secret length:', secretKeyBase58.length, 'chars');

    return new Response(
      JSON.stringify({
        success: true,
        publicKey,
        secretKeyBase58,
        secretKeyArray,
        instructions: [
          '1. Copy the secretKeyBase58 value (the LONG ~88 character string, NOT the short publicKey)',
          '2. Go to Supabase Dashboard → Settings → Edge Functions → Secrets',
          '3. Set the "escrow_wallet" secret to the secretKeyBase58 value',
          '4. Update ESCROW_WALLET_PUBLIC_KEY in src/config/marketplace.ts with: ' + publicKey,
          '5. Update ESCROW_PUBLIC_KEY in supabase/functions/buy_nft/index.ts with: ' + publicKey,
          '6. Fund on devnet: solana airdrop 2 ' + publicKey + ' --url devnet',
          '7. Delete or restrict this function after use',
        ],
        WARNING: 'DO NOT paste the publicKey as the secret! The secret must be the LONG secretKeyBase58 string (~88 chars)',
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
