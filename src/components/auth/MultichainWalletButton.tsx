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
      console.log('🖊️ Starting message signing:', { chainType, message: message.slice(0, 50) + '...' });
      
      if (chainType === 'solana') {
        // For Solana use direct wallet access (AppKit doesn't expose signMessage directly)
        console.log('📝 Using Solana signing method');
        
        const solanaWallet = (window as any).solana;
        if (!solanaWallet?.signMessage) {
          throw new Error('Solana wallet does not support message signing or is not connected');
        }
        
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await solanaWallet.signMessage(encodedMessage);
        
        // Convert signature to hex string
        const signature = Array.from(signedMessage.signature)
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('');
        console.log('✅ Solana message signed successfully');
        return signature;
      } else {
        // For EVM use personal_sign
        console.log('📝 Using EVM signing method');
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          throw new Error('No Ethereum provider found');
        }
        const signature = await ethereum.request({
          method: 'personal_sign',
          params: [message, address]
        });
        console.log('✅ EVM message signed');
        return signature;
      }
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw error;
    }
  }, [address, appKit]);

  const handleAuthentication = useCallback(async () => {
    if (!address || !isAppKitReady() || isAuthenticating) {
      console.log('❌ Missing requirements for authentication:', { 
        hasAddress: !!address, 
        appKitReady: isAppKitReady(), 
        isAuthenticating 
      });
      return;
    }

    setIsAuthenticating(true);
    
    try {
      // Determine chain type - improved detection
      const networkId = String(caipNetwork?.id || '');
      const networkName = String(caipNetwork?.name || '').toLowerCase();
      const isSolana = networkId.includes('solana') || networkName.includes('solana') || 
                      networkId.startsWith('solana:') || address?.length === 44; // Solana addresses are typically 44 chars
      const chainType: ChainType = isSolana ? 'solana' : 'evm';
      
      console.log('🔍 Starting authentication:', { 
        address: address.slice(0, 10) + '...', 
        chainType, 
        networkId, 
        networkName,
        addressLength: address.length,
        caipNetwork: caipNetwork 
      });

      // Step 1: Request nonce
      console.log('📝 Requesting nonce from server...');
      const { nonce, message } = await requestNonce(address, chainType);
      console.log('✅ Nonce received, message to sign:', message.slice(0, 100) + '...');

      // Step 2: Sign the message through wallet
      console.log('🖊️ Requesting signature from wallet...');
      const signature = await signMessage(message, chainType);
      console.log('✅ Message signed successfully, signature length:', signature.length);
      
      // Step 3: Verify signature
      console.log('🔍 Verifying signature with server...');
      const verificationData = await verifySignature({
        address,
        chain: chainType,
        signature,
        nonce,
        message,
        publicKey: isSolana ? address : undefined
      });

      if (verificationData.success) {
        console.log('🎉 Authentication successful!', verificationData);
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
      console.log('❌ AppKit not ready:', { appKitReady: isAppKitReady(), hasAppKit: !!appKit });
      toast.error('Wallet connector not ready');
      return;
    }

    try {
      console.log('🔗 Opening wallet selection modal...');
      await appKit.open();
      console.log('✅ Wallet modal opened successfully');
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

  // Debug logging
  console.log('🔍 MultichainWalletButton state:', {
    appKitReady,
    isConnected,
    isAuthenticated,
    hasWalletProfile: !!walletProfile,
    hasAddress: !!address,
    addressLength: address?.length,
    networkId: caipNetwork?.id,
    networkName: caipNetwork?.name
  });

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
  if (isConnected && address && !isAuthenticated) {
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