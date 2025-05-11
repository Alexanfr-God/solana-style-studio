
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Diamond, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface MintNftButtonProps {
  targetRef: React.RefObject<HTMLElement>;
}

const MintNftButton: React.FC<MintNftButtonProps> = ({ targetRef }) => {
  const [isMinting, setIsMinting] = useState(false);
  
  const handleMintNft = async () => {
    if (!targetRef.current) {
      toast.error('Could not find wallet element to capture');
      return;
    }
    
    try {
      setIsMinting(true);
      
      toast.info('Minting NFT for wallet design...');
      
      // Define the style data as a proper object
      const styleData = {
        bgColor: '#000000',
        textColor: '#ffffff',
        image: 'https://placekitten.com/400/400'
      };
      
      // Call the Edge Function to mint the NFT
      const response = await fetch('https://opxordptvpvzmhakvdde.supabase.co/functions/v1/mint_wallet_skin_nft', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weG9yZHB0dnB2em1oYWt2ZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTY2NjgsImV4cCI6MjA2MjI5MjY2OH0.uHDqEycZqhQ02zMvmikDjMXsqeVU792Ei61ceavk6iw',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo_user_1',
          styleData: styleData
        }),
      });
      
      const result = await response.json();
      
      console.log('Mint NFT response:', result);
      
      // Show success message
      if (result.success) {
        toast.success(`Successfully minted NFT with ID: ${result.skinId}`);
        if (result.isExisting) {
          toast.info('This design was already minted before.');
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

export default MintNftButton;
