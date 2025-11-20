/**
 * Bids History Chart Component
 * Displays a line chart showing bid price progression over time
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { useAuctionBids } from '@/hooks/useAuction';
import { lamportsToSOL, formatWalletAddress } from '@/utils/auctionUtils';
import type { Bid } from '@/types/auction';

interface BidsHistoryChartProps {
  auctionId: string;
}

interface ChartDataPoint {
  index: number;
  price: number;
  priceLabel: string;
  time: string;
  bidder: string;
  timestamp: number;
}

export function BidsHistoryChart({ auctionId }: BidsHistoryChartProps) {
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
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">No bids yet</p>
          </div>
        </div>
      </Card>
    );
  }

  // Transform bids to chart data
  const chartData: ChartDataPoint[] = bids.map((bid, index) => ({
    index: index + 1,
    price: lamportsToSOL(bid.bid_price_lamports),
    priceLabel: `${lamportsToSOL(bid.bid_price_lamports).toFixed(4)} SOL`,
    time: new Date(bid.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }),
    bidder: formatWalletAddress(bid.bidder_wallet),
    timestamp: new Date(bid.created_at).getTime()
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-1">
            Bid #{data.index}
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            <span className="font-medium text-foreground">{data.priceLabel}</span>
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            Time: {data.time}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            By: {data.bidder}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate min/max for better scaling
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || 0.1;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Bid Price History</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {bids.length} bid{bids.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="index"
            label={{ value: 'Bid Number', position: 'insideBottom', offset: -5 }}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            label={{ value: 'Price (SOL)', angle: -90, position: 'insideLeft' }}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{
              fill: 'hsl(var(--primary))',
              strokeWidth: 2,
              r: 5,
              stroke: 'hsl(var(--background))'
            }}
            activeDot={{
              r: 7,
              fill: 'hsl(var(--primary))',
              stroke: 'hsl(var(--background))',
              strokeWidth: 2
            }}
            name="Bid Price (SOL)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Starting Bid</p>
          <p className="text-sm font-semibold text-foreground">
            {chartData[0].priceLabel}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
          <p className="text-sm font-semibold text-primary">
            {chartData[chartData.length - 1].priceLabel}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Increase</p>
          <p className="text-sm font-semibold text-green-500">
            +{((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </Card>
  );
}
