import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// External libs for signature verification and JWT
import { utils as naclUtils } from "https://esm.sh/tweetnacl-util@0.15.1"; // for encoding/decoding
import nacl from "https://esm.sh/tweetnacl@1.0.3";
import bs58 from "https://esm.sh/bs58@6.0.0";
import * as ethers from "https://esm.sh/ethers@6.12.1";
import { SignJWT, importPKCS8 } from "https://esm.sh/jose@5.3.0";

// Import modules (kept for existing chat functionality)
import { createImageGenerationManager } from './modules/imageGenerator.ts';
import { handleChatWithGPT } from './modules/chatHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildMessageToSign({ nonce, address, chain }: { nonce: string; address: string; chain: string }) {
  const ts = new Date().toISOString();
  return `Wallet Coast Customs Login

Chain: ${chain}
Address: ${address}
Nonce: ${nonce}
Issued At: ${ts}

By signing this message you prove ownership of the wallet address.`;
}

async function issueAppJwt(address: string, chain: string) {
  const secret = Deno.env.get('WALLET_AUTH_JWT_SECRET');
  if (!secret) {
    return null; // Secret isn't configured, return null token
  }
  // Expect a PKCS8 private key string for ES256 or a simple HMAC secret
  // We'll use HMAC (HS256) for simplicity via jose: SignJWT with secret as Uint8Array
  const alg = 'HS256';
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const jwt = await new SignJWT({ sub: address, chain, aud: 'wallet-auth', iss: 'wallet-chat-gpt' })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
  return jwt;
}

serve(async (req) => {
  console.log(`🚀 Wallet Chat GPT Request received`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json().catch(() => ({}));
    const { action } = requestBody || {};

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1) Wallet Auth: Issue Nonce
    if (action === 'nonce') {
      const { address, chain } = requestBody || {};
      if (!address || !chain) {
        return jsonResponse({ success: false, error: 'address and chain are required' }, 400);
      }

      const nonce = generateNonce();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      const message = buildMessageToSign({ nonce, address, chain });

      const { error: insertError } = await supabase
        .from('auth_nonces')
        .insert({
          address,
          chain,
          nonce,
          expires_at: expiresAt,
          used: false
        });

      if (insertError) {
        console.error('❌ Error inserting nonce:', insertError);
        return jsonResponse({ success: false, error: 'Failed to create nonce' }, 500);
      }

      console.log(`✅ Nonce issued for ${chain}:${address} -> ${nonce}`);
      return jsonResponse({ success: true, nonce, message });
    }

    // 2) Wallet Auth: Verify Signature
    if (action === 'verify') {
      const { address, chain, signature, nonce, message, publicKey } = requestBody || {};
      if (!address || !chain || !signature || !nonce || !message) {
        return jsonResponse({ success: false, error: 'address, chain, signature, nonce and message are required' }, 400);
      }

      // Find valid nonce
      const { data: nonceRow, error: nonceError } = await supabase
        .from('auth_nonces')
        .select('*')
        .eq('address', address)
        .eq('nonce', nonce)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (nonceError || !nonceRow) {
        console.error('❌ Nonce not found or expired:', nonceError);
        return jsonResponse({ success: false, error: 'Invalid or expired nonce' }, 400);
      }

      let verified = false;

      try {
        if (chain.toLowerCase() === 'evm') {
          // Verify with ethers
          const recovered = ethers.verifyMessage(message, signature);
          console.log('EVM recovered address:', recovered);
          verified = recovered?.toLowerCase() === (address as string).toLowerCase();
        } else if (chain.toLowerCase() === 'solana') {
          if (!publicKey) {
            return jsonResponse({ success: false, error: 'publicKey is required for Solana' }, 400);
          }
          const messageBytes = new TextEncoder().encode(message);
          const signatureBytes = bs58.decode(signature);
          const pubKeyBytes = bs58.decode(publicKey);
          verified = nacl.sign.detached.verify(messageBytes, signatureBytes, pubKeyBytes);
        } else {
          return jsonResponse({ success: false, error: 'Unsupported chain' }, 400);
        }
      } catch (e) {
        console.error('❌ Verification error:', e);
        return jsonResponse({ success: false, error: 'Verification failed' }, 400);
      }

      if (!verified) {
        return jsonResponse({ success: false, error: 'Signature invalid' }, 401);
      }

      // Mark nonce as used
      const { error: updateError } = await supabase
        .from('auth_nonces')
        .update({ used: true })
        .eq('id', nonceRow.id);

      if (updateError) {
        console.error('❌ Failed to mark nonce as used:', updateError);
      }

      // Upsert profile
      const lowerAddr = chain.toLowerCase() === 'evm' ? (address as string).toLowerCase() : address;
      const { data: upsertData, error: upsertError } = await supabase
        .from('wallet_profiles')
        .upsert({
          chain,
          wallet_address: lowerAddr,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'chain,wallet_address' })
        .select()
        .maybeSingle();

      if (upsertError) {
        console.error('❌ Failed to upsert wallet profile:', upsertError);
      }

      // Issue app-level JWT if configured
      const token = await issueAppJwt(address, chain).catch((e) => {
        console.warn('JWT not issued (missing or invalid secret?):', e);
        return null;
      });

      console.log(`✅ ${chain} wallet verified: ${address}`);

      return jsonResponse({
        success: true,
        token, // can be null if secret not configured
        profile: upsertData || { chain, wallet_address: lowerAddr },
      });
    }

    // 3) Existing image/chat handlers (unchanged)
    const { 
      content, 
      mode, 
      imageUrl, 
      walletContext, 
      sessionId,
      isImageGeneration = false,
      debugMode = false
    } = requestBody;

    console.log(`🚀 Processing request: {
  mode: "${mode}",
  message: "${content}",
  isImageGeneration: ${isImageGeneration}
}`);

    // Check for required API keys
    const openAiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENA_API_KEY');
    const leonardoKey = Deno.env.get('LEONARDO_API_KEY');
    const replicateKey = Deno.env.get('REPLICATE_API_KEY');

    console.log('🔑 API Keys status:', {
      openAI: !!openAiKey,
      leonardo: !!leonardoKey,
      replicate: !!replicateKey
    });

    // Handle image generation requests
    const isImageGenerationMode = mode === 'leonardo' || mode === 'replicate' || isImageGeneration;
    
    if (isImageGenerationMode) {
      console.log(`🎨 Handling image generation with mode: ${mode}`);
      
      // Check if the required API key exists for the selected generator
      if (mode === 'leonardo' && !leonardoKey) {
        return jsonResponse({
          success: false,
          error: 'Leonardo API key not configured',
          mode: mode
        }, 400);
      }
      
      if (mode === 'replicate' && !replicateKey) {
        return jsonResponse({
          success: false,
          error: 'Replicate API key not configured',
          mode: mode
        }, 400);
      }
      
      const imageManager = createImageGenerationManager(supabaseUrl, supabaseKey);
      
      const imageRequest = {
        prompt: content,
        style: 'digital art',
        type: 'wallet_background',
        dimensions: { width: 1024, height: 1024 },
        generator: mode as 'leonardo' | 'replicate',
        options: {
          enhancePrompt: true,
          optimizeForWallet: true,
          highQuality: true
        }
      };

      console.log(`📋 Image generation request:`, imageRequest);

      const imageResult = await imageManager.generateImage(imageRequest);
      
      console.log(`📊 Image generation result:`, imageResult);

      if (imageResult.success && imageResult.imageUrl) {
        return jsonResponse({
          success: true,
          imageUrl: imageResult.imageUrl,
          data: {
            imageUrl: imageResult.imageUrl
          },
          metadata: imageResult.metadata,
          mode: mode
        });
      } else {
        console.error(`❌ Image generation failed:`, imageResult.error);
        return jsonResponse({
          success: false,
          error: imageResult.error || 'Image generation failed',
          mode: mode
        }, 500);
      }
    }

    // Handle regular chat
    console.log('💬 Handling chat request...');
    
    if (!openAiKey) {
      return jsonResponse({
        success: false,
        error: 'OpenAI API key not configured for chat functionality'
      }, 400);
    }
    
    const chatResult = await handleChatWithGPT({
      content,
      imageUrl,
      walletContext,
      sessionId,
      mode: 'analysis'
    });

    return jsonResponse(chatResult);

  } catch (error: any) {
    console.error('💥 Edge Function Error:', error);
    return jsonResponse({
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    }, 500);
  }
});
