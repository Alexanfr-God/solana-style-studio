// supabase/functions/mint-nft-build/index.ts
// ✅ Server-built / Client-signed NFT mint
// Builds UNSIGNED Metaplex NFT transaction for user to sign

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Buffer } from "node:buffer";
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
  PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID,
} from "npm:@metaplex-foundation/mpl-token-metadata@^2.0.0";
import { createMemoInstruction } from "npm:@solana/spl-memo@0.2.5";

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

    // Use only public Solana devnet RPC
    const endpoint = "https://api.devnet.solana.com";
    console.log("[mint-nft-build] 🌐 Using Solana devnet RPC:", endpoint);
    
    const connection = new Connection(endpoint, "confirmed");

    // Parse user public key (will be feePayer)
    const userPubkey = new PublicKey(userPublicKey);

    // Check user balance (need at least 0.105 SOL for 0.1 payment + gas)
    const balance = await connection.getBalance(userPubkey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    console.log("[mint-nft-build] 💰 User balance:", balanceSOL.toFixed(4), "SOL");

    if (balance < 0.105 * LAMPORTS_PER_SOL) {
      return jsonResponse(400, {
        success: false,
        message: `Insufficient balance. You need at least 0.105 SOL (you have ${balanceSOL.toFixed(4)} SOL). Get devnet SOL from https://faucet.solana.com/`,
      });
    }

    // Get treasury wallet from env
    const treasuryWallet = Deno.env.get("TREASURY_WALLET");
    if (!treasuryWallet) {
      return jsonResponse(500, {
        success: false,
        message: "TREASURY_WALLET not configured on server",
      });
    }
    const treasuryPubkey = new PublicKey(treasuryWallet);
    console.log("[mint-nft-build] 🏦 Treasury wallet:", treasuryPubkey.toBase58());

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

    // Instruction 0: Transfer 0.1 SOL to treasury (mint price)
    console.log("[mint-nft-build] 💸 Adding 0.1 SOL payment to treasury...");
    tx.add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        toPubkey: treasuryPubkey,
        lamports: 0.1 * LAMPORTS_PER_SOL, // 0.1 SOL mint price
      })
    );

    // Instruction 1: Add unique memo to prevent duplicate detection
    const uniqueMemo = `WCC-MINT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    console.log("[mint-nft-build] 🔖 Adding memo:", uniqueMemo);
    tx.add(
      createMemoInstruction(uniqueMemo, [userPubkey])
    );

    // Get mint rent-exempt amount
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    // Instruction 2: Create mint account
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: userPubkey,
        newAccountPubkey: mintAddress,
        space: MINT_SIZE,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Instruction 3: Initialize mint (decimals=0 for NFT, userPubkey is mint authority)
    tx.add(
      createInitializeMintInstruction(
        mintAddress,
        0, // decimals (0 for NFT)
        userPubkey, // mint authority (user will own the mint)
        userPubkey, // freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    // Instruction 4: Get/Create ATA for user
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

    // Instruction 5: Mint 1 token to user's ATA
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

    // Instruction 6: Create Metadata Account V3 (Metaplex)
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      MPL_TOKEN_METADATA_PROGRAM_ID
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
