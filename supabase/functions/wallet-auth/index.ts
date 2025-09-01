
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decode } from 'https://deno.land/x/base64@v0.2.1/mod.ts';

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

// Helper to verify signature (simplified for Solana)
function verifySignature(message: string, signature: string, publicKey: string): boolean {
  // In production, use proper ed25519 signature verification
  // For now, we'll assume signature verification logic
  console.log('Verifying signature for:', { message: message.slice(0, 50), publicKey: publicKey.slice(0, 20) });
  return signature.length > 10 && publicKey.length > 10; // Simplified check
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
    
    console.log('🔐 Wallet Auth Request:', { action, address, chain });

    if (action === 'nonce') {
      // Generate and store nonce
      const generatedNonce = generateNonce();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const authMessage = `Sign this message to authenticate with WCC: ${generatedNonce}`;

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

      return new Response(JSON.stringify({
        success: true,
        nonce: generatedNonce,
        message: authMessage
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'verify') {
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
        return new Response(JSON.stringify({
          success: false,
          error: 'Nonce expired'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify signature
      const isValidSignature = verifySignature(message, signature, publicKey || address);
      if (!isValidSignature) {
        console.error('❌ Invalid signature');
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid signature'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Mark nonce as used
      await supabase
        .from('auth_nonces')
        .update({ used: true })
        .eq('id', nonceData.id);

      // Create or update wallet profile
      const { data: profile, error: profileError } = await supabase
        .from('wallet_profiles')
        .upsert({
          wallet_address: address,
          chain,
          last_login_at: new Date().toISOString(),
          metadata: { publicKey }
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to create user profile'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('✅ Wallet authentication successful');
      return new Response(JSON.stringify({
        success: true,
        token: null, // JWT not implemented yet
        profile: profile
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
