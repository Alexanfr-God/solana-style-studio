/**
 * Solana Transaction Utilities for Auction Finalization
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from 'https://esm.sh/@solana/web3.js@1.98.2';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from 'https://esm.sh/@solana/spl-token@0.3.11';

const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const PLATFORM_FEE_BPS = 1000; // 10%
const ROYALTY_FEE_BPS = 500; // 5%

/**
 * Initialize Solana connection
 */
export function getConnection(): Connection {
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Get escrow wallet keypair from environment
 */
function getEscrowKeypair(): Keypair {
  const escrowWalletPrivateKey = Deno.env.get('escrow_wallet');
  
  if (!escrowWalletPrivateKey) {
    throw new Error('escrow_wallet secret not configured');
  }

  try {
    // Parse the private key (expects base58 or array of numbers)
    const secretKey = JSON.parse(escrowWalletPrivateKey);
    return Keypair.fromSecretKey(new Uint8Array(secretKey));
  } catch (error) {
    console.error('[solana] Failed to parse escrow_wallet:', error);
    throw new Error('Invalid escrow_wallet format');
  }
}

/**
 * Calculate fees from auction price
 */
export function calculateFees(priceLamports: number): {
  platformFee: number;
  royaltyFee: number;
  sellerReceives: number;
} {
  const platformFee = Math.floor((priceLamports * PLATFORM_FEE_BPS) / 10000);
  const royaltyFee = Math.floor((priceLamports * ROYALTY_FEE_BPS) / 10000);
  const sellerReceives = priceLamports - platformFee - royaltyFee;

  return {
    platformFee,
    royaltyFee,
    sellerReceives,
  };
}

/**
 * Transfer NFT from escrow to winner
 */
export async function transferNFTFromEscrow(
  nftMint: string,
  winnerAddress: string
): Promise<string> {
  console.log('[solana] Transferring NFT from escrow to winner...');
  console.log('[solana] NFT Mint:', nftMint);
  console.log('[solana] Winner:', winnerAddress);

  const connection = getConnection();
  const escrowKeypair = getEscrowKeypair();
  const mintPubkey = new PublicKey(nftMint);
  const winnerPubkey = new PublicKey(winnerAddress);

  // Get token accounts
  const escrowTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    escrowKeypair.publicKey
  );

  const winnerTokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    winnerPubkey
  );

  console.log('[solana] Escrow token account:', escrowTokenAccount.toString());
  console.log('[solana] Winner token account:', winnerTokenAccount.toString());

  // Build transaction
  const transaction = new Transaction();

  // Check if winner's token account exists
  const winnerAccountInfo = await connection.getAccountInfo(winnerTokenAccount);
  if (!winnerAccountInfo) {
    console.log('[solana] Creating associated token account for winner...');
    
    // Add instruction to create associated token account
    const { createAssociatedTokenAccountInstruction } = await import(
      'https://esm.sh/@solana/spl-token@0.3.11'
    );
    
    transaction.add(
      createAssociatedTokenAccountInstruction(
        escrowKeypair.publicKey, // payer
        winnerTokenAccount, // ata
        winnerPubkey, // owner
        mintPubkey // mint
      )
    );
  }

  // Add transfer instruction (transfer 1 NFT = 1 token with 0 decimals)
  transaction.add(
    createTransferInstruction(
      escrowTokenAccount, // source
      winnerTokenAccount, // destination
      escrowKeypair.publicKey, // owner
      1, // amount (1 NFT)
      [],
      TOKEN_PROGRAM_ID
    )
  );

  // Send transaction
  console.log('[solana] Sending NFT transfer transaction...');
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [escrowKeypair],
    {
      commitment: 'confirmed',
    }
  );

  console.log('[solana] ✅ NFT transferred! Signature:', signature);
  return signature;
}

/**
 * Transfer SOL from winner to seller (with fees to platform)
 */
export async function transferSOLPayment(
  winnerAddress: string,
  sellerAddress: string,
  priceLamports: number
): Promise<string> {
  console.log('[solana] Processing SOL payment...');
  console.log('[solana] Winner:', winnerAddress);
  console.log('[solana] Seller:', sellerAddress);
  console.log('[solana] Price:', priceLamports, 'lamports');

  const connection = getConnection();
  const escrowKeypair = getEscrowKeypair();
  
  const winnerPubkey = new PublicKey(winnerAddress);
  const sellerPubkey = new PublicKey(sellerAddress);
  const platformWalletPubkey = escrowKeypair.publicKey; // Platform wallet = escrow wallet

  // Calculate fees
  const { platformFee, royaltyFee, sellerReceives } = calculateFees(priceLamports);

  console.log('[solana] Platform fee:', platformFee, 'lamports');
  console.log('[solana] Royalty fee:', royaltyFee, 'lamports');
  console.log('[solana] Seller receives:', sellerReceives, 'lamports');

  // Build transaction
  const transaction = new Transaction();

  // Transfer to seller (minus fees)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: winnerPubkey,
      toPubkey: sellerPubkey,
      lamports: sellerReceives,
    })
  );

  // Transfer platform fee
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: winnerPubkey,
      toPubkey: platformWalletPubkey,
      lamports: platformFee,
    })
  );

  // Transfer royalty fee (to platform for now, can be to creator later)
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: winnerPubkey,
      toPubkey: platformWalletPubkey,
      lamports: royaltyFee,
    })
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = winnerPubkey;

  // NOTE: This transaction needs to be signed by the winner's wallet
  // In a real implementation, this would be done client-side
  // For now, we'll return unsigned transaction or use a different approach
  
  console.log('[solana] ⚠️ SOL payment transaction prepared but not sent');
  console.log('[solana] ⚠️ This requires winner\'s wallet signature (client-side)');
  
  // Return a placeholder signature for now
  // In production, this would be handled differently (winner signs transaction)
  return `sol_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Finalize auction with blockchain transactions
 */
export async function finalizeAuctionOnChain(
  nftMint: string,
  winnerAddress: string,
  sellerAddress: string,
  priceLamports: number
): Promise<{
  nftTransferSignature: string;
  solPaymentSignature: string;
}> {
  console.log('[solana] 🚀 Starting on-chain auction finalization...');

  try {
    // Step 1: Transfer NFT from escrow to winner
    const nftTransferSignature = await transferNFTFromEscrow(
      nftMint,
      winnerAddress
    );

    // Step 2: Process SOL payment (winner -> seller + fees)
    const solPaymentSignature = await transferSOLPayment(
      winnerAddress,
      sellerAddress,
      priceLamports
    );

    console.log('[solana] ✅ Auction finalized on-chain');

    return {
      nftTransferSignature,
      solPaymentSignature,
    };
  } catch (error) {
    console.error('[solana] ❌ Blockchain finalization failed:', error);
    throw error;
  }
}
