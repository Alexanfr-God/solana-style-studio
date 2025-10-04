import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { useThemeStore } from '@/state/themeStore';

export const ThemeInitButton = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasTheme, setHasTheme] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { walletProfile } = useExtendedWallet();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const checkExistingTheme = async () => {
      if (!walletProfile?.wallet_address) {
        setIsChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_themes')
          .select('user_id')
          .eq('user_id', walletProfile.wallet_address)
          .maybeSingle();

        if (!error && data) {
          setHasTheme(true);
        }
      } catch (err) {
        console.error('Error checking theme:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingTheme();
  }, [walletProfile?.wallet_address]);

  const handleInitialize = async () => {
    if (!walletProfile?.wallet_address) {
      toast.error('Please connect wallet first');
      return;
    }

    if (hasTheme) {
      toast.info('Theme already exists. Use AI chat to customize it!');
      return;
    }

    setIsInitializing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-base-theme', {
        body: { userId: walletProfile.wallet_address }
      });

      if (error) throw error;

      if (data.success) {
        setHasTheme(true);
        console.log('[ThemeInitButton] ✅ Theme created, retrying to load...');

        // Retry logic: 5 попыток с задержкой 200ms
        let themeRow = null;
        let themeError = null;

        for (let attempt = 1; attempt <= 5; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const result = await supabase
            .from('user_themes')
            .select('theme_data')
            .eq('user_id', walletProfile.wallet_address)
            .maybeSingle();
          
          if (result.data) {
            themeRow = result.data;
            console.log(`[ThemeInitButton] ✅ Theme loaded on attempt ${attempt}`);
            break;
          }
          
          themeError = result.error;
          console.log(`[ThemeInitButton] Retry ${attempt}/5...`);
        }

        if (themeError) {
          console.error('[ThemeInitButton] ❌ Failed to load theme after 5 retries:', themeError);
          toast.error('Theme created but failed to load.');
        } else if (themeRow?.theme_data) {
          setTheme(themeRow.theme_data);
          console.log('[ThemeInitButton] ✅ Theme applied to UI');
          toast.success('✨ Theme applied! You can now customize it with AI.');
        } else {
          console.warn('[ThemeInitButton] ⚠️ Empty theme_data in DB');
          toast.error('Theme created but empty.');
        }
      } else {
        throw new Error('Failed to initialize theme');
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      toast.error(`Failed to initialize theme: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isChecking) {
    return (
      <Button disabled className="w-full gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (hasTheme) {
    return (
      <Button disabled variant="secondary" className="w-full gap-2">
        <CheckCircle2 className="h-4 w-4" />
        Theme Ready
      </Button>
    );
  }

  return (
    <Button
      onClick={handleInitialize}
      disabled={isInitializing || !walletProfile?.wallet_address}
      className="w-full gap-2"
    >
      {isInitializing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Initializing Theme...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Initialize Theme
        </>
      )}
    </Button>
  );
};
