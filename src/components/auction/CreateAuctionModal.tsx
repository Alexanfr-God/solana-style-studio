/**
 * Create Auction Modal Component
 * Allows NFT owners to create an auction for their NFT
 */

import { useState } from 'react';
import { z } from 'zod';
import { Gavel, Calendar, Wallet } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAuction } from '@/hooks/useAuction';
import { useSolanaBalance } from '@/hooks/useSolanaBalance';
import { calculateEndTime, formatDate, solToLamports } from '@/utils/auctionUtils';
import type { CreateAuctionParams } from '@/types/auction';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CreateAuctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nftMint: string;
  sellerWallet: string;
  nftName?: string;
}

const DURATION_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '12 hours', hours: 12 },
  { label: '1 day', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
  { label: '14 days', hours: 336 },
] as const;

const createAuctionSchema = z.object({
  startPrice: z.string()
    .trim()
    .nonempty({ message: 'Start price is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.1, {
      message: 'Minimum start price is 0.1 SOL'
    })
    .refine((val) => parseFloat(val) <= 1000000, {
      message: 'Maximum start price is 1,000,000 SOL'
    }),
  duration: z.number().min(1, { message: 'Duration is required' })
});

export function CreateAuctionModal({
  open,
  onOpenChange,
  nftMint,
  sellerWallet,
  nftName
}: CreateAuctionModalProps) {
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState<number>(72); // 3 days default
  const [errors, setErrors] = useState<{ startPrice?: string; duration?: string }>({});

  const { mutate: createAuction, isPending } = useCreateAuction();
  const { balanceSOL, isLoading: isLoadingBalance } = useSolanaBalance(sellerWallet);

  // Minimum balance needed for auction creation (~0.01 SOL for transaction fees)
  const minBalanceRequired = 0.01;
  const hasEnoughBalance = balanceSOL >= minBalanceRequired;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const result = createAuctionSchema.safeParse({
      startPrice,
      duration
    });

    if (!result.success) {
      const fieldErrors: { startPrice?: string; duration?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'startPrice') fieldErrors.startPrice = err.message;
        if (err.path[0] === 'duration') fieldErrors.duration = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const params: CreateAuctionParams = {
      nft_mint: nftMint,
      seller_wallet: sellerWallet,
      start_price_lamports: solToLamports(parseFloat(startPrice)),
      duration_hours: duration
    };

    createAuction(params, {
      onSuccess: () => {
        onOpenChange(false);
        setStartPrice('');
        setDuration(72);
      }
    });
  };

  const endTime = duration ? calculateEndTime(duration) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Gavel className="h-5 w-5 text-primary" />
            Create Auction
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up an auction for {nftName || 'your NFT'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Wallet Balance Info */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Your Balance:</span>
            </div>
            {isLoadingBalance ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : (
              <span className={`text-sm font-medium ${!hasEnoughBalance ? 'text-destructive' : 'text-foreground'}`}>
                {balanceSOL.toFixed(4)} SOL
              </span>
            )}
          </div>

          {/* Low Balance Warning */}
          {!isLoadingBalance && !hasEnoughBalance && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient SOL balance for transaction fees. You need at least {minBalanceRequired} SOL.
              </AlertDescription>
            </Alert>
          )}

          {/* Starting Price */}
          <div className="space-y-2">
            <Label htmlFor="startPrice" className="text-foreground">
              Starting Price (SOL) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startPrice"
              type="number"
              step="0.01"
              min="0.1"
              placeholder="0.1"
              value={startPrice}
              onChange={(e) => setStartPrice(e.target.value)}
              className="bg-background border-border text-foreground"
              disabled={isPending}
            />
            {errors.startPrice && (
              <p className="text-sm text-destructive">{errors.startPrice}</p>
            )}
            <p className="text-xs text-muted-foreground">Minimum: 0.1 SOL</p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-foreground">
              Duration <span className="text-destructive">*</span>
            </Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(parseInt(value))}
              disabled={isPending}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.hours}
                    value={option.hours.toString()}
                    className="text-foreground hover:bg-muted cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration}</p>
            )}
          </div>

          {/* End Time Preview */}
          {endTime && (
            <div className="rounded-lg bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Auction will end at:</span>
              </div>
              <p className="text-sm font-medium text-foreground pl-6">
                {formatDate(endTime.toISOString())}
              </p>
            </div>
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
              disabled={isPending || !hasEnoughBalance || isLoadingBalance}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? 'Creating...' : 'Create Auction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
