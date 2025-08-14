
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Diamond, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { prepareMint } from '@/lib/api/client';

interface ExportToIpfsButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  themeId?: string;
}

const ExportToIpfsButton: React.FC<ExportToIpfsButtonProps> = ({ targetRef, themeId }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleMintClick = async () => {
    if (!themeId) {
      toast.error('No theme selected for minting');
      return;
    }
    
    try {
      setIsExporting(true);
      toast.info('Preparing theme for mint...');
      
      // Call the new export API
      const { url, walletTarget } = await prepareMint(themeId);
      
      // Show success message
      toast.success(`Theme prepared for mint (${walletTarget})`);
      
      // Open the export file in a new tab
      window.open(url, '_blank');
      
    } catch (error) {
      console.error('Mint preparation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Mint preparation failed';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button
      onClick={handleMintClick}
      disabled={isExporting || !themeId}
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
      size="lg"
    >
      {isExporting ? <Loader className="mr-2 animate-spin" /> : <Diamond className="mr-2" />}
      {isExporting ? 'Preparing…' : 'Mint as NFT'}
    </Button>
  );
};

export default ExportToIpfsButton;
