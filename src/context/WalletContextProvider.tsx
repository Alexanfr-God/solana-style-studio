import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { initializeAppKit, getIsInitialized } from '@/lib/appkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { toast } from 'sonner';

// Create QueryClient for Wagmi
const queryClient = new QueryClient();

// Extended wallet context interface
interface WalletContextExtendedProps {
  // AppKit state
  isAppKitReady: boolean;
  
  // Authentication state
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  hasRejectedSignature: boolean;
  
  // User data
  userId: string | null;
  authToken: string | null;
  walletProfile: any;
  
  // Authentication actions
  setAuthSession: (session: { userId: string; token: string; profile: any }) => void;
  clearAuthSession: () => void;
  handleWalletDisconnect: () => void;
}

// Create context with default values
const WalletContextExtended = createContext<WalletContextExtendedProps>({
  isAppKitReady: false,
  isAuthenticating: false,
  isAuthenticated: false,
  hasRejectedSignature: false,
  userId: null,
  authToken: null,
  walletProfile: null,
  setAuthSession: () => {},
  clearAuthSession: () => {},
  handleWalletDisconnect: () => {},
});

// Hook to use the extended wallet context
export const useExtendedWallet = () => {
  const context = useContext(WalletContextExtended);
  if (!context) {
    throw new Error('useExtendedWallet must be used within WalletContextProvider');
  }
  return context;
};

// Main wallet context provider
interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [isAppKitReady, setIsAppKitReady] = useState(false);
  const [wagmiConfig, setWagmiConfig] = useState<any>(null);

  // Initialize AppKit on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🔄 Starting AppKit initialization...');
        const { wagmiAdapter } = await initializeAppKit();
        setWagmiConfig(wagmiAdapter.wagmiConfig);
        setIsAppKitReady(true);
        console.log('✅ AppKit initialized in context');
      } catch (error) {
        console.error('❌ Failed to initialize AppKit in context:', error);
        toast.error('Failed to initialize wallet system');
      }
    };

    init();
  }, []);

  // Don't render until AppKit is ready
  if (!isAppKitReady || !wagmiConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Initializing wallet system...</p>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletAuthProvider isAppKitReady={isAppKitReady}>
          {children}
        </WalletAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// Authentication provider component
interface WalletAuthProviderProps {
  children: ReactNode;
  isAppKitReady: boolean;
}

const WalletAuthProvider: React.FC<WalletAuthProviderProps> = ({ children, isAppKitReady }) => {
  // Authentication state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRejectedSignature, setHasRejectedSignature] = useState(false);
  
  // User data
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [walletProfile, setWalletProfile] = useState<any>(null);

  // AppKit hooks - now safe to call within providers
  const { address, isConnected } = useAppKitAccount();

  // Clear all wallet-related localStorage on component mount
  useEffect(() => {
    console.log('🧹 Clearing all wallet-related storage for clean start');
    
    // Clear auth session
    localStorage.removeItem('wallet_auth_session');
    
    // Clear AppKit/WalletConnect storage
    localStorage.removeItem('wc@2:client:0.3//session');
    localStorage.removeItem('wc@2:core:0.3//history');
    localStorage.removeItem('wc@2:core:0.3//pairing');
    localStorage.removeItem('wc@2:core:0.3//subscription');
    localStorage.removeItem('wc@2:core:0.3//keychain');
    localStorage.removeItem('wc@2:core:0.3//expirer');
    localStorage.removeItem('wc@2:universal_provider');
    localStorage.removeItem('@appkit/connected_connector');
    localStorage.removeItem('@appkit/connected_wallet_image_url');
    localStorage.removeItem('wagmi.store');
    localStorage.removeItem('wagmi.cache');
    localStorage.removeItem('wagmi.wallet');
    
    // Reset authentication state
    setIsAuthenticated(false);
    setUserId(null);
    setAuthToken(null);
    setWalletProfile(null);
    
    console.log('✅ All wallet storage cleared and auth state reset');
  }, []);

  // Clear session when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      console.log('🔌 Wallet disconnected, clearing auth session');
      clearAuthSession();
    }
  }, [isConnected, isAuthenticated]);

  // Set authentication session
  const setAuthSession = useCallback((session: { userId: string; token: string; profile: any }) => {
    setUserId(session.userId);
    setAuthToken(session.token);
    setWalletProfile(session.profile);
    setIsAuthenticated(true);
    setIsAuthenticating(false);
    setHasRejectedSignature(false);

    // Save to localStorage for persistence
    const sessionData = {
      userId: session.userId,
      authToken: session.token,
      walletProfile: session.profile,
    };
    localStorage.setItem('wallet_auth_session', JSON.stringify(sessionData));
    
    console.log('✅ Auth session set and saved');
  }, []);

  // Clear authentication session
  const clearAuthSession = useCallback(() => {
    setUserId(null);
    setAuthToken(null);
    setWalletProfile(null);
    setIsAuthenticated(false);
    setIsAuthenticating(false);
    setHasRejectedSignature(false);
    localStorage.removeItem('wallet_auth_session');
    
    console.log('🗑️ Auth session cleared');
  }, []);

  // Handle wallet disconnect
  const handleWalletDisconnect = useCallback(() => {
    clearAuthSession();
  }, [clearAuthSession]);

  // Context value
  const contextValue = useMemo(() => ({
    // AppKit state
    isAppKitReady,
    
    // Authentication state
    isAuthenticating,
    isAuthenticated,
    hasRejectedSignature,
    
    // User data
    userId,
    authToken,
    walletProfile,
    
    // Authentication actions
    setAuthSession,
    clearAuthSession,
    handleWalletDisconnect,
  }), [
    isAppKitReady,
    isAuthenticating,
    isAuthenticated,
    hasRejectedSignature,
    userId,
    authToken,
    walletProfile,
    setAuthSession,
    clearAuthSession,
    handleWalletDisconnect,
  ]);

  return (
    <WalletContextExtended.Provider value={contextValue}>
      {children}
    </WalletContextExtended.Provider>
  );
};