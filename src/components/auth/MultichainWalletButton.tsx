import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner";
import { Loader2, Wallet } from 'lucide-react';
import { PhantomIcon, SolflareIcon, BackpackIcon, BraveIcon, MetaMaskIcon } from '../wallet/WalletIcons';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { requestNonce, verifySignature } from '@/services/walletAuthService';

// Define icon mapping for wallet types
const WALLET_ICONS: Record<string, React.ReactNode> = {
  'Phantom': <PhantomIcon />,
  'Solflare': <SolflareIcon />,
  'Backpack': <BackpackIcon />,
  'Brave': <BraveIcon />,
  'MetaMask': <MetaMaskIcon />,
};

// EVM Provider detection helpers
const findMetaMaskProvider = () => {
  if (typeof window === 'undefined') return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  // Check for MetaMask specifically
  if (ethereum.isMetaMask && !ethereum.isRabby) {
    console.log('🦊 MetaMask provider found');
    return ethereum;
  }

  // Check if there are multiple providers
  if (ethereum.providers) {
    const metaMaskProvider = ethereum.providers.find((provider: any) => 
      provider.isMetaMask && !provider.isRabby
    );
    if (metaMaskProvider) {
      console.log('🦊 MetaMask provider found in providers array');
      return metaMaskProvider;
    }
  }

  console.log('❌ MetaMask provider not found');
  return null;
};

const findRabbyProvider = () => {
  if (typeof window === 'undefined') return null;
  
  const ethereum = (window as any).ethereum;
  if (!ethereum) return null;

  // Check for Rabby specifically
  if (ethereum.isRabby) {
    console.log('🐰 Rabby provider found');
    return ethereum;
  }

  // Check if there are multiple providers
  if (ethereum.providers) {
    const rabbyProvider = ethereum.providers.find((provider: any) => provider.isRabby);
    if (rabbyProvider) {
      console.log('🐰 Rabby provider found in providers array');
      return rabbyProvider;
    }
  }

  console.log('❌ Rabby provider not found');
  return null;
};

