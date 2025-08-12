
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, Wallet, MousePointerSquare, Squirrel } from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import bs58 from 'bs58';
import { requestNonce, verifySignature } from '@/services/walletAuthService';

type ProviderLike = any;

function isRabby(eth: any) {
  return !!eth?.isRabby;
}

function isMetaMask(eth: any) {
  return !!eth?.isMetaMask && !eth?.isBraveWallet;
}

const ConnectWalletButton: React.FC = () => {
  const { wallets, select, connecting, connected, wallet, publicKey, signMessage } = useWallet();
  const [authLoading, setAuthLoading] = useState(false);

  const connectSolana = useCallback(async () => {
    try {
      const phantom = wallets.find(w => w.adapter.name === 'Phantom');
      if (!phantom) {
        toast.error('Phantom not available. Please install Phantom extension.');
        return;
      }
      if (!wallet || wallet.adapter.name !== 'Phantom') {
        select(phantom.adapter.name as WalletName);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to select Phantom');
    }
  }, [wallets, wallet, select]);

  const signSolanaNonce = useCallback(async () => {
    if (!publicKey) {
      toast.error('Connect Phantom first');
      return;
    }
    if (!signMessage) {
      toast.error('signMessage is not available on this wallet');
      return;
    }
    setAuthLoading(true);
    try {
      const address = publicKey.toString();
      const { nonce, message } = await requestNonce(address, 'solana');
      const messageBytes = new TextEncoder().encode(message);
      const sigBytes = await signMessage(messageBytes);
      const signature = bs58.encode(sigBytes);
      const { token, profile } = await verifySignature({
        address,
        chain: 'solana',
        signature,
        nonce,
        message,
        publicKey: address
      });
      if (token) {
        localStorage.setItem('wcc_wallet_token', token);
      }
      toast.success('Wallet verified');
      console.log('Verified profile', profile);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to verify wallet');
    } finally {
      setAuthLoading(false);
    }
  }, [publicKey, signMessage]);

  const connectEvmInjected = useCallback(async (target: 'metamask' | 'rabby') => {
    try {
      const eth: ProviderLike = (window as any).ethereum;
      if (!eth) {
        toast.error('No EVM wallet detected. Please install MetaMask or Rabby.');
        return;
      }
      // In case of multiple providers
      const providers: any[] = (eth.providers || []).length ? eth.providers : [eth];
      let provider = providers.find(p => target === 'rabby' ? isRabby(p) : isMetaMask(p)) || providers[0];

      const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts?.[0];
      if (!address) {
        toast.error('No account returned from wallet');
        return;
      }

      setAuthLoading(true);
      const { nonce, message } = await requestNonce(address, 'evm');

      // personal_sign wants hex string message or UTF-8; we pass UTF-8 directly
      const signature: string = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      });

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
      toast.success('Wallet verified');
      console.log('Verified profile', profile);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'EVM connect/verify failed');
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleWalletConnect = useCallback(() => {
    // Stub: Requires WalletConnect Project ID to enable.
    toast.info('WalletConnect requires a Project ID. Please provide it and we will enable Web3Modal.');
  }, []);

  const isBusy = connecting || authLoading;

  return (
    <div className="relative z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={connected ? "default" : "outline"} 
            className={`flex items-center gap-2 transition-all duration-300 ${
              connected ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary shadow-[0_0_10px_rgba(153,69,255,0.4)]' : 'bg-background/50 backdrop-blur-sm'
            }`}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{authLoading ? 'Authorizing...' : 'Connecting...'}</span>
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
          <DropdownMenuItem onClick={() => connectEvmInjected('metamask')} className="cursor-pointer gap-2">
            <MousePointerSquare className="h-4 w-4" />
            <span>MetaMask (EVM)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => connectEvmInjected('rabby')} className="cursor-pointer gap-2">
            <Squirrel className="h-4 w-4" />
            <span>Rabby (EVM)</span>
          </DropdownMenuItem>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem onClick={handleWalletConnect} className="cursor-pointer gap-2">
                  <img src="https://avatars.githubusercontent.com/u/37784886?s=200&v=4" alt="WalletConnect" className="h-4 w-4 rounded" />
                  <span>WalletConnect (EVM)</span>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Provide WalletConnect Project ID to enable</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuItem onClick={connectSolana} className="cursor-pointer gap-2">
            <img src="https://www.phantom.app/img/logo.png" alt="Phantom" className="h-4 w-4" />
            <span>Phantom (Solana) — Connect</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={signSolanaNonce} className="cursor-pointer gap-2">
            <img src="https://www.phantom.app/img/logo.png" alt="Phantom" className="h-4 w-4" />
            <span>Phantom (Solana) — Sign & Verify</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ConnectWalletButton;
