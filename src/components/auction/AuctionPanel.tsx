/**
 * Auction Panel Component
 * Displays auction information and controls
 */

import { useState } from 'react';
import { Gavel, TrendingUp, User, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from './CountdownTimer';
import { PlaceBidModal } from './PlaceBidModal';
import { CreateAuctionModal } from './CreateAuctionModal';
import {
  useAuction,
  useCancelAuction,
  useFinalizeAuction
} from '@/hooks/useAuction';
import { useAuctionWithBidsRealtime } from '@/hooks/useAuctionRealtime';
import {
  formatSOLWithSymbol,
  formatWalletAddress,
  isAuctionActive,
  isAuctionEnded
} from '@/utils/auctionUtils';
import type { Auction } from '@/types/auction';

interface AuctionPanelProps {
  auction: Auction | null;
  nftMint: string;
  nftName?: string;
  ownerAddress: string;
  userWallet?: string;
  isListed: boolean;
}

export function AuctionPanel({
  auction,
  nftMint,
  nftName,
  ownerAddress,
  userWallet,
  isListed
}: AuctionPanelProps) {
  const [placeBidModalOpen, setPlaceBidModalOpen] = useState(false);
  const [createAuctionModalOpen, setCreateAuctionModalOpen] = useState(false);

  const { mutate: cancelAuction, isPending: isCancelling } = useCancelAuction();
  const { mutate: finalizeAuction, isPending: isFinalizing } = useFinalizeAuction();

  // Real-time updates
  useAuctionWithBidsRealtime(auction?.id);

  const isOwner = userWallet && userWallet === ownerAddress;
  const isSeller = auction && userWallet && userWallet === auction.seller_wallet;
  const isActive = auction ? isAuctionActive(auction) : false;
  const hasEnded = auction ? isAuctionEnded(auction) : false;

  // No auction exists
  if (!auction) {
    if (!isOwner) {
      return (
        <Card className="p-6 bg-card border-border">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
              <Gavel className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">No Active Auction</h3>
              <p className="text-sm text-muted-foreground">
                This NFT is not currently listed for auction.
              </p>
            </div>
          </div>
        </Card>
      );
    }

    // Owner can create auction
    if (!isListed) {
      return (
        <Card className="p-6 bg-card border-border">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Gavel className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Start an Auction</h3>
              <p className="text-sm text-muted-foreground">
                List your NFT for auction and let bidders compete for it.
              </p>
            </div>
            <Button
              onClick={() => setCreateAuctionModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Gavel className="w-4 h-4 mr-2" />
              Create Auction
            </Button>
          </div>

          {userWallet && (
            <CreateAuctionModal
              open={createAuctionModalOpen}
              onOpenChange={setCreateAuctionModalOpen}
              nftMint={nftMint}
              sellerWallet={userWallet}
              nftName={nftName}
            />
          )}
        </Card>
      );
    }

    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This NFT is listed in the marketplace.
          </p>
        </div>
      </Card>
    );
  }

  // Auction exists
  const handleCancelAuction = () => {
    if (!userWallet || !auction) return;
    
    cancelAuction({
      auction_id: auction.id,
      seller_wallet: userWallet
    });
  };

  const handleFinalizeAuction = () => {
    if (!auction) return;
    
    finalizeAuction({
      auction_id: auction.id
    });
  };

  return (
    <Card className="p-6 bg-card border-border space-y-6">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Gavel className="h-5 w-5 text-primary" />
          Auction
        </h2>
        <Badge
          variant={
            auction.status === 'active' && isActive
              ? 'default'
              : auction.status === 'finished'
              ? 'secondary'
              : 'outline'
          }
          className="capitalize"
        >
          {auction.status === 'active' && hasEnded ? 'Ended' : auction.status}
        </Badge>
      </div>

      {/* Current Price */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Current Price</p>
        <p className="text-3xl font-bold text-foreground">
          {formatSOLWithSymbol(auction.current_price_lamports, 4)}
        </p>
      </div>

      {/* Countdown Timer */}
      {isActive && (
        <div className="p-4 rounded-lg bg-muted/30">
          <CountdownTimer endAt={auction.end_at} />
        </div>
      )}

      {/* Highest Bidder */}
      {auction.winner_wallet && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Highest Bidder
          </p>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <code className="text-sm font-mono text-foreground">
              {formatWalletAddress(auction.winner_wallet)}
            </code>
          </div>
        </div>
      )}

      {/* Starting Price */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Starting Price:</span>
        <span className="font-medium text-foreground">
          {formatSOLWithSymbol(auction.start_price_lamports, 4)}
        </span>
      </div>

      {/* Seller */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Seller:</span>
        <code className="text-xs font-mono text-foreground">
          {formatWalletAddress(auction.seller_wallet)}
        </code>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4 border-t border-border">
        {/* Place Bid Button (for non-sellers when active) */}
        {isActive && !isSeller && userWallet && (
          <Button
            onClick={() => setPlaceBidModalOpen(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Gavel className="w-4 h-4 mr-2" />
            Place Bid
          </Button>
        )}

        {/* Cancel Button (for seller when no bids) */}
        {isActive && isSeller && !auction.winner_wallet && (
          <Button
            onClick={handleCancelAuction}
            disabled={isCancelling}
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10"
            size="lg"
          >
            <Ban className="w-4 h-4 mr-2" />
            {isCancelling ? 'Cancelling...' : 'Cancel Auction'}
          </Button>
        )}

        {/* Finalize Button (when ended) */}
        {hasEnded && auction.status === 'active' && (
          <Button
            onClick={handleFinalizeAuction}
            disabled={isFinalizing}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isFinalizing ? 'Finalizing...' : 'Finalize Auction'}
          </Button>
        )}

        {/* Ended Message */}
        {hasEnded && auction.status === 'finished' && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            This auction has ended
          </div>
        )}

        {/* Cancelled Message */}
        {auction.status === 'cancelled' && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            This auction was cancelled
          </div>
        )}
      </div>

      {/* Modals */}
      {userWallet && auction && (
        <PlaceBidModal
          open={placeBidModalOpen}
          onOpenChange={setPlaceBidModalOpen}
          auction={auction}
          bidderWallet={userWallet}
          nftName={nftName}
        />
      )}
    </Card>
  );
}
