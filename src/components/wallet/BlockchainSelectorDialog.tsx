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
import { Badge } from '@/components/ui/badge';
import ethereumIcon from '@/assets/ethereum-eth.svg';
import solanaIcon from '@/assets/solana-logo.png';
import mantleIcon from '@/assets/mantle-logo.svg';

interface BlockchainSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBlockchain: (blockchain: 'ETH' | 'SOL' | 'MNT', themeName: string) => void;
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
      <DialogContent className="sm:max-w-lg">
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
          <div className="space-y-3">
            <Label>Select Blockchain</Label>
            <div className="grid grid-cols-3 gap-4">
              {/* Solana */}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 px-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-2 hover:border-purple-500"
                onClick={() => isValidName && onSelectBlockchain('SOL', themeName.trim())}
                disabled={!isValidName}
              >
                <img src={solanaIcon} alt="Solana" className="w-12 h-12" />
                <span className="text-sm font-semibold">Solana</span>
                <Badge variant="secondary" className="text-[10px]">Devnet</Badge>
              </Button>
              
              {/* Mantle L2 */}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 px-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed border-2 hover:border-[#65B3AE] relative"
                onClick={() => isValidName && onSelectBlockchain('MNT', themeName.trim())}
                disabled={!isValidName}
              >
                <img src={mantleIcon} alt="Mantle" className="w-12 h-12" />
                <span className="text-sm font-semibold">Mantle</span>
                <Badge variant="outline" className="text-[10px] border-[#65B3AE] text-[#65B3AE]">L2</Badge>
              </Button>

              {/* Ethereum (coming soon) */}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4 px-3 opacity-50 cursor-not-allowed border-2"
                disabled
              >
                <img src={ethereumIcon} alt="Ethereum" className="w-12 h-12 grayscale" />
                <span className="text-sm font-semibold">Ethereum</span>
                <Badge variant="secondary" className="text-[10px]">Soon</Badge>
              </Button>
            </div>
          </div>

          {/* Info text */}
          <p className="text-xs text-muted-foreground text-center">
            Solana: ~0.1 SOL + gas • Mantle L2: Free on testnet, 0.01 MNT on mainnet
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlockchainSelectorDialog;
