/**
 * NFT Detail Page
 * Displays detailed information about an NFT and its auction
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppKitAccount } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuctionPanel } from '@/components/auction/AuctionPanel';
import { RatingStars } from '@/components/nft/RatingStars';
import { ChainBadge } from '@/components/nft/ChainBadge';
import { useAuctionByNft } from '@/hooks/useAuction';
import { useAuctionRealtimeByNft } from '@/hooks/useAuctionRealtime';
import { formatWalletAddress } from '@/utils/auctionUtils';
import { toast } from 'sonner';

// Convert IPFS URI to HTTP gateway URL
function ipfsToHttp(uri: string): string {
  if (!uri) return uri;
  
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return `https://gateway.lighthouse.storage/ipfs/${cid}`;
  }
  
  if (uri.startsWith('https://')) {
    return uri;
  }
  
  return `https://gateway.lighthouse.storage/ipfs/${uri}`;
}

type NFTData = {
  mint_address: string;
  owner_address: string;
  theme_name?: string | null;
  image_url?: string | null;
  metadata_uri: string;
  blockchain: string;
  network: string;
  tx_sig: string;
  created_at: string;
  rating_avg?: number;
  rating_count?: number;
  is_listed?: boolean;
  price_lamports?: number;
};

export default function NftDetailPage() {
  const { mintAddress } = useParams<{ mintAddress: string }>();
  const navigate = useNavigate();
  const { address } = useAppKitAccount();

  const [nft, setNft] = useState<NFTData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { data: auction } = useAuctionByNft(mintAddress);
  useAuctionRealtimeByNft(mintAddress);

  useEffect(() => {
    if (mintAddress) {
      fetchNFT();
    }
  }, [mintAddress]);

  async function fetchNFT() {
    if (!mintAddress) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('minted_themes')
        .select('*')
        .eq('mint_address', mintAddress)
        .single();

      if (error) throw error;
      setNft(data);
    } catch (error) {
      console.error('Error fetching NFT:', error);
      toast.error('Failed to load NFT');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopyAddress = () => {
    if (mintAddress) {
      navigator.clipboard.writeText(mintAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading NFT...</p>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">NFT Not Found</h2>
          <p className="text-muted-foreground">The NFT you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const imageUrl = ipfsToHttp(nft.image_url || '');
  const explorerUrl = nft.blockchain === 'solana'
    ? `https://solscan.io/tx/${nft.tx_sig}?cluster=${nft.network}`
    : `https://etherscan.io/tx/${nft.tx_sig}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image & Info */}
          <div className="space-y-6">
            {/* NFT Image */}
            <Card className="overflow-hidden bg-card border-border">
              <div className="aspect-[3/4] relative bg-black/40">
                <img
                  src={imageUrl}
                  alt={nft.theme_name || 'NFT'}
                  className="w-full h-full object-contain"
                />
              </div>
            </Card>

            {/* Rating */}
            {nft.rating_count && nft.rating_count > 0 && (
              <Card className="p-4 bg-card border-border">
                <RatingStars
                  value={nft.rating_avg || 0}
                  count={nft.rating_count || 0}
                  readonly
                  showCount
                />
              </Card>
            )}

            {/* Details Tab */}
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Blockchain:</span>
                  <ChainBadge chain={nft.blockchain as 'solana' | 'ethereum'} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Network:</span>
                  <Badge variant="outline" className="capitalize">
                    {nft.network}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Owner:</span>
                  <code className="text-xs font-mono text-foreground">
                    {formatWalletAddress(nft.owner_address)}
                  </code>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Mint Address:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAddress}
                    className="h-auto py-1 px-2"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <div className="pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(explorerUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Auction Panel */}
          <div className="space-y-6">
            {/* NFT Name & Status */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                {nft.theme_name || 'Unnamed NFT'}
              </h1>
              {nft.is_listed && (
                <Badge variant="secondary" className="text-xs">
                  Listed in Marketplace
                </Badge>
              )}
            </div>

            {/* Auction Panel */}
            <AuctionPanel
              auction={auction || null}
              nftMint={nft.mint_address}
              nftName={nft.theme_name || undefined}
              ownerAddress={nft.owner_address}
              userWallet={address}
              isListed={nft.is_listed || false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
