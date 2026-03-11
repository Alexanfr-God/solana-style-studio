/**
 * Get Escrow Public Key Edge Function
 * Returns the public key of the escrow wallet
 */

// Lazy-loaded modules to reduce static bundle size
let _web3: any = null;
let _bs58: any = null;

async function getWeb3() {
  if (!_web3) _web3 = await import('npm:@solana/web3.js@1.98.2');
  return _web3;
}

async function getBs58() {
  if (!_bs58) {
    const mod = await import('npm:bs58@6.0.0');
    _bs58 = mod.default || mod;
  }
  return _bs58;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Parse escrow wallet secret key (supports JSON array and Base58 formats)
 */
async function parseSecretKey(raw: string): Promise<Uint8Array> {
  // Try JSON array first: [1,2,3,...]
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Uint8Array(parsed);
    }
  } catch {
    // Not JSON, try Base58
  }

  // Try Base58
  try {
    const bs58 = await getBs58();
    return bs58.decode(raw);
  } catch {
    throw new Error('escrow_wallet secret is neither valid JSON array nor Base58');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Getting escrow wallet public key...');

    // Get escrow wallet from secrets
    const escrowWalletSecret = Deno.env.get('escrow_wallet');
    if (!escrowWalletSecret) {
      throw new Error('Escrow wallet not configured');
    }

    // Parse the keypair from the secret (unified parsing)
    const secretKey = parseSecretKey(escrowWalletSecret);
    const keypair = Keypair.fromSecretKey(secretKey);
    const publicKey = keypair.publicKey.toString();

    console.log('✅ Escrow public key retrieved:', publicKey);

    return new Response(
      JSON.stringify({
        success: true,
        publicKey
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error: any) {
    console.error('❌ Error getting escrow public key:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to get escrow public key'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