const MultichainWalletButton: React.FC = () => {
  const { connected, wallet, connecting, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { signMessageOnConnect, isAuthenticating, isAuthenticated, hasRejectedSignature, walletProfile } = useExtendedWallet();
  
  const [evmConnecting, setEvmConnecting] = useState(false);
  const [evmWallet, setEvmWallet] = useState<{ address: string; provider: string } | null>(null);

  // Trigger sign message after Solana wallet is connected
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating && !hasRejectedSignature) {
      signMessageOnConnect(publicKey.toString());
    }
  }, [connected, publicKey, signMessageOnConnect, isAuthenticated, isAuthenticating, hasRejectedSignature]);

  // Connect to EVM wallets
  const connectEvmWallet = useCallback(async (walletType: 'metamask' | 'rabby') => {
    try {
      setEvmConnecting(true);
      
      const provider = walletType === 'metamask' ? findMetaMaskProvider() : findRabbyProvider();
      
      if (!provider) {
        toast.error(`${walletType === 'metamask' ? 'MetaMask' : 'Rabby'} wallet not found. Please install it first.`);
        return;
      }

      console.log(`🔗 Connecting to ${walletType}...`);
      
      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      console.log(`✅ ${walletType} connected:`, address.slice(0, 10) + '...');

      // Request nonce for EVM
      const { nonce, message } = await requestNonce(address, 'evm');
      
      // Sign message
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      });
      
      console.log('🖊️ EVM signature received, verifying...');
      
      // Verify signature
      const { token, profile } = await verifySignature({
        address,
        chain: 'evm',
        signature,
        nonce,
        message
      });
      
      // Set auth session - EVM wallet connected successfully
      
      setEvmWallet({ address, provider: walletType });
      toast.success(`🎯 ${walletType === 'metamask' ? 'MetaMask' : 'Rabby'} authenticated: ${address.slice(0, 6)}...${address.slice(-4)}`);
      
    } catch (error: any) {
      console.error(`❌ ${walletType} connection error:`, error);
      toast.error(`Failed to connect ${walletType}: ${error?.message || 'User rejected'}`);
    } finally {
      setEvmConnecting(false);
    }
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    try {
      if (connected) {
        await disconnect();
      }
      if (evmWallet) {
        setEvmWallet(null);
      }
      toast.success('Wallet disconnected');
    } catch (error: any) {
      toast.error(`Error disconnecting: ${error?.message || 'Unknown error'}`);
    }
  }, [disconnect, connected, evmWallet]);

  // Helper function to shorten wallet address
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Get display address - prefer from walletProfile if available, then EVM wallet
  const displayAddress = useMemo(() => {
    if (isAuthenticated && walletProfile?.wallet_address) {
      return walletProfile.wallet_address;
    }
    if (evmWallet?.address) {
      return evmWallet.address;
    }
    return publicKey?.toString() || '';
  }, [isAuthenticated, walletProfile, publicKey, evmWallet]);

  const isConnectedToAny = connected || evmWallet;
  const isConnecting = connecting || evmConnecting || isAuthenticating;

  return (
    <div className="relative z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={isConnectedToAny && (isAuthenticated || evmWallet) ? "default" : "outline"} 
            className={`flex items-center gap-2 transition-all duration-300 ${
              isConnectedToAny && (isAuthenticated || evmWallet)
                ? 'bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 shadow-[0_0_10px_rgba(153,69,255,0.4)]' 
                : 'bg-black/30 backdrop-blur-sm'
            }`}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {isAuthenticating ? 'Signing...' : 
                   evmConnecting ? 'Connecting EVM...' : 'Connecting...'}
                </span>
              </>
            ) : isConnectedToAny && (isAuthenticated || evmWallet) && displayAddress ? (
              <div className="flex items-center gap-2 wallet-connect-animation">
                {evmWallet ? (
                  evmWallet.provider === 'metamask' ? <MetaMaskIcon /> : <BraveIcon />
                ) : (
                  WALLET_ICONS[wallet?.adapter.name || ''] || null
                )}
                <span>{shortenAddress(displayAddress)}</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            ) : isConnectedToAny && !isAuthenticated && !evmWallet ? (
              <div className="flex items-center gap-2">
                {WALLET_ICONS[wallet?.adapter.name || ''] || null}
                <span className="text-yellow-500">Authentication needed</span>
              </div>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="bg-background border border-border w-64">
          {!isConnectedToAny ? (
            <>
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                Solana Wallets
              </div>
              <DropdownMenuItem
                onClick={() => setVisible(true)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <PhantomIcon />
                <span>Phantom & Other Solana Wallets</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                Ethereum Wallets
              </div>
              <DropdownMenuItem
                onClick={() => connectEvmWallet('metamask')}
                className="flex items-center gap-2 cursor-pointer"
                disabled={evmConnecting}
              >
                <MetaMaskIcon />
                <span>MetaMask</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => connectEvmWallet('rabby')}
                className="flex items-center gap-2 cursor-pointer"
                disabled={evmConnecting}
              >
                <BraveIcon />
                <span>Rabby</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem
                onClick={() => toast.info('WalletConnect coming soon!')}
                className="flex items-center gap-2 cursor-pointer opacity-50"
                disabled
              >
                <Wallet className="h-4 w-4" />
                <span>WalletConnect (Soon)</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              {(isAuthenticated || evmWallet) && displayAddress && (
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="text-sm font-medium">Connected</div>
                  <div className="text-xs text-muted-foreground">
                    {evmWallet ? `${evmWallet.provider} (EVM)` : 'Solana'}: {displayAddress}
                  </div>
                </DropdownMenuItem>
              )}
              {connected && !isAuthenticated && !evmWallet && (
                <DropdownMenuItem 
                  onClick={() => publicKey && signMessageOnConnect(publicKey.toString())}
                  className="cursor-pointer text-yellow-600"
                >
                  Sign to Authenticate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer">
                Disconnect
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MultichainWalletButton;