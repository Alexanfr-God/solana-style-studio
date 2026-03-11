/**
 * Solana Transaction Utilities for Auction Finalization
 * Uses only @solana/web3.js (no spl-token) to keep bundle size small
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from 'npm:@solana/web3.js@1.98.2';
import bs58 from 'npm:bs58@6.0.0';

const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const PLATFORM_FEE_BPS = 1000; // 10%
const ROYALTY_FEE_BPS = 500; // 5%

// Program IDs (hardcoded to avoid spl-token dependency)
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

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
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Uint8Array(parsed);
    }
  } catch {
    // Not JSON, try Base58
  }
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
  return { platformFee, royaltyFee, sellerReceives };
}

/**
 * Derive Associated Token Address (replaces getAssociatedTokenAddress from spl-token)
 */
function getAssociatedTokenAddress(mint: PublicKey, owner: PublicKey): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

/**
 * Create ATA instruction (replaces createAssociatedTokenAccountInstruction from spl-token)
 */
function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  ata: PublicKey,
  owner: PublicKey,
  mint: PublicKey
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.alloc(0),
  });
}

/**
 * Create SPL Token transfer instruction (replaces createTransferInstruction from spl-token)
 */
function createTokenTransferInstruction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number
): TransactionInstruction {
  // SPL Token Transfer instruction index = 3, followed by u64 amount (little-endian)
  const data = Buffer.alloc(9);
  data.writeUInt8(3, 0); // Transfer instruction
  data.writeBigUInt64LE(BigInt(amount), 1);

  return new TransactionInstruction({
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data,
  });
}

/**
 * Transfer NFT from escrow to winner
 */
export async function transferNFTFromEscrow(
  nftMint: string,
  winnerAddress: string
): Promise<string> {
  console.log('[solana] Transferring NFT from escrow to winner...');

  const connection = getConnection();
  const escrowKeypair = getEscrowKeypair();
  const mintPubkey = new PublicKey(nftMint);
  const winnerPubkey = new PublicKey(winnerAddress);

  const escrowTokenAccount = getAssociatedTokenAddress(mintPubkey, escrowKeypair.publicKey);
  const winnerTokenAccount = getAssociatedTokenAddress(mintPubkey, winnerPubkey);

  const transaction = new Transaction();

  // Check if winner's token account exists
  const winnerAccountInfo = await connection.getAccountInfo(winnerTokenAccount);
  if (!winnerAccountInfo) {
    console.log('[solana] Creating associated token account for winner...');
    transaction.add(
      createAssociatedTokenAccountInstruction(
        escrowKeypair.publicKey, winnerTokenAccount, winnerPubkey, mintPubkey
      )
    );
  }

  // Transfer 1 NFT
  transaction.add(
    createTokenTransferInstruction(escrowTokenAccount, winnerTokenAccount, escrowKeypair.publicKey, 1)
  );

  console.log('[solana] Sending NFT transfer transaction...');
  const signature = await sendAndConfirmTransaction(connection, transaction, [escrowKeypair], { commitment: 'confirmed' });
  console.log('[solana] ✅ NFT transferred! Signature:', signature);
  return signature;
}

/**
 * Transfer SOL from escrow to seller
 */
export async function transferSOLPayment(
  _winnerAddress: string,
  sellerAddress: string,
  priceLamports: number
): Promise<string> {
  console.log('[solana] Processing SOL payment from escrow...');

  const connection = getConnection();
  const escrowKeypair = getEscrowKeypair();
  const sellerPubkey = new PublicKey(sellerAddress);
  const { sellerReceives } = calculateFees(priceLamports);

  console.log('[solana] Seller receives:', sellerReceives, 'lamports');

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrowKeypair.publicKey,
      toPubkey: sellerPubkey,
      lamports: sellerReceives,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [escrowKeypair], { commitment: 'confirmed' });
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
): Promise<{ nftTransferSignature: string; solPaymentSignature: string }> {
  console.log('[solana] 🚀 Starting on-chain auction finalization...');

  try {
    const nftTransferSignature = await transferNFTFromEscrow(nftMint, winnerAddress);
    const solPaymentSignature = await transferSOLPayment(winnerAddress, sellerAddress, priceLamports);
    console.log('[solana] ✅ Auction finalized on-chain');
    return { nftTransferSignature, solPaymentSignature };
  } catch (error) {
    console.error('[solana] ❌ Blockchain finalization failed:', error);
    throw error;
  }
}
