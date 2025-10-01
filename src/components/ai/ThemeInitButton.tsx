import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExtendedWallet } from '@/context/WalletContextProvider';

export const ThemeInitButton = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { walletProfile } = useExtendedWallet();

  const handleInitialize = async () => {
    if (!walletProfile?.wallet_address) {
      toast.error('Please connect wallet first');
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
        // Reload page to fetch the new theme
        window.location.reload();
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

  return (
    <Button
      onClick={handleInitialize}
      disabled={isInitializing}
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
