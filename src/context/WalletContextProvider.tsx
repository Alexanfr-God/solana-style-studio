
import { FC, ReactNode, useMemo, createContext, useState, useContext, useCallback, useEffect } from 'react';
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
import { requestNonce, verifySignature } from '@/services/walletAuthService';
import bs58 from 'bs58';

// Import the styles for the modal
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextExtendedProps {
  // Solana wallet state
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  hasRejectedSignature: boolean;
  
  // Backend auth state
  userId: string | null;
  authToken: string | null;
  walletProfile: any | null;
  
  // Methods
  signMessageOnConnect: (publicKey: string) => Promise<void>;
  setAuthSession: (session: { userId: string; token: string; profile: any }) => void;
  clearAuthSession: () => void;
  handleWalletDisconnect: () => void;
}

const WalletContextExtended = createContext<WalletContextExtendedProps>({
  isAuthenticating: false,
  isAuthenticated: false,
  hasRejectedSignature: false,
  userId: null,
  authToken: null,
  walletProfile: null,
  signMessageOnConnect: async () => {},
  setAuthSession: () => {},
  clearAuthSession: () => {},
  handleWalletDisconnect: () => {}
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
    console.error('[WALLET_ERROR]', error);
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
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRejectedSignature, setHasRejectedSignature] = useState(false);
  
  // Backend auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [walletProfile, setWalletProfile] = useState<any | null>(null);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('wcc_wallet_token');
    const savedProfile = localStorage.getItem('wcc_wallet_profile');
    
    if (savedToken && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setAuthToken(savedToken);
        setWalletProfile(profile);
        setUserId(profile.id);
        setIsAuthenticated(true);
        console.log('[AUTH] Restored session from localStorage');
      } catch (error) {
        console.error('[AUTH] Failed to restore session:', error);
        localStorage.removeItem('wcc_wallet_token');
        localStorage.removeItem('wcc_wallet_profile');
      }
    }
  }, []);

  // Clear auth state when wallet disconnects
  useEffect(() => {
    if (!connected) {
      handleWalletDisconnect();
    }
  }, [connected]);

  const setAuthSession = useCallback((session: { userId: string; token: string; profile: any }) => {
    setUserId(session.userId);
    setAuthToken(session.token);
    setWalletProfile(session.profile);
    setIsAuthenticated(true);
    
    // Persist to localStorage
    if (session.token) {
      localStorage.setItem('wcc_wallet_token', session.token);
    }
    localStorage.setItem('wcc_wallet_profile', JSON.stringify(session.profile));
    
    console.log('[AUTH] Session set:', session.profile?.wallet_address);
  }, []);

  const clearAuthSession = useCallback(() => {
    setUserId(null);
    setAuthToken(null);
    setWalletProfile(null);
    setIsAuthenticated(false);
    setHasRejectedSignature(false);
    
    // Clear localStorage
    localStorage.removeItem('wcc_wallet_token');
    localStorage.removeItem('wcc_wallet_profile');
    
    console.log('[AUTH] Session cleared');
  }, []);

  const handleWalletDisconnect = useCallback(() => {
    clearAuthSession();
    console.log('[AUTH] Wallet disconnected, auth cleared');
  }, [clearAuthSession]);
  
  const signMessageOnConnect = useCallback(async (publicKeyStr: string) => {
    if (!signMessage || !publicKey || hasRejectedSignature) {
      console.log('[AUTH] Sign blocked:', { signMessage: !!signMessage, publicKey: !!publicKey, hasRejectedSignature });
      return;
    }
    
    try {
      setIsAuthenticating(true);
      console.log('[AUTH] Starting nonce request...');
      
      const address = publicKey.toString();
      const { nonce, message } = await requestNonce(address, 'solana');
      console.log('[AUTH] Nonce received, requesting signature...');
      
      const messageBytes = new TextEncoder().encode(message);
      const sigBytes = await signMessage(messageBytes);
      const signature = bs58.encode(sigBytes);
      
      console.log('[AUTH] Signature received, verifying...');
      const { token, profile } = await verifySignature({
        address,
        chain: 'solana',
        signature,
        nonce,
        message,
        publicKey: address
      });
      
      // Set auth session
      setAuthSession({
        userId: profile.id,
        token: token || '',
        profile
      });
      
      setHasRejectedSignature(false);
      toast.success('Wallet authenticated successfully');
      console.log('[AUTH] Verify OK, session saved');
    } catch (error: any) {
      console.error('[AUTH] Error during authentication:', error);
      setHasRejectedSignature(true);
      toast.error(`Authentication failed: ${error?.message || 'User declined to sign'}`);
    } finally {
      setIsAuthenticating(false);
    }
  }, [publicKey, signMessage, hasRejectedSignature, setAuthSession]);

  const value = useMemo(() => ({
    // Solana wallet state
    isAuthenticating,
    isAuthenticated,
    hasRejectedSignature,
    
    // Backend auth state
    userId,
    authToken,
    walletProfile,
    
    // Methods
    signMessageOnConnect,
    setAuthSession,
    clearAuthSession,
    handleWalletDisconnect
  }), [
    isAuthenticating, isAuthenticated, hasRejectedSignature,
    userId, authToken, walletProfile,
    signMessageOnConnect, setAuthSession, clearAuthSession, handleWalletDisconnect
  ]);

  return (
    <WalletContextExtended.Provider value={value}>
      {children}
    </WalletContextExtended.Provider>
  );
};
