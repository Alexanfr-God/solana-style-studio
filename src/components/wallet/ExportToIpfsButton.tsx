
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Diamond, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { captureElementAsImage } from '@/utils/imageExport';

interface ExportToIpfsButtonProps {
  targetRef: React.RefObject<HTMLElement>;
}

const ExportToIpfsButton: React.FC<ExportToIpfsButtonProps> = ({ targetRef }) => {
  const [isMinting, setIsMinting] = useState(false);
  
  const handleMintNft = async () => {
    if (!targetRef.current) {
      toast.error('Could not find wallet element to capture');
      return;
    }
    
    try {
      setIsMinting(true);
      toast.info('Capturing wallet design...');
      
      // Capture the wallet design as an image
      // For demo purposes, using a placeholder image
      let imageUrl = "https://gateway.pinata.cloud/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
      
      try {
        // Try to capture the actual element if possible
        const blob = await captureElementAsImage(targetRef.current);
        const localImageUrl = URL.createObjectURL(blob);
        if (localImageUrl) {
          imageUrl = localImageUrl;
        }
      } catch (error) {
        console.warn('Could not capture element, using placeholder:', error);
      }
      
      toast.info('Minting NFT for wallet design...');
      
      // Define the style data as a proper object
      const styleData = {
        bgColor: '#000000',
        textColor: '#ffffff',
        image: imageUrl
      };
      
      // Use a dummy wallet address for testing
      const userWallet = "5FHwkrdxD3iWVBewGpyQ2NwJHcQNcleK9vw6jD9ai1vn"; // Example Solana address
      
      // Call the Edge Function to mint the NFT via Crossmint
      const response = await fetch('https://opxordptvpvzmhakvdde.supabase.co/functions/v1/mint_wallet_skin_nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userWallet,
          imageUrl,
          styleData
        }),
      });
      
      const result = await response.json();
      
      console.log('Mint NFT response:', result);
      
      // Show success message based on the response
      if (result.success) {
        toast.success(`Successfully minted NFT!`);
        if (result.result && result.result.id) {
          toast.info('Your NFT will appear in your wallet shortly');
        }
      } else {
        toast.error(`Failed to mint NFT: ${result.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Mint NFT error:', error);
      toast.error(`Mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMinting(false);
    }
  };
  
  return (
    <Button
      onClick={handleMintNft}
      disabled={isMinting}
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
      size="lg"
    >
      {isMinting ? <Loader className="mr-2 animate-spin" /> : <Diamond className="mr-2" />}
      Mint as NFT
    </Button>
  );
};

export default ExportToIpfsButton;
