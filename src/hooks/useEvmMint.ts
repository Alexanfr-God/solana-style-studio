import { useState, useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain, useConfig } from 'wagmi';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseEther, type Chain } from 'viem';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Mantle chain configs
export const mantleMainnet: Chain = {
  id: 5000,
  name: 'Mantle',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantlescan', url: 'https://mantlescan.xyz' },
  },
};

export const mantleTestnet: Chain = {
  id: 5003,
  name: 'Mantle Sepolia Testnet',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Mantlescan', url: 'https://sepolia.mantlescan.xyz' },
  },
  testnet: true,
};

// Chain IDs
const MANTLE_MAINNET_ID = 5000;
const MANTLE_TESTNET_ID = 5003;

// WCCThemeNFT ABI (minimal)
const WCC_NFT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'uri', type: 'string' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'freeMint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'uri', type: 'string' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

interface MintResult {
  success: boolean;
  txHash?: string;
  tokenId?: string;
  explorerUrl?: string;
  error?: string;
}

export function useEvmMint() {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  
  const config = useConfig();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Check if on Mantle network
  const isOnMantle = chainId === MANTLE_MAINNET_ID || chainId === MANTLE_TESTNET_ID;
  const isTestnet = chainId === MANTLE_TESTNET_ID;

  // Switch to Mantle network
  const switchToMantle = useCallback(async (testnet = true) => {
    const targetChainId = testnet ? MANTLE_TESTNET_ID : MANTLE_MAINNET_ID;
    
    try {
      await switchChain({ chainId: targetChainId });
      toast.success(`Switched to Mantle ${testnet ? 'Sepolia Testnet' : 'Mainnet'}`);
      return true;
    } catch (err) {
      console.error('Failed to switch to Mantle:', err);
      toast.error('Failed to switch network. Please add Mantle manually.');
      return false;
    }
  }, [switchChain]);

  // Main mint function
  const mint = useCallback(async (
    metadataUri: string,
    themeName: string,
    previewImageUrl?: string
  ): Promise<MintResult> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }
    
    setIsMinting(true);
    setTxHash(null);
    
    try {
      // Get contract address from edge function
      const { data: configData, error: configError } = await supabase.functions.invoke('mint-nft-mantle', {
        body: { action: 'getConfig' }
      });
      
      if (configError || !configData?.contractAddress) {
        throw new Error('Failed to get contract address. Deploy the contract first.');
      }
      
      const contractAddr = configData.contractAddress as `0x${string}`;
      const currentIsTestnet = chainId === MANTLE_TESTNET_ID;
      
      console.log('[useEvmMint] Contract address:', contractAddr);
      console.log('[useEvmMint] Minting to:', address);
      console.log('[useEvmMint] Chain ID:', chainId, 'isTestnet:', currentIsTestnet);
      
      toast.info('🔓 Please sign the transaction in your wallet...');
      
      // Get chain config
      const chain = currentIsTestnet ? mantleTestnet : mantleMainnet;
      
      // Call writeContract from @wagmi/core with explicit account and chain
      let hash: `0x${string}`;
      
      if (currentIsTestnet) {
        hash = await writeContract(config, {
          account: address,
          chain,
          address: contractAddr,
          abi: WCC_NFT_ABI,
          functionName: 'freeMint',
          args: [address, metadataUri],
        });
      } else {
        hash = await writeContract(config, {
          account: address,
          chain,
          address: contractAddr,
          abi: WCC_NFT_ABI,
          functionName: 'mint',
          args: [address, metadataUri],
          value: parseEther('0.01'),
        });
      }
      
      setTxHash(hash);
      console.log('[useEvmMint] Transaction sent:', hash);
      toast.info('⏳ Waiting for confirmation...');
      
      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(config, { 
        hash,
        confirmations: 1 
      });
      
      console.log('[useEvmMint] Transaction confirmed:', receipt);
      
      const explorerUrl = currentIsTestnet
        ? `https://sepolia.mantlescan.xyz/tx/${hash}`
        : `https://mantlescan.xyz/tx/${hash}`;
      
      // Extract tokenId from logs (simplified)
      let tokenId = '0';
      if (receipt.logs.length > 0) {
        // The tokenId is usually in the first indexed parameter of Transfer event
        try {
          const transferLog = receipt.logs.find(log => log.topics.length >= 4);
          if (transferLog?.topics[3]) {
            tokenId = BigInt(transferLog.topics[3]).toString();
          }
        } catch (e) {
          console.warn('[useEvmMint] Could not extract tokenId');
        }
      }
      
      // Save to database
      try {
        const { error: dbError } = await supabase.from('minted_themes').insert({
          tx_sig: hash,
          mint_address: `${contractAddr}:${tokenId}`,
          owner_address: address,
          metadata_uri: metadataUri,
          theme_name: themeName,
          image_url: previewImageUrl || '',
          network: currentIsTestnet ? 'mantle-sepolia' : 'mantle',
          blockchain: 'mantle',
          is_verified: true
        });
        
        if (dbError) {
          console.error('[useEvmMint] DB error:', dbError);
        } else {
          console.log('[useEvmMint] Saved to database');
        }
      } catch (dbError) {
        console.error('[useEvmMint] DB error:', dbError);
      }
      
      toast.success(`🎉 NFT Minted! Token #${tokenId}`);
      
      return {
        success: true,
        txHash: hash,
        tokenId,
        explorerUrl
      };
      
    } catch (error) {
      console.error('[useEvmMint] Error:', error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`❌ Mint failed: ${message}`);
      throw error;
    } finally {
      setIsMinting(false);
    }
  }, [address, isConnected, chainId, config]);

  return {
    mint,
    isMinting,
    txHash,
    isOnMantle,
    isTestnet,
    switchToMantle,
    chainId,
  };
}

export { MANTLE_MAINNET_ID, MANTLE_TESTNET_ID };
