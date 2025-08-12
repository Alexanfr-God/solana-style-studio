
import { FC, ReactNode, useMemo, createContext, useState, useContext, useCallback } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter as SolflareAdapter } from '@solana/wallet-adapter-solflare';
import { LedgerWalletAdapter as LedgerAdapter } from '@solana/wallet-adapter-ledger';
import { CoinbaseWalletAdapter as CoinbaseAdapter } from '@solana/wallet-adapter-coinbase';
import { TorusWalletAdapter as TorusAdapter } from '@solana/wallet-adapter-torus';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

// Import the styles for the modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextExtendedProps {
  signMessageOnConnect: (publicKey: string) => Promise<void>;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  hasRejectedSignature: boolean;
}

const WalletContextExtended = createContext<WalletContextExtendedProps>({
  signMessageOnConnect: async () => {},
  isAuthenticating: false,
  isAuthenticated: false,
  hasRejectedSignature: false
});

export const useExtendedWallet = () => useContext(WalletContextExtended);

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Use specific wallet adapters instead of the aggregator
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareAdapter(),
    new CoinbaseAdapter(),
    new LedgerAdapter(),
    new TorusAdapter()
  ], []);

  // Show wallet connection status notifications
  const onError = (error: any) => {
    toast.error(`Wallet error: ${error?.message || 'Unknown error'}`);
    console.error(error);
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={onError}
      >
        <WalletModalProvider>
          <WalletAuthProvider>
            {children}
          </WalletAuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Separate component to handle authentication logic
const WalletAuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connected, publicKey, signMessage } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRejectedSignature, setHasRejectedSignature] = useState(false);
  
  const signMessageOnConnect = useCallback(async (publicKeyStr: string) => {
    if (!signMessage || !publicKey || hasRejectedSignature) return;
    
    try {
      setIsAuthenticating(true);
      
      const message = new TextEncoder().encode(
        "Welcome to Wallet Coast Customs ⚡ Your identity, your style, your wallet. Let's customize the future."
      );
      
      // This will trigger the Phantom wallet interface to show the custom message
      const signature = await signMessage(message);
      
      // If we got here, the user signed the message successfully
      setIsAuthenticated(true);
      setHasRejectedSignature(false);
      console.log("Message signed successfully:", signature);
    } catch (error: any) {
      console.error("Error signing message:", error);
      setHasRejectedSignature(true);
      toast.error(`Signature error: ${error?.message || 'User declined to sign'}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage, hasRejectedSignature]);

  const value = useMemo(() => ({
    signMessageOnConnect,
    isAuthenticating,
    isAuthenticated,
    hasRejectedSignature
  }), [signMessageOnConnect, isAuthenticating, isAuthenticated, hasRejectedSignature]);

  return (
    <WalletContextExtended.Provider value={value}>
      {children}
    </WalletContextExtended.Provider>
  );
};
