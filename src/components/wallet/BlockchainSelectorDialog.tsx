import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ethereumIcon from '@/assets/ethereum-eth.svg';
import solanaIcon from '@/assets/solana-logo.png';

interface BlockchainSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlockchain: (blockchain: 'ETH' | 'SOL') => void;
}

const BlockchainSelectorDialog: React.FC<BlockchainSelectorDialogProps> = ({
  open,
  onOpenChange,
  onSelectBlockchain,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Choose Blockchain</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center gap-8 py-6">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 px-8 hover:scale-105 transition-transform"
            onClick={() => onSelectBlockchain('ETH')}
          >
            <img src={ethereumIcon} alt="Ethereum" className="w-16 h-16" />
            <span className="text-lg font-semibold">ETH</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 px-8 hover:scale-105 transition-transform"
            onClick={() => onSelectBlockchain('SOL')}
          >
            <img src={solanaIcon} alt="Solana" className="w-16 h-16" />
            <span className="text-lg font-semibold">SOL</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockchainSelectorDialog;
