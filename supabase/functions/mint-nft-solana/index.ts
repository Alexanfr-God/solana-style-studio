// supabase/functions/mint-nft-solana/index.ts
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metadataUri, recipient, name = 'WCC Theme', symbol = 'WCC' } = await req.json();

    // Validation
    if (!metadataUri || !recipient) {
      return jsonResponse(400, {
        success: false,
        message: 'Missing required fields: metadataUri and recipient',
      });
    }

    console.log('[mint-nft-solana] 🚀 Start', { metadataUri, recipient, name });

    // Get server wallet keypair
    const keyRaw = Deno.env.get('SOLANA_DEVNET_KEYPAIR');
    if (!keyRaw) {
      console.error('[mint-nft-solana] ❌ SOLANA_DEVNET_KEYPAIR not set');
      return jsonResponse(500, {
        success: false,
        message: 'Server wallet not configured. Please add SOLANA_DEVNET_KEYPAIR secret.',
      });
    }

    // Import Solana SDK (npm: prefix for Deno)
    const { Connection, Keypair, PublicKey, clusterApiUrl } = await import('npm:@solana/web3.js@1.98.2');
    const { Metaplex, keypairIdentity } = await import('npm:@metaplex-foundation/js@0.20.1');

    // Parse keypair (support JSON array format)
    let secretBytes: Uint8Array;
    const trimmedKey = keyRaw.trim();
    
    if (trimmedKey.startsWith('[')) {
      // JSON array: [1,2,3,...]
      secretBytes = new Uint8Array(JSON.parse(trimmedKey));
    } else {
      // Base58 (requires bs58)
      const bs58 = await import('npm:bs58@5.0.0');
      secretBytes = bs58.default.decode(trimmedKey);
    }

    const serverWallet = Keypair.fromSecretKey(secretBytes);
    console.log('[mint-nft-solana] 🔑 Server wallet:', serverWallet.publicKey.toBase58());

    // Connect to Solana (use HELIUS_DEVNET if available)
    const rpcUrl = Deno.env.get('HELIUS_DEVNET') || clusterApiUrl('devnet');
    console.log('[mint-nft-solana] 🌐 Using RPC:', rpcUrl);
    console.log('[mint-nft-solana] 🔍 HELIUS_DEVNET env:', Deno.env.get('HELIUS_DEVNET') ? 'SET' : 'NOT SET');
    
    const connection = new Connection(rpcUrl, 'confirmed');

    // Check balance
    console.log('[mint-nft-solana] 💰 Checking balance for:', serverWallet.publicKey.toBase58());
    const balance = await connection.getBalance(serverWallet.publicKey);
    console.log('[mint-nft-solana] 💰 Server balance:', balance / 1e9, 'SOL');

    // Request airdrop if balance is low
    if (balance < 0.01 * 1e9) {
      console.warn('[mint-nft-solana] ⚠️ Low balance, requesting airdrop...');
      try {
        const airdropSig = await connection.requestAirdrop(serverWallet.publicKey, 1e9);
        await connection.confirmTransaction(airdropSig);
        console.log('[mint-nft-solana] ✅ Airdrop confirmed');
      } catch (airdropError) {
        console.error('[mint-nft-solana] ⚠️ Airdrop failed (rate limit?):', airdropError);
        // Continue anyway, maybe we have enough for the transaction
      }
    }

    // Initialize Metaplex
    const metaplex = new Metaplex(connection).use(keypairIdentity(serverWallet));

    // Mint NFT
    console.log('[mint-nft-solana] 🎨 Minting NFT...');
    const { nft, response } = await metaplex.nfts().create({
      uri: metadataUri,
      name,
      symbol,
      sellerFeeBasisPoints: 0,
      isMutable: false,
    });

    const mintAddress = nft.address.toBase58();
    console.log('[mint-nft-solana] ✅ NFT minted:', mintAddress);

    // Transfer to recipient
    console.log('[mint-nft-solana] 📤 Transferring to:', recipient);
    const recipientPk = new PublicKey(recipient);
    
    const transferResponse = await metaplex.nfts().transfer({
      nftOrSft: nft,
      toOwner: recipientPk,
    });

    console.log('[mint-nft-solana] ✅ Transfer confirmed:', transferResponse.response.signature);

    return jsonResponse(200, {
      success: true,
      mintAddress,
      signature: response.signature,
      transferSignature: transferResponse.response.signature,
      explorerUrl: `https://explorer.solana.com/address/${mintAddress}?cluster=devnet`,
      transferredTo: recipient,
    });

  } catch (error) {
    console.error('[mint-nft-solana] ❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return jsonResponse(500, {
      success: false,
      message: 'Mint failed',
      detail: errorMessage,
    });
  }
});
