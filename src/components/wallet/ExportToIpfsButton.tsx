
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Diamond, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStore } from '@/state/themeStore';
import { supabase } from '@/integrations/supabase/client';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import BlockchainSelectorDialog from './BlockchainSelectorDialog';

interface ExportToIpfsButtonProps {
  themeId?: string;
}

// Resolve preview image URL from theme layers (cascade fallback)
function resolvePreviewImageUrl(theme: any): string {
  if (theme.lockLayer?.backgroundImage) return theme.lockLayer.backgroundImage;
  if (theme.homeLayer?.backgroundImage) return theme.homeLayer.backgroundImage;
  if (theme.receiveLayer?.centerContainer?.backgroundImage) return theme.receiveLayer.centerContainer.backgroundImage;
  if (theme.sendLayer?.headerContainer?.backgroundImage) return theme.sendLayer.headerContainer.backgroundImage;
  if (theme.buyLayer?.headerContainer?.backgroundImage) return theme.buyLayer.headerContainer.backgroundImage;
  
  console.warn('[ExportToIpfs] No backgroundImage found in theme, using placeholder');
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

const ExportToIpfsButton: React.FC<ExportToIpfsButtonProps> = ({ themeId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  
  const handleSelectBlockchain = async (blockchain: 'ETH' | 'SOL') => {
    // Prevent double-click / concurrent mints
    if (isExporting) {
      console.log('[MintFlow] ⚠️ Mint already in progress, ignoring click');
      return;
    }
    
    setDialogOpen(false);
    
    // Пока поддерживаем только Solana
    if (blockchain !== 'SOL') {
      toast.error('Only Solana minting is supported at this time');
      return;
    }
    
    // Проверка: подключён ли кошелёк
    if (!isConnected || !address) {
      toast.error('Please connect a wallet using the top-right button');
      return;
    }
    
    // Проверка: это Solana сеть?
    const networkId = String(caipNetwork?.id || '');
    const isSolana = networkId.includes('solana') || address.length === 44;
    
    console.log('[ExportToIpfs] Wallet check:', {
      address: address.slice(0, 10) + '...',
      network: caipNetwork?.name,
      networkId,
      isSolana
    });
    
    if (!isSolana) {
      toast.error('Please switch to a Solana network (Devnet/Mainnet)');
      return;
    }
    
    try {
      setIsExporting(true);
      toast.info('Starting NFT mint process...');
      
      // Step 1: Get current theme from store
      const currentTheme = useThemeStore.getState().theme;
      const themeName = themeId || useThemeStore.getState().activeThemeId || 'custom-theme';
      
      // Step 2: Resolve preview image URL (cascade through layers)
      const previewImageUrl = resolvePreviewImageUrl(currentTheme);
      
      console.log('[ExportToIpfs] Theme:', themeName);
      console.log('[ExportToIpfs] Preview URL:', previewImageUrl);
      console.log('[ExportToIpfs] Theme data size:', JSON.stringify(currentTheme).length);
      
      // Step 2.5: Check user balance (need at least 0.105 SOL)
      const { Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const userPubkey = new PublicKey(address);
      const balance = await connection.getBalance(userPubkey);
      const balanceSOL = balance / LAMPORTS_PER_SOL;
      
      console.log('[ExportToIpfs] User balance:', balanceSOL.toFixed(4), 'SOL');
      
      if (balance < 0.105 * LAMPORTS_PER_SOL) {
        toast.error(`Insufficient balance. You need at least 0.105 SOL (you have ${balanceSOL.toFixed(4)} SOL). Get devnet SOL from https://faucet.solana.com/`);
        return;
      }
      
      // Step 3: Upload to IPFS via Edge Function
      toast.info('📤 Uploading theme to IPFS...');
      const { data: ipfsData, error: ipfsError } = await supabase.functions.invoke('upload-to-ipfs', {
        body: {
          themeName,
          themeData: currentTheme,
          previewImageUrl,
          description: 'Custom wallet theme created with Wallet Coast Customs'
        }
      });
      
      if (ipfsError || !ipfsData?.success) {
        throw new Error(ipfsData?.message || ipfsError?.message || 'Failed to upload to IPFS');
      }
      
      console.log('[ExportToIpfs] ✅ IPFS Upload success:', {
        metadataUri: ipfsData.metadataUri,
        imageCid: ipfsData.imageCid,
        themeCid: ipfsData.themeCid
      });
      
      toast.success('✅ Uploaded to IPFS!');
      
      // Step 4: Show cost to user
      toast.info('💰 Mint cost: 0.1 SOL + gas fees (~0.005 SOL)', { duration: 5000 });
      
      // Step 5: Build unsigned transaction via Edge Function
      toast.info('🔨 Building mint transaction...');
      console.log('[MintFlow] 1️⃣ Calling mint-nft-build...');

      const { data: buildData, error: buildError } = await supabase.functions.invoke('mint-nft-build', {
        body: {
          userPublicKey: address,
          metadataUri: ipfsData.metadataUri,
          name: `WCC: ${themeName}`,
          symbol: 'WCC',
        }
      });

      if (buildError || !buildData?.success) {
        throw new Error(buildData?.message || buildError?.message || 'Failed to build transaction');
      }

      console.log('[MintFlow] ✅ Transaction built:', {
        mintAddress: buildData.mintAddress,
        txSize: buildData.txBase64?.length
      });

      // Step 6: Deserialize transaction
      const { Transaction } = await import('@solana/web3.js');
      const tx = Transaction.from(Buffer.from(buildData.txBase64, 'base64'));

      // Step 7: Sign transaction via connected wallet (universal check)
      console.log('[MintFlow] 2️⃣ Requesting wallet signature...');
      toast.info('🔓 Please sign the transaction in your wallet...');

      // Universal wallet detection (Phantom, Solflare, Backpack, etc.)
      const wallet = (window as any).solana || (window as any).phantom?.solana || (window as any).solflare;
      
      if (!wallet?.signTransaction) {
        throw new Error('No Solana wallet detected. Please install Phantom, Solflare, or another Solana wallet extension.');
      }

      console.log('[MintFlow] 🔍 Detected wallet:', wallet.isPhantom ? 'Phantom' : wallet.isSolflare ? 'Solflare' : 'Unknown');

      // Ensure wallet is connected
      if (!wallet.isConnected) {
        console.log('[MintFlow] Wallet not connected, requesting connection...');
        try {
          await wallet.connect();
        } catch (err) {
          throw new Error('Wallet connection rejected by user');
        }
      }

      let signed;
      try {
        signed = await wallet.signTransaction(tx);
        console.log('[MintFlow] ✅ Transaction signed by user');
      } catch (err: any) {
        if (err.message?.includes('User rejected') || err.code === 4001) {
          throw new Error('Transaction cancelled by user');
        }
        throw err;
      }

      // Step 8: Send to Solana devnet (reuse connection from balance check)

      toast.info('📤 Sending transaction to Solana...');
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      console.log('[MintFlow] 3️⃣ Transaction sent:', signature);

      // Step 8.5: Save to database IMMEDIATELY (before confirmation)
      console.log('[MintFlow] 💾 Saving mint record to database...');
      try {
        const { error: insertError } = await supabase
          .from('minted_themes')
          .insert({
            tx_sig: signature,
            mint_address: buildData.mintAddress,
            owner_address: address,
            metadata_uri: ipfsData.metadataUri,
            theme_name: themeName,
            image_url: previewImageUrl,
            network: 'devnet',
            blockchain: 'solana'
          });
        
        if (insertError) {
          console.error('[MintFlow] ⚠️ Failed to save mint record:', insertError);
          // Don't block mint, just log
        } else {
          console.log('[MintFlow] ✅ Mint record saved to database');
        }
      } catch (dbError) {
        console.error('[MintFlow] ⚠️ Database error:', dbError);
      }

      // Step 9: Confirm transaction (may timeout, but NFT is already in DB)
      toast.info('⏳ Confirming transaction...');
      await connection.confirmTransaction({
        signature,
        blockhash: buildData.recentBlockhash,
        lastValidBlockHeight: buildData.lastValidBlockHeight
      }, 'confirmed');

      console.log('[MintFlow] ✅ Transaction confirmed!', {
        signature,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      });

      // Step 11: Show success
      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      const mintExplorerUrl = `https://explorer.solana.com/address/${buildData.mintAddress}?cluster=devnet`;

      console.log('[MintFlow] 🎫 Mint address:', buildData.mintAddress);
      console.log('[MintFlow] 🔗 Explorer:', explorerUrl);

      toast.success(
        `🎉 NFT Minted Successfully!\nMint: ${buildData.mintAddress.slice(0, 8)}...\n💰 Cost: 0.1 SOL + gas fees\n🔗 View in Explorer`,
        { duration: 10000 }
      );
      
      setDialogOpen(false);
      
    } catch (error) {
      console.error('❌ Mint process failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Minting failed';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={isExporting || !themeId}
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
        size="lg"
      >
        {isExporting ? <Loader className="mr-2 animate-spin" /> : <Diamond className="mr-2" />}
        {isExporting ? 'Preparing…' : 'Mint as NFT'}
      </Button>
      
      <BlockchainSelectorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelectBlockchain={handleSelectBlockchain}
      />
    </>
  );
};

export default ExportToIpfsButton;
