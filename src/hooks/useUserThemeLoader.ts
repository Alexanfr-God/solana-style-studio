import { useEffect } from 'react';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { useThemeStore } from '@/state/themeStore';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to load user's theme from database when wallet connects
 * This ensures the AI-modified theme is loaded into the UI store
 */
export const useUserThemeLoader = () => {
  const { walletProfile, isAuthenticated } = useExtendedWallet();
  const { setTheme, setLoading } = useThemeStore();
  
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!isAuthenticated || !walletProfile?.wallet_address) {
        console.log('[UserThemeLoader] No wallet connected, using default theme');
        return;
      }
      
      setLoading(true);
      
      try {
        console.log('[UserThemeLoader] 🔄 Loading theme for wallet:', walletProfile.wallet_address);
        
        // Load user theme from database
        const { data, error } = await supabase
          .from('user_themes')
          .select('theme_data, version, updated_at')
          .eq('user_id', walletProfile.wallet_address)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error('[UserThemeLoader] ❌ Error loading theme:', error);
          return;
        }
        
        if (data?.theme_data) {
          console.log('[UserThemeLoader] ✅ User theme loaded from DB');
          console.log('[UserThemeLoader] Theme version:', data.version);
          console.log('[UserThemeLoader] Theme keys:', Object.keys(data.theme_data).slice(0, 5));
          setTheme(data.theme_data);
        } else {
          console.log('[UserThemeLoader] ℹ️ No user theme found, keeping default');
        }
      } catch (error) {
        console.error('[UserThemeLoader] ❌ Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserTheme();
  }, [walletProfile?.wallet_address, isAuthenticated, setTheme, setLoading]);

  // Setup realtime subscription for instant updates
  useEffect(() => {
    if (!walletProfile?.wallet_address) return;
    
    console.log('[UserThemeLoader] 📡 Setting up realtime subscription');
    
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_themes',
          filter: `user_id=eq.${walletProfile.wallet_address}`
        },
        (payload) => {
          console.log('[UserThemeLoader] 🔔 Realtime theme update:', payload);
          if (payload.new && 'theme_data' in payload.new) {
            setTheme((payload.new as any).theme_data);
          }
        }
      )
      .subscribe();
    
    return () => {
      console.log('[UserThemeLoader] 🔌 Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [walletProfile?.wallet_address, setTheme]);
};
