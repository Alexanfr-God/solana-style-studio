import { useEffect, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useThemeStore } from '@/state/themeStore';
import { toast } from 'sonner';

type MintRow = {
  id: string;
  created_at: string;
  network: string;
  tx_sig: string;
  mint_address: string;
  owner_address: string;
  metadata_uri: string;
  theme_name?: string | null;
  image_url?: string | null;
};

export default function MintedGallerySection() {
  const { address } = useAppKitAccount();
  const { setTheme, setActiveThemeId } = useThemeStore();
  
  const [items, setItems] = useState<MintRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyMyMints, setOnlyMyMints] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedBlockchain, setSelectedBlockchain] = useState<'all' | 'solana' | 'ethereum'>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<'all' | 'devnet' | 'mainnet'>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const pageSize = 24;

  useEffect(() => {
    fetchMints();
  }, [searchQuery, onlyMyMints, sortOrder, selectedBlockchain, selectedNetwork, page, address]);

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

      // Sort
      query = query.order('created_at', { 
        ascending: sortOrder === 'oldest' 
      });

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
    try {
      toast.info('📥 Loading theme from IPFS...');
      
      // Fetch theme data from IPFS
      const response = await fetch(metadataUri);
      if (!response.ok) throw new Error('Failed to fetch theme from IPFS');
      
      const metadata = await response.json();
      
      // Metadata structure: { name, description, image, properties: { theme: {...} } }
      const themeData = metadata.properties?.theme || metadata.theme;
      
      if (!themeData) {
        throw new Error('Invalid theme data in metadata');
      }
      
      // Apply theme to store
      setTheme(themeData);
      setActiveThemeId(themeName);
      
      toast.success(`✅ Theme "${themeName}" applied!`);
      
      // Scroll to preview
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('[MintedGallery] Error applying theme:', error);
      toast.error('Failed to apply theme');
    }
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
        </div>

        {/* Sort */}
        <Select
          value={sortOrder}
          onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
        >
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
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
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
            >
              {/* Preview Image */}
              <div className="aspect-[4/3] bg-black/20 overflow-hidden">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.theme_name || 'Theme'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    No Preview
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-white truncate">
                  {item.theme_name || 'Unnamed Theme'}
                </h3>
                
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
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                    asChild
                  >
                    <a
                      href={`https://explorer.solana.com/tx/${item.tx_sig}?cluster=${item.network}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Explorer
                    </a>
                  </Button>
                  
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    onClick={() => handleApplyTheme(item.metadata_uri, item.theme_name || 'imported-theme')}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
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
    </section>
  );
}
