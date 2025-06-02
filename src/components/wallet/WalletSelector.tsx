
import React, { useCallback, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { PhantomIcon, SolflareIcon, BackpackIcon, BraveIcon, MetaMaskIcon } from './WalletIcons';
import { useExtendedWallet } from '@/context/WalletContextProvider';

// Define icon mapping for wallet types
const WALLET_ICONS: Record<string, React.ReactNode> = {
  'Phantom': <PhantomIcon />,
  'Solflare': <SolflareIcon />,
  'Backpack': <BackpackIcon />,
  'Brave': <BraveIcon />,
  'MetaMask': <MetaMaskIcon />,
};

// WalletSelector component with explicit React.FC type
const WalletSelector: React.FC = () => {
  const { wallets, select, connecting, connected, wallet, disconnect, publicKey } = useWallet();
  const { signMessageOnConnect, isAuthenticating, isAuthenticated, hasRejectedSignature, supabaseUser } = useExtendedWallet();

  // Добавляем детальное логирование
  console.log('🔍 WalletSelector rendered');
  console.log('🔍 Wallet state:', { 
    connected, 
    connecting, 
    isAuthenticating, 
    isAuthenticated, 
    walletName: wallet?.adapter?.name,
    publicKey: publicKey?.toString(),
    walletsLength: wallets.length 
  });

  // Filter and sort wallets by readiness
  const availableWallets = useMemo(() => {
    const installed = wallets.filter(
      ({ readyState }) => readyState === WalletReadyState.Installed
    );
    const notDetected = wallets.filter(
      ({ readyState }) => readyState !== WalletReadyState.Installed
    );
    console.log('🔍 Available wallets:', { installed: installed.length, notDetected: notDetected.length });
    return [...installed, ...notDetected];
  }, [wallets]);

  // Trigger sign message after wallet is connected
  useEffect(() => {
    if (connected && publicKey && !isAuthenticated && !isAuthenticating && !hasRejectedSignature) {
      console.log('🔍 Triggering sign message for:', publicKey.toString());
      signMessageOnConnect(publicKey.toString());
    }
  }, [connected, publicKey, signMessageOnConnect, isAuthenticated, isAuthenticating, hasRejectedSignature]);

  // Handle disconnect with toast notification
  const handleDisconnect = useCallback(async () => {
    console.log('🔍 Disconnect clicked');
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('🔍 Disconnect error:', error);
      toast.error(`Error disconnecting: ${error?.message || 'Unknown error'}`);
    }
  }, [disconnect]);

  // Handle wallet selection
  const handleWalletSelect = useCallback(
    async (walletName: WalletName) => {
      console.log('🔍 Wallet selected:', walletName);
      try {
        select(walletName);
      } catch (error: any) {
        console.error('🔍 Wallet selection error:', error);
        toast.error(`Error selecting wallet: ${error?.message || 'Unknown error'}`);
      }
    },
    [select]
  );

  // Helper function to shorten wallet address
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Using explicit return with parentheses to ensure proper transpilation
  return (
    <div className="relative z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={connected && isAuthenticated ? "default" : "outline"} 
            className={`flex items-center gap-2 transition-all duration-300 ${
              connected && isAuthenticated ? 'bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 shadow-[0_0_10px_rgba(153,69,255,0.4)]' : 'bg-black/30 backdrop-blur-sm'
            }`}
            disabled={isAuthenticating}
            onClick={() => console.log('🔍 WalletSelector button clicked')}
          >
            {connecting || isAuthenticating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{isAuthenticating ? 'Signing...' : 'Connecting...'}</span>
              </>
            ) : connected && wallet && isAuthenticated ? (
              <div className="flex items-center gap-2 wallet-connect-animation">
                {WALLET_ICONS[wallet.adapter.name] || null}
                <span>{shortenAddress(publicKey?.toString() || '')}</span>
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs text-green-300">✓ Auth</span>
              </div>
            ) : connected && wallet ? (
              <div className="flex items-center gap-2">
                {WALLET_ICONS[wallet.adapter.name] || null}
                <span>{shortenAddress(publicKey?.toString() || '')}</span>
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                <span className="text-xs text-yellow-300">Sign needed</span>
              </div>
            ) : (
              <span>Connect Wallet</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="bg-background border border-border w-56 wallet-dropdown-animation">
          {!connected ? (
            availableWallets.map((item) => {
              const isInstalled = item.readyState === WalletReadyState.Installed;
              
              return (
                <TooltipProvider key={item.adapter.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        disabled={!isInstalled}
                        onClick={() => {
                          console.log('🔍 Wallet item clicked:', item.adapter.name, 'installed:', isInstalled);
                          if (isInstalled) {
                            handleWalletSelect(item.adapter.name);
                          }
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {/* Display wallet icon if available */}
                        {WALLET_ICONS[item.adapter.name] || null}
                        <span>{item.adapter.name}</span>
                        {!isInstalled && <span className="ml-auto text-xs text-muted-foreground">(Not detected)</span>}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    {!isInstalled && (
                      <TooltipContent side="left">
                        <p>Please install {item.adapter.name} wallet extension</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })
          ) : (
            <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer">
              Disconnect
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WalletSelector;
