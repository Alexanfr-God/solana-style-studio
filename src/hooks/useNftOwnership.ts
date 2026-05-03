import { useEffect, useState, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { useAppKitAccount } from '@reown/appkit/react';
import { supabase } from '@/integrations/supabase/client';
import type { WCCOverlayV3 } from '@/stores/phantomThemeStore';

export interface OwnedNftTheme {
  mintAddress: string;
  themeName: string;
  imageUrl: string;
  themeData: WCCOverlayV3;
  network: string;
  collectionName: string;
}

const SPL_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export function useNftOwnership() {
  const { address, isConnected } = useAppKitAccount();
  const [ownedThemes, setOwnedThemes] = useState<OwnedNftTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkOwnership = useCallback(async () => {
    if (!address || !isConnected) {
      setOwnedThemes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ── Step 1: Fast path — Supabase DB lookup ──────────────────────────────
      // Works for all WCC-minted NFTs where owner_address is recorded at mint time.
      const { data: dbThemes, error: dbError } = await supabase
        .from('minted_themes')
        .select('mint_address, theme_name, image_url, theme_data, network, collection_name')
        .eq('owner_address', address)
        .not('theme_data', 'is', null);

      if (dbError) {
        console.warn('[useNftOwnership] DB query failed, falling back to on-chain:', dbError.message);
      }

      if (dbThemes?.length) {
        console.log(`[useNftOwnership] Found ${dbThemes.length} NFT theme(s) in DB for ${address.slice(0, 8)}...`);
        setOwnedThemes(dbThemes.map(t => ({
          mintAddress: t.mint_address,
          themeName: t.theme_name ?? 'WCC Theme',
          imageUrl: t.image_url ?? '',
          themeData: t.theme_data as unknown as WCCOverlayV3,
          network: t.network ?? 'devnet',
          collectionName: t.collection_name ?? 'WCC',
        })));
        return;
      }

      // ── Step 2: On-chain fallback ────────────────────────────────────────────
      // Queries all SPL token accounts for the wallet, then cross-references
      // with known WCC mint addresses in minted_themes table.
      // Handles the case where ownership transferred on-chain but DB wasn't updated.
      const { data: allMints } = await supabase
        .from('minted_themes')
        .select('mint_address, theme_name, image_url, theme_data, network, collection_name')
        .not('theme_data', 'is', null);

      if (!allMints?.length) {
        console.log('[useNftOwnership] No WCC themes in DB yet');
        setOwnedThemes([]);
        return;
      }

      const RPC = (import.meta as unknown as Record<string, Record<string, string>>).env?.VITE_SOLANA_RPC
        ?? 'https://api.devnet.solana.com';

      const conn = new Connection(RPC, 'confirmed');
      const walletKey = new PublicKey(address);

      const tokenAccounts = await conn.getParsedTokenAccountsByOwner(walletKey, {
        programId: new PublicKey(SPL_TOKEN_PROGRAM),
      });

      // Collect mints where balance > 0 (NFT balance is always 1)
      const heldMints = new Set<string>(
        tokenAccounts.value
          .filter(a => {
            const amount = a.account.data.parsed?.info?.tokenAmount?.uiAmount;
            return typeof amount === 'number' && amount > 0;
          })
          .map(a => a.account.data.parsed?.info?.mint as string)
          .filter(Boolean)
      );

      const owned = allMints.filter(m => heldMints.has(m.mint_address));

      console.log(
        `[useNftOwnership] On-chain check: wallet holds ${heldMints.size} tokens, ` +
        `${owned.length} WCC NFT(s) matched`
      );

      // ── Step 3: Update DB owner_address if it has changed (secondary market) ─
      if (owned.length) {
        const updates = owned.map(m =>
          supabase
            .from('minted_themes')
            .update({ owner_address: address })
            .eq('mint_address', m.mint_address)
            .neq('owner_address', address) // only update if different
        );
        await Promise.allSettled(updates);
      }

      setOwnedThemes(owned.map(t => ({
        mintAddress: t.mint_address,
        themeName: t.theme_name ?? 'WCC Theme',
        imageUrl: t.image_url ?? '',
        themeData: t.theme_data as unknown as WCCOverlayV3,
        network: t.network ?? 'devnet',
        collectionName: t.collection_name ?? 'WCC',
      })));

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn('[useNftOwnership] ownership check failed:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Auto-check whenever wallet connects / address changes
  useEffect(() => {
    checkOwnership();
  }, [checkOwnership]);

  return {
    ownedThemes,
    isLoading,
    error,
    hasNftThemes: ownedThemes.length > 0,
    refetch: checkOwnership,
  };
}
