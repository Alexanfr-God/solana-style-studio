import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, ChevronRight, RefreshCw, Download, Wallet, FlaskConical } from 'lucide-react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { aiScanOrchestrator } from '@/services/aiScanOrchestrator';
import { toast } from 'sonner';

export const ScanControlPanel = () => {
  const { 
    isScanning,
    isWalletConnected,
    walletType,
    stopScan, 
    exportJSON,
    currentLayer,
    addLog
  } = useAiScannerStore();
  
  const handleConnect = async () => {
    if (walletType === 'MetaMask' || walletType === 'Phantom') {
      try {
        await aiScanOrchestrator.connectWallet(walletType);
      } catch (error) {
        console.error('Connection failed:', error);
      }
    }
  };
  
  const handleStartScan = async () => {
    try {
      await aiScanOrchestrator.startScan('home');
    } catch (error) {
      console.error('Scan failed:', error);
    }
  };
  
  const handleNextLayer = async () => {
    await aiScanOrchestrator.nextLayer();
  };
  
  const handleReviewPass2 = async () => {
    await aiScanOrchestrator.reviewPass2();
  };
  
  const handleSmokeTest = async () => {
    try {
      addLog('scanning', '🟢', 'Running smoke test...');
      
      // 1. Connect
      if (!isWalletConnected) {
        await handleConnect();
        addLog('verified', '✅', 'Step 1: Connected');
      }
      
      // 2. Start scan (will fetch DOM)
      await handleStartScan();
      addLog('verified', '✅', 'Step 2: Scan completed');
      
      // 3. Export
      exportJSON();
      addLog('verified', '✅', 'Step 3: Exported JSON');
      
      addLog('verified', '✅', '🎉 Smoke test PASSED');
      toast.success('✅ Smoke test passed!');
      
    } catch (error) {
      addLog('error', '❌', `Smoke test FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('❌ Smoke test failed');
    }
  };
  
  return (
    <div className="space-y-3 p-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-4">Scan Controls</h3>
      
      {!isWalletConnected && (
        <Button 
          onClick={handleConnect} 
          className="w-full gap-2"
          size="sm"
          variant="default"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      )}
      
      {!isScanning ? (
        <Button 
          onClick={handleStartScan} 
          className="w-full gap-2"
          size="sm"
          disabled={!isWalletConnected}
        >
          <Play className="h-4 w-4" />
          Start Scan
        </Button>
      ) : (
        <Button 
          onClick={stopScan} 
          variant="destructive"
          className="w-full gap-2"
          size="sm"
        >
          <Square className="h-4 w-4" />
          Stop Scan
        </Button>
      )}
      
      <Button 
        onClick={handleNextLayer} 
        variant="outline" 
        className="w-full gap-2"
        size="sm"
        disabled={!isScanning}
      >
        <ChevronRight className="h-4 w-4" />
        Next Layer ({currentLayer + 1})
      </Button>
      
      <Button 
        onClick={handleReviewPass2} 
        variant="outline" 
        className="w-full gap-2"
        size="sm"
        disabled={!isScanning}
      >
        <RefreshCw className="h-4 w-4" />
        Review Pass 2
      </Button>
      
      <Button 
        onClick={exportJSON} 
        variant="secondary" 
        className="w-full gap-2"
        size="sm"
      >
        <Download className="h-4 w-4" />
        Export JSON
      </Button>
      
      <div className="border-t pt-3 mt-3">
        <Button 
          onClick={handleSmokeTest} 
          variant="outline" 
          className="w-full gap-2"
          size="sm"
        >
          <FlaskConical className="h-4 w-4" />
          Run Smoke Test
        </Button>
      </div>
    </div>
  );
};
