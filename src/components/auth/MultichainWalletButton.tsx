import React, { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useAppKit, useAppKitAccount, useAppKitNetwork, useDisconnect, useAppKitProvider } from '@reown/appkit/react';
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

  // Debounce for nonce requests - prevent multiple rapid auth attempts
  const lastNonceRequestRef = useRef<number>(0);
  const NONCE_DEBOUNCE_MS = 3000;

  // Always call hooks (React rules)
  const appKit = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const { walletProvider: solanaProvider } = useAppKitProvider<any>('solana');

  // Real message signing function with improved Solana/AppKit support
  const signMessage = useCallback(async (message: string, chainType: ChainType): Promise<string> => {
    try {
      console.log('🖊️ Starting message signing:', { 
        chainType, 
        message: message.slice(0, 50) + '...',
        hasSolanaProvider: !!solanaProvider,
        hasWindowSolana: !!(window as any).solana
      });
      
      if (chainType === 'solana') {
        console.log('📝 Using Solana signing method');
        const encodedMessage = new TextEncoder().encode(message);
        
        // Try AppKit provider first (WalletConnect compatible)
        if (solanaProvider?.signMessage) {
          try {
            console.log('🔐 Trying AppKit Solana provider...');
            const signedMessage = await solanaProvider.signMessage(encodedMessage);
            const signature = Array.from(signedMessage.signature || signedMessage)
              .map((b: number) => b.toString(16).padStart(2, '0'))
              .join('');
            console.log('✅ Solana message signed via AppKit provider');
            return signature;
          } catch (appKitError: any) {
            console.log('⚠️ AppKit Solana provider failed:', appKitError.message);
          }
        }
        
        // Fallback to window.solana (direct Phantom/Solflare injection)
        const solanaWallet = (window as any).solana;
        if (solanaWallet?.signMessage) {
          console.log('🔐 Trying window.solana fallback...');
          const signedMessage = await solanaWallet.signMessage(encodedMessage);
          const signature = Array.from(signedMessage.signature)
            .map((b: number) => b.toString(16).padStart(2, '0'))
            .join('');
          console.log('✅ Solana message signed via window.solana');
          return signature;
        }
        
        throw new Error('No Solana signing method available. Please reconnect your wallet.');
      } else {
        // For EVM - try multiple signing methods
        console.log('📝 Using EVM signing method');
        const ethereum = (window as any).ethereum;
        if (!ethereum) {
          throw new Error('No Ethereum provider found');
        }

        // Try personal_sign first (most compatible)
        try {
          console.log('🔐 Trying personal_sign method...');
          const signature = await ethereum.request({
            method: 'personal_sign',
            params: [message, address]
          });
          console.log('✅ EVM message signed with personal_sign');
          return signature;
        } catch (personalSignError: any) {
          console.log('⚠️ personal_sign failed, trying eth_sign...', personalSignError.message);
          
          // Fallback to eth_sign
          try {
            const messageHex = `0x${new TextEncoder().encode(message).reduce((hex, byte) => hex + byte.toString(16).padStart(2, '0'), '')}`;
            const signature = await ethereum.request({
              method: 'eth_sign',
              params: [address, messageHex]
            });
            console.log('✅ EVM message signed with eth_sign');
            return signature;
          } catch (ethSignError: any) {
            console.log('⚠️ eth_sign failed, trying eth_signTypedData_v4...', ethSignError.message);
            
            // Last resort: eth_signTypedData_v4
            const typedData = {
              domain: {
                name: 'WCC Authentication',
                version: '1'
              },
              types: {
                Message: [
                  { name: 'content', type: 'string' }
                ]
              },
              primaryType: 'Message',
              message: {
                content: message
              }
            };
            
            const signature = await ethereum.request({
              method: 'eth_signTypedData_v4',
              params: [address, JSON.stringify(typedData)]
            });
            console.log('✅ EVM message signed with eth_signTypedData_v4');
            return signature;
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to sign message:', error);
      // Better error classification for user feedback
      if (error.message?.includes('User rejected') || 
          error.code === 4001 || 
          error.message?.includes('cancelled') ||
          error.message?.includes('denied')) {
        throw new Error('USER_REJECTED');
      }
      throw error;
    }
  }, [address, solanaProvider]);

  // Enhanced wallet detection function for EVM
  const detectWalletProvider = useCallback(() => {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum) return 'unknown';
    
    // Check for specific wallet providers
    if (ethereum.isMetaMask) return 'metamask';
    if (ethereum.isRabby) return 'rabby';
    if (ethereum.isCoinbaseWallet) return 'coinbase';
    if (ethereum.isTrust) return 'trust';
    if (ethereum.isImToken) return 'imtoken';
    if (ethereum.providers?.length > 0) return 'walletconnect';
    
    return 'unknown_evm';
  }, []);

  // Enhanced wallet detection function for Solana
  const detectSolanaWalletProvider = useCallback(() => {
    // Check connected wallet name from AppKit first
    const connectedWalletName = (appKit as any)?.getWalletInfo?.()?.name?.toLowerCase() || '';
    
    console.log('🔍 Solana wallet detection:', {
      connectedWalletName,
      hasWindowSolana: !!(window as any).solana,
      hasWindowPhantom: !!(window as any).phantom,
      solanaIsPhantom: (window as any).solana?.isPhantom,
      solanaIsSolflare: (window as any).solana?.isSolflare
    });
    
    if (connectedWalletName.includes('phantom')) return 'phantom';
    if (connectedWalletName.includes('solflare')) return 'solflare';
    if (connectedWalletName.includes('trust')) return 'trust';
    if (connectedWalletName.includes('coinbase')) return 'coinbase';
    if (connectedWalletName.includes('metamask')) return 'metamask_snaps';
    if (connectedWalletName.includes('backpack')) return 'backpack';
    
    // Fallback: check window objects
    const solana = (window as any).solana;
    const phantom = (window as any).phantom?.solana;
    
    if (phantom?.isPhantom || solana?.isPhantom) return 'phantom';
    if (solana?.isSolflare) return 'solflare';
    if (solana?.isBackpack) return 'backpack';
    if ((window as any).ethereum?.isMetaMask) return 'metamask_snaps';
    
    return 'solana_wallet';
  }, [appKit]);

  const handleAuthentication = useCallback(async () => {
    if (!address || !isAppKitReady() || isAuthenticating) {
      console.log('❌ Missing requirements for authentication:', { 
        hasAddress: !!address, 
        appKitReady: isAppKitReady(), 
        isAuthenticating 
      });
      return;
    }

    // Debounce: prevent multiple rapid nonce requests
    const now = Date.now();
    if (now - lastNonceRequestRef.current < NONCE_DEBOUNCE_MS) {
      console.log('⏳ Throttling nonce request, too soon since last attempt');
      toast.info('Please wait a moment before trying again');
      return;
    }
    lastNonceRequestRef.current = now;

    setIsAuthenticating(true);
    
    try {
      // Determine chain type - improved detection
      const networkId = String(caipNetwork?.id || '');
      const networkName = String(caipNetwork?.name || '').toLowerCase();
      const isSolana = networkId.includes('solana') || networkName.includes('solana') || 
                      networkId.startsWith('solana:') || address?.length === 44; // Solana addresses are typically 44 chars
      const chainType: ChainType = isSolana ? 'solana' : 'evm';

      // Detect wallet provider
      const walletProvider = chainType === 'solana' ? detectSolanaWalletProvider() : detectWalletProvider();
      
      console.log('🔍 Starting authentication:', { 
        address: address.slice(0, 10) + '...', 
        chainType, 
        networkId, 
        networkName,
        addressLength: address.length,
        walletProvider,
        chainId: String(caipNetwork?.id || '').split(':')[1] || 'unknown',
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
      
      // Step 3: Get publicKey for verification
      let publicKey = address; // Default to address
      if (chainType === 'solana') {
        // For Solana, get the actual publicKey from wallet
        const solanaWallet = (window as any).solana;
        publicKey = solanaWallet?.publicKey?.toString() || address;
        console.log('🔑 Solana publicKey:', publicKey.slice(0, 20) + '...');
      } else {
        // For EVM, address is the publicKey
        console.log('🔑 EVM address as publicKey:', address.slice(0, 20) + '...');
      }
      
      // Step 4: Verify signature with enhanced metadata
      console.log('🔍 Verifying signature with server...');
      const verificationData = await verifySignature({
        address,
        chain: chainType,
        signature,
        nonce,
        message,
        publicKey,
        // Additional metadata for EVM wallets
        ...(chainType === 'evm' && {
          walletProvider,
          chainId: String(caipNetwork?.id || '').split(':')[1] || 'unknown',
          networkName: caipNetwork?.name
        })
      });

      if (verificationData.success) {
        console.log('🎉 Authentication successful!', verificationData);
        toast.success(`${walletProvider.charAt(0).toUpperCase() + walletProvider.slice(1)} wallet connected!`);
        
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
      
      if (error.message === 'USER_REJECTED') {
        toast.error('You rejected the signature request. Click "Sign Message" to try again.');
      } else if (error.message?.includes('reject') || error.message?.includes('cancel') || error.message?.includes('denied')) {
        toast.error('Signature rejected. Please try again.');
      } else if (error.message?.includes('No Solana signing method')) {
        toast.error('Wallet disconnected. Please reconnect and try again.');
      } else {
        toast.error(`Authentication failed: ${error?.message || 'Unknown error'}`);
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, caipNetwork, isAuthenticating, setIsAuthenticating, setAuthSession, signMessage, detectWalletProvider, detectSolanaWalletProvider]);

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
      console.log('🔌 Disconnecting wallet...');
      
      // Aggressive cleanup of wallet-related storage
      const keysToRemove = [
        'wallet_auth_session',
        'walletconnect',
        'wagmi.store', 
        'wagmi.cache',
        'reown.wallet',
        'appkit.wallet',
        'appkit.account',
        'appkit.network',
        'appkit.session',
        'wagmi.injected.shimDisconnect',
        'wagmi.wallet',
        'wagmi.connected',
        'wc@2:',
        'WALLETCONNECT_DEEPLINK_CHOICE'
      ];
      
      // Clear localStorage
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
          // Also try with potential prefixes
          Object.keys(localStorage).forEach(storageKey => {
            if (storageKey.includes(key) || storageKey.startsWith(key)) {
              localStorage.removeItem(storageKey);
            }
          });
        } catch (error) {
          console.warn(`Failed to clear ${key}:`, error);
        }
      });
      
      await disconnect();
      clearAuthSession();
      
      console.log('🧹 Aggressive wallet cleanup completed');
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('❌ Error disconnecting:', error);
      toast.error('Error disconnecting wallet');
    }
  }, [disconnect, clearAuthSession]);

  // Helper function to shorten wallet address
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const appKitReady = isAppKitReady();
  const isBusy = !appKitReady || isAuthenticating;
  const isConnectedAndAuth = isConnected && isAuthenticated && walletProfile;
  const showAuthButton = isConnected && address && !isAuthenticated;

  // Debug logging
  console.log('🔍 MultichainWalletButton state:', {
    appKitReady,
    isConnected,
    isAuthenticated,
    hasWalletProfile: !!walletProfile,
    hasAddress: !!address,
    addressLength: address?.length,
    networkId: caipNetwork?.id,
    networkName: caipNetwork?.name,
    showAuthButton
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

  // If fully authenticated, show connected state
  if (isConnectedAndAuth) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="default"
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-[0_0_10px_rgba(153,69,255,0.4)]"
          onClick={handleDisconnect}
        >
          <Wallet className="h-4 w-4" />
          <span>{shortenAddress(address || '')}</span>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        </Button>
      </div>
    );
  }

  // If connected but need authentication, show auth button separately
  if (showAuthButton) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={async () => {
            console.log('🔄 Forcing wallet change...');
            await handleDisconnect(); // Use our enhanced disconnect
            setTimeout(() => handleConnect(), 500); // Small delay to ensure cleanup
          }}
        >
          <Wallet className="h-4 w-4" />
          <span>Change Wallet</span>
        </Button>
        <Button 
          variant="default" 
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
      </div>
    );
  }

  // Default state: not connected, show connect button
  return (
    <div className="relative z-10">
      <Button 
        variant="outline"
        className="flex items-center gap-2 bg-background/50 backdrop-blur-sm transition-all duration-300"
        disabled={isBusy}
        onClick={handleConnect}
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </Button>
    </div>
  );
};

export default MultichainWalletButton;