import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ethereumIcon from '@/assets/ethereum-eth.svg';
import solanaIcon from '@/assets/solana-logo.png';

interface BlockchainSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlockchain: (blockchain: 'ETH' | 'SOL', themeName: string) => void;
}

const BlockchainSelectorDialog: React.FC<BlockchainSelectorDialogProps> = ({
  open,
  onOpenChange,
  onSelectBlockchain,
}) => {
  const [themeName, setThemeName] = useState('My Custom Theme');

  // Reset to default when dialog opens
  useEffect(() => {
    if (open) {
      setThemeName('My Custom Theme');
    }
  }, [open]);

  const isValidName = themeName.trim().length > 0 && themeName.length <= 50;
  const charCount = themeName.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Mint Your Theme</DialogTitle>
          <DialogDescription className="text-center">
            Choose a name for your theme and select the blockchain
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Theme Name Input */}
          <div className="space-y-2">
            <Label htmlFor="theme-name">Theme Name</Label>
            <Input
              id="theme-name"
              placeholder="e.g., Cyberpunk Blue, Golden Luxury"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              maxLength={50}
              className="w-full"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {!isValidName && themeName.trim().length === 0 && 'Name cannot be empty'}
              </span>
              <span className={charCount > 45 ? 'text-warning' : ''}>
                {charCount}/50
              </span>
            </div>
          </div>

          {/* Blockchain Selection */}
          <div className="space-y-2">
            <Label>Select Blockchain</Label>
            <div className="flex justify-center gap-6">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 px-8 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => isValidName && onSelectBlockchain('ETH', themeName.trim())}
                disabled={!isValidName}
              >
                <img src={ethereumIcon} alt="Ethereum" className="w-16 h-16" />
                <span className="text-lg font-semibold">ETH</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center gap-3 h-auto py-6 px-8 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => isValidName && onSelectBlockchain('SOL', themeName.trim())}
                disabled={!isValidName}
              >
                <img src={solanaIcon} alt="Solana" className="w-16 h-16" />
                <span className="text-lg font-semibold">SOL</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockchainSelectorDialog;
