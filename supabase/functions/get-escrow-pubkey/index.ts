/**
 * Get Escrow Public Key Edge Function
 * Returns the public key of the escrow wallet
 */

import { Keypair } from 'npm:@solana/web3.js@1.98.2';
import bs58 from 'npm:bs58@6.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Parse the keypair from the secret
    const secretKey = bs58.decode(escrowWalletSecret);
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
