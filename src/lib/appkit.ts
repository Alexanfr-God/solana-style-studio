import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { mainnet, arbitrum, polygon, base, optimism, sepolia, bsc } from 'viem/chains'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { supabase } from '@/integrations/supabase/client'

// Initialize AppKit configuration
let modal: any = null;
let wagmiAdapter: any = null;
let solanaWeb3JsAdapter: any = null;

// Function to initialize AppKit with project ID
export async function initializeAppKit() {
  try {
    // Get WalletConnect Project ID from edge function
    const { data, error } = await supabase.functions.invoke('get-walletconnect-config');
    
    if (error || !data?.success) {
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

    // Create the modal
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
      }
    });

    console.log('✅ AppKit initialized successfully');
    return { modal, wagmiAdapter, solanaWeb3JsAdapter };
  } catch (error) {
    console.error('❌ Failed to initialize AppKit:', error);
    throw error;
  }
}

export { modal, wagmiAdapter, solanaWeb3JsAdapter }