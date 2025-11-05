import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { WalletCanvasRenderer } from './WalletCanvasRenderer';
import { WalletConnectionPrompt } from './WalletConnectionPrompt';
import { aiScanOrchestrator } from '@/services/aiScanOrchestrator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const WalletPreviewCanvas = () => {
  const { 
    walletType, 
    setWalletType, 
    foundElements, 
    currentScreen,
    isWalletConnected 
  } = useAiScannerStore();
  
  const [isConnecting, setIsConnecting] = useState(false);
  
  const walletTypes: Array<'WCC' | 'MetaMask' | 'Phantom'> = ['MetaMask', 'Phantom'];
  
  const handleConnect = async () => {
    if (walletType === 'MetaMask' || walletType === 'Phantom') {
      setIsConnecting(true);
      try {
        await aiScanOrchestrator.connectWallet(walletType);
        toast.success(`✅ Connected to ${walletType}`);
      } catch (error) {
        console.error('Connection failed:', error);
        // Error toast is already shown by orchestrator with detailed message
      } finally {
        setIsConnecting(false);
      }
    }
  };
  
  return (
    <div className="relative h-full flex flex-col">
      {/* Wallet selector */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50">
        <h3 className="text-sm font-semibold">External Wallet - {currentScreen}</h3>
        <div className="flex gap-2 items-center">
          {walletTypes.map(type => (
            <Badge
              key={type}
              variant={walletType === type ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-all",
                walletType === type && "shadow-sm"
              )}
              onClick={() => setWalletType(type)}
            >
              {type}
            </Badge>
          ))}
          
          {!isWalletConnected && (
            <Button size="sm" onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Canvas Renderer or Connection Prompt */}
      <div className="flex-1 relative overflow-hidden">
        {!isWalletConnected ? (
          <WalletConnectionPrompt 
            onConnect={handleConnect} 
            walletType={walletType as 'MetaMask' | 'Phantom'}
          />
        ) : (
          <WalletCanvasRenderer 
            elements={foundElements}
            walletType={walletType}
          />
        )}
      </div>
    </div>
  );
};
