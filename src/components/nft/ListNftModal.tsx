import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';
import { AlertCircle, DollarSign } from 'lucide-react';

interface ListNftModalProps {
  nftMint: string;
  nftName: string;
  currentPrice?: number; // in lamports
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (priceLamports: number) => Promise<void>;
}

export const ListNftModal: React.FC<ListNftModalProps> = ({
  nftMint,
  nftName,
  currentPrice,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [priceSOL, setPriceSOL] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceLamports = priceSOL ? MARKETPLACE_CONFIG.solToLamports(parseFloat(priceSOL)) : 0;
  const platformFee = MARKETPLACE_CONFIG.calculateFee(priceLamports);
  const sellerReceives = MARKETPLACE_CONFIG.calculateSellerReceives(priceLamports);

  const isValidPrice = priceLamports >= MARKETPLACE_CONFIG.MIN_LISTING_PRICE_LAMPORTS;

  const handleSubmit = async () => {
    if (!isValidPrice) return;

    setIsSubmitting(true);
    try {
      await onConfirm(priceLamports);
      onClose();
      setPriceSOL('');
    } catch (error) {
      console.error('[ListNftModal] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">List NFT for Sale</DialogTitle>
          <DialogDescription className="text-gray-400">
            {nftName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white">
              Price (SOL)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                step="0.1"
                min={MARKETPLACE_CONFIG.lamportsToSol(MARKETPLACE_CONFIG.MIN_LISTING_PRICE_LAMPORTS)}
                placeholder="0.5"
                value={priceSOL}
                onChange={(e) => setPriceSOL(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            {priceSOL && !isValidPrice && (
              <p className="text-xs text-red-400">
                Minimum price: {MARKETPLACE_CONFIG.lamportsToSol(MARKETPLACE_CONFIG.MIN_LISTING_PRICE_LAMPORTS)} SOL
              </p>
            )}
          </div>

          {/* Fee Breakdown */}
          {priceSOL && isValidPrice && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
                <div className="flex-1 space-y-1 text-sm">
                  <div className="font-semibold text-yellow-300">Platform Fee (10%)</div>
                  
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Total Price:</span>
                      <span className="font-mono">{MARKETPLACE_CONFIG.formatPrice(priceLamports)} SOL</span>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <span>You receive:</span>
                      <span className="font-mono font-semibold">
                        {MARKETPLACE_CONFIG.formatPrice(sellerReceives)} SOL (90%)
                      </span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                      <span>Platform fee:</span>
                      <span className="font-mono">{MARKETPLACE_CONFIG.formatPrice(platformFee)} SOL (10%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/10 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValidPrice || isSubmitting}
            className="flex-1 bg-purple-500 hover:bg-purple-600"
          >
            {isSubmitting ? 'Listing...' : 'List for Sale'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
