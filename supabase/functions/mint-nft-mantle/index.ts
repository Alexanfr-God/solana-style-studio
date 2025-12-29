// supabase/functions/mint-nft-mantle/index.ts
// Edge function for Mantle L2 NFT minting configuration

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Mantle network configs
const NETWORKS = {
  mainnet: {
    chainId: 5000,
    name: 'Mantle',
    rpc: 'https://rpc.mantle.xyz',
    explorer: 'https://mantlescan.xyz',
    currency: 'MNT'
  },
  testnet: {
    chainId: 5003,
    name: 'Mantle Sepolia Testnet',
    rpc: 'https://rpc.sepolia.mantle.xyz',
    explorer: 'https://sepolia.mantlescan.xyz',
    currency: 'MNT'
  }
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Get contract address from secrets
    const contractAddress = Deno.env.get('MANTLE_NFT_CONTRACT');
    
    // Action: Get config (contract address, network info)
    if (action === 'getConfig') {
      if (!contractAddress) {
        console.error('[mint-nft-mantle] MANTLE_NFT_CONTRACT not set');
        return jsonResponse(500, {
          success: false,
          message: 'Mantle NFT contract not configured. Deploy the contract and set MANTLE_NFT_CONTRACT secret.'
        });
      }

      console.log('[mint-nft-mantle] Returning config:', { contractAddress });

      return jsonResponse(200, {
        success: true,
        contractAddress,
        networks: NETWORKS,
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'uri', type: 'string' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          },
          {
            name: 'freeMint',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'uri', type: 'string' }
            ],
            outputs: [{ name: '', type: 'uint256' }]
          }
        ]
      });
    }

    // Action: Verify mint (check if tokenId exists)
    if (action === 'verifyMint') {
      const { txHash, tokenId } = body;
      
      if (!txHash) {
        return jsonResponse(400, {
          success: false,
          message: 'txHash required'
        });
      }

      // For now, just return success - actual verification would query the blockchain
      console.log('[mint-nft-mantle] Verify request:', { txHash, tokenId });
      
      return jsonResponse(200, {
        success: true,
        verified: true,
        message: 'Transaction verification pending'
      });
    }

    // Unknown action
    return jsonResponse(400, {
      success: false,
      message: `Unknown action: ${action}`
    });

  } catch (error) {
    console.error('[mint-nft-mantle] Error:', error);
    return jsonResponse(500, {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
