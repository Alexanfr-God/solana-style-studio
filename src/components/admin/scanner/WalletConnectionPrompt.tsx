import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import { MetaMaskBridge } from '@/services/walletBridge/MetaMaskBridge';

type ConnectionStatus = 'idle' | 'checking' | 'ready' | 'not-installed' | 'metamask-closed';

interface Props {
  onConnect: () => void;
  walletType: 'MetaMask' | 'Phantom';
}

export const WalletConnectionPrompt: React.FC<Props> = ({ onConnect, walletType }) => {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    // Auto-check extension availability on mount
    checkExtensionStatus();
  }, []);
  
  const checkExtensionStatus = async () => {
    setIsChecking(true);
    setStatus('checking');
    
    try {
      const result = await MetaMaskBridge.checkExtensionAvailability();
      
      if (result.available) {
        setStatus('ready');
      } else {
        setStatus('not-installed');
      }
    } catch (error) {
      console.error('Extension check failed:', error);
      setStatus('not-installed');
    } finally {
      setIsChecking(false);
    }
  };
  
  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <h3 className="text-lg font-semibold">Checking Extension Status...</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Detecting WCC MetaMask Bridge extension
            </p>
          </div>
        );
        
      case 'ready':
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h3 className="text-lg font-semibold">Extension Ready</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              WCC MetaMask Bridge extension is installed and responding
            </p>
            <Button onClick={onConnect} size="lg" className="mt-4">
              <Wallet className="mr-2 h-4 w-4" />
              Connect to {walletType}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Make sure {walletType} popup is open before connecting
            </p>
          </div>
        );
        
      case 'not-installed':
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-amber-500" />
            <h3 className="text-lg font-semibold">Extension Not Found</h3>
            <p className="text-sm text-muted-foreground">
              The WCC MetaMask Bridge extension is not installed or not responding
            </p>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Installation Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-left text-sm">
                    <li>Open Chrome and navigate to <code className="text-xs bg-muted px-1 py-0.5 rounded">chrome://extensions</code></li>
                    <li>Enable "Developer mode" (toggle in top right)</li>
                    <li>Click "Load unpacked"</li>
                    <li>Select the <code className="text-xs bg-muted px-1 py-0.5 rounded">packages/metamask-bridge-extension</code> folder</li>
                    <li>Open {walletType} popup in a new window</li>
                    <li>Return here and click "Check Again"</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={checkExtensionStatus} variant="outline" disabled={isChecking}>
                {isChecking ? 'Checking...' : 'Check Again'}
              </Button>
            </div>
          </div>
        );
        
      case 'metamask-closed':
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500" />
            <h3 className="text-lg font-semibold">{walletType} Not Open</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Please open {walletType} extension popup before connecting
            </p>
            
            <Alert className="mt-4">
              <AlertDescription>
                <div className="space-y-2 text-left">
                  <p className="font-semibold">Steps to open {walletType}:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Click the {walletType} extension icon in your browser toolbar</li>
                    <li>Or right-click the extension icon → "Open in new window"</li>
                    <li>Navigate to the screen you want to scan (Home, Send, etc.)</li>
                    <li>Return here and click "Connect to {walletType}"</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={checkExtensionStatus} variant="outline">
                Check Again
              </Button>
              <Button onClick={onConnect} variant="default">
                <Wallet className="mr-2 h-4 w-4" />
                Try Connecting
              </Button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
            <Wallet className="w-16 h-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Connect External Wallet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Connect to {walletType} to scan their UI structure and build theme JSON
            </p>
            <Button onClick={checkExtensionStatus} size="lg" className="mt-4">
              Check Extension Status
            </Button>
          </div>
        );
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      {renderContent()}
    </div>
  );
};
