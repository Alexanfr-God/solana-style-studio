
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface WalletNftCardProps {
  ipfsUrl: string;
  imageUrl: string;
  onClose: () => void;
}

const WalletNftCard: React.FC<WalletNftCardProps> = ({ ipfsUrl, imageUrl, onClose }) => {
  const handleCopyIpfsUrl = () => {
    navigator.clipboard.writeText(ipfsUrl);
    toast.success('IPFS URL copied to clipboard');
  };
  
  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(imageUrl);
    toast.success('Image URL copied to clipboard');
  };
  
  return (
    <Card className="p-4 bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl">
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">Your Wallet NFT is Ready!</h3>
          <p className="text-sm text-white/70">Your design has been uploaded to IPFS</p>
        </div>
        
        <div className="relative aspect-square max-w-xs mx-auto p-2 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-lg">
          <img 
            src={imageUrl.replace('ipfs://', 'https://nftstorage.link/ipfs/')} 
            alt="Wallet NFT" 
            className="rounded-md w-full h-full object-contain"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-black/30 p-2 rounded-md">
            <div className="text-xs text-white/70">IPFS Metadata</div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-white/90 truncate max-w-[180px]">
                {ipfsUrl}
              </div>
              <Button size="icon" variant="ghost" onClick={handleCopyIpfsUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-black/30 p-2 rounded-md">
            <div className="text-xs text-white/70">Image URL</div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-mono text-white/90 truncate max-w-[180px]">
                {imageUrl}
              </div>
              <Button size="icon" variant="ghost" onClick={handleCopyImageUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Card>
  );
};

export default WalletNftCard;
