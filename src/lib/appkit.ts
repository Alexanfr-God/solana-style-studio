import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, avalanche, fantom, gnosis, zkSync } from 'viem/chains'
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  Coin98WalletAdapter,
  TrustWalletAdapter,
  CloverWalletAdapter,
  BitpieWalletAdapter,
  BitKeepWalletAdapter,
  NightlyWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
  SafePalWalletAdapter,
  CoinbaseWalletAdapter,
  SolongWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { supabase } from '@/integrations/supabase/client'

// Global AppKit state
let modal: any = null;
let wagmiAdapter: any = null;
let solanaWeb3JsAdapter: any = null;
let isInitialized = false;

// Function to initialize AppKit synchronously with project ID
export async function initializeAppKit() {
  if (isInitialized && modal) {
    console.log('🔗 AppKit already initialized');
    return { modal, wagmiAdapter, solanaWeb3JsAdapter };
  }

  try {
    console.log('🔗 Starting AppKit initialization...');
    
    // Get WalletConnect Project ID from edge function
    const { data, error } = await supabase.functions.invoke('get-walletconnect-config');
    
    if (error || !data?.success) {
      console.error('❌ Failed to get WalletConnect config:', error);
      throw new Error('Failed to get WalletConnect config');
    }

    const projectId = data.projectId;
    console.log('🔗 Initializing AppKit with Project ID:', projectId.slice(0, 8) + '...');

    // Set up Solana adapter with all popular wallets
    solanaWeb3JsAdapter = new SolanaAdapter({
      wallets: [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new Coin98WalletAdapter(),
        new TrustWalletAdapter(),
        new CloverWalletAdapter(),
        new BitpieWalletAdapter(),
        new BitKeepWalletAdapter(),
        new NightlyWalletAdapter(),
        new MathWalletAdapter(),
        new TokenPocketWalletAdapter(),
        new SafePalWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new SolongWalletAdapter()
      ]
    });

    // Set up Wagmi adapter for EVM chains with more networks
    wagmiAdapter = new WagmiAdapter({
      networks: [mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, avalanche, fantom, gnosis, zkSync],
      projectId
    });

    // Create the modal with comprehensive configuration
    modal = createAppKit({
      adapters: [solanaWeb3JsAdapter, wagmiAdapter],
      networks: [
        // EVM Networks
        mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, avalanche, fantom, gnosis, zkSync,
        // Solana Networks
        solana, solanaTestnet, solanaDevnet
      ],
      projectId,
      metadata: {
        name: 'Wallet Coast Customs',
        description: 'AI-powered wallet customization platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`]
      },
      features: {
        analytics: true,
        email: false,
        socials: false,
        onramp: true,
        swaps: false
      },
      // Enable all wallet connection methods
      enableWalletConnect: true,
      enableEIP6963: true,
      enableCoinbase: true,
      enableInjected: true,
      allWallets: 'SHOW',
      // Enhanced wallet selection experience
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
        'ecc4036f814562b41a5268adc86270ffc6a78ce0d1b81fda3c4e81e2b5dd6b24', // Phantom
        '38f5d18bd8522c244e5e5b1ae8d0a8c8c1d87a9c3d4b1c1a3a7a8b8c8d8e8f8', // Trust Wallet
        '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // WalletConnect
      ]
    });

    // Force disconnect all wallets on startup to ensure clean state
    try {
      console.log('🔌 Force disconnecting all wallets...');
      await modal.disconnect();
      console.log('✅ All wallets disconnected');
    } catch (error) {
      console.log('⚠️ No wallets were connected to disconnect:', error);
    }

    isInitialized = true;
    console.log('✅ AppKit initialized successfully');
    return { modal, wagmiAdapter, solanaWeb3JsAdapter };
  } catch (error) {
    console.error('❌ Failed to initialize AppKit:', error);
    throw error;
  }
}

// Check if AppKit is ready
export const isAppKitReady = () => isInitialized && modal;

export { modal, wagmiAdapter, solanaWeb3JsAdapter }