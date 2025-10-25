// supabase/functions/mint-nft-build/index.ts
// ✅ Server-built / Client-signed NFT mint
// Builds UNSIGNED Metaplex NFT transaction for user to sign

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  Connection, 
  clusterApiUrl, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from "npm:@solana/web3.js@1.98.2";
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE
} from "npm:@solana/spl-token@0.3.11";
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as METADATA_PROGRAM_ID,
} from "npm:@metaplex-foundation/mpl-token-metadata@3.4.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse input
    const body = await req.json().catch(() => ({}));
    const { userPublicKey, metadataUri, name, symbol } = body as {
      userPublicKey?: string;
      metadataUri?: string;
      name?: string;
      symbol?: string;
    };

    console.log("[mint-nft-build] 🚀 Start:", { userPublicKey, name, metadataUri });

    if (!userPublicKey || !metadataUri || !name || !symbol) {
      return jsonResponse(400, {
        success: false,
        message: "userPublicKey, metadataUri, name, and symbol are required",
      });
    }

    // Connect to Solana devnet
    const rpcUrl = Deno.env.get("HELIUS_DEVNET") || clusterApiUrl("devnet");
    console.log("[mint-nft-build] 🌐 Using RPC:", rpcUrl);
    const connection = new Connection(rpcUrl, "confirmed");

    // Parse user public key (will be feePayer)
    const userPubkey = new PublicKey(userPublicKey);

    // Generate new mint keypair (NFT address)
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey;
    console.log("[mint-nft-build] 🎨 Mint address:", mintAddress.toBase58());

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    console.log("[mint-nft-build] 🔑 Recent blockhash:", blockhash.slice(0, 8) + "...");

    // Build transaction
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey; // ✅ User pays all fees

    // Get mint rent-exempt amount
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    // Instruction 1: Create mint account
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: userPubkey,
        newAccountPubkey: mintAddress,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Instruction 2: Initialize mint (decimals=0 for NFT, userPubkey is mint authority)
    tx.add(
      createInitializeMintInstruction(
        mintAddress,
        0, // decimals (0 for NFT)
        userPubkey, // mint authority (user will own the mint)
        userPubkey, // freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    // Instruction 3: Get/Create ATA for user
    const userAta = await getAssociatedTokenAddress(
      mintAddress,
      userPubkey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    tx.add(
      createAssociatedTokenAccountInstruction(
        userPubkey, // payer
        userAta, // associated token address
        userPubkey, // owner
        mintAddress, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    // Instruction 4: Mint 1 token to user's ATA
    tx.add(
      createMintToInstruction(
        mintAddress,
        userAta,
        userPubkey, // mint authority
        1, // amount (1 token for NFT)
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Instruction 5: Create Metadata Account V3 (Metaplex)
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    tx.add(
      createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAddress,
          mint: mintAddress,
          mintAuthority: userPubkey,
          payer: userPubkey,
          updateAuthority: userPubkey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name,
              symbol,
              uri: metadataUri,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: false,
            collectionDetails: null,
          },
        }
      )
    );

    // Partial sign: only the mint keypair (NOT the feePayer!)
    // User will sign the feePayer signature on the client
    tx.partialSign(mintKeypair);

    // Serialize without requiring all signatures
    const txBase64 = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString("base64");

    const txSize = tx.serialize({ requireAllSignatures: false }).length;
    console.log("[mint-nft-build] 📏 Transaction size:", txSize, "bytes");
    console.log("[mint-nft-build] ✅ Transaction built successfully");

    return jsonResponse(200, {
      success: true,
      txBase64,
      mintAddress: mintAddress.toBase58(),
      recentBlockhash: blockhash,
      lastValidBlockHeight,
      estimatedFee: (txSize * 5000) / LAMPORTS_PER_SOL, // rough estimate
    });
  } catch (error) {
    console.error("[mint-nft-build] ❌ Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return jsonResponse(500, {
      success: false,
      message: "Failed to build mint transaction",
      detail: errorMessage,
    });
  }
});
