
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Diamond, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletTheme } from '@/state/themeStore';
import { supabase } from '@/integrations/supabase/client';
import { mintThemeNft } from '@/services/solanaMintService';
import { useWallet } from '@solana/wallet-adapter-react';
import html2canvas from 'html2canvas';
import BlockchainSelectorDialog from './BlockchainSelectorDialog';

interface ExportToIpfsButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  themeId?: string;
}

const ExportToIpfsButton: React.FC<ExportToIpfsButtonProps> = ({ targetRef, themeId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Получаем текущую тему и Solana кошелёк
  const currentTheme = useWalletTheme();
  const wallet = useWallet();
  
  const handleSelectBlockchain = async (blockchain: 'ETH' | 'SOL') => {
    setDialogOpen(false);
    
    // Пока поддерживаем только Solana
    if (blockchain !== 'SOL') {
      toast.error('Only Solana minting is supported at this time');
      return;
    }
    
    // Отладка: проверяем состояние Solana wallet
    console.log('[SolanaWallet Debug]', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toBase58(),
      hasSignTransaction: !!wallet.signTransaction
    });
    
    // Проверяем подключение кошелька
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect a Solana wallet (Phantom/Solflare)');
      return;
    }
    
    if (!targetRef.current) {
      toast.error('Wallet preview not found');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Шаг 1: Захватываем скриншот кошелька
      toast.info('📸 Capturing wallet screenshot...');
      console.log('📸 Starting screenshot capture...');
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      
      const imageData = canvas.toDataURL('image/png');
      console.log('✅ Screenshot captured');
      
      // Шаг 2: Загружаем на IPFS
      toast.info('📤 Uploading to IPFS...');
      console.log('📤 Uploading to IPFS...', {
        themeName: themeId || 'Custom Theme',
        themeDataKeys: Object.keys(currentTheme)
      });
      
      const { data: ipfsData, error: ipfsError } = await supabase.functions.invoke('upload-to-ipfs', {
        body: {
          imageData: imageData,
          themeName: themeId || 'Custom Theme',
          themeData: currentTheme,
          description: `Custom wallet theme created with Wallet Coast Customs`
        }
      });
      
      if (ipfsError) {
        console.error('❌ IPFS upload error:', ipfsError);
        throw new Error(ipfsError.message || 'Failed to upload to IPFS');
      }
      
      if (!ipfsData?.success || !ipfsData?.metadataUri) {
        console.error('❌ Invalid IPFS response:', ipfsData);
        throw new Error('Invalid response from IPFS upload');
      }
      
      console.log('✅ IPFS upload successful:', {
        metadataUri: ipfsData.metadataUri,
        imageUri: ipfsData.imageUri,
        themeCid: ipfsData.themeCid
      });
      
      toast.success('✅ Uploaded to IPFS!');
      
      // Шаг 3: Минтим NFT на Solana
      toast.info('🎨 Minting NFT on Solana...');
      console.log('🎨 Starting Solana mint...', {
        wallet: wallet.publicKey.toString(),
        metadataUri: ipfsData.metadataUri
      });
      
      const mintResult = await mintThemeNft(
        wallet,
        ipfsData.metadataUri,
        themeId || 'Custom Theme'
      );
      
      console.log('✅ Mint successful:', mintResult);
      
      toast.success(
        `🎉 NFT Minted Successfully!\nMint: ${mintResult.mint.toString().slice(0, 8)}...`,
        { duration: 5000 }
      );
      
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
