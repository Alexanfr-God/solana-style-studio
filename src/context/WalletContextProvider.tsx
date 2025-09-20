import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { initializeAppKit } from '@/lib/appkit';
import { toast } from 'sonner';
// Note: AppKit CSS will be imported via the modal component when initialized

// Extended wallet context interface
interface WalletContextExtendedProps {
  // AppKit state
  isAppKitReady: boolean;
  
  // Authentication state
  isAuthenticating: boolean;
  setIsAuthenticating: (value: boolean) => void;
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
  setIsAuthenticating: () => {},
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

  // Clear any previous wallet connections on mount
  useEffect(() => {
    // Clear comprehensive wallet-related localStorage on app start
    const keysToRemove = [
      'walletconnect',
      'wagmi.store', 
      'wagmi.cache',
      'reown.wallet',
      'appkit.wallet',
      'appkit.account',
      'appkit.network',
      'appkit.session',
      'wagmi.injected.shimDisconnect',
      'wagmi.wallet',
      'wagmi.connected',
      'wc@2:',
      'WALLETCONNECT_DEEPLINK_CHOICE'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        // Also try with potential prefixes
        Object.keys(localStorage).forEach(storageKey => {
          if (storageKey.includes(key) || storageKey.startsWith(key)) {
            localStorage.removeItem(storageKey);
          }
        });
      } catch (error) {
        console.warn(`Failed to clear ${key}:`, error);
      }
    });
    
    // Clear session storage as well
    try {
      Object.keys(sessionStorage).forEach(key => {
        keysToRemove.forEach(keyToRemove => {
          if (key.includes(keyToRemove) || key.startsWith(keyToRemove)) {
            sessionStorage.removeItem(key);
          }
        });
      });
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
    
    console.log('🧹 Cleared comprehensive wallet connection cache');
  }, []);

  // AppKit is now initialized in main.tsx before React rendering
  // Set ready state immediately since initialization happens before this component
  useEffect(() => {
    console.log('🚀 WalletContextProvider mounted, AppKit should already be ready');
    setIsAppKitReady(true);
  }, []);

  return (
    <WalletAuthProvider isAppKitReady={isAppKitReady}>
      {children}
    </WalletAuthProvider>
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

  // Restore session from localStorage on component mount
  useEffect(() => {
    const savedSession = localStorage.getItem('wallet_auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setUserId(session.userId);
        setAuthToken(session.authToken);
        setWalletProfile(session.walletProfile);
        setIsAuthenticated(true);
        console.log('🔄 Restored auth session from localStorage');
      } catch (error) {
        console.error('❌ Error restoring auth session:', error);
        localStorage.removeItem('wallet_auth_session');
      }
    }
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
    setIsAuthenticating,
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