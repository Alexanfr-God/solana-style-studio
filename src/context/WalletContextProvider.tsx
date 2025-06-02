
import { FC, ReactNode, useMemo, createContext, useState, useContext, useCallback, useEffect } from 'react';
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
import { phantomAuthService } from '@/services/phantomAuthService';
import { supabase } from '@/integrations/supabase/client';

// Import the styles for the modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextExtendedProps {
  signMessageOnConnect: (publicKey: string) => Promise<void>;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  hasRejectedSignature: boolean;
  supabaseUser: any;
}

const WalletContextExtended = createContext<WalletContextExtendedProps>({
  signMessageOnConnect: async () => {},
  isAuthenticating: false,
  isAuthenticated: false,
  hasRejectedSignature: false,
  supabaseUser: null
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
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  
  // Слушаем изменения в Supabase auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Supabase auth state change:', event, session?.user?.id);
      setSupabaseUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signMessageOnConnect = useCallback(async (publicKeyStr: string) => {
    if (!signMessage || !publicKey || hasRejectedSignature) return;
    
    try {
      setIsAuthenticating(true);
      
      const message = new TextEncoder().encode(
        "Welcome to Wallet Coast Customs ⚡ Your identity, your style, your wallet. Let's customize the future."
      );
      
      // Подписываем сообщение в Phantom
      console.log('📝 Requesting signature from Phantom...');
      const signature = await signMessage(message);
      
      // Аутентифицируемся в Supabase
      console.log('🔐 Authenticating with Supabase...');
      const authResult = await phantomAuthService.authenticateWithPhantom(publicKeyStr, signature);
      
      if (authResult.success) {
        setIsAuthenticated(true);
        setHasRejectedSignature(false);
        toast.success(`Welcome! Wallet ${publicKeyStr.slice(0, 8)}... authenticated successfully`);
        console.log("✅ Phantom + Supabase authentication successful");
      } else {
        toast.error(`Authentication failed: ${authResult.error}`);
        console.error("❌ Authentication failed:", authResult.error);
      }
      
    } catch (error: any) {
      console.error("❌ Error during authentication:", error);
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
    hasRejectedSignature,
    supabaseUser
  }), [signMessageOnConnect, isAuthenticating, isAuthenticated, hasRejectedSignature, supabaseUser]);

  return (
    <WalletContextExtended.Provider value={value}>
      {children}
    </WalletContextExtended.Provider>
  );
};
