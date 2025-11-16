import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';
import { AlertCircle, ShoppingCart } from 'lucide-react';

interface BuyNftModalProps {
  listing: {
    id: string;
    nft_mint: string;
    price_lamports: number;
    seller_wallet: string;
  };
  nftName: string;
  nftImage?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const BuyNftModal: React.FC<BuyNftModalProps> = ({
  listing,
  nftName,
  nftImage,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platformFee = MARKETPLACE_CONFIG.calculateFee(listing.price_lamports);
  const sellerReceives = MARKETPLACE_CONFIG.calculateSellerReceives(listing.price_lamports);

  const handleBuy = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('[BuyNftModal] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Buy NFT</DialogTitle>
          <DialogDescription className="text-gray-400">
            {nftName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* NFT Preview */}
          {nftImage && (
            <div className="aspect-video rounded overflow-hidden bg-black/20">
              <img 
                src={nftImage} 
                alt={nftName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Price Display */}
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-green-400">
              💎 {MARKETPLACE_CONFIG.formatPrice(listing.price_lamports)} SOL
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
              <div className="flex-1 space-y-1 text-sm">
                <div className="font-semibold text-blue-300">Purchase Breakdown</div>
                
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-mono font-semibold">
                      {MARKETPLACE_CONFIG.formatPrice(listing.price_lamports)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Seller receives:</span>
                    <span className="font-mono">
                      {MARKETPLACE_CONFIG.formatPrice(sellerReceives)} SOL (90%)
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Platform fee:</span>
                    <span className="font-mono">
                      {MARKETPLACE_CONFIG.formatPrice(platformFee)} SOL (10%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stub Warning */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5" />
              <div className="text-xs text-orange-300">
                <div className="font-semibold mb-1">Demo Mode</div>
                <p>This is a stub transaction. No real SOL will be transferred. Ownership will be updated in the database for testing purposes.</p>
              </div>
            </div>
          </div>
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
            onClick={handleBuy}
            disabled={isSubmitting}
            className="flex-1 bg-green-500 hover:bg-green-600"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Purchasing...' : 'Buy Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
