import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { initializeAppKit } from '@/lib/appkit';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { requestNonce, verifySignature } from '@/services/walletAuthService';
import { useExtendedWallet } from '@/context/WalletContextProvider';

const MultichainWalletButton: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { open } = useAppKit();
  const { address, isConnected, caipAddress } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  
  const { 
    isAuthenticated, 
    setAuthSession, 
    clearAuthSession,
    walletProfile 
  } = useExtendedWallet();

  // Initialize AppKit on component mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeAppKit();
        setIsInitialized(true);
        console.log('🎯 AppKit ready for use');
      } catch (error) {
        console.error('❌ AppKit initialization failed:', error);
        toast.error('Failed to initialize wallet connector');
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && isInitialized) {
      console.log('🔐 Wallet connected, starting authentication...', {
        address: address.slice(0, 10) + '...',
        network: caipNetwork?.name
      });
      handleAuthentication();
    }
  }, [isConnected, address, isAuthenticated, isInitialized, caipNetwork]);

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

  const handleConnect = useCallback(async () => {
    if (!isInitialized) {
      toast.error('Wallet connector not ready');
      return;
    }

    try {
      await open();
    } catch (error: any) {
      console.error('❌ Failed to open wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, [isInitialized, open]);

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
  const isConnectedAndAuth = isConnected && isAuthenticated && walletProfile;

  if (isInitializing) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    );
  }

  return (
    <div className="relative z-10">
      <Button 
        variant={isConnectedAndAuth ? "default" : "outline"} 
        className={`flex items-center gap-2 transition-all duration-300 ${
          isConnectedAndAuth ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-[0_0_10px_rgba(153,69,255,0.4)]' : 'bg-background/50 backdrop-blur-sm'
        }`}
        disabled={isBusy}
        onClick={isConnectedAndAuth ? handleDisconnect : handleConnect}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : isConnectedAndAuth ? (
          <>
            <Wallet className="h-4 w-4" />
            <span>{shortenAddress(address || '')}</span>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
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