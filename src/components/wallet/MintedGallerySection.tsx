import { useEffect, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ExternalLink, Sparkles, Tag, ShoppingBag } from 'lucide-react';
import { useThemeStore } from '@/state/themeStore';
import { toast } from 'sonner';
import { RibbonBadge } from '@/components/nft/RibbonBadge';
import { RatingStars } from '@/components/nft/RatingStars';
import { ListNftModal } from '@/components/nft/ListNftModal';
import { BuyNftModal } from '@/components/nft/BuyNftModal';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';

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
  
  // Fallback for raw CID
  return `https://gateway.lighthouse.storage/ipfs/${uri}`;
}

type MintRow = {
  id: string;
  created_at: string;
  network: string;
  blockchain: string;
  tx_sig: string;
  mint_address: string;
  owner_address: string;
  metadata_uri: string;
  theme_name?: string | null;
  image_url?: string | null;
  rating_avg?: number;
  rating_count?: number;
  is_listed?: boolean;
  price_lamports?: number;
  listing_id?: string;
};

export default function MintedGallerySection() {
  const { address } = useAppKitAccount();
  const { setTheme, setActiveThemeId } = useThemeStore();
  
  const [items, setItems] = useState<MintRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyMints, setOnlyMyMints] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [selectedBlockchain, setSelectedBlockchain] = useState<'all' | 'solana' | 'ethereum'>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<'all' | 'devnet' | 'mainnet'>('all');
  const [showWccOnly, setShowWccOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [showListedOnly, setShowListedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Marketplace modals
  const [listModalOpen, setListModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MintRow | null>(null);
  
  const pageSize = 24;

  useEffect(() => {
    fetchMints();
  }, [searchQuery, onlyMyMints, sortOrder, selectedBlockchain, selectedNetwork, showWccOnly, minRating, showListedOnly, page, address]);

  async function fetchMints() {
    setIsLoading(true);
    try {
      let query = supabase
        .from('minted_themes')
        .select('*', { count: 'exact' });

      // Filter by blockchain
      if (selectedBlockchain !== 'all') {
        query = query.eq('blockchain', selectedBlockchain);
      }

      // Filter by network
      if (selectedNetwork !== 'all') {
        query = query.eq('network', selectedNetwork);
      }

      // Search
      if (searchQuery.trim()) {
        const search = `%${searchQuery.trim()}%`;
        query = query.or(
          `mint_address.ilike.${search},owner_address.ilike.${search},tx_sig.ilike.${search},theme_name.ilike.${search}`
        );
      }

      // Filter "My Mints"
      if (onlyMyMints && address) {
        query = query.eq('owner_address', address);
      }

      // Filter "WCC Themes"
      if (showWccOnly) {
        query = query.ilike('theme_name', 'WCC:%');
      }

      // Filter by minimum rating
      if (minRating > 0) {
        query = query.gte('rating_avg', minRating);
      }

      // Filter listed only
      if (showListedOnly) {
        query = query.eq('is_listed', true);
      }

      // Sort
      if (sortOrder === 'rating') {
        query = query.order('rating_avg', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('created_at', { 
          ascending: sortOrder === 'oldest' 
        });
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setItems(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('[MintedGallery] Error fetching mints:', error);
      toast.error('Failed to load minted themes');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApplyTheme(metadataUri: string, themeName: string) {
    const loadingToast = toast.loading('📥 Loading from IPFS...');
    
    try {
      // Check localStorage cache first (TTL: 24 hours)
      const cacheKey = `ipfs_cache_${metadataUri}`;
      const cached = localStorage.getItem(cacheKey);
      let metadata;
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        // Use cache if less than 24 hours old
        if (age < 24 * 60 * 60 * 1000) {
          console.log('[MintedGallery] Using cached metadata');
          metadata = data;
          toast.loading('📦 Loading from cache...', { id: loadingToast });
        }
      }
      
      // Fetch from IPFS if not cached
      if (!metadata) {
        console.log('[MintedGallery] Fetching metadata from:', metadataUri);
        
        // Convert IPFS URI to HTTP URL
        const httpUrl = ipfsToHttp(metadataUri);
        console.log('[MintedGallery] HTTP URL:', httpUrl);
        
        const response = await fetch(httpUrl);
        if (!response.ok) {
          const errorBody = await response.text();
          console.error('[MintedGallery] Fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            url: httpUrl,
            body: errorBody
          });
          throw new Error(`IPFS fetch failed: ${response.status} ${response.statusText}`);
        }
        
        metadata = await response.json();
        
        // Cache the metadata
        localStorage.setItem(cacheKey, JSON.stringify({
          data: metadata,
          timestamp: Date.now()
        }));
      }
      
      toast.loading('🔍 Parsing theme data...', { id: loadingToast });
      console.log('[MintedGallery] Metadata received:', metadata);
      
      // Try multiple paths for theme data (new and legacy NFTs)
      let themeData = 
        metadata.properties?.theme || 
        metadata.theme || 
        metadata.properties?.files?.[0]?.theme;
      
      // Fallback: fetch from wcc_theme_uri for legacy NFTs
      if (!themeData && metadata.wcc_theme_uri) {
        console.log('[MintedGallery] Fetching legacy theme from:', metadata.wcc_theme_uri);
        toast.loading('🔄 Loading legacy format...', { id: loadingToast });
        
        // Convert IPFS URI to HTTP URL
        const legacyHttpUrl = ipfsToHttp(metadata.wcc_theme_uri);
        console.log('[MintedGallery] Legacy HTTP URL:', legacyHttpUrl);
        
        const legacyResponse = await fetch(legacyHttpUrl);
        if (legacyResponse.ok) {
          themeData = await legacyResponse.json();
        }
      }
      
      if (!themeData) {
        console.error('[MintedGallery] Invalid metadata structure:', metadata);
        throw new Error('Theme data not found in NFT metadata. This NFT may need to be re-minted.');
      }
      
      // Enhanced validation - check required layers
      toast.loading('✅ Validating theme structure...', { id: loadingToast });
      
      const requiredLayers = ['homeLayer', 'lockLayer'];
      const missingLayers = requiredLayers.filter(layer => !themeData[layer]);
      
      if (missingLayers.length > 0) {
        const availableLayers = Object.keys(themeData).filter(k => k.includes('Layer')).join(', ');
        console.error('[MintedGallery] Missing layers:', missingLayers);
        console.log('[MintedGallery] Available layers:', availableLayers);
        throw new Error(
          `Invalid theme structure: missing ${missingLayers.join(', ')}. ` +
          `Found layers: ${availableLayers || 'none'}. This NFT needs to be re-minted.`
        );
      }
      
      // Validate layer structure
      if (typeof themeData.homeLayer !== 'object' || typeof themeData.lockLayer !== 'object') {
        throw new Error('Invalid theme structure: layers must be objects.');
      }
      
      console.log('[MintedGallery] Theme validation passed:', themeData);
      toast.loading('🎨 Applying theme...', { id: loadingToast });
      
      // Clear any preview and apply theme
      const store = useThemeStore.getState();
      store.clearPreview?.();
      setTheme(themeData);
      setActiveThemeId(themeName);
      
      toast.success(`✨ "${themeName}" applied successfully!`, { id: loadingToast });
      
      // Scroll to preview
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('[MintedGallery] Error applying theme:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to apply theme. See console for details.',
        { id: loadingToast }
      );
    }
  }

  async function handleRateNFT(nftMint: string, rating: number) {
    if (!address) {
      toast.error('Connect wallet to rate NFTs');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('rate_nft', {
        body: {
          nft_mint: nftMint,
          user_wallet: address,
          rating
        }
      });

      if (error) throw error;

      toast.success(`Rated ${rating} ⭐`);
      
      // Optimize: update only this card if API returned updated_stats
      if (data?.updated_stats) {
        setItems(prev => prev.map(item => 
          item.mint_address === nftMint 
            ? { ...item, rating_avg: data.updated_stats.rating_avg, rating_count: data.updated_stats.rating_count }
            : item
        ));
      } else {
        // Fallback: refresh all cards
        fetchMints();
      }
    } catch (error) {
      console.error('[Rate NFT] Error:', error);
      toast.error('Failed to rate NFT');
    }
  }

  // Marketplace functions
  async function handleCreateListing(nftMint: string, priceLamports: number) {
    if (!address) {
      toast.error('Connect wallet to list NFTs');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('create-listing', {
        body: {
          nft_mint: nftMint,
          seller_wallet: address,
          price_lamports: priceLamports
        }
      });

      if (error) throw error;

      toast.success('🏷️ NFT listed for sale!');
      fetchMints();
    } catch (error) {
      console.error('[Create Listing] Error:', error);
      toast.error(error.message || 'Failed to create listing');
    }
  }

  async function handleBuyNFT(listingId: string) {
    if (!address) {
      toast.error('Connect wallet to buy NFTs');
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('buy-nft', {
        body: {
          listing_id: listingId,
          buyer_wallet: address
        }
      });

      if (error) throw error;

      toast.success('🎉 NFT purchased successfully!');
      fetchMints();
    } catch (error) {
      console.error('[Buy NFT] Error:', error);
      toast.error(error.message || 'Failed to buy NFT');
    }
  }

  async function handleCancelListing(listingId: string) {
    if (!address) {
      toast.error('Connect wallet to cancel listing');
      return;
    }

    if (!confirm('Cancel this listing?')) return;

    try {
      const { error } = await supabase.functions.invoke('cancel-listing', {
        body: {
          listing_id: listingId,
          seller_wallet: address
        }
      });

      if (error) throw error;

      toast.success('Listing cancelled');
      fetchMints();
    } catch (error) {
      console.error('[Cancel Listing] Error:', error);
      toast.error(error.message || 'Failed to cancel listing');
    }
  }

  function openListModal(item: MintRow) {
    setSelectedItem(item);
    setListModalOpen(true);
  }

  function openBuyModal(item: MintRow) {
    setSelectedItem(item);
    setBuyModalOpen(true);
  }

  function formatAddress(addr: string, head = 4, tail = 4) {
    if (addr.length <= head + tail) return addr;
    return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <section className="mt-16 pt-12 border-t border-white/10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Minted Gallery
          </span>
        </h2>
        <p className="text-gray-400">
          Explore NFT themes minted on Solana Devnet
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search mint / owner / tx / theme..."
            className="w-64 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />

          {/* My Mints Toggle */}
          <Button
            variant={onlyMyMints ? 'default' : 'outline'}
            onClick={() => {
              setOnlyMyMints(!onlyMyMints);
              setPage(1);
            }}
            disabled={!address}
            className={onlyMyMints 
              ? 'bg-purple-500 hover:bg-purple-600' 
              : 'border-white/10 text-white hover:bg-white/5'
            }
          >
            My Mints {onlyMyMints && `(${totalCount})`}
          </Button>

          {/* WCC Themes Toggle */}
          <Button
            variant={showWccOnly ? 'default' : 'outline'}
            onClick={() => {
              setShowWccOnly(!showWccOnly);
              setPage(1);
            }}
            className={showWccOnly 
              ? 'bg-purple-500 hover:bg-purple-600' 
              : 'border-white/10 text-white hover:bg-white/5'
            }
          >
            <img src="/lovable-uploads/WCC.png" alt="WCC" className="w-4 h-4 mr-1" />
            WCC Themes {showWccOnly && `(${totalCount})`}
          </Button>

          {/* For Sale Toggle */}
          <Button
            variant={showListedOnly ? 'default' : 'outline'}
            onClick={() => {
              setShowListedOnly(!showListedOnly);
              setPage(1);
            }}
            className={showListedOnly 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'border-white/10 text-white hover:bg-white/5'
            }
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            For Sale {showListedOnly && `(${totalCount})`}
          </Button>

          {/* Blockchain Filter */}
          <Select
            value={selectedBlockchain}
            onValueChange={(value: any) => {
              setSelectedBlockchain(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="solana">🟣 Solana</SelectItem>
              <SelectItem value="ethereum">⬨ Ethereum</SelectItem>
            </SelectContent>
          </Select>

          {/* Network Filter */}
          <Select
            value={selectedNetwork}
            onValueChange={(value: any) => {
              setSelectedNetwork(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Networks</SelectItem>
              <SelectItem value="devnet">Devnet</SelectItem>
              <SelectItem value="mainnet">Mainnet</SelectItem>
            </SelectContent>
          </Select>

          {/* Min Rating Filter */}
          <Select
            value={minRating.toString()}
            onValueChange={(value) => {
              setMinRating(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Ratings</SelectItem>
              <SelectItem value="2">⭐ 2+ Stars</SelectItem>
              <SelectItem value="3">⭐⭐ 3+ Stars</SelectItem>
              <SelectItem value="4">⭐⭐⭐ 4+ Stars</SelectItem>
              <SelectItem value="4.5">⭐⭐⭐⭐ 4.5+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <Select
          value={sortOrder}
          onValueChange={(value: any) => {
            setSortOrder(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="rating">Rating ↓</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No minted themes found
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
            >
              {/* Preview Image */}
              <div className="relative w-full h-[220px] sm:h-[240px] lg:h-[260px] bg-black/20 overflow-hidden rounded-t-xl">
              {/* For Sale Badge */}
              {item.is_listed && (
                <div className="absolute top-2 left-2 z-10 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>FOR SALE</span>
                </div>
              )}
              
              {/* Ribbon Badge - single chain indicator in top-right corner */}
              <RibbonBadge 
                chain={(item.blockchain || 'solana') as 'solana' | 'ethereum'}
                network={item.network as 'devnet' | 'mainnet'}
              />

              {/* WCC Logo - moved to bottom-left corner */}
              <div className="absolute bottom-2 left-2 z-10">
                <img 
                  src="/lovable-uploads/WCC.png" 
                  alt="WCC" 
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/30 p-1 backdrop-blur-sm opacity-60 hover:opacity-90 transition-opacity"
                />
              </div>

              {/* V1 Legacy Badge - moved next to WCC */}
              {!item.metadata_uri?.includes('properties') && (
                <div className="absolute bottom-2 left-9 sm:left-10 z-10 px-1.5 py-0.5 rounded bg-orange-500/60 backdrop-blur-sm">
                  <span className="text-[8px] sm:text-[9px] font-semibold text-white uppercase tracking-wide">Legacy</span>
                </div>
              )}
                
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.theme_name || 'Theme'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    No Preview
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-white truncate flex-1">
                    {item.theme_name || 'Unnamed Theme'}
                  </h3>
                  
                  {/* Rating Display (readonly) */}
                  <RatingStars
                    value={item.rating_avg || 0}
                    count={item.rating_count || 0}
                    readonly={true}
                    size="sm"
                    showCount={true}
                  />
                </div>
                
                {/* Interactive Rating */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-400">Rate this NFT:</span>
                  <RatingStars
                    value={item.rating_avg || 0}
                    onChange={(rating) => handleRateNFT(item.mint_address, rating)}
                    readonly={false}
                    size="sm"
                    showCount={false}
                  />
                </div>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <div>
                    <span className="text-gray-500">Mint:</span>{' '}
                    <span className="font-mono">{formatAddress(item.mint_address)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Owner:</span>{' '}
                    <span className="font-mono">{formatAddress(item.owner_address)}</span>
                  </div>
                  <div className="text-gray-500">
                    {formatDate(item.created_at)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 min-w-0 border-white/10 text-white hover:bg-white/10 px-2 text-xs sm:text-sm"
                    asChild
                  >
                    <a
                      href={`https://explorer.solana.com/tx/${item.tx_sig}?cluster=${item.network}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 sm:mr-1.5" />
                      <span className="hidden sm:inline truncate">Explorer</span>
                    </a>
                  </Button>
                  
                  <Button
                    size="sm"
                    className="flex-1 min-w-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-2 text-xs sm:text-sm"
                    onClick={() => handleApplyTheme(item.metadata_uri, item.theme_name || 'imported-theme')}
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 sm:mr-1.5" />
                    <span className="hidden sm:inline truncate">Apply</span>
                  </Button>
                </div>

                {/* Marketplace Actions */}
                <div className="mt-2 space-y-1.5 pt-2 border-t border-white/5">
                  {/* If current user is owner */}
                  {item.owner_address === address && (
                    <>
                      {!item.is_listed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-white/10 text-white hover:bg-green-500/20 hover:border-green-500/50"
                          onClick={() => openListModal(item)}
                        >
                          <Tag className="mr-1.5 h-3 w-3" />
                          List for Sale
                        </Button>
                      ) : (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                            onClick={() => handleCancelListing(item.listing_id!)}
                          >
                            ❌ Cancel
                          </Button>
                          <div className="flex-1 text-center text-xs text-green-400 font-semibold flex items-center justify-center">
                            💎 {MARKETPLACE_CONFIG.formatPrice(item.price_lamports!)} SOL
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* If listed and not owner */}
                  {item.is_listed && item.owner_address !== address && (
                    <>
                      <div className="text-center text-lg font-bold text-green-400 py-1">
                        💎 {MARKETPLACE_CONFIG.formatPrice(item.price_lamports!)} SOL
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={() => openBuyModal(item)}
                      >
                        <ShoppingBag className="mr-1.5 h-3 w-3" />
                        Buy Now
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-white/10 text-white hover:bg-white/5"
          >
            Previous
          </Button>
          
          <div className="text-gray-400 px-4">
            Page {page} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-white/10 text-white hover:bg-white/5"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {selectedItem && (
        <>
          <ListNftModal
            nftMint={selectedItem.mint_address}
            nftName={selectedItem.theme_name || 'Unnamed Theme'}
            currentPrice={selectedItem.price_lamports}
            isOpen={listModalOpen}
            onClose={() => {
              setListModalOpen(false);
              setSelectedItem(null);
            }}
            onConfirm={(priceLamports) => handleCreateListing(selectedItem.mint_address, priceLamports)}
          />

          <BuyNftModal
            listing={{
              id: selectedItem.listing_id!,
              nft_mint: selectedItem.mint_address,
              price_lamports: selectedItem.price_lamports!,
              seller_wallet: selectedItem.owner_address
            }}
            nftName={selectedItem.theme_name || 'Unnamed Theme'}
            nftImage={selectedItem.image_url || undefined}
            isOpen={buyModalOpen}
            onClose={() => {
              setBuyModalOpen(false);
              setSelectedItem(null);
            }}
            onConfirm={() => handleBuyNFT(selectedItem.listing_id!)}
          />
        </>
      )}
    </section>
  );
}
