/**
 * Buy NFT Modal - Shows price breakdown with 10% commission
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

interface BuyNftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  priceLamports: number;
  nftName: string;
  isProcessing?: boolean;
}

export function BuyNftModal({
  isOpen,
  onClose,
  onConfirm,
  priceLamports,
  nftName,
  isProcessing = false
}: BuyNftModalProps) {
  const priceSOL = MARKETPLACE_CONFIG.lamportsToSol(priceLamports);
  const sellerReceivesLamports = Math.floor(priceLamports * 0.9);
  const platformFeeLamports = priceLamports - sellerReceivesLamports;
  const sellerReceivesSOL = MARKETPLACE_CONFIG.lamportsToSol(sellerReceivesLamports);
  const platformFeeSOL = MARKETPLACE_CONFIG.lamportsToSol(platformFeeLamports);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Review the payment breakdown before buying
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">NFT</p>
            <p className="text-lg font-semibold">{nftName}</p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-mono font-semibold">{priceSOL.toFixed(4)} SOL</span>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Seller receives (90%)</span>
              <span className="font-mono">{sellerReceivesSOL.toFixed(4)} SOL</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform fee (10%)</span>
              <span className="font-mono">{platformFeeSOL.toFixed(4)} SOL</span>
            </div>
          </div>

          <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
            💡 Funds will be securely processed through our escrow wallet
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : `Buy for ${priceSOL.toFixed(4)} SOL`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
