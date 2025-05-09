
import React, { useCallback, useEffect } from 'react';
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

const WalletSelector = () => {
  const { 
    wallets, 
    select, 
    wallet, 
    connect, 
    connecting, 
    connected, 
    disconnect, 
    disconnecting,
    publicKey 
  } = useWallet();

  // Fix: Check if Phantom wallet exists using WalletName type
  const hasPhantomWallet = wallets.some(w => 
    w.adapter.name === ('Phantom' as WalletName));

  const handleSelectWallet = useCallback((name: WalletName) => {
    select(name);
  }, [select]);
  
  const handleConnectWallet = useCallback(async () => {
    try {
      if (wallet && !connecting && !connected) {
        await connect();
        toast.success("Wallet connected successfully!");
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(`Connection failed: ${error?.message || 'Unknown error'}`);
    }
  }, [wallet, connecting, connected, connect]);

  const handleDisconnectWallet = useCallback(async () => {
    try {
      if (disconnecting) return;
      await disconnect();
      toast.info("Wallet disconnected");
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnect, disconnecting]);

  useEffect(() => {
    if (wallet) {
      console.log("Selected wallet:", wallet.adapter.name);
    }
  }, [wallet]);

  const getShortenedAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // If connected, show the address and a disconnect button
  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg">
          <p className="font-mono">{getShortenedAddress(publicKey.toString())}</p>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDisconnectWallet}
          disabled={disconnecting}
          className="text-white"
        >
          {disconnecting ? 'Disconnecting...' : 'Disconnect'}
        </Button>
      </div>
    );
  }

  // If not connected, show the connect options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-500">
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/80 backdrop-blur-md text-white border-white/20">
        {/* Phantom wallet */}
        {hasPhantomWallet ? (
          <DropdownMenuItem 
            onClick={() => {
              // Ensure all instances use proper type casting
              handleSelectWallet('Phantom' as WalletName);
              handleConnectWallet();
            }}
            disabled={connecting}
            className="cursor-pointer hover:bg-white/10 flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="128" height="128" rx="24" fill="url(#paint0_linear_phantom)"/>
              <path d="M110.584 64.9142H99.142C99.142 41.8335 80.214 23 57 23V34.214C73.786 34.214 87.857 48.2502 87.857 64.9142H76.415C76.415 64.9142 92.513 81.2282 92.8708 81.5619C93.8476 82.5057 95.4417 82.49 96.4348 81.5619L110.584 64.9142Z" fill="white"/>
              <path d="M57 105.829V94.6147C40.214 94.6147 26.143 80.5785 26.143 63.9144H37.585C37.585 63.9144 21.487 47.6005 21.1292 47.2667C20.1524 46.323 18.5583 46.3387 17.5652 47.2667L3.41602 63.9144H14.858C14.858 87.0941 33.786 105.829 57 105.829Z" fill="white"/>
              <defs>
                <linearGradient id="paint0_linear_phantom" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9945FF"/>
                  <stop offset="1" stopColor="#14F195"/>
                </linearGradient>
              </defs>
            </svg>
            Phantom {connecting ? '(Connecting...)' : ''}
          </DropdownMenuItem>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-1.5 text-sm opacity-50 flex items-center gap-2 cursor-not-allowed">
                  <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="128" height="128" rx="24" fill="url(#paint0_linear_phantom)"/>
                    <path d="M110.584 64.9142H99.142C99.142 41.8335 80.214 23 57 23V34.214C73.786 34.214 87.857 48.2502 87.857 64.9142H76.415C76.415 64.9142 92.513 81.2282 92.8708 81.5619C93.8476 82.5057 95.4417 82.49 96.4348 81.5619L110.584 64.9142Z" fill="white"/>
                    <path d="M57 105.829V94.6147C40.214 94.6147 26.143 80.5785 26.143 63.9144H37.585C37.585 63.9144 21.487 47.6005 21.1292 47.2667C20.1524 46.323 18.5583 46.3387 17.5652 47.2667L3.41602 63.9144H14.858C14.858 87.0941 33.786 105.829 57 105.829Z" fill="white"/>
                    <defs>
                      <linearGradient id="paint0_linear_phantom" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#9945FF"/>
                        <stop offset="1" stopColor="#14F195"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  Phantom (Not Installed)
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-black/80 text-white">
                <p>Please install Phantom wallet extension</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Other wallet options remain as placeholder/demo items */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2 py-1.5 text-sm opacity-50 flex items-center gap-2 cursor-not-allowed">
                <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="128" height="128" rx="64" fill="#E17726"/>
                  <path d="M88.9072 42L64.9072 57.589L68.8373 47.7923L88.9072 42Z" fill="white" fillOpacity="0.85"/>
                  <path d="M39.0928 42L62.7833 57.7743L59.1627 47.7923L39.0928 42Z" fill="white"/>
                  <path d="M79.4732 78.9386L73.4178 89.8762L86.9333 94.8148L91.1002 79.1239L79.4732 78.9386Z" fill="white"/>
                  <path d="M36.9148 79.1239L41.0667 94.8148L54.5822 89.8762L48.5268 78.9386L36.9148 79.1239Z" fill="white"/>
                  <path d="M54.0274 65.2103L50.7971 72.2113L64.2076 73.0273L63.5112 58.4977L54.0274 65.2103Z" fill="white"/>
                  <path d="M73.9719 65.2106L64.3486 58.3135L63.789 73.0276L77.2029 72.2116L73.9719 65.2106Z" fill="white"/>
                  <path d="M54.5822 89.876L63.1609 84.8073L55.9523 79.2092L54.5822 89.876Z" fill="white"/>
                  <path d="M64.8391 84.8073L73.4178 89.876L72.0477 79.2092L64.8391 84.8073Z" fill="white"/>
                </svg>
                MetaMask
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black/80 text-white">
              <p>Coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2 py-1.5 text-sm opacity-50 flex items-center gap-2 cursor-not-allowed">
                <svg width="20" height="20" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="128" height="128" rx="24" fill="#FC9965"/>
                  <path d="M92.6292 78.5697C92.6292 83.0645 91.0709 87.2113 88.3038 90.2078L97.9225 99.8265C103.3 94.2077 106.556 86.6696 106.556 78.5697C106.556 70.1282 103.3 63.0317 97.3672 57.2846L88.0261 66.6257C91.0709 69.3445 92.6292 73.7974 92.6292 78.5697Z" fill="white"/>
                  <path d="M78.5698 92.6291C73.7975 92.6291 69.3446 91.0709 66.6258 88.0261L57.2847 97.3671C63.0318 103.3 70.0799 106.556 78.5698 106.556C86.4403 106.556 93.7368 103.3 99.4839 98.1803L89.8652 88.3038C86.9687 91.0709 82.822 92.6291 78.5698 92.6291Z" fill="white"/>
                  <path d="M75.5232 75.5234C75.5232 77.9181 73.6281 79.8132 71.2334 79.8132C68.7904 79.8132 66.9435 77.9181 66.9435 75.5234C66.9435 73.1287 68.8387 71.2336 71.2334 71.2336C73.6763 71.2336 75.5232 73.1287 75.5232 75.5234Z" fill="white"/>
                  <path d="M92.6292 78.5697C92.6292 83.0645 91.0709 87.2113 88.3038 90.2078L97.9225 99.8265C103.3 94.2077 106.556 86.6696 106.556 78.5697C106.556 70.1282 103.3 63.0317 97.3672 57.2846L88.0261 66.6257C91.0709 69.3445 92.6292 73.7974 92.6292 78.5697Z" fill="white"/>
                  <path d="M78.5698 92.6291C73.7975 92.6291 69.3446 91.0709 66.6258 88.0261L57.2847 97.3671C63.0318 103.3 70.0799 106.556 78.5698 106.556C86.4403 106.556 93.7368 103.3 99.4839 98.1803L89.8652 88.3038C86.9687 91.0709 82.822 92.6291 78.5698 92.6291Z" fill="white"/>
                  <path d="M21.4819 78.5697C21.4819 73.7974 23.0402 69.6506 25.8073 66.654L16.1886 57.0353C10.8111 62.6057 7.55566 70.1921 7.55566 78.5697C7.55566 86.6696 10.8111 93.7661 16.7439 99.5132L26.085 90.1722C23.0402 87.2113 21.4819 82.7584 21.4819 78.5697Z" fill="white"/>
                  <path d="M78.5698 21.4818C83.0645 21.4818 87.2113 23.04 90.208 25.807L99.8267 16.1883C94.208 10.8108 86.6699 7.55542 78.5698 7.55542C70.4698 7.55542 63.0317 10.8108 57.1846 16.7436L66.5257 26.0846C69.3446 23.04 73.7975 21.4818 78.5698 21.4818Z" fill="white"/>
                  <path d="M90.1724 26.0848L80.8314 16.7436C86.5784 10.8108 93.6267 7.55542 101.445 7.55542C109.315 7.55542 116.612 10.8108 122.359 16.0304L112.74 25.8071C109.844 23.0401 105.697 21.4819 101.445 21.4819C96.6724 21.3835 92.8531 23.04 90.1724 26.0848Z" fill="white"/>
                  <path d="M35.4113 78.5697C35.4113 75.5234 36.0343 72.6223 37.1208 69.9417L27.5021 60.323C24.7832 65.6375 23.1767 71.9048 23.1767 78.5697C23.1767 84.9414 24.6832 91.2688 27.3022 96.9687L37.0726 87.1979C36.0343 84.5173 35.4113 81.616 35.4113 78.5697Z" fill="white"/>
                  <path d="M78.5698 35.4112C81.6161 35.4112 84.5173 36.0342 87.1979 37.1207L96.8166 27.502C91.5022 24.7831 85.2348 23.1766 78.5698 23.1766C71.6216 23.1766 65.5525 24.6831 59.8527 27.3021L69.6235 37.0724C72.3041 36.0342 75.2054 35.4112 78.5698 35.4112Z" fill="white"/>
                  <path d="M87.198 37.0724L97.506 46.8432C100.126 41.1434 101.632 34.8159 101.632 28.4442C101.632 21.4961 100.027 15.2287 97.1797 9.96439L87.4089 20.2724C88.4954 23.2223 89.0701 26.4778 89.0701 29.9383C89.0701 32.5225 88.4471 34.9655 87.198 37.0724Z" fill="white"/>
                </svg>
                Solflare
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black/80 text-white">
              <p>Coming soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Instructions for users without wallet */}
        <div className="mt-2 border-t border-white/10 pt-2 px-2 text-xs opacity-70">
          <p>Don't have Phantom?</p>
          <a 
            href="https://phantom.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-purple-400 hover:text-purple-300 mt-1 block"
          >
            → Install Phantom Wallet
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletSelector;
