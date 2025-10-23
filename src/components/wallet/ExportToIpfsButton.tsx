
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Diamond, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStore } from '@/state/themeStore';
import { supabase } from '@/integrations/supabase/client';
import { mintThemeNft } from '@/services/solanaMintService';
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
    
    const solanaWallet = (window as any).solana;
    if (!solanaWallet?.signTransaction || !solanaWallet?.publicKey) {
      toast.error('Solana wallet does not support signing transactions. Please ensure Phantom or Solflare is connected.');
      return;
    }
    
    console.log('[ExportToIpfs] Using AppKit Solana wallet:', {
      address: solanaWallet.publicKey.toString().slice(0, 10) + '...',
      hasSignTransaction: !!solanaWallet.signTransaction
    });
    
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
      
      // Step 4: Mint NFT on Solana
      toast.info('🎨 Minting NFT on Solana...');
      console.log('[ExportToIpfs] 🎨 Starting Solana mint...', {
        wallet: solanaWallet.publicKey.toString(),
        metadataUri: ipfsData.metadataUri
      });
      
      const walletAdapter = {
        publicKey: solanaWallet.publicKey,
        signTransaction: solanaWallet.signTransaction.bind(solanaWallet),
        signAllTransactions: solanaWallet.signAllTransactions?.bind(solanaWallet)
      };
      
      const mintResult = await mintThemeNft(
        walletAdapter,
        ipfsData.metadataUri,
        themeName
      );
      
      console.log('[ExportToIpfs] ✅ Mint successful:', mintResult);
      
      toast.success(
        `🎉 NFT Minted Successfully!\nMint: ${mintResult.mint.toString().slice(0, 8)}...`,
        { duration: 5000 }
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
