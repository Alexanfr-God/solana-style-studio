/**
 * Solana Transaction Utilities for Auction Finalization
 * Uses dynamic imports to avoid bundle timeout with heavy @solana/web3.js
 */

const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const PLATFORM_FEE_BPS = 1000; // 10%
const ROYALTY_FEE_BPS = 500; // 5%

// Program IDs
const TOKEN_PROGRAM_ID_STR = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
const ASSOCIATED_TOKEN_PROGRAM_ID_STR = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';

// Lazy-loaded modules
let _web3: any = null;
let _bs58: any = null;

async function getWeb3() {
  if (!_web3) _web3 = await import('npm:@solana/web3.js@1.98.2');
  return _web3;
}

async function getBs58() {
  if (!_bs58) {
    const mod = await import('npm:bs58@6.0.0');
    _bs58 = mod.default || mod;
  }
  return _bs58;
}

/**
 * Parse escrow wallet secret key (supports JSON array and Base58 formats)
 */
async function parseSecretKey(raw: string): Promise<Uint8Array> {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Uint8Array(parsed);
  } catch { /* not JSON */ }
  try {
    const bs58 = await getBs58();
    return bs58.decode(raw);
  } catch {
    throw new Error('escrow_wallet secret is neither valid JSON array nor Base58');
  }
}

/**
 * Calculate fees from auction price
 */
export function calculateFees(priceLamports: number) {
  const platformFee = Math.floor((priceLamports * PLATFORM_FEE_BPS) / 10000);
  const royaltyFee = Math.floor((priceLamports * ROYALTY_FEE_BPS) / 10000);
  const sellerReceives = priceLamports - platformFee - royaltyFee;
  return { platformFee, royaltyFee, sellerReceives };
}

/**
 * Initialize Solana connection
 */
export async function getConnection() {
  const { Connection } = await getWeb3();
  return new Connection(SOLANA_RPC_URL, 'confirmed');
}

/**
 * Get escrow wallet keypair from environment
 */
export async function getEscrowKeypair() {
  const { Keypair } = await getWeb3();
  const escrowWalletPrivateKey = Deno.env.get('escrow_wallet');
  if (!escrowWalletPrivateKey) {
    throw new Error('escrow_wallet secret not configured. Run generate-escrow-keypair to create one.');
  }
  try {
    const secretKey = await parseSecretKey(escrowWalletPrivateKey);
    if (secretKey.length !== 64) {
      throw new Error(
        `escrow_wallet secret key must be exactly 64 bytes, got ${secretKey.length}. ` +
        `Expected format: JSON array of 64 numbers [1,2,3,...] or Base58-encoded 64-byte key. ` +
        `A public address (32 bytes) will NOT work — the secret must contain the full keypair.`
      );
    }
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('[solana] Failed to parse escrow_wallet:', error);
    throw error;
  }
}

/**
 * Derive Associated Token Address
 */
async function getAssociatedTokenAddress(mint: any, owner: any) {
  const { PublicKey } = await getWeb3();
  const TOKEN_PROGRAM_ID = new PublicKey(TOKEN_PROGRAM_ID_STR);
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID_STR);
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

/**
 * Transfer NFT from escrow to winner
 */
export async function transferNFTFromEscrow(nftMint: string, winnerAddress: string): Promise<string> {
  console.log('[solana] Transferring NFT from escrow to winner...');
  const { PublicKey, Transaction, TransactionInstruction, SystemProgram, sendAndConfirmTransaction } = await getWeb3();

  const TOKEN_PROGRAM_ID = new PublicKey(TOKEN_PROGRAM_ID_STR);
  const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(ASSOCIATED_TOKEN_PROGRAM_ID_STR);

  const connection = new (await getWeb3()).Connection(SOLANA_RPC_URL, 'confirmed');
  const escrowKeypair = await getEscrowKeypair();
  const mintPubkey = new PublicKey(nftMint);
  const winnerPubkey = new PublicKey(winnerAddress);

  const escrowTokenAccount = await getAssociatedTokenAddress(mintPubkey, escrowKeypair.publicKey);
  const winnerTokenAccount = await getAssociatedTokenAddress(mintPubkey, winnerPubkey);

  const transaction = new Transaction();

  const winnerAccountInfo = await connection.getAccountInfo(winnerTokenAccount);
  if (!winnerAccountInfo) {
    transaction.add(new TransactionInstruction({
      keys: [
        { pubkey: escrowKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: winnerTokenAccount, isSigner: false, isWritable: true },
        { pubkey: winnerPubkey, isSigner: false, isWritable: false },
        { pubkey: mintPubkey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.alloc(0),
    }));
  }

  // SPL Token Transfer: instruction index 3 + u64 amount
  const transferData = Buffer.alloc(9);
  transferData.writeUInt8(3, 0);
  transferData.writeBigUInt64LE(BigInt(1), 1);
  transaction.add(new TransactionInstruction({
    keys: [
      { pubkey: escrowTokenAccount, isSigner: false, isWritable: true },
      { pubkey: winnerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: escrowKeypair.publicKey, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: transferData,
  }));

  const signature = await sendAndConfirmTransaction(connection, transaction, [escrowKeypair], { commitment: 'confirmed' });
  console.log('[solana] ✅ NFT transferred! Signature:', signature);
  return signature;
}

/**
 * Transfer SOL from escrow to seller
 */
export async function transferSOLPayment(_winnerAddress: string, sellerAddress: string, priceLamports: number): Promise<string> {
  console.log('[solana] Processing SOL payment from escrow...');
  const { PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Connection } = await getWeb3();

  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  const escrowKeypair = await getEscrowKeypair();
  const sellerPubkey = new PublicKey(sellerAddress);
  const { sellerReceives } = calculateFees(priceLamports);

  const transaction = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: escrowKeypair.publicKey, toPubkey: sellerPubkey, lamports: sellerReceives })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [escrowKeypair], { commitment: 'confirmed' });
  console.log('[solana] ✅ SOL payment sent! Signature:', signature);
  return signature;
}

/**
 * Finalize auction with blockchain transactions
 */
export async function finalizeAuctionOnChain(
  nftMint: string, winnerAddress: string, sellerAddress: string, priceLamports: number
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
