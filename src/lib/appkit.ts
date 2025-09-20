import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { mainnet, arbitrum, polygon, base, optimism, sepolia, bsc } from 'viem/chains'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
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

    // Set up Solana adapter
    solanaWeb3JsAdapter = new SolanaAdapter({
      wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
    });

    // Set up Wagmi adapter for EVM chains
    wagmiAdapter = new WagmiAdapter({
      networks: [mainnet, arbitrum, polygon, base, optimism, sepolia, bsc],
      projectId
    });

    // Create the modal with proper configuration
    modal = createAppKit({
      adapters: [solanaWeb3JsAdapter, wagmiAdapter],
      networks: [mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, solana, solanaTestnet, solanaDevnet],
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
        socials: false
      },
      // Ensure modal is shown for wallet selection
      enableWalletConnect: true,
      enableEIP6963: true,
      enableCoinbase: true,
      allWallets: 'SHOW'
    });

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