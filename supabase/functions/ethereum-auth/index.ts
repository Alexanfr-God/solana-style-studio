import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { ethers } from 'https://esm.sh/ethers@6.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, walletAddress, signature, message } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Action: request-nonce
    if (action === 'request-nonce') {
      if (!walletAddress) {
        return new Response(
          JSON.stringify({ error: 'Wallet address required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const nonce = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from('auth_nonces')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          chain: 'ethereum',
          nonce,
          expires_at: expiresAt,
        });

      if (insertError) {
        console.error('Failed to create nonce:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create nonce' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Nonce created for:', walletAddress);
      return new Response(
        JSON.stringify({ nonce }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: verify-signature
    if (action === 'verify-signature') {
      if (!walletAddress || !signature || !message) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 1. Get nonce from DB
      const { data: nonceData, error: nonceError } = await supabase
        .from('auth_nonces')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .eq('chain', 'ethereum')
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (nonceError || !nonceData) {
        console.error('Nonce not found:', nonceError);
        return new Response(
          JSON.stringify({ error: 'Invalid or expired nonce' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 2. Check expiration
      if (new Date(nonceData.expires_at) < new Date()) {
        console.error('Nonce expired');
        return new Response(
          JSON.stringify({ error: 'Nonce expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 3. Verify cryptographic signature
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          console.error('Signature verification failed');
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('✅ Signature verified for:', walletAddress);
      } catch (error) {
        console.error('Signature verification error:', error);
        return new Response(
          JSON.stringify({ error: 'Signature verification failed' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 4. Mark nonce as used
      await supabase
        .from('auth_nonces')
        .update({ used: true })
        .eq('id', nonceData.id);

      // 5. Create or get user
      const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
        email: `${walletAddress.toLowerCase()}@ethereum.wallet`,
        email_confirm: true,
        user_metadata: {
          wallet_address: walletAddress.toLowerCase(),
          chain: 'ethereum',
        },
      });

      if (authError && !authError.message.includes('already registered')) {
        console.error('Failed to create user:', authError);
        return new Response(
          JSON.stringify({ error: 'Authentication failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 6. Get or create user if already exists
      let userId = user?.id;
      if (!userId) {
        const { data: existingUser } = await supabase
          .from('wallet_profiles')
          .select('user_id')
          .eq('wallet_address', walletAddress.toLowerCase())
          .eq('chain', 'ethereum')
          .single();

        userId = existingUser?.user_id;
      }

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User creation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 7. Generate session token
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${walletAddress.toLowerCase()}@ethereum.wallet`,
      });

      if (sessionError || !sessionData) {
        console.error('Failed to generate session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Session generation failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('✅ Ethereum auth successful:', walletAddress);

      return new Response(
        JSON.stringify({
          user: { id: userId, wallet_address: walletAddress.toLowerCase(), chain: 'ethereum' },
          session: sessionData,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Ethereum auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
