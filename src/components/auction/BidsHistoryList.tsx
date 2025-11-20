/**
 * Bids History List Component
 * Displays a list of all bids in chronological order
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, User, Clock } from 'lucide-react';
import { useAuctionBids } from '@/hooks/useAuction';
import { formatSOLWithSymbol, formatWalletAddress } from '@/utils/auctionUtils';
import { cn } from '@/lib/utils';

interface BidsHistoryListProps {
  auctionId: string;
}

export function BidsHistoryList({ auctionId }: BidsHistoryListProps) {
  const { data: bids = [], isLoading } = useAuctionBids(auctionId);

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Loading bids...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (bids.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <User className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">No bids yet</p>
            <p className="text-xs text-muted-foreground">Be the first to place a bid!</p>
          </div>
        </div>
      </Card>
    );
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Bids</h3>
        <Badge variant="secondary" className="text-xs">
          {bids.length} total
        </Badge>
      </div>

      <div className="space-y-3">
        {bids.map((bid, index) => {
          const isHighestBid = index === 0;
          
          return (
            <div
              key={bid.id}
              className={cn(
                'p-4 rounded-lg border transition-all',
                isHighestBid
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-muted/20 border-border hover:bg-muted/30'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Bidder info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {isHighestBid && (
                      <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    )}
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <code className="text-sm font-mono text-foreground">
                      {formatWalletAddress(bid.bidder_wallet)}
                    </code>
                    {isHighestBid && (
                      <Badge variant="default" className="text-xs">
                        Highest Bid
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatRelativeTime(bid.created_at)}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>
                      {new Date(bid.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                {/* Right side - Price */}
                <div className="text-right">
                  <div
                    className={cn(
                      'text-lg font-bold',
                      isHighestBid ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {formatSOLWithSymbol(bid.bid_price_lamports, 4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Bid #{bids.length - index}
                  </div>
                </div>
              </div>

              {/* Price increase indicator (if not first bid) */}
              {index < bids.length - 1 && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Increased by:</span>
                    <span className="font-semibold text-green-500">
                      +{formatSOLWithSymbol(
                        bid.bid_price_lamports - bids[index + 1].bid_price_lamports,
                        4
                      )}
                    </span>
                    <span className="text-muted-foreground">
                      (+
                      {(
                        ((bid.bid_price_lamports - bids[index + 1].bid_price_lamports) /
                          bids[index + 1].bid_price_lamports) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Total Bids</p>
            <p className="text-lg font-semibold text-foreground">{bids.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Unique Bidders</p>
            <p className="text-lg font-semibold text-foreground">
              {new Set(bids.map(b => b.bidder_wallet)).size}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
