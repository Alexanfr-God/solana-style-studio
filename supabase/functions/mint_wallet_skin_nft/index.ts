
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Crossmint API key from environment variables
const crossmintApiKey = Deno.env.get('CROSSMINT_API_KEY') || '';
const collectionId = "default-solana"; // Replace with your actual collection ID if different

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { userWallet, imageUrl, styleData } = await req.json();

    // Validate input
    if (!userWallet || !imageUrl || !styleData) {
      console.error('Missing required fields:', { userWallet, imageUrl, styleData });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate description based on style data
    let description = "Custom wallet skin with ";
    if (styleData.bgColor) {
      description += `${styleData.bgColor} background`;
    }
    if (styleData.textColor) {
      description += styleData.bgColor ? `, ${styleData.textColor} text` : `${styleData.textColor} text`;
    }
    
    console.log('Minting NFT via Crossmint API with data:', {
      recipient: userWallet,
      imageUrl: imageUrl,
      styleDataKeys: Object.keys(styleData)
    });

    // Make request to Crossmint API
    const crossmintResponse = await fetch(`https://www.crossmint.io/api/2022-06-09/collections/${collectionId}/nfts`, {
      method: "POST",
      headers: {
        "x-api-key": crossmintApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: userWallet,
        metadata: {
          name: "Wallet Skin",
          image: imageUrl,
          description: description,
          attributes: Object.entries(styleData).map(([key, value]) => ({ 
            trait_type: key, 
            value: String(value) 
          }))
        },
        reuploadLinkedFiles: false
      })
    });

    // Handle Crossmint API response
    if (!crossmintResponse.ok) {
      const errorData = await crossmintResponse.json().catch(() => ({}));
      console.error('Crossmint API error:', { 
        status: crossmintResponse.status, 
        statusText: crossmintResponse.statusText,
        body: errorData 
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Crossmint API error: ${crossmintResponse.status} ${crossmintResponse.statusText}`
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const crossmintData = await crossmintResponse.json();
    console.log('Crossmint API response:', crossmintData);
    
    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: "NFT minted via Crossmint",
      crossmintResponse: crossmintData
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
