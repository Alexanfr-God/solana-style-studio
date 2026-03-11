// supabase/functions/mint-nft-build/index.ts
// ✅ Server-built / Client-signed NFT mint
// Builds UNSIGNED Metaplex NFT transaction for user to sign
// Uses dynamic imports to avoid bundle timeout

import { Buffer } from "node:buffer";

// Memo program ID
const MEMO_PROGRAM_ID_STR = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

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

Deno.serve(async (req: Request) => {
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

    // Dynamic imports to avoid bundle timeout
    const {
      Connection, PublicKey, Keypair, Transaction, TransactionInstruction,
      SystemProgram, LAMPORTS_PER_SOL
    } = await import("npm:@solana/web3.js@1.98.2");

    const {
      TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID,
      createInitializeMintInstruction, createAssociatedTokenAccountInstruction,
      createMintToInstruction, getAssociatedTokenAddress,
      getMinimumBalanceForRentExemptMint, MINT_SIZE
    } = await import("npm:@solana/spl-token@0.3.11");

    const mplModule = await import("npm:@metaplex-foundation/mpl-token-metadata@^2.0.0");
    const createCreateMetadataAccountV3Instruction = mplModule.createCreateMetadataAccountV3Instruction;
    const MPL_TOKEN_METADATA_PROGRAM_ID = mplModule.PROGRAM_ID;

    const MEMO_PROGRAM_ID = new PublicKey(MEMO_PROGRAM_ID_STR);

    function createMemoInstruction(memo: string, signers: InstanceType<typeof PublicKey>[]): InstanceType<typeof TransactionInstruction> {
      return new TransactionInstruction({
        keys: signers.map((signer: any) => ({ pubkey: signer, isSigner: true, isWritable: false })),
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memo, 'utf-8'),
      });
    }

    // Use only public Solana devnet RPC
    const endpoint = "https://api.devnet.solana.com";
    console.log("[mint-nft-build] 🌐 Using Solana devnet RPC:", endpoint);
    
    const connection = new Connection(endpoint, "confirmed");
    const userPubkey = new PublicKey(userPublicKey);

    // Check user balance
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
      return jsonResponse(500, { success: false, message: "TREASURY_WALLET not configured on server" });
    }
    const treasuryPubkey = new PublicKey(treasuryWallet);
    console.log("[mint-nft-build] 🏦 Treasury wallet:", treasuryPubkey.toBase58());

    // Generate new mint keypair (NFT address)
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey;
    console.log("[mint-nft-build] 🎨 Mint address:", mintAddress.toBase58());

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

    // Build transaction
    const tx = new Transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = userPubkey;

    // Instruction 0: Transfer 0.1 SOL to treasury (mint price)
    tx.add(SystemProgram.transfer({
      fromPubkey: userPubkey, toPubkey: treasuryPubkey, lamports: 0.1 * LAMPORTS_PER_SOL,
    }));

    // Instruction 1: Add unique memo
    const uniqueMemo = `WCC-MINT-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    tx.add(createMemoInstruction(uniqueMemo, [userPubkey]));

    // Get mint rent-exempt amount
    const mintRent = await getMinimumBalanceForRentExemptMint(connection);

    // Instruction 2: Create mint account
    tx.add(SystemProgram.createAccount({
      fromPubkey: userPubkey, newAccountPubkey: mintAddress,
      space: MINT_SIZE, lamports: mintRent, programId: TOKEN_PROGRAM_ID,
    }));

    // Instruction 3: Initialize mint
    tx.add(createInitializeMintInstruction(mintAddress, 0, userPubkey, userPubkey, TOKEN_PROGRAM_ID));

    // Instruction 4: Get/Create ATA for user
    const userAta = await getAssociatedTokenAddress(
      mintAddress, userPubkey, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
    );
    tx.add(createAssociatedTokenAccountInstruction(
      userPubkey, userAta, userPubkey, mintAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
    ));

    // Instruction 5: Mint 1 token
    tx.add(createMintToInstruction(mintAddress, userAta, userPubkey, 1, [], TOKEN_PROGRAM_ID));

    // Instruction 6: Create Metadata Account V3 (Metaplex)
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("metadata"), MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
      MPL_TOKEN_METADATA_PROGRAM_ID
    );

    tx.add(createCreateMetadataAccountV3Instruction(
      { metadata: metadataAddress, mint: mintAddress, mintAuthority: userPubkey, payer: userPubkey, updateAuthority: userPubkey },
      { createMetadataAccountArgsV3: {
        data: { name, symbol, uri: metadataUri, sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null },
        isMutable: false, collectionDetails: null,
      }},
    ));

    // Partial sign with mint keypair only
    tx.partialSign(mintKeypair);

    const txBase64 = tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64");
    const txSize = tx.serialize({ requireAllSignatures: false }).length;
    console.log("[mint-nft-build] 📏 Transaction size:", txSize, "bytes");
    console.log("[mint-nft-build] ✅ Transaction built successfully");

    return jsonResponse(200, {
      success: true, txBase64,
      mintAddress: mintAddress.toBase58(),
      recentBlockhash: blockhash, lastValidBlockHeight,
      estimatedFee: (txSize * 5000) / LAMPORTS_PER_SOL,
    });
  } catch (error) {
    console.error("[mint-nft-build] ❌ Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return jsonResponse(500, { success: false, message: "Failed to build mint transaction", detail: errorMessage });
  }
});
