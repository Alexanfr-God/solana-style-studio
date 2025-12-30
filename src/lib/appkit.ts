import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, avalanche, fantom, gnosis, zkSync, type Chain } from 'viem/chains'
import { supabase } from '@/integrations/supabase/client'

// Mantle L2 chain configs
const mantleMainnet: Chain = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mantle.xyz'] } },
  blockExplorers: { default: { name: 'Mantlescan', url: 'https://mantlescan.xyz' } },
};

const mantleTestnet: Chain = {
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.sepolia.mantle.xyz'] } },
  blockExplorers: { default: { name: 'Mantlescan', url: 'https://sepolia.mantlescan.xyz' } },
  testnet: true,
};

let modal: any = null;
let wagmiAdapter: any = null;
let solanaWeb3JsAdapter: any = null;
let isInitialized = false;

export async function initializeAppKit() {
  if (isInitialized && modal) {
    return { modal, wagmiAdapter, solanaWeb3JsAdapter };
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-walletconnect-config');
    if (error || !data?.success) throw new Error('Failed to get WalletConnect config');

    const projectId = data.projectId;

    solanaWeb3JsAdapter = new SolanaAdapter({ wallets: [] });

    wagmiAdapter = new WagmiAdapter({
      networks: [mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, avalanche, fantom, gnosis, zkSync, mantleMainnet, mantleTestnet],
      projectId
    });

    modal = createAppKit({
      adapters: [solanaWeb3JsAdapter, wagmiAdapter],
      networks: [
        mainnet, arbitrum, polygon, base, optimism, sepolia, bsc, avalanche, fantom, gnosis, zkSync,
        mantleMainnet, mantleTestnet,
        solana, solanaTestnet, solanaDevnet
      ],
      projectId,
      metadata: {
        name: 'Wallet Coast Customs',
        description: 'AI-powered wallet customization platform',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`]
      },
      features: { analytics: true, email: false, socials: false, onramp: true, swaps: false },
      enableWalletConnect: true,
      enableEIP6963: true,
      enableCoinbase: true,
      enableInjected: true,
      allWallets: 'SHOW',
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
        'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
        'ecc4036f814562b41a5268adc86270ffc6a78ce0d1b81fda3c4e81e2b5dd6b24',
      ]
    });

    isInitialized = true;
    console.log('✅ AppKit initialized with Mantle L2 support');
    return { modal, wagmiAdapter, solanaWeb3JsAdapter };
  } catch (error) {
    console.error('❌ Failed to initialize AppKit:', error);
    throw error;
  }
}

export const isAppKitReady = () => isInitialized && modal;
export const getWagmiConfig = () => wagmiAdapter?.wagmiConfig;
export { modal, wagmiAdapter, solanaWeb3JsAdapter, mantleMainnet, mantleTestnet }
