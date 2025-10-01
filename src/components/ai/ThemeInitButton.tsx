import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExtendedWallet } from '@/context/WalletContextProvider';

export const ThemeInitButton = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasTheme, setHasTheme] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { walletProfile } = useExtendedWallet();

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
        toast.success('🎨 Theme initialized successfully!');
        setHasTheme(true);
        // Reload page to fetch the new theme
        setTimeout(() => window.location.reload(), 1000);
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
