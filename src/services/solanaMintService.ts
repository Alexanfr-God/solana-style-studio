import { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import type { WalletAdapter } from '@solana/wallet-adapter-base';

// Generic wallet adapter interface (для AppKit/WalletConnect)
interface GenericWalletAdapter {
  publicKey: any;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions?: (txs: Transaction[]) => Promise<Transaction[]>;
}

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
 * Создать WalletAdapter-обёртку для Metaplex из "сырого" signer'а
 */
function makeMetaplexAdapter(signer: GenericWalletAdapter): WalletAdapter {
  const pk = signer.publicKey instanceof PublicKey
    ? signer.publicKey
    : new PublicKey(
        typeof signer.publicKey === 'string'
          ? signer.publicKey
          : signer.publicKey.toBase58()
      );

  return {
    name: 'WCC-AppKit-Adapter',
    url: '',
    icon: '',
    readyState: 'Installed',
    publicKey: pk,
    connecting: false,
    connected: true,
    autoConnect: false,
    supportedTransactionVersions: null,
    
    async connect() {},
    async disconnect() {},
    
    async sendTransaction(transaction: Transaction, connection: Connection) {
      const signed = await signer.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      return signature;
    },
    
    async signTransaction<T extends Transaction>(tx: T): Promise<T> {
      return await signer.signTransaction(tx as Transaction) as T;
    },
    
    async signAllTransactions<T extends Transaction>(txs: T[]): Promise<T[]> {
      if (signer.signAllTransactions) {
        return await signer.signAllTransactions(txs as Transaction[]) as T[];
      }
      return await Promise.all(txs.map(tx => signer.signTransaction(tx as Transaction))) as T[];
    },
    
    on() {},
    off() {},
  } as unknown as WalletAdapter;
}

/**
 * Минт NFT на Solana devnet через Metaplex
 */
export async function mintThemeNft(
  walletAdapter: GenericWalletAdapter,
  metadataUri: string,
  themeName: string
): Promise<{ mint: PublicKey; transaction: string; explorerUrl: string }> {
  
  console.log('🎨 Minting NFT:', themeName);
  console.log('📍 Metadata URI:', metadataUri);
  console.log('👛 Wallet:', walletAdapter.publicKey.toString());
  
  try {
    const connection = getConnection();
    
    // Динамический импорт Metaplex - грузится только при клике "Mint"
    console.log('📦 Loading Metaplex SDK...');
    const { Metaplex, walletAdapterIdentity } = await import('@metaplex-foundation/js');
    
    // ✅ Создаём адаптер, совместимый с Metaplex
    const adapter = makeMetaplexAdapter(walletAdapter);
    
    // ✅ Используем официальный плагин walletAdapterIdentity
    const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(adapter));
    
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
