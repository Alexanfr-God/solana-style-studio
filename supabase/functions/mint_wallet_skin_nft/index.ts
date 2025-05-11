
import { serve } from "https://deno.land/std/http/server.ts";

// Add CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Mint NFT process started");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const crossmintApiKey = Deno.env.get("CROSSMINT_API_KEY");
  if (!crossmintApiKey) {
    return new Response(JSON.stringify({ error: "Missing Crossmint API Key" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { userWallet, imageUrl, styleData } = body;

    if (!userWallet || !imageUrl || !styleData) {
      console.error('Missing required fields:', { userWallet, imageUrl, styleData });
      return new Response(JSON.stringify({ error: "Missing fields", step: "validation failed" }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Minting NFT with data:', {
      recipient: userWallet,
      imageUrl,
      step: "sending request"
    });

    const response = await fetch("https://www.crossmint.com/api/2022-06-09/collections/default-solana/nfts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": crossmintApiKey,
      },
      body: JSON.stringify({
        recipient: `solana:${userWallet}`,
        metadata: {
          name: "Wallet Skin NFT",
          image: imageUrl,
          description: "Your AI-generated wallet design",
          attributes: [
            { trait_type: "Style", value: JSON.stringify(styleData) }
          ]
        }
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Crossmint API error:', result);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Crossmint API error", 
        details: result,
        step: "api_error"
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, step: "minted", result }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in mint_wallet_skin_nft:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Server error", 
      message: error instanceof Error ? error.message : "Unknown error",
      step: "server_error"
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
