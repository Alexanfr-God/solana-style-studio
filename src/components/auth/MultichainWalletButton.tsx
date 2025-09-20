import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { requestNonce, verifySignature, type ChainType } from '@/services/walletAuthService';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { isAppKitReady } from '@/lib/appkit';

const MultichainWalletButton: React.FC = () => {
  const { 
    isAuthenticated, 
    isAuthenticating,
    setIsAuthenticating,
    setAuthSession, 
    clearAuthSession,
    walletProfile
  } = useExtendedWallet();

  // Always call hooks (React rules)
  const appKit = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();

  // Real message signing function
  const signMessage = useCallback(async (message: string, chainType: ChainType): Promise<string> => {
    try {
      if (chainType === 'solana') {
        // For Solana use signMessage
        const solanaWallet = (window as any).solana;
        if (!solanaWallet?.signMessage) {
          throw new Error('Solana wallet does not support message signing');
        }
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await solanaWallet.signMessage(encodedMessage);
        
        // Convert signature to hex string
        const signature = Array.from(signedMessage.signature)
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('');
        return signature;
      } else {
        // For EVM use personal_sign
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          throw new Error('No Ethereum provider found');
        }
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [message, address]
        });
        return signature;
      }
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw error;
    }
  }, [address]);

  const handleAuthentication = useCallback(async () => {
    if (!address || !isAppKitReady() || isAuthenticating) {
      console.log('❌ Missing requirements for authentication');
      return;
    }

    setIsAuthenticating(true);
    
    try {
      // Determine chain type
      const networkId = String(caipNetwork?.id || '');
      const isSolana = networkId.includes('solana');
      const chainType: ChainType = isSolana ? 'solana' : 'evm';
      
      console.log('🔍 Starting authentication:', { address: address.slice(0, 10) + '...', chainType });

      // Step 1: Request nonce
      const { nonce, message } = await requestNonce(address, chainType);
      console.log('📝 Nonce received, requesting signature...');

      // Step 2: Sign the message through wallet
      const signature = await signMessage(message, chainType);
      console.log('✅ Message signed successfully');
      
      // Step 3: Verify signature
      const verificationData = await verifySignature({
        address,
        chain: chainType,
        signature,
        nonce,
        message,
        publicKey: isSolana ? address : undefined
      });

      if (verificationData.success) {
        console.log('🎉 Authentication successful!');
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
  }, [address, caipNetwork, isAuthenticating, setIsAuthenticating, setAuthSession, signMessage]);

  const handleConnect = useCallback(async () => {
    if (!isAppKitReady() || !appKit) {
      toast.error('Wallet connector not ready');
      return;
    }

    try {
      console.log('🔗 Opening wallet selection modal...');
      await appKit.open();
    } catch (error: any) {
      console.error('❌ Failed to open wallet modal:', error);
      toast.error('Failed to open wallet selector');
    }
  }, [appKit]);

  const handleDisconnect = useCallback(async () => {
    try {
      clearAuthSession();
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

  const appKitReady = isAppKitReady();
  const isBusy = !appKitReady || isAuthenticating;
  const isConnectedAndAuth = isConnected && isAuthenticated && walletProfile;

  // Show loading state while AppKit initializes
  if (!appKitReady) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Initializing...</span>
      </Button>
    );
  }

  // Show Sign Message button if connected but not authenticated
  if (isConnected && !isAuthenticated) {
    return (
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        disabled={isAuthenticating}
        onClick={handleAuthentication}
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span>Sign Message</span>
          </>
        )}
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
        {isConnectedAndAuth ? (
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