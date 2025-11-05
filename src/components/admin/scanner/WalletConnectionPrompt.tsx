import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  onConnect: () => void;
  walletType: 'MetaMask' | 'Phantom';
}

/**
 * Connection Prompt - Displayed before wallet connection
 * Shows instructions and connect button
 */
export const WalletConnectionPrompt: React.FC<Props> = ({ onConnect, walletType }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
        <Wallet className="w-20 h-20 text-primary relative z-10" />
      </div>
      
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold">Connect External Wallet</h3>
        <p className="text-sm text-muted-foreground">
          Connect to {walletType} to scan its UI structure and build theme JSON in real-time
        </p>
      </div>
      
      <Button onClick={onConnect} size="lg" className="mt-4 gap-2">
        <Wallet className="h-5 w-5" />
        Connect to {walletType}
      </Button>
      
      <Alert className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Required:</strong> Install the WCC MetaMask Bridge extension from{' '}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">
            packages/metamask-bridge-extension
          </code>
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 space-y-2 text-xs text-muted-foreground max-w-md">
        <p className="font-semibold">How it works:</p>
        <ol className="text-left space-y-1 list-decimal list-inside">
          <li>Load the bridge extension in Chrome</li>
          <li>Open {walletType} wallet extension</li>
          <li>Click "Connect to {walletType}" above</li>
          <li>AI Scanner will fetch DOM and build theme JSON</li>
        </ol>
      </div>
    </div>
  );
};
