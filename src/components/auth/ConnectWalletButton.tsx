
import React, { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Wallet, MousePointer, Squirrel } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { requestNonce, verifySignature } from '@/services/walletAuthService';
import bs58 from 'bs58';

type ProviderLike = any;

function isRabby(eth: any) {
  return !!eth?.isRabby;
}

function isMetaMask(eth: any) {
  return !!eth?.isMetaMask && !eth?.isBraveWallet && !eth?.isRabby;
}

// Helper function to detect Rabby more thoroughly
function findRabbyProvider(): any {
  const eth = (window as any).ethereum;
  if (!eth) return null;
  
  // If ethereum is Rabby directly
  if (isRabby(eth)) return eth;
  
  // If multiple providers exist
  if (eth.providers?.length) {
    return eth.providers.find((p: any) => isRabby(p));
  }
  
  return null;
}

// Helper function to find MetaMask provider
function findMetaMaskProvider(): any {
  const eth = (window as any).ethereum;
  if (!eth) return null;
  
  // If ethereum is MetaMask directly
  if (isMetaMask(eth)) return eth;
  
  // If multiple providers exist
  if (eth.providers?.length) {
    return eth.providers.find((p: any) => isMetaMask(p));
  }
  
  // Fallback to first provider if no specific MetaMask found
  return eth.providers?.[0] || eth;
}

