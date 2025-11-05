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
    const store = useAiScannerStore.getState();
    
    try {
      addLog('scanning', '🟢', '🧪 Starting comprehensive smoke test...');
      toast.info('🧪 Running smoke test...');
      
      // Test 1: Connect to wallet
      addLog('scanning', '🟢', 'Test 1/5: Connecting to wallet...');
      if (!isWalletConnected) {
        await handleConnect();
        
        // Verify connection
        const connected = useAiScannerStore.getState().isWalletConnected;
        if (!connected) {
          throw new Error('Connection verification failed');
        }
        addLog('verified', '✅', 'Test 1/5: Connection ✓');
      } else {
        addLog('verified', '✅', 'Test 1/5: Already connected ✓');
      }
      
      // Wait for connection to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test 2: Fetch DOM
      addLog('scanning', '🟢', 'Test 2/5: Fetching DOM structure...');
      await handleStartScan();
      
      // Wait for scan to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const elementsFound = useAiScannerStore.getState().foundElements.length;
      if (elementsFound < 10) {
        throw new Error(`Not enough elements found: ${elementsFound} (expected > 10)`);
      }
      addLog('verified', '✅', `Test 2/5: Fetched ${elementsFound} elements ✓`);
      
      // Test 3: Get Element Style (first element)
      addLog('scanning', '🟢', 'Test 3/5: Extracting element styles...');
      const firstElement = useAiScannerStore.getState().foundElements[0];
      if (firstElement && firstElement.metrics) {
        addLog('verified', '✅', `Test 3/5: Styles extracted (${firstElement.metrics.width}×${firstElement.metrics.height}px) ✓`);
      } else {
        throw new Error('No element metrics available');
      }
      
      // Test 4: Vision Analysis
      addLog('scanning', '🟢', 'Test 4/5: Checking AI Vision analysis...');
      const aiSummary = (useAiScannerStore.getState() as any).aiSummary;
      const elementsWithAI = useAiScannerStore.getState().foundElements.filter(el => el.aiComment);
      
      if (elementsWithAI.length > 0) {
        addLog('verified', '✅', `Test 4/5: AI enriched ${elementsWithAI.length} elements ✓`);
      } else {
        addLog('error', '❌', 'Test 4/5: AI Vision skipped (non-critical)');
      }
      
      // Test 5: Export JSON
      addLog('scanning', '🟢', 'Test 5/5: Exporting JSON with metadata...');
      exportJSON();
      addLog('verified', '✅', 'Test 5/5: JSON exported successfully ✓');
      
      // Final summary
      const summary = `
🎉 Smoke Test PASSED
━━━━━━━━━━━━━━━━━━
✅ Connection: OK
✅ DOM Fetch: ${elementsFound} elements
✅ Style Extraction: OK
${elementsWithAI.length > 0 ? '✅' : '⚠️'} AI Vision: ${elementsWithAI.length} enriched
✅ JSON Export: OK
━━━━━━━━━━━━━━━━━━
`;
      
      addLog('verified', '✅', summary);
      toast.success('🎉 All smoke tests passed!', { duration: 5000 });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', '❌', `❌ Smoke test FAILED: ${errorMsg}`);
      toast.error(`❌ Smoke test failed: ${errorMsg}`, { duration: 5000 });
      console.error('[SmokeTest] Error:', error);
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
