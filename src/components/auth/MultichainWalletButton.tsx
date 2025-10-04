import React, { useEffect, useState, useCallback } from 'react';
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { modal } from '@/lib/appkit';

// Helper: Shorten address for display
const shortenAddress = (addr: string) => 
  `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const MultichainWalletButton: React.FC = () => {
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  
  const [user, setUser] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Listen to Supabase auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        setIsInitialized(true);
      }
    );

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Get chain type from CAIP address
  const getChainType = useCallback((): 'solana' | 'ethereum' => {
    if (!caipAddress) return 'ethereum';
    const namespace = caipAddress.split(':')[0];
    return namespace === 'solana' ? 'solana' : 'ethereum';
  }, [caipAddress]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !user && !isAuthenticating && isInitialized) {
      console.log('🔄 Wallet connected, initiating Web3 authentication...');
      handleAuthentication();
    }
  }, [isConnected, address, user, isInitialized]);

  // Native Supabase Web3 Authentication
  const handleAuthentication = useCallback(async () => {
    if (!address || isAuthenticating) return;

    const chain = getChainType();
    console.log('🚀 Starting Web3 auth:', { address: address.slice(0, 10) + '...', chain });

    setIsAuthenticating(true);

    try {
      let result;
      
      if (chain === 'solana') {
        // Solana Web3 auth
        result = await supabase.auth.signInWithWeb3({
          chain: 'solana' as const,
          statement: 'Sign in to Wallet Coast Customs',
        });
      } else {
        // Ethereum Web3 auth
        result = await supabase.auth.signInWithWeb3({
          chain: 'ethereum' as const,
          statement: 'Sign in to Wallet Coast Customs',
        });
      }

      const { data, error } = result;
      
      if (error) throw error;

      console.log('✅ Web3 authentication successful:', data);
      
      toast.success(
        `Connected to ${chain === 'solana' ? 'Solana' : 'Ethereum'} wallet`,
        { description: `Address: ${shortenAddress(address)}` }
      );

    } catch (error: any) {
      console.error('❌ Web3 auth failed:', error);
      
      if (error?.code === 4001 || error?.message?.includes('rejected')) {
        toast.error('Signature rejected', {
          description: 'You must sign the message to authenticate'
        });
      } else {
        toast.error('Authentication failed', {
          description: error?.message || 'Please try again'
        });
      }
      
      await disconnect();
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isAuthenticating, getChainType, disconnect]);

  // Open AppKit modal
  const handleConnect = useCallback(async () => {
    try {
      console.log('🔗 Opening wallet selection modal...');
      await modal.open();
    } catch (error: any) {
      console.error('❌ Failed to open wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    console.log('👋 Disconnecting wallet...');
    
    try {
      // Sign out from Supabase Auth
      await supabase.auth.signOut();
      
      // Disconnect from AppKit
      await disconnect();
      
      // Clean up wallet connection storage
      const keysToRemove = [
        'wc@2:core:0.3//pairing',
        'wc@2:client:0.3//proposal',
        'wc@2:universal_provider:/namespaces',
        '-walletlink:https://www.walletlink.org:session:id'
      ];
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed to remove key:', key);
        }
      });
      
      console.log('✅ Wallet disconnected');
      toast.success('Wallet disconnected');
      
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      toast.error('Failed to disconnect');
    }
  }, [disconnect]);

  // Render button states
  if (!isInitialized) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Initializing...
      </Button>
    );
  }

  if (isConnected && user && address) {
    return (
      <Button onClick={handleDisconnect} variant="default" size="sm" className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        {shortenAddress(address)}
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
      </Button>
    );
  }

  if (isConnected && !user) {
    return (
      <Button disabled variant="outline" size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Signing...
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} variant="outline" size="sm">
      <Wallet className="h-4 w-4 mr-2" />
      Connect Wallet
    </Button>
  );
};

export default MultichainWalletButton;
