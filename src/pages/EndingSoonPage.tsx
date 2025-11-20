/**
 * Ending Soon Page
 * Displays auctions ending within the next 24 hours
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Gavel, ArrowLeft, ExternalLink } from 'lucide-react';
import { AuctionCountdown } from '@/components/auction/AuctionCountdown';
import { lamportsToSOL, formatWalletAddress } from '@/utils/auctionUtils';
import { toast } from 'sonner';

interface AuctionWithNFT {
  id: string;
  nft_mint: string;
  seller_wallet: string;
  start_price_lamports: number;
  current_price_lamports: number;
  status: string;
  end_at: string;
  created_at: string;
  theme_name?: string | null;
  image_url?: string | null;
  bid_count?: number;
}

export default function EndingSoonPage() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<AuctionWithNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEndingSoonAuctions();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchEndingSoonAuctions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchEndingSoonAuctions() {
    try {
      // Get current time and 24 hours from now
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Fetch active auctions ending within 24 hours
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('nft_auctions')
        .select('*')
        .eq('status', 'active')
        .lt('end_at', in24Hours.toISOString())
        .gt('end_at', now.toISOString())
        .order('end_at', { ascending: true });

      if (auctionsError) throw auctionsError;

      if (!auctionsData || auctionsData.length === 0) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }

      // Get NFT details for each auction
      const mintAddresses = auctionsData.map(a => a.nft_mint);
      const { data: nftsData, error: nftsError } = await supabase
        .from('minted_themes')
        .select('mint_address, theme_name, image_url')
        .in('mint_address', mintAddresses);

      if (nftsError) throw nftsError;

      // Get bid counts for each auction
      const auctionIds = auctionsData.map(a => a.id);
      const { data: bidsData, error: bidsError } = await supabase
        .from('nft_bids')
        .select('auction_id')
        .in('auction_id', auctionIds);

      if (bidsError) throw bidsError;

      // Count bids per auction
      const bidCounts = bidsData.reduce((acc: Record<string, number>, bid) => {
        acc[bid.auction_id] = (acc[bid.auction_id] || 0) + 1;
        return acc;
      }, {});

      // Merge data
      const mergedData = auctionsData.map(auction => {
        const nft = nftsData?.find(n => n.mint_address === auction.nft_mint);
        return {
          ...auction,
          theme_name: nft?.theme_name || null,
          image_url: nft?.image_url || null,
          bid_count: bidCounts[auction.id] || 0,
        };
      });

      setAuctions(mergedData);
    } catch (error) {
      console.error('[EndingSoon] Error fetching auctions:', error);
      toast.error('Failed to load ending soon auctions');
    } finally {
      setIsLoading(false);
    }
  }

  function getUrgencyLevel(endAt: string): 'critical' | 'warning' | 'normal' {
    const now = new Date().getTime();
    const end = new Date(endAt).getTime();
    const hoursLeft = (end - now) / (1000 * 60 * 60);

    if (hoursLeft < 1) return 'critical';
    if (hoursLeft < 6) return 'warning';
    return 'normal';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-red-500/20">
              <Clock className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Ending Soon
              </h1>
              <p className="text-muted-foreground mt-1">
                Auctions ending within the next 24 hours
              </p>
            </div>
          </div>

          {!isLoading && (
            <div className="mt-4 text-sm text-muted-foreground">
              {auctions.length} {auctions.length === 1 ? 'auction' : 'auctions'} ending soon
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading auctions...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && auctions.length === 0 && (
          <Card className="p-12 text-center bg-card border-border">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Auctions Ending Soon
            </h3>
            <p className="text-muted-foreground mb-6">
              There are no active auctions ending in the next 24 hours
            </p>
            <Button onClick={() => navigate('/')}>
              Browse All NFTs
            </Button>
          </Card>
        )}

        {/* Auctions List */}
        {!isLoading && auctions.length > 0 && (
          <div className="space-y-4">
            {auctions.map((auction) => {
              const urgency = getUrgencyLevel(auction.end_at);
              const urgencyColors = {
                critical: 'border-red-500/50 bg-red-500/5',
                warning: 'border-yellow-500/50 bg-yellow-500/5',
                normal: 'border-border bg-card',
              };

              return (
                <Card
                  key={auction.id}
                  className={`p-6 transition-all hover:shadow-lg cursor-pointer ${urgencyColors[urgency]}`}
                  onClick={() => navigate(`/nft/${auction.nft_mint}`)}
                >
                  <div className="flex gap-6">
                    {/* NFT Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {urgency === 'critical' && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-red-500 animate-pulse">
                          <span className="text-xs font-bold text-white">URGENT</span>
                        </div>
                      )}
                      {auction.image_url ? (
                        <img
                          src={auction.image_url}
                          alt={auction.theme_name || 'NFT'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Auction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-foreground truncate mb-1">
                            {auction.theme_name || 'Unnamed NFT'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono">{formatWalletAddress(auction.nft_mint)}</span>
                            <a
                              href={`https://explorer.solana.com/address/${auction.nft_mint}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="hover:text-primary"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Countdown */}
                        <div className="flex flex-col items-end gap-2">
                          <AuctionCountdown endAt={auction.end_at} compact={false} />
                        </div>
                      </div>

                      {/* Price & Bids Info */}
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Starting Price</p>
                          <p className="text-sm font-semibold text-foreground">
                            {lamportsToSOL(auction.start_price_lamports).toFixed(4)} SOL
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
                          <p className="text-sm font-bold text-primary">
                            {lamportsToSOL(auction.current_price_lamports).toFixed(4)} SOL
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Total Bids</p>
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                            <Gavel className="w-3 h-3" />
                            {auction.bid_count}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