const ConnectWalletButton: React.FC = () => {
  const { wallets, select, connecting, connected, wallet, publicKey, signMessage, disconnect } = useWallet();
  const { 
    isAuthenticating, 
    isAuthenticated, 
    signMessageOnConnect, 
    clearAuthSession,
    walletProfile 
  } = useExtendedWallet();
  const [authLoading, setAuthLoading] = useState(false);

  // Auto-trigger sign on connect
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating) {
      console.log('[AUTH] Connected wallet detected, triggering auth...', publicKey.toString());
      signMessageOnConnect(publicKey.toString());
    }
  }, [connected, publicKey, isAuthenticated, isAuthenticating, signMessageOnConnect]);

  const connectSolana = useCallback(async () => {
    try {
      console.log('[PHANTOM] Starting Phantom connection...');
      
      const phantom = wallets.find(w => w.adapter.name === 'Phantom');
      if (!phantom) {
        toast.error('Phantom wallet not available. Please install Phantom extension.');
        return;
      }

      // If not already selected, select first
      if (!wallet || wallet.adapter.name !== 'Phantom') {
        console.log('[PHANTOM] Selecting Phantom wallet...');
        select(phantom.adapter.name as WalletName);
        
        // Wait a bit for selection to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Now try to connect if not already connected
      if (!connected && phantom.adapter.connected === false) {
        console.log('[PHANTOM] Calling connect() directly...');
        try {
          await phantom.adapter.connect();
          console.log('[PHANTOM] Connect successful');
          toast.success('Phantom wallet connected');
        } catch (connectError: any) {
          console.error('[PHANTOM] Connect error:', connectError);
          if (connectError.code === 4001) {
            toast.error('Connection cancelled by user');
          } else {
            toast.error(`Failed to connect Phantom: ${connectError.message}`);
          }
        }
      }
    } catch (e: any) {
      console.error('[PHANTOM] Error in connectSolana:', e);
      toast.error(e?.message || 'Failed to connect Phantom wallet');
    }
  }, [wallets, wallet, select, connected]);

  const connectEvmInjected = useCallback(async (target: 'metamask' | 'rabby') => {
    try {
      console.log(`[${target.toUpperCase()}] Starting connection...`);
      
      let provider: any;
      
      if (target === 'rabby') {
        provider = findRabbyProvider();
        if (!provider) {
          toast.error('Rabby wallet not detected. Please install Rabby extension and refresh the page.');
          return;
        }
        console.log('[RABBY] Rabby provider found:', !!provider);
      } else {
        provider = findMetaMaskProvider();
        if (!provider) {
          toast.error('MetaMask not detected. Please install MetaMask extension.');
          return;
        }
        console.log('[METAMASK] MetaMask provider found:', !!provider);
      }

      setAuthLoading(true);
      
      console.log(`[${target.toUpperCase()}] Requesting accounts...`);
      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts?.[0];
      
      if (!address) {
        toast.error('No account returned from wallet');
        return;
      }
      
      console.log(`[${target.toUpperCase()}] Account connected:`, address.slice(0, 10) + '...');

      console.log(`[${target.toUpperCase()}] Requesting nonce...`);
      const { nonce, message } = await requestNonce(address, 'evm');

      console.log(`[${target.toUpperCase()}] Requesting signature...`);
      const signature: string = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      });

      console.log(`[${target.toUpperCase()}] Verifying signature...`);
      const { token, profile } = await verifySignature({
        address,
        chain: 'evm',
        signature,
        nonce,
        message
      });

      if (token) {
        localStorage.setItem('wcc_wallet_token', token);
      }
      
      toast.success(`${target === 'rabby' ? 'Rabby' : 'MetaMask'} wallet verified successfully`);
      console.log(`[${target.toUpperCase()}] Verified profile:`, profile);
      
    } catch (e: any) {
      console.error(`[${target.toUpperCase()}] Error:`, e);
      
      if (e.code === 4001) {
        toast.error('Connection cancelled by user');
      } else if (e.message?.includes('User rejected')) {
        toast.error('Signature cancelled by user');
      } else {
        toast.error(`${target === 'rabby' ? 'Rabby' : 'MetaMask'} connection failed: ${e?.message || 'Unknown error'}`);
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleWalletConnect = useCallback(() => {
    toast.info('WalletConnect requires a Project ID. Please provide it and we will enable Web3Modal.');
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      console.log('[AUTH] Disconnecting wallet...');
      await disconnect();
      clearAuthSession();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('[AUTH] Error disconnecting:', error);
      toast.error(`Error disconnecting: ${error?.message || 'Unknown error'}`);
    }
  }, [disconnect, clearAuthSession]);

  // Helper function to shorten wallet address
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const isBusy = connecting || isAuthenticating || authLoading;
  const isConnectedAndAuth = connected && isAuthenticated && walletProfile;

  return (
    <div className="relative z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={isConnectedAndAuth ? "default" : "outline"} 
            className={`flex items-center gap-2 transition-all duration-300 ${
              isConnectedAndAuth ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-[0_0_10px_rgba(153,69,255,0.4)]' : 'bg-background/50 backdrop-blur-sm'
            }`}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {isAuthenticating ? 'Signing...' : 
                   authLoading ? 'Authorizing...' : 
                   connecting ? 'Connecting...' : 'Processing...'}
                </span>
              </>
            ) : isConnectedAndAuth ? (
              <>
                <Wallet className="h-4 w-4" />
                <span>{shortenAddress(walletProfile.wallet_address || publicKey?.toString() || '')}</span>
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="bg-background border border-border w-64">
          {!isConnectedAndAuth ? (
            <>
              <DropdownMenuItem 
                onClick={() => connectEvmInjected('metamask')} 
                className="cursor-pointer gap-2 hover:bg-accent"
                disabled={isBusy}
              >
                <MousePointer className="h-4 w-4" />
                <span>MetaMask (EVM)</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => connectEvmInjected('rabby')} 
                className="cursor-pointer gap-2 hover:bg-accent"
                disabled={isBusy}
              >
                <Squirrel className="h-4 w-4" />
                <span>Rabby (EVM)</span>
              </DropdownMenuItem>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuItem onClick={handleWalletConnect} className="cursor-pointer gap-2 hover:bg-accent">
                      <img src="https://avatars.githubusercontent.com/u/37784886?s=200&v=4" alt="WalletConnect" className="h-4 w-4 rounded" />
                      <span>WalletConnect (EVM)</span>
                    </DropdownMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Provide WalletConnect Project ID to enable</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenuItem 
                onClick={connectSolana} 
                className="cursor-pointer gap-2 hover:bg-accent"
                disabled={isBusy}
              >
                <img src="https://www.phantom.app/img/logo.png" alt="Phantom" className="h-4 w-4" />
                <span>Phantom (Solana)</span>
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-950/20">
              Disconnect Wallet
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ConnectWalletButton;
