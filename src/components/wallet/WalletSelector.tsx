
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

const WALLET_ICONS: Record<string, React.ReactNode> = {
  'Phantom': <PhantomIcon />,
  'Solflare': <SolflareIcon />,
  'Backpack': <BackpackIcon />,
  'Brave': <BraveIcon />,
  'MetaMask': <MetaMaskIcon />,
};

export default function WalletSelector() {
  const { wallets, select, connecting, connected, wallet, disconnect } = useWallet();

  // Filter and sort wallets by readiness
  const availableWallets = useMemo(() => {
    const installed = wallets.filter(
      ({ readyState }) => readyState === WalletReadyState.Installed
    );
    const notDetected = wallets.filter(
      ({ readyState }) => readyState !== WalletReadyState.Installed
    );
    return [...installed, ...notDetected];
  }, [wallets]);

  // Handle disconnect with toast notification
  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error: any) {
      toast.error(`Error disconnecting: ${error?.message || 'Unknown error'}`);
    }
  }, [disconnect]);

  // Handle wallet selection
  const handleWalletSelect = useCallback(
    async (walletName: WalletName) => {
      try {
        select(walletName);
        toast.success(`${walletName} selected`);
      } catch (error: any) {
        toast.error(`Error selecting wallet: ${error?.message || 'Unknown error'}`);
      }
    },
    [select]
  );

  return (
    <div className="relative z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : connected && wallet ? (
              <>
                {WALLET_ICONS[wallet.adapter.name] || null}
                <span>{wallet.adapter.name}</span>
              </>
            ) : (
              <span>Connect Wallet</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="bg-background border border-border w-56">
          {!connected ? (
            availableWallets.map((item) => {
              const isInstalled = item.readyState === WalletReadyState.Installed;
              
              return (
                <TooltipProvider key={item.adapter.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        disabled={!isInstalled}
                        onClick={() => isInstalled && handleWalletSelect(item.adapter.name)}
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
}
