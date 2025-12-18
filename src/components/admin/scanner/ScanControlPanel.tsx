import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, ChevronRight, RefreshCw, Download, Wallet, FlaskConical, Plug, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAiScannerStore, ScanSource } from '@/stores/aiScannerStore';
import { aiScanOrchestrator } from '@/services/aiScanOrchestrator';
import { WalletConnectionPrompt } from './WalletConnectionPrompt';
import { ExtensionSnapshotViewer } from './ExtensionSnapshotViewer';
import { BridgeDebugPanel } from './BridgeDebugPanel';
import { realtimeBridgeClient, getExtensionBridgeUrl } from '@/services/extensionBridge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export const ScanControlPanel = () => {
  const { 
    isScanning,
    isWalletConnected,
    walletType,
    targetMode,
    scanSource,
    bridgeConnection,
    stopScan, 
    exportJSON,
    currentLayer,
    addLog,
    setTargetMode,
    setScanSource,
    updateBridgeConnection
  } = useAiScannerStore();
  
  const [selectedWallet, setSelectedWallet] = useState<'MetaMask' | 'Phantom' | 'WS'>('MetaMask');
  const [isConnectingBridge, setIsConnectingBridge] = useState(false);
  const [bridgeUrl] = useState(() => getExtensionBridgeUrl());
  
  // Listen to bridge state changes
  useEffect(() => {
    const unsubscribe = realtimeBridgeClient.subscribe((state) => {
      console.log('[ScanControlPanel] Bridge state changed:', state);
    });
    return unsubscribe;
  }, []);
  
  const handleConnect = async () => {
    try {
      await aiScanOrchestrator.connectWallet(selectedWallet);
      toast.success(`✅ Connected to ${selectedWallet}`);
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(`❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleStartScan = async () => {
    try {
      console.log('[ScanControlPanel] 🚀 Starting scan...');
      addLog('scanning', '🟢', 'Starting AI scan of WalletContainer...');
      await aiScanOrchestrator.startScan('home');
      toast.success('✅ Scan completed successfully!');
    } catch (error) {
      console.error('[ScanControlPanel] ❌ Scan failed:', error);
      toast.error(`❌ Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      {/* Scan Source Toggle */}
      <div className="flex gap-1 mb-4">
        <Button 
          variant={scanSource === 'local' ? 'default' : 'outline'}
          onClick={() => { setScanSource('local'); setTargetMode('local'); }}
          size="sm"
          className="flex-1 text-xs px-2"
        >
          Local
        </Button>
        <Button 
          variant={scanSource === 'external' ? 'default' : 'outline'}
          onClick={() => { setScanSource('external'); setTargetMode('external'); }}
          size="sm"
          className="flex-1 text-xs px-2"
        >
          External
        </Button>
        <Button 
          variant={scanSource === 'extension-bridge' ? 'default' : 'outline'}
          onClick={() => setScanSource('extension-bridge')}
          size="sm"
          className="flex-1 text-xs px-2 gap-1"
        >
          <Plug className="h-3 w-3" />
          Bridge
        </Button>
      </div>
      
      {/* Extension Bridge Mode */}
      {scanSource === 'extension-bridge' && (
        <div className="space-y-3">
          {/* Bridge Endpoints Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded space-y-2">
            <div>
              <div className="font-medium text-foreground/80">State Endpoint (GET):</div>
              <code className="text-[10px] break-all block mt-0.5">{bridgeUrl}</code>
            </div>
            <div>
              <div className="font-medium text-foreground/80">Snapshot Endpoint (POST):</div>
              <code className="text-[10px] break-all block mt-0.5">{bridgeUrl}/snapshot</code>
            </div>
          </div>
          
          {/* Connect Bridge Button */}
          <Button
            onClick={async () => {
              setIsConnectingBridge(true);
              addLog('scanning', '🟢', `Connecting to bridge: ${bridgeUrl}`);
              
              try {
                const connected = await realtimeBridgeClient.connect();
                setIsConnectingBridge(false);
                
                if (connected) {
                  updateBridgeConnection({ isConnected: true });
                  addLog('verified', '✅', 'Extension bridge connected');
                  toast.success('Connected to extension bridge');
                } else {
                  addLog('error', '❌', 'Bridge connection failed');
                  toast.error('Bridge connection failed. Check if Edge Function is deployed.');
                }
              } catch (error) {
                setIsConnectingBridge(false);
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                addLog('error', '❌', `Bridge error: ${errorMsg}`);
                toast.error(`Bridge error: ${errorMsg}`);
              }
            }}
            disabled={isConnectingBridge || bridgeConnection.isConnected}
            variant={bridgeConnection.isConnected ? 'secondary' : 'default'}
            size="sm"
            className="w-full"
          >
            {isConnectingBridge ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
            ) : bridgeConnection.isConnected ? (
              <><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Bridge Connected</>
            ) : (
              <><Plug className="h-4 w-4 mr-2" /> Connect Bridge</>
            )}
          </Button>
          
          {/* Connection Status */}
          {bridgeConnection.isConnected && (
            <div className="text-xs space-y-1.5 p-2 bg-green-500/10 border border-green-500/20 rounded">
              {bridgeConnection.extensionName ? (
                <>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Extension: <strong>{bridgeConnection.extensionName}</strong></span>
                  </div>
                  {bridgeConnection.lastSnapshotAt ? (
                    <div className={`flex items-center gap-1 ${
                      (Date.now() - bridgeConnection.lastSnapshotAt) > 30000 
                        ? 'text-amber-600' 
                        : 'text-green-700/80'
                    }`}>
                      {(Date.now() - bridgeConnection.lastSnapshotAt) > 30000 && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      <span>
                        Last snapshot: {bridgeConnection.lastScreen || 'unknown'} ({formatDistanceToNow(bridgeConnection.lastSnapshotAt)} ago)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Waiting for snapshot...</span>
                    </div>
                  )}
                  {bridgeConnection.snapshotCount !== undefined && bridgeConnection.snapshotCount > 0 && (
                    <div className="text-muted-foreground">
                      Elements: {Array.isArray(useAiScannerStore.getState().extensionSnapshot?.state?.elements) 
                        ? (useAiScannerStore.getState().extensionSnapshot?.state?.elements as unknown[]).length 
                        : 0} | 
                      Total snapshots: {bridgeConnection.snapshotCount}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Bridge active, waiting for extension...</span>
                </div>
              )}
            </div>
          )}
          
          {/* Test Snapshot Button */}
          <Button
            onClick={async () => {
              addLog('scanning', '🟢', 'Sending test snapshot with full data...');
              try {
                const testSnapshot = {
                  extension: 'test-vpn',
                  screen: 'popup',
                  ts: Date.now(),
                  snapshot: {
                    elements: [
                      { 
                        tag: 'BUTTON', 
                        id: 'connect', 
                        selector: 'button#connect.btn-primary',
                        classes: ['btn-primary'], 
                        text: 'Connect VPN',
                        rect: { x: 20, y: 300, width: 280, height: 44 }
                      },
                      { 
                        tag: 'DIV', 
                        id: 'status', 
                        selector: 'div#status.status-indicator',
                        classes: ['status-indicator'], 
                        text: 'Disconnected',
                        rect: { x: 20, y: 120, width: 280, height: 32 }
                      },
                      { 
                        tag: 'SPAN', 
                        id: 'server', 
                        selector: 'span#server.server-label',
                        classes: ['server-label'], 
                        text: 'US-East-1',
                        rect: { x: 20, y: 180, width: 200, height: 24 }
                      },
                    ],
                    theme: { background: '#1a1a2e', color: '#ffffff', accent: '#6366f1' },
                    title: 'Test VPN Extension',
                    viewport: { width: 320, height: 480 },
                    devicePixelRatio: 2
                  }
                };
                
                const response = await fetch(`${bridgeUrl}/snapshot`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(testSnapshot)
                });
                
                const result = await response.json();
                if (response.ok) {
                  addLog('verified', '✅', `Test snapshot sent! ID: ${result.id}`);
                  toast.success('Test snapshot sent with rect data!');
                  await realtimeBridgeClient.requestSnapshot();
                } else {
                  throw new Error(result.error || 'Failed to send snapshot');
                }
              } catch (error) {
                const msg = error instanceof Error ? error.message : 'Unknown error';
                addLog('error', '❌', `Test snapshot failed: ${msg}`);
                toast.error(`Failed: ${msg}`);
              }
            }}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <FlaskConical className="h-4 w-4" />
            Send Test Snapshot
          </Button>
          
          {/* Clear Test Snapshots Button */}
          <Button
            onClick={async () => {
              try {
                const { error } = await supabase
                  .from('extension_bridge_snapshots')
                  .delete()
                  .eq('extension_id', 'test-vpn');
                
                if (error) throw error;
                
                addLog('verified', '✅', 'Test snapshots cleared from database');
                toast.success('Test snapshots cleared!');
                await realtimeBridgeClient.requestSnapshot();
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                toast.error(`Failed to clear: ${msg}`);
              }
            }}
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-amber-600 hover:text-amber-700"
          >
            <XCircle className="h-4 w-4" />
            Clear Test Snapshots
          </Button>
          
          <ExtensionSnapshotViewer />
          <BridgeDebugPanel />
        </div>
      )}
      
      {/* Wallet Selector (External Mode Only) */}
      {scanSource === 'external' && (
        <Select value={selectedWallet} onValueChange={(value) => setSelectedWallet(value as any)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select wallet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MetaMask">MetaMask (Chrome)</SelectItem>
            <SelectItem value="Phantom">Phantom (Chrome)</SelectItem>
            <SelectItem value="WS">Web Wallet (WebSocket)</SelectItem>
          </SelectContent>
        </Select>
      )}
      
      {/* Connection Prompt or Scan Button */}
      {scanSource !== 'extension-bridge' && scanSource === 'external' && !isWalletConnected ? (
        <WalletConnectionPrompt 
          onConnect={handleConnect} 
          walletType={selectedWallet as 'MetaMask' | 'Phantom'} 
        />
      ) : !isScanning ? (
        <Button 
          onClick={handleStartScan} 
          className="w-full gap-2"
          size="sm"
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
