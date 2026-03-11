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
} from 'npm:@solana/web3.js@1.98.2';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from 'npm:@solana/spl-token@0.3.11';
import bs58 from 'npm:bs58@6.0.0';

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
 * Parse escrow wallet secret key (supports JSON array and Base58 formats)
 */
function parseSecretKey(raw: string): Uint8Array {
  // Try JSON array first: [1,2,3,...]
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Uint8Array(parsed);
    }
  } catch {
    // Not JSON, try Base58
  }

  // Try Base58
  try {
    return bs58.decode(raw);
  } catch {
    throw new Error('escrow_wallet secret is neither valid JSON array nor Base58');
  }
}

/**
 * Get escrow wallet keypair from environment
 */
export function getEscrowKeypair(): Keypair {
  const escrowWalletPrivateKey = Deno.env.get('escrow_wallet');
  
  if (!escrowWalletPrivateKey) {
    throw new Error('escrow_wallet secret not configured');
  }

  try {
    const secretKey = parseSecretKey(escrowWalletPrivateKey);
    return Keypair.fromSecretKey(secretKey);
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
 * Transfer SOL from escrow to seller (escrow already holds bidder's SOL)
 * Platform fee stays in escrow wallet (escrow = platform wallet)
 */
export async function transferSOLPayment(
  _winnerAddress: string,
  sellerAddress: string,
  priceLamports: number
): Promise<string> {
  console.log('[solana] Processing SOL payment from escrow...');
  console.log('[solana] Seller:', sellerAddress);
  console.log('[solana] Price:', priceLamports, 'lamports');

  const connection = getConnection();
  const escrowKeypair = getEscrowKeypair();
  const sellerPubkey = new PublicKey(sellerAddress);

  // Calculate fees
  const { platformFee, royaltyFee, sellerReceives } = calculateFees(priceLamports);

  console.log('[solana] Platform fee (stays in escrow):', platformFee + royaltyFee, 'lamports');
  console.log('[solana] Seller receives:', sellerReceives, 'lamports');

  // Build transaction: escrow sends seller's share
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: sellerPubkey,
      lamports: sellerReceives,
    })
  );

  // Send transaction signed by escrow
  console.log('[solana] Sending SOL payment transaction...');
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [escrowKeypair],
    {
      commitment: 'confirmed',
    }
  );

  console.log('[solana] ✅ SOL payment sent! Signature:', signature);
  return signature;
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

    // Step 2: Process SOL payment (escrow -> seller minus fees)
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
