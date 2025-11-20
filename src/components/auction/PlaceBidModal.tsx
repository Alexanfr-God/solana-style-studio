/**
 * Place Bid Modal Component
 * Allows users to place a bid on an active auction
 */

import { useState, useMemo } from 'react';
import { z } from 'zod';
import { Gavel, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePlaceBid } from '@/hooks/useAuction';
import {
  calculateMinBid,
  formatSOL,
  solToLamports,
  lamportsToSOL,
  formatWalletAddress
} from '@/utils/auctionUtils';
import type { Auction } from '@/types/auction';

interface PlaceBidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auction: Auction;
  bidderWallet: string;
  nftName?: string;
}

export function PlaceBidModal({
  open,
  onOpenChange,
  auction,
  bidderWallet,
  nftName
}: PlaceBidModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  const { mutate: placeBid, isPending } = usePlaceBid();

  const minBidLamports = calculateMinBid(auction.current_price_lamports);
  const minBidSOL = lamportsToSOL(minBidLamports);
  const currentPriceSOL = lamportsToSOL(auction.current_price_lamports);

  const isSeller = bidderWallet === auction.seller_wallet;

  const placeBidSchema = useMemo(() => z.object({
    bidAmount: z.string()
      .trim()
      .nonempty({ message: 'Bid amount is required' })
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= minBidSOL, {
        message: `Minimum bid is ${formatSOL(minBidLamports, 4)} SOL`
      })
      .refine((val) => parseFloat(val) <= 1000000, {
        message: 'Maximum bid is 1,000,000 SOL'
      })
  }), [minBidSOL, minBidLamports]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if seller
    if (isSeller) {
      setError('You cannot bid on your own auction');
      return;
    }

    // Validate
    const result = placeBidSchema.safeParse({ bidAmount });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    const bidLamports = solToLamports(parseFloat(bidAmount));

    placeBid({
      auction_id: auction.id,
      bidder_wallet: bidderWallet,
      bid_price_lamports: bidLamports
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setBidAmount('');
      },
      onError: (err) => {
        setError(err.message);
      }
    });
  };

  const bidAmountValue = bidAmount ? parseFloat(bidAmount) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Gavel className="h-5 w-5 text-primary" />
            Place Bid
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Place your bid on {nftName || 'this NFT'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Current Info */}
          <div className="space-y-2 p-4 rounded-lg bg-muted/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price:</span>
              <span className="font-medium text-foreground">{formatSOL(auction.current_price_lamports, 4)} SOL</span>
            </div>
            {auction.winner_wallet && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Leading Bidder:</span>
                <span className="font-mono text-xs text-foreground">
                  {formatWalletAddress(auction.winner_wallet)}
                </span>
              </div>
            )}
          </div>

          {/* Bid Amount */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="text-foreground">
              Your Bid (SOL) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.01"
              min={minBidSOL}
              placeholder={minBidSOL.toFixed(4)}
              value={bidAmount}
              onChange={(e) => {
                setBidAmount(e.target.value);
                setError('');
              }}
              className="bg-background border-border text-foreground"
              disabled={isPending || isSeller}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum bid: {formatSOL(minBidLamports, 4)} SOL (+10%)
            </p>
          </div>

          {/* Bid Breakdown */}
          {bidAmountValue > 0 && (
            <div className="space-y-2 p-4 rounded-lg border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Bid Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your bid:</span>
                  <span className="font-medium text-foreground">{bidAmountValue.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform fee:</span>
                  <span className="font-medium text-foreground">0.00 SOL (0%)</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Total:</span>
                    <span className="font-bold text-primary">{bidAmountValue.toFixed(4)} SOL</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <Alert className="bg-muted/30 border-border">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-sm text-muted-foreground">
              This bid is binding. If you win the auction, you must complete the purchase.
            </AlertDescription>
          </Alert>

          {/* Seller Warning */}
          {isSeller && (
            <Alert className="bg-destructive/10 border-destructive">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm text-destructive">
                You cannot bid on your own auction.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSeller || !bidAmount}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? 'Placing Bid...' : 'Place Bid'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
