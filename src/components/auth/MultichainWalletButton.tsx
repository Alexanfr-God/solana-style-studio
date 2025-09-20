import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { requestNonce, verifySignature } from '@/services/walletAuthService';
import { useExtendedWallet } from '@/context/WalletContextProvider';

const MultichainWalletButton: React.FC = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { 
    isAuthenticated, 
    setAuthSession, 
    clearAuthSession,
    walletProfile,
    isAppKitReady 
  } = useExtendedWallet();

  // Only use hooks when AppKit is ready
  let appKit, accountData, networkData;
  let open, address, isConnected, caipAddress, caipNetwork;

  if (isAppKitReady) {
    try {
      appKit = useAppKit();
      accountData = useAppKitAccount();
      networkData = useAppKitNetwork();
      
      open = appKit?.open;
      address = accountData?.address;
      isConnected = accountData?.isConnected;
      caipAddress = accountData?.caipAddress;
      caipNetwork = networkData?.caipNetwork;
    } catch (error) {
      console.warn('AppKit hooks not ready yet:', error);
    }
  }

  const handleAuthentication = useCallback(async () => {
    if (!address || !caipNetwork || isAuthenticating) {
      console.log('❌ Missing requirements for authentication:', { address: !!address, caipNetwork: !!caipNetwork, isAuthenticating });
      return;
    }

    setIsAuthenticating(true);
    
    try {
      // Determine chain type based on CAIP network
      const networkId = String(caipNetwork.id || '');
      const networkName = String(caipNetwork.name || '').toLowerCase();
      const isSolana = networkId.includes('solana') || networkName.includes('solana');
      const chainType = isSolana ? 'solana' : 'evm';
      
      console.log('🔍 Starting authentication flow:', {
        address: address.slice(0, 10) + '...',
        chainType,
        network: caipNetwork.name
      });

      // Step 1: Request nonce from backend
      const { nonce, message } = await requestNonce(address, chainType);
      console.log('📝 Nonce received, message to sign:', message);

      // Step 2: Sign the message through the wallet
      // TODO: Implement actual wallet signing based on chain type
      // For now, we'll create a mock signature for demonstration
      const mockSignature = `0x${'a'.repeat(130)}`; // Mock signature
      
      toast.info('Please sign the message in your wallet...');
      
      // Step 3: Verify signature with backend
      const verificationData = await verifySignature({
        address,
        chain: chainType,
        signature: mockSignature,
        nonce,
        message,
        publicKey: isSolana ? address : undefined
      });

      if (verificationData.success) {
        console.log('✅ Authentication successful');
        toast.success(`Wallet authenticated: ${chainType.toUpperCase()}`);
        
        setAuthSession({
          userId: verificationData.profile.id,
          token: verificationData.token || `temp_token_${Date.now()}`,
          profile: verificationData.profile
        });
      } else {
        throw new Error('Signature verification failed');
      }

    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      toast.error(`Authentication failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, caipNetwork, setAuthSession, isAuthenticating]);

  const handleConnect = useCallback(async () => {
    if (!isAppKitReady || !open) {
      toast.error('Wallet connector not ready');
      return;
    }

    try {
      console.log('🔗 Opening wallet selection modal...');
      await open();
    } catch (error: any) {
      console.error('❌ Failed to open wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, [isAppKitReady, open]);

  const handleAuthenticateAfterConnect = useCallback(async () => {
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      console.log('🔐 Wallet connected, starting authentication flow...');
      await handleAuthentication();
    }
  }, [isConnected, address, isAuthenticated, isAuthenticating, handleAuthentication]);

  const handleDisconnect = useCallback(async () => {
    try {
      clearAuthSession();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('❌ Error disconnecting:', error);
      toast.error('Error disconnecting wallet');
    }
  }, [clearAuthSession]);

  // Monitor connection state and trigger authentication
  useEffect(() => {
    if (isAppKitReady && isConnected && address && !isAuthenticated && !isAuthenticating) {
      console.log('🔐 Auto-triggering authentication after wallet connection');
      handleAuthenticateAfterConnect();
    }
  }, [isAppKitReady, isConnected, address, isAuthenticated, isAuthenticating, handleAuthenticateAfterConnect]);

  // Helper function to shorten wallet address
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const isBusy = !isAppKitReady || isAuthenticating;
  const isConnectedAndAuth = isConnected && isAuthenticated && walletProfile;

  // Show loading state while AppKit initializes
  if (!isAppKitReady) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Initializing...</span>
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
        {isAuthenticating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
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