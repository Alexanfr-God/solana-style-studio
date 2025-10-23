import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import type { WalletContextState } from '@solana/wallet-adapter-react';

/**
 * Получить подключение к Solana
 * Приоритет: Helius RPC → clusterApiUrl('devnet')
 */
export function getConnection(): Connection {
  const heliusRpc = import.meta.env.VITE_HELIUS_RPC_DEVNET;
  const endpoint = heliusRpc || clusterApiUrl('devnet');
  
  console.log('🔗 Connecting to Solana:', endpoint.includes('helius') ? 'Helius Devnet' : 'Public Devnet');
  
  return new Connection(endpoint, 'confirmed');
}

/**
 * Запросить airdrop на devnet (если баланс < 0.5 SOL)
 */
export async function requestDevnetAirdrop(walletAddress: string): Promise<void> {
  const connection = getConnection();
  const publicKey = new PublicKey(walletAddress);
  
  try {
    const balance = await connection.getBalance(publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    
    console.log('💰 Current balance:', balanceInSol, 'SOL');
    
    if (balanceInSol < 0.5) {
      console.log('📥 Requesting 2 SOL airdrop...');
      const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      console.log('✅ Airdrop successful');
    } else {
      console.log('✅ Balance sufficient, skipping airdrop');
    }
  } catch (error) {
    console.error('❌ Airdrop failed:', error);
    throw new Error('Failed to request devnet airdrop');
  }
}

/**
 * Минт NFT на Solana devnet через Metaplex
 */
export async function mintThemeNft(
  wallet: WalletContextState,
  metadataUri: string,
  themeName: string
): Promise<{ mint: PublicKey; transaction: string; explorerUrl: string }> {
  
  // Проверка wallet
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error('Wallet not connected');
  }
  
  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support signing transactions');
  }
  
  console.log('🎨 Minting NFT:', themeName);
  console.log('📍 Metadata URI:', metadataUri);
  console.log('👛 Wallet:', wallet.publicKey.toBase58());
  
  try {
    const connection = getConnection();
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet));
    
    // Минт NFT
    const { nft, response } = await metaplex.nfts().create({
      uri: metadataUri,
      name: `WCC: ${themeName}`,
      symbol: 'WCC',
      sellerFeeBasisPoints: 0,
      isMutable: false,
    });
    
    const transaction = response.signature;
    const explorerUrl = `https://explorer.solana.com/tx/${transaction}?cluster=devnet`;
    
    console.log('✅ NFT minted successfully!');
    console.log('🎫 Mint address:', nft.address.toBase58());
    console.log('🔗 Explorer:', explorerUrl);
    
    return {
      mint: nft.address,
      transaction,
      explorerUrl
    };
    
  } catch (error) {
    console.error('❌ Minting failed:', error);
    throw error;
  }
}
