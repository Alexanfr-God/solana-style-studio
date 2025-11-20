/**
 * Auction Statistics Dashboard
 * Displays analytics and statistics for NFT auctions
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gavel, TrendingUp, DollarSign, Users, Trophy } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { lamportsToSOL, formatWalletAddress } from '@/utils/auctionUtils';
import { toast } from 'sonner';

interface AuctionStats {
  totalActive: number;
  totalFinished: number;
  totalBids: number;
  avgBidPrice: number;
  totalVolume: number;
}

interface PopularNFT {
  nft_mint: string;
  theme_name: string | null;
  image_url: string | null;
  bid_count: number;
  current_price: number;
}

interface BidTrend {
  date: string;
  bids: number;
  volume: number;
}

export default function AuctionStatsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AuctionStats | null>(null);
  const [popularNFTs, setPopularNFTs] = useState<PopularNFT[]>([]);
  const [bidTrends, setBidTrends] = useState<BidTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  async function fetchStatistics() {
    try {
      setIsLoading(true);

      // Get auction counts by status
      const { data: auctions } = await supabase
        .from('nft_auctions')
        .select('status, current_price_lamports');

      const totalActive = auctions?.filter(a => a.status === 'active').length || 0;
      const totalFinished = auctions?.filter(a => a.status === 'finished').length || 0;

      // Get all bids
      const { data: allBids } = await supabase
        .from('nft_bids')
        .select('bid_price_lamports, created_at, auction_id');

      const totalBids = allBids?.length || 0;
      const avgBidPrice = allBids?.length
        ? allBids.reduce((sum, bid) => sum + bid.bid_price_lamports, 0) / allBids.length
        : 0;

      const totalVolume = auctions?.reduce((sum, a) => sum + a.current_price_lamports, 0) || 0;

      setStats({
        totalActive,
        totalFinished,
        totalBids,
        avgBidPrice,
        totalVolume,
      });

      // Get popular NFTs (most bids)
      if (allBids && allBids.length > 0) {
        const bidCounts = allBids.reduce((acc: Record<string, number>, bid) => {
          acc[bid.auction_id] = (acc[bid.auction_id] || 0) + 1;
          return acc;
        }, {});

        const topAuctionIds = Object.entries(bidCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);

        const { data: topAuctions } = await supabase
          .from('nft_auctions')
          .select('nft_mint, current_price_lamports, id')
          .in('id', topAuctionIds);

        if (topAuctions && topAuctions.length > 0) {
          const mintAddresses = topAuctions.map(a => a.nft_mint);
          const { data: nfts } = await supabase
            .from('minted_themes')
            .select('mint_address, theme_name, image_url')
            .in('mint_address', mintAddresses);

          const popular = topAuctions.map(auction => {
            const nft = nfts?.find(n => n.mint_address === auction.nft_mint);
            return {
              nft_mint: auction.nft_mint,
              theme_name: nft?.theme_name || null,
              image_url: nft?.image_url || null,
              bid_count: bidCounts[auction.id] || 0,
              current_price: auction.current_price_lamports,
            };
          }).sort((a, b) => b.bid_count - a.bid_count);

          setPopularNFTs(popular);
        }
      }

      // Get bid trends (last 7 days)
      if (allBids && allBids.length > 0) {
        const last7Days = new Array(7).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const trends = last7Days.map(date => {
          const dayBids = allBids.filter(bid => 
            bid.created_at.startsWith(date)
          );
          
          return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            bids: dayBids.length,
            volume: dayBids.reduce((sum, bid) => sum + lamportsToSOL(bid.bid_price_lamports), 0),
          };
        });

        setBidTrends(trends);
      }
    } catch (error) {
      console.error('[AuctionStats] Error:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  }

  const statusData = stats ? [
    { name: 'Active', value: stats.totalActive, color: '#22c55e' },
    { name: 'Finished', value: stats.totalFinished, color: '#6366f1' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/20">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Auction Statistics
              </h1>
              <p className="text-muted-foreground mt-1">
                Analytics and insights for NFT auctions
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {!isLoading && stats && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <Gavel className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Auctions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalActive}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Trophy className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Finished Auctions</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalFinished}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bids</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalBids}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volume</p>
                    <p className="text-2xl font-bold text-foreground">
                      {lamportsToSOL(stats.totalVolume).toFixed(2)} SOL
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bid Trends Chart */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Bid Activity (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bidTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bids"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Bids"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Auction Status Distribution */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-primary" />
                  Auction Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Volume Trends */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Trading Volume (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bidTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="volume" fill="hsl(var(--primary))" name="Volume (SOL)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Popular NFTs */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Most Popular NFTs
              </h3>
              {popularNFTs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No auction data available</p>
              ) : (
                <div className="space-y-4">
                  {popularNFTs.map((nft, index) => (
                    <div
                      key={nft.nft_mint}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => navigate(`/nft/${nft.nft_mint}`)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-background flex-shrink-0">
                        {nft.image_url ? (
                          <img
                            src={nft.image_url}
                            alt={nft.theme_name || 'NFT'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {nft.theme_name || 'Unnamed NFT'}
                        </h4>
                        <p className="text-sm text-muted-foreground font-mono">
                          {formatWalletAddress(nft.nft_mint)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Bids</p>
                        <p className="text-lg font-bold text-primary">{nft.bid_count}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-lg font-bold text-foreground">
                          {lamportsToSOL(nft.current_price).toFixed(4)} SOL
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Additional Stats */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Additional Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Average Bid Price</p>
                  <p className="text-2xl font-bold text-foreground">
                    {lamportsToSOL(stats.avgBidPrice).toFixed(4)} SOL
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Auctions</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalActive + stats.totalFinished}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Bids per Auction</p>
                  <p className="text-2xl font-bold text-foreground">
                    {((stats.totalActive + stats.totalFinished) > 0
                      ? (stats.totalBids / (stats.totalActive + stats.totalFinished)).toFixed(1)
                      : '0')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
