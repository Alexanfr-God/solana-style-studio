
import { FC, ReactNode, useMemo, createContext, useState, useContext, useCallback } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
  TorusWalletAdapter,
  CloverWalletAdapter,
  MathWalletAdapter
} from '@solana/wallet-adapter-wallets';
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
}

const WalletContextExtended = createContext<WalletContextExtendedProps>({
  signMessageOnConnect: async () => {},
  isAuthenticating: false,
  isAuthenticated: false,
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

  // @solana/wallet-adapter-wallets imports all the adapters but supports tree shaking
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new LedgerWalletAdapter(),
    new TorusWalletAdapter(),
    new CloverWalletAdapter(),
    new MathWalletAdapter()
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
        autoConnect={true}
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
  
  const signMessageOnConnect = useCallback(async (publicKeyStr: string) => {
    if (!signMessage || !publicKey) return;
    
    try {
      setIsAuthenticating(true);
      
      const message = new TextEncoder().encode(
        "Welcome to Wallet Coast Customs ⚡ Your identity, your style, your wallet. Let's customize the future."
      );
      
      // This will trigger the Phantom wallet interface to show the custom message
      const signature = await signMessage(message);
      
      // If we got here, the user signed the message successfully
      setIsAuthenticated(true);
      console.log("Message signed successfully:", signature);
    } catch (error: any) {
      console.error("Error signing message:", error);
      toast.error(`Signature error: ${error?.message || 'User declined to sign'}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage]);

  const value = useMemo(() => ({
    signMessageOnConnect,
    isAuthenticating,
    isAuthenticated
  }), [signMessageOnConnect, isAuthenticating, isAuthenticated]);

  return (
    <WalletContextExtended.Provider value={value}>
      {children}
    </WalletContextExtended.Provider>
  );
};
