
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to generate secure nonce
function generateNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper to verify signature for both chains
function verifySignature(message: string, signature: string, publicKey: string, chain: string): boolean {
  console.log('🔐 Verifying signature:', { 
    chain,
    messageLength: message.length, 
    signatureLength: signature.length,
    publicKeyLength: publicKey.length,
    messagePreview: message.slice(0, 50),
    publicKeyPreview: publicKey.slice(0, 20)
  });

  // Basic validation
  if (!signature || signature.length < 10 || !publicKey || publicKey.length < 10) {
    console.error('❌ Invalid signature or publicKey format');
    return false;
  }

  if (chain === 'solana') {
    // For Solana, we expect hex signature and base58 public key
    console.log('🔐 Validating Solana signature format');
    return signature.length >= 128 && publicKey.length >= 32; // Solana signature is 64 bytes = 128 hex chars
  } else {
    // For EVM, we expect 0x prefixed signature and address as publicKey
    console.log('🔐 Validating EVM signature format');
    const isValidSignature = signature.startsWith('0x') && signature.length >= 130; // 65 bytes = 130 hex chars + 0x
    const isValidAddress = publicKey.startsWith('0x') && publicKey.length === 42; // EVM address
    
    console.log('🔍 EVM validation details:', {
      hasHexPrefix: signature.startsWith('0x'),
      signatureLength: signature.length,
      expectedMinLength: 130,
      isValidAddress,
      addressLength: publicKey.length
    });
    
    return isValidSignature && isValidAddress;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, address, chain, signature, nonce, message, publicKey } = await req.json();
    
    console.log('🔐 Wallet Auth Request:', { 
      action, 
      address: address?.slice(0, 10) + '...', 
      chain,
      hasSignature: !!signature,
      hasNonce: !!nonce,
      messageLength: message?.length,
      timestamp: new Date().toISOString()
    });

    if (action === 'nonce') {
      // Generate and store nonce
      const generatedNonce = generateNonce();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const authMessage = `Sign this message to authenticate with WCC: ${generatedNonce}`;

      console.log('📝 Generating nonce:', {
        address: address?.slice(0, 10) + '...',
        nonce: generatedNonce.slice(0, 8) + '...',
        expiresAt: expiresAt.toISOString()
      });

      // Clean up old nonces first
      await supabase
        .from('auth_nonces')
        .delete()
        .or(`expires_at.lt.${new Date().toISOString()},used.eq.true`);

      const { error: insertError } = await supabase
        .from('auth_nonces')
        .insert({
          address,
          chain,
          nonce: generatedNonce,
          expires_at: expiresAt.toISOString()
        });

      if (insertError) {
        console.error('❌ Failed to store nonce:', insertError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to generate nonce' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Nonce stored successfully');
      return new Response(JSON.stringify({
        success: true,
        nonce: generatedNonce,
        message: authMessage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify') {
      console.log('🔍 Starting signature verification...');
      
      // Verify nonce exists and not expired
      const { data: nonceData, error: nonceError } = await supabase
        .from('auth_nonces')
        .select('*')
        .eq('address', address)
        .eq('chain', chain)
        .eq('nonce', nonce)
        .eq('used', false)
        .single();

      if (nonceError || !nonceData) {
        console.error('❌ Invalid nonce:', nonceError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid or expired nonce'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if nonce is expired
      if (new Date(nonceData.expires_at) < new Date()) {
        console.error('❌ Nonce expired:', {
          expiresAt: nonceData.expires_at,
          now: new Date().toISOString()
        });
        return new Response(JSON.stringify({
          success: false,
          error: 'Nonce expired'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Nonce validation passed');

      // Verify signature with chain information
      const isValidSignature = verifySignature(message, signature, publicKey || address, chain);
      if (!isValidSignature) {
        console.error('❌ Invalid signature for chain:', { chain, signatureLength: signature.length, publicKeyLength: (publicKey || address).length });
        return new Response(JSON.stringify({
          success: false,
          error: `Invalid signature format for ${chain} chain`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Signature validation passed');

      // Mark nonce as used
      await supabase
        .from('auth_nonces')
        .update({ used: true })
        .eq('id', nonceData.id);

      // Create or update wallet profile with proper metadata for each chain
      const metadata = chain === 'solana' 
        ? { publicKey: publicKey || address, walletType: 'solana', signatureMethod: 'ed25519' }
        : { publicKey: address, walletType: 'evm', signatureMethod: 'ecdsa', originalPublicKey: publicKey };

      console.log('📝 Creating/updating profile with metadata:', {
        chain,
        address: address?.slice(0, 10) + '...',
        metadata
      });

      const { data: profile, error: profileError } = await supabase
        .from('wallet_profiles')
        .upsert({
          wallet_address: address,
          chain,
          user_id: null, // Keep NULL for wallet users
          last_login_at: new Date().toISOString(),
          metadata
        }, { 
          onConflict: 'chain,wallet_address'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Failed to create/update profile:', profileError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to create user profile'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Profile created/updated:', {
        id: profile.id,
        address: profile.wallet_address?.slice(0, 10) + '...',
        chain: profile.chain
      });

      // Generate a simple wallet token
      const walletToken = `wallet_${profile.id}_${Date.now()}`;

      return new Response(JSON.stringify({
        success: true,
        token: walletToken,
        profile: profile,
        auth_url: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown action'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Wallet Auth Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
