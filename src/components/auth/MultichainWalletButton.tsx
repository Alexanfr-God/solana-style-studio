import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { requestNonce, verifySignature } from '@/services/walletAuthService';
import { useExtendedWallet } from '@/context/WalletContextProvider';

const MultichainWalletButton: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { 
    isAuthenticated, 
    setAuthSession, 
    clearAuthSession,
    walletProfile,
    isAppKitReady 
  } = useExtendedWallet();

  // Now safe to call hooks since we're within the provider tree
  const { open } = useAppKit();
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  // Reset isInitializing when AppKit is ready
  useEffect(() => {
    if (isAppKitReady) {
      console.log('🚀 AppKit ready, setting initialization to false');
      setIsInitializing(false);
    }
  }, [isAppKitReady]);

  // Debug logging for button states
  useEffect(() => {
    console.log('🔍 Button state debug:', {
      isAppKitReady,
      isInitializing,
      isConnected,
      isAuthenticated,
      hasAddress: !!address,
      hasProfile: !!walletProfile
    });
  }, [isAppKitReady, isInitializing, isConnected, isAuthenticated, address, walletProfile]);

  // Remove auto-authentication - user must explicitly authenticate after connection

  const handleAuthentication = useCallback(async () => {
    if (!address || !caipNetwork) {
      console.log('❌ Missing address or network for authentication');
      return;
    }

    try {
      // Determine chain type based on CAIP network
      const networkId = String(caipNetwork.id || '');
      const networkName = String(caipNetwork.name || '').toLowerCase();
      const isSolana = networkId.includes('solana') || networkName.includes('solana');
      const chainType = isSolana ? 'solana' : 'evm';
      
      console.log('🔍 Authenticating with:', {
        address: address.slice(0, 10) + '...',
        chainType,
        network: caipNetwork.name
      });

      // Request nonce
      const { nonce, message } = await requestNonce(address, chainType);
      console.log('📝 Nonce received, requesting signature...');

      // For now, we'll show success without actual signing
      // This is a simplified implementation - you'd need to integrate with the specific wallet's signing method
      toast.success(`Wallet connected: ${chainType.toUpperCase()}`);
      
      // Create a temporary profile for demo
      const tempProfile = {
        id: `profile_${Date.now()}`,
        wallet_address: address,
        chain: chainType,
        created_at: new Date().toISOString()
      };

      setAuthSession({
        userId: tempProfile.id,
        token: `temp_token_${Date.now()}`,
        profile: tempProfile
      });

    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      toast.error(`Authentication failed: ${error?.message || 'Unknown error'}`);
    }
  }, [address, caipNetwork, setAuthSession]);

  // Open wallet selection modal
  const handleConnect = useCallback(async () => {
    if (!isAppKitReady || !open) {
      toast.error('Wallet connector not ready');
      return;
    }

    try {
      console.log('🔌 Opening wallet selection modal');
      await open();
    } catch (error: any) {
      console.error('❌ Failed to open wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, [isAppKitReady, open]);

  // Authenticate after wallet is connected
  const handleAuthenticate = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error('Please connect wallet first');
      return;
    }

    await handleAuthentication();
  }, [isConnected, address, handleAuthentication]);

  const handleDisconnect = useCallback(async () => {
    try {
      clearAuthSession();
      // Note: AppKit handles disconnection through its UI
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('❌ Error disconnecting:', error);
      toast.error('Error disconnecting wallet');
    }
  }, [clearAuthSession]);

  // Helper function to shorten wallet address
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const isBusy = isInitializing;

  // Show loading state while initializing
  if (!isAppKitReady) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  // Show different states based on connection and authentication
  if (isConnected && address) {
    if (isAuthenticated && walletProfile) {
      // Authenticated state
      return (
        <div className="relative z-10">
          <Button 
            variant="default"
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-[0_0_10px_rgba(153,69,255,0.4)]"
            onClick={handleDisconnect}
          >
            <Wallet className="h-4 w-4" />
            <span>{shortenAddress(address)}</span>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          </Button>
        </div>
      );
    } else {
      // Connected but not authenticated
      return (
        <div className="relative z-10">
          <Button 
            variant="outline"
            className="flex items-center gap-2 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20"
            onClick={handleAuthenticate}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>{shortenAddress(address)} - Authenticate</span>
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
              </>
            )}
          </Button>
        </div>
      );
    }
  }

  // Not connected state
  return (
    <div className="relative z-10">
      <Button 
        variant="outline"
        className="flex items-center gap-2 bg-background/50 backdrop-blur-sm"
        onClick={handleConnect}
        disabled={isBusy}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default MultichainWalletButton;