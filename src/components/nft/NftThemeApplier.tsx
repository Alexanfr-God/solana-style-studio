import React, { useState } from 'react';
import { Ghost, RefreshCw, Loader2, Gem, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNftOwnership } from '@/hooks/useNftOwnership';
import { usePhantomThemeStore } from '@/stores/phantomThemeStore';
import { pushThemeToPhantom } from '@/utils/wccToLayoutDocument';
import { toast } from 'sonner';

interface NftThemeApplierProps {
  /** Show compact inline version (for ThemeChat sidebar) */
  compact?: boolean;
}

export const NftThemeApplier: React.FC<NftThemeApplierProps> = ({ compact = false }) => {
  const { ownedThemes, isLoading, hasNftThemes, refetch } = useNftOwnership();
  const { setPhantomTheme } = usePhantomThemeStore();
  const [pushingId, setPushingId] = useState<string | null>(null);

  // Don't render if wallet has no NFT themes (silent hide)
  if (!isLoading && !hasNftThemes) return null;

  const handleApplyPreview = (mintAddress: string, themeData: typeof ownedThemes[0]['themeData'], themeName: string) => {
    setPhantomTheme(themeData);
    toast.success(
      `✨ NFT Theme "${themeName}" applied!`,
      { description: 'Preview updated — click ⚡ to push to real Phantom' }
    );
  };

  const handlePushToPhantom = async (mintAddress: string, themeData: typeof ownedThemes[0]['themeData'], themeName: string) => {
    setPushingId(mintAddress);
    try {
      await pushThemeToPhantom(themeData);
      toast.success(
        `⚡ "${themeName}" pushed to Phantom!`,
        { description: 'Your real Phantom wallet now has the NFT overlay' }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error('Could not reach Phantom overlay server', {
        description: msg.includes('3333')
          ? 'Run: npm run dev:server (in Phantom Overlay Editor)'
          : msg,
      });
    } finally {
      setPushingId(null);
    }
  };

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
                ${compact ? 'min-w-[200px] p-2' : 'p-2.5'}
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

              {/* Buttons: Apply (preview) + Push (real wallet) */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Apply to WCC preview */}
                <Button
                  size="sm"
                  onClick={() => handleApplyPreview(nft.mintAddress, nft.themeData, nft.themeName)}
                  className="h-6 px-2 text-[10px] bg-violet-600 hover:bg-violet-500 text-white"
                  title="Apply to WCC preview"
                >
                  Apply
                </Button>

                {/* Push to real Phantom */}
                <Button
                  size="sm"
                  onClick={() => handlePushToPhantom(nft.mintAddress, nft.themeData, nft.themeName)}
                  disabled={pushingId === nft.mintAddress}
                  className="h-6 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                  title="Push overlay to real Phantom wallet (requires overlay server on port 3333)"
                >
                  {pushingId === nft.mintAddress
                    ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    : <Zap className="h-2.5 w-2.5" />
                  }
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {!isLoading && hasNftThemes && (
        <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
          <span><span className="text-violet-400">Apply</span> = WCC preview</span>
          <span><span className="text-emerald-400">⚡</span> = real Phantom wallet</span>
        </div>
      )}
    </div>
  );
};
