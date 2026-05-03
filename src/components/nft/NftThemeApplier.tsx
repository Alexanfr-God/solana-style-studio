import React from 'react';
import { Ghost, RefreshCw, Loader2, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNftOwnership } from '@/hooks/useNftOwnership';
import { usePhantomThemeStore } from '@/stores/phantomThemeStore';
import { toast } from 'sonner';

interface NftThemeApplierProps {
  /** Show compact inline version (for ThemeChat sidebar) */
  compact?: boolean;
}

export const NftThemeApplier: React.FC<NftThemeApplierProps> = ({ compact = false }) => {
  const { ownedThemes, isLoading, hasNftThemes, refetch } = useNftOwnership();
  const { setPhantomTheme } = usePhantomThemeStore();

  // Don't render if wallet has no NFT themes (silent hide)
  if (!isLoading && !hasNftThemes) return null;

  return (
    <div className={`nft-theme-applier ${compact ? 'py-2' : 'py-4 px-3'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Gem className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">
            Your NFT Themes
          </span>
          {hasNftThemes && (
            <span className="text-xs bg-violet-500/30 text-violet-200 rounded-full px-1.5 py-0.5 leading-none">
              {ownedThemes.length}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-white/30 hover:text-white/60 transition-colors"
          title="Refresh NFT list"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-white/40 text-xs py-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Checking NFT ownership…</span>
        </div>
      )}

      {/* NFT Theme Cards */}
      {!isLoading && hasNftThemes && (
        <div className={`flex ${compact ? 'flex-row gap-2 overflow-x-auto pb-1' : 'flex-col gap-2'}`}>
          {ownedThemes.map(nft => (
            <div
              key={nft.mintAddress}
              className={`
                flex items-center gap-2 rounded-lg border border-violet-500/25
                bg-gradient-to-r from-violet-500/10 to-purple-500/10
                hover:from-violet-500/20 hover:to-purple-500/20
                transition-all duration-200
                ${compact ? 'min-w-[160px] p-2' : 'p-2.5'}
              `}
            >
              {/* NFT thumbnail */}
              {nft.imageUrl ? (
                <img
                  src={nft.imageUrl}
                  alt={nft.themeName}
                  className="w-8 h-8 rounded-md object-cover flex-shrink-0 border border-violet-500/30"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-8 h-8 rounded-md bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Ghost className="h-4 w-4 text-violet-400" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/90 truncate">
                  {nft.themeName}
                </div>
                <div className="text-[10px] text-white/40 truncate">
                  {nft.collectionName} · {nft.mintAddress.slice(0, 6)}…
                </div>
              </div>

              {/* Apply button */}
              <Button
                size="sm"
                onClick={() => {
                  setPhantomTheme(nft.themeData);
                  toast.success(
                    `✨ NFT Theme "${nft.themeName}" applied!`,
                    { description: 'Your wallet overlay is now active' }
                  );
                }}
                className="h-6 px-2 text-[10px] bg-violet-600 hover:bg-violet-500 text-white flex-shrink-0"
              >
                Apply
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
