import React, { createContext, useContext, ReactNode } from 'react';
import { useSmartEditContext } from '@/hooks/useSmartEditContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type SmartEditContextType = ReturnType<typeof useSmartEditContext>;

const SmartEditContext = createContext<SmartEditContextType | undefined>(undefined);

interface SmartEditContextProviderProps {
  children: ReactNode;
}

export const SmartEditContextProvider: React.FC<SmartEditContextProviderProps> = ({ children }) => {
  const smartEditState = useSmartEditContext();
  
  return (
    <ErrorBoundary>
      <SmartEditContext.Provider value={smartEditState}>
        {children}
      </SmartEditContext.Provider>
    </ErrorBoundary>
  );
};

export const useSmartEdit = () => {
  const context = useContext(SmartEditContext);
  if (!context) {
    throw new Error('useSmartEdit must be used within SmartEditContextProvider');
  }
  return context;
};
