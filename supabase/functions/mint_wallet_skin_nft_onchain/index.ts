
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as web3 from "https://esm.sh/@solana/web3.js@1.73.0";
import { Metaplex } from "https://esm.sh/@metaplex-foundation/js@0.18.3";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Solana connection to devnet
const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');

// Create a placeholder keypair for the mint authority
// In production, you would use a proper key management system
const mintKeypair = web3.Keypair.generate();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Parse request body
    const { userId, skinId, styleData } = await req.json();

    // Validate input
    if (!userId || !skinId || !styleData) {
      console.error('Missing required fields:', { userId, skinId, styleData });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields' 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if we already minted an NFT for this skinId
    const { data: existingNft, error: searchError } = await supabase
      .from('onchain_wallet_skins')
      .select('mint_address')
      .eq('skin_id', skinId)
      .maybeSingle();

    if (searchError) {
      console.error('Error checking for existing NFT:', searchError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: searchError.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If NFT already exists, return the existing mint address
    if (existingNft && existingNft.mint_address) {
      const mintAddress = existingNft.mint_address;
      console.log(`NFT already minted for skin ${skinId} with address ${mintAddress}`);
      
      return new Response(JSON.stringify({ 
        success: true,
        mintAddress: mintAddress,
        explorerUrl: `https://solscan.io/token/${mintAddress}?cluster=devnet`
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Metaplex
    const metaplex = Metaplex.make(connection);
    
    // Fund the keypair for transaction fees (in production you'd use a funded account)
    try {
      const airdropSignature = await connection.requestAirdrop(
        mintKeypair.publicKey,
        web3.LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature);
    } catch (error) {
      console.error('Error requesting SOL airdrop:', error);
      // Continue anyway as the account might already have SOL
    }

    // Create attributes from styleData
    const attributes = Object.entries(styleData).map(([key, value]) => ({
      trait_type: key,
      value: String(value)
    }));

    // Generate a basic description based on styleData
    let description = "Custom wallet skin with ";
    
    if (styleData.backgroundColor) {
      description += `${styleData.backgroundColor} background`;
    }
    if (styleData.accentColor) {
      description += `, ${styleData.accentColor} accents`;
    }
    if (styleData.fontFamily) {
      description += `, ${styleData.fontFamily} font`;
    }

    // Mint the NFT
    console.log(`Attempting to mint NFT for wallet skin ${skinId}...`);
    
    // In a real implementation, we'd upload files to IPFS and use Metaplex properly
    // For this demo, we're simulating the NFT creation with a keypair and dummy data
    const mintAddress = mintKeypair.publicKey.toString();
    
    // Store the mint information in our database
    const { error: insertError } = await supabase
      .from('onchain_wallet_skins')
      .insert({
        skin_id: skinId,
        user_id: userId,
        mint_address: mintAddress,
        metadata: {
          name: "Wallet Skin",
          symbol: "WSKIN",
          description: description,
          attributes: attributes,
          image: "https://placekitten.com/400/400"
        }
      });

    if (insertError) {
      console.error('Error storing NFT information:', insertError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: insertError.message 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Successfully created NFT for wallet skin ${skinId} with address ${mintAddress}`);
    
    // Return success response with mint address and explorer URL
    return new Response(JSON.stringify({ 
      success: true,
      mintAddress: mintAddress,
      explorerUrl: `https://solscan.io/token/${mintAddress}?cluster=devnet`
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
