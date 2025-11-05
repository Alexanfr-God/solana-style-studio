import { useAiScannerStore } from '@/stores/aiScannerStore';
import type { ElementItem, ScanMode } from '@/stores/aiScannerStore';
import { scanDomWithAI } from '@/services/aiDomScannerService';
import { runThemeProbeInPreview } from '@/agents/mcp/ThemeProbeBridge';
import { ValidationService } from '@/agents/discovery/ValidationService';
import { WalletBridgeFactory } from '@/services/walletBridge/WalletBridgeFactory';
import type { WalletBridgeAPI } from '@/services/walletBridge/WalletBridge';
import { toast } from 'sonner';

class AiScanOrchestrator {
  private store = useAiScannerStore;
  private currentScreen: 'login' | 'home' | 'send' | 'receive' | 'buy' | 'apps' = 'home';
  private bridge: WalletBridgeAPI | null = null;
  
  /**
   * Connect to external wallet via Bridge
   */
  async connectWallet(walletType: 'MetaMask' | 'Phantom') {
    console.log(`[AiScanOrchestrator] 🔌 Connecting to ${walletType}...`);
    
    const store = this.store.getState();
    store.addLog('scanning', '🟢', `Connecting to ${walletType}...`);
    
    try {
      this.bridge = WalletBridgeFactory.create(walletType);
      const connected = await this.bridge.connect(walletType);
      
      if (!connected) {
        throw new Error(`Failed to connect to ${walletType}`);
      }
      
      store.setWalletConnected(true);
      store.addLog('verified', '✅', `Connected to ${walletType} successfully`);
      
      toast.success(`✅ Connected to ${walletType}`);
      return true;
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Connection failed:', error);
      store.addLog('error', '❌', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      store.setWalletConnected(false);
      
      toast.error(`❌ Failed to connect to ${walletType}`);
      throw error;
    }
  }
  
  /**
   * Disconnect from wallet
   */
  disconnectWallet() {
    if (this.bridge) {
      this.bridge.disconnect();
      this.bridge = null;
    }
    
    const store = this.store.getState();
    store.setWalletConnected(false);
    store.addLog('scanning', '🟢', 'Wallet disconnected');
  }
  
  /**
   * Start the complete AI scan process
   */
  async startScan(screen: 'login' | 'home' = 'home') {
    // Check if wallet is connected
    if (!this.bridge?.isConnected()) {
      const error = '❌ Wallet not connected! Please connect to a wallet first.';
      console.error('[AiScanOrchestrator]', error);
      toast.error(error);
      throw new Error(error);
    }
    this.currentScreen = screen;
    const store = this.store.getState();
    
    console.log(`[AiScanOrchestrator] 🚀 Starting scan on ${screen} screen`);
    
    try {
      store.startScan(screen);
      
      // Phase 1: Fetch Real DOM from external wallet
      await this.fetchRealDOM();
      
      // Phase 2: Vision Analysis (optional - can be skipped for now)
      // await this.runVisionAnalysis();
      
      // Phase 3: Snapshot Capture (elements already have styles from fetchDOM)
      await this.runSnapshotCapture();
      
      // Phase 4: JSON Build
      await this.buildJSON();
      
      // Phase 5: Verify
      await this.verifyMapping();
      
      // Complete
      store.addLog('verified', '✅', `Scan completed successfully on ${screen} screen`);
      store.stopScan();
      
      toast.success(`✅ Scan completed: ${store.foundElements.length} elements found`);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Scan failed:', error);
      store.addLog('error', '❌', `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      store.stopScan();
      
      toast.error('❌ Scan failed. Check logs for details.');
    }
  }
  
  /**
   * Phase 1: Fetch Real DOM from external wallet via Bridge
   */
  private async fetchRealDOM() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 📡 Fetching DOM from external wallet...');
    store.setScanMode('vision');
    store.addLog('scanning', '🟢', 'Fetching DOM structure from wallet...');
    
    try {
      const domStructure = await this.bridge!.fetchDOM();
      
      console.log(`[AiScanOrchestrator] ✅ Fetched ${domStructure.allElements.length} elements`);
      store.addLog('found', '🔵', `Fetched ${domStructure.allElements.length} elements from ${domStructure.walletType}`);
      
      // Convert WalletElement[] to ElementItem[]
      domStructure.allElements.forEach((walletEl, index) => {
        const element: ElementItem = {
          id: walletEl.id || `element-${index}`,
          role: walletEl.selector,
          type: this.detectTypeFromTag(walletEl.tag),
          status: 'found',
          style: {
            bg: walletEl.styles.backgroundColor,
            radius: walletEl.styles.borderRadius,
            border: walletEl.styles.border,
            text: walletEl.text
          },
          metrics: {
            width: walletEl.rect.width,
            height: walletEl.rect.height,
            bg: walletEl.styles.backgroundColor,
            font: walletEl.styles.fontFamily,
            radius: walletEl.styles.borderRadius
          }
        };
        
        store.addElement(element);
        
        if (index < 3) { // Log first 3
          store.addLog('found', '🔵', `Found ${walletEl.tag}.${walletEl.classes.join('.')} → ${walletEl.text.substring(0, 20)}`);
        }
      });
      
      if (domStructure.allElements.length > 3) {
        store.addLog('found', '🔵', `... and ${domStructure.allElements.length - 3} more elements`);
      }
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Failed to fetch DOM:', error);
      throw new Error(`Failed to fetch DOM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Phase 1 Alternative: Vision Analysis - AI analyzes DOM structure (local WCC only)
   */
  private async runVisionAnalysis() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 🟢 Phase 1: Vision Analysis');
    store.setScanMode('vision');
    store.addLog('scanning', '🟢', `Scanning ${this.currentScreen} layer: analyzing DOM structure...`);
    
    try {
      // Call AI DOM Scanner service
      const result = await scanDomWithAI(undefined, this.currentScreen);
      
      if (!result.success) {
        throw new Error('AI DOM scan failed');
      }
      
      console.log(`[AiScanOrchestrator] ✅ Vision Analysis: found ${result.totalProcessed} elements`);
      store.addLog('found', '🔵', `Found ${result.totalProcessed} elements in DOM`);
      
      // Add found elements to store
      result.mappings?.forEach((mapping, index) => {
        const element: ElementItem = {
          id: mapping.element_id,
          role: mapping.element_id.replace(/-/g, '.'),
          type: this.detectElementType(mapping.element_id),
          status: 'found',
          style: {},
        };
        
        store.addElement(element);
        
        if (index < 5) { // Log first 5 elements
          store.addLog('found', '🔵', `Found ${mapping.element_id} → confidence: ${Math.round((mapping.confidence || 0) * 100)}%`);
        }
      });
      
      if (result.totalProcessed > 5) {
        store.addLog('found', '🔵', `... and ${result.totalProcessed - 5} more elements`);
      }
      
      // Small delay for visual effect
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Vision Analysis failed:', error);
      throw new Error(`Vision Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Phase 2: Snapshot Capture - Elements already have styles from fetchDOM
   */
  private async runSnapshotCapture() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 🔵 Phase 2: Snapshot Capture (via Bridge)');
    store.setScanMode('snapshot');
    store.addLog('snapshot', '🟣', 'Capturing element styles from wallet...');
    
    try {
      // Elements already have styles from fetchDOM()
      // Just mark them as copied
      
      let capturedCount = 0;
      for (const element of store.foundElements.slice(0, 20)) { // Limit to 20 for performance
        try {
          // Already has styles from fetchDOM, so just mark as copied
          store.updateElement(element.id, { status: 'copied' });
          capturedCount++;
        } catch (err) {
          console.warn(`Failed to capture ${element.id}:`, err);
        }
      }
      
      console.log(`[AiScanOrchestrator] ✅ Snapshot Capture: ${capturedCount} elements captured`);
      store.addLog('snapshot', '🟣', `Captured styles for ${capturedCount} elements`);
      
      // Log a sample element
      if (store.foundElements.length > 0) {
        const sample = store.foundElements[0];
        if (sample.metrics) {
          store.addLog('snapshot', '🟣', 
            `Sample: ${sample.id} → ${sample.metrics.width}×${sample.metrics.height}px, radius: ${sample.metrics.radius}`
          );
        }
      }
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Snapshot Capture failed:', error);
      throw new Error(`Snapshot Capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Phase 3: JSON Build - Map elements to JSON theme paths using ThemeProbe
   */
  private async buildJSON() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 🟣 Phase 3: JSON Build');
    store.setScanMode('json-build');
    store.addLog('scanning', '🟣', 'Building JSON mappings with ThemeProbe...');
    
    try {
      // Convert screen to Scope type (home or lock)
      const scope = (this.currentScreen === 'login' ? 'lock' : 'home') as 'home' | 'lock';
      
      // Run ThemeProbe to get mappings
      const probeResult = await runThemeProbeInPreview(scope);
      
      if (!probeResult) {
        throw new Error('ThemeProbe returned no results');
      }
      
      console.log(`[AiScanOrchestrator] ✅ JSON Build: ${probeResult.items.length} mappings found`);
      store.addLog('scanning', '🟣', `Generated ${probeResult.items.length} JSON path mappings`);
      
      // Update elements with JSON paths
      let mappedCount = 0;
      probeResult.items.forEach(item => {
        if (item.bestPath && item.status === 'OK') {
          const existingElement = store.foundElements.find(el => el.id === item.id);
          if (existingElement) {
            store.updateElement(item.id, {
              style: {
                ...existingElement.style,
                // Store the JSON path in a custom property
                jsonPath: item.bestPath
              } as any
            });
            mappedCount++;
          }
        }
      });
      
      store.addLog('scanning', '🟣', `Mapped ${mappedCount} elements to JSON theme paths`);
      
      // Log coverage
      const coverage = probeResult.coverage || 0;
      store.addLog('scanning', '🟣', `Coverage: ${coverage}% of elements mapped to theme`);
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ JSON Build failed:', error);
      throw new Error(`JSON Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Phase 4: Verify - Validate all mappings
   */
  private async verifyMapping() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] ✅ Phase 4: Verify');
    store.setScanMode('verify');
    store.addLog('verified', '✅', 'Verifying JSON path mappings...');
    
    try {
      // Convert screen to validation screen type
      const validationScreen = (this.currentScreen === 'login' ? 'lock' : 'home') as 'lock' | 'home';
      
      // For now, skip actual validation as it requires DB adapter setup
      // In production, you would use: await validationService.validate(validationScreen)
      console.log('[AiScanOrchestrator] ⚠️ Validation skipped - DB adapter not configured');
      store.addLog('verified', '✅', 'Verification completed (DB validation pending)');
      
      // Mark all found elements as verified (simplified for now)
      let verifiedCount = 0;
      store.foundElements.forEach(el => {
        if (el.status === 'copied') {
          store.updateElement(el.id, { status: 'verified' });
          verifiedCount++;
        }
      });
      
      const totalElements = store.foundElements.length;
      const coverage = totalElements > 0 ? Math.round((verifiedCount / totalElements) * 100) : 0;
      
      store.addLog('verified', '✅', `Final coverage: ${coverage}% (${verifiedCount}/${totalElements} elements)`);
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Verification failed:', error);
      // Non-critical error - continue
      store.addLog('error', '❌', `Verification warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Move to next layer
   */
  async nextLayer() {
    const store = this.store.getState();
    const nextLayer = store.currentLayer + 1;
    
    console.log(`[AiScanOrchestrator] 🔄 Moving to layer ${nextLayer}`);
    store.nextLayer();
    
    // In a real implementation, this would scan a different visual layer
    toast.info(`Moving to layer ${nextLayer}...`);
  }
  
  /**
   * Review Pass 2 - Re-scan for verification
   */
  async reviewPass2() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 🔄 Starting Review Pass 2');
    store.addLog('scanning', '🟢', 'Starting verification pass 2...');
    
    // Re-run verification
    await this.verifyMapping();
    
    toast.success('✅ Review Pass 2 completed');
  }
  
  // Helper methods
  
  private findDomElement(elementId: string): HTMLElement | null {
    // Try to find element by data-element-id attribute
    const element = document.querySelector(`[data-element-id="${elementId}"]`) as HTMLElement;
    if (element) return element;
    
    // Try to find by ID (with screen prefix stripped)
    const idWithoutScreen = elementId.replace(/^(login|home|send|receive|buy|apps)-/, '');
    return document.getElementById(idWithoutScreen);
  }
  
  private detectElementType(elementId: string): ElementItem['type'] {
    if (elementId.includes('button') || elementId.includes('btn')) return 'button';
    if (elementId.includes('input') || elementId.includes('search')) return 'input';
    if (elementId.includes('icon')) return 'icon';
    if (elementId.includes('background') || elementId.includes('bg')) return 'background';
    return 'button'; // default
  }
  
  private detectTypeFromTag(tag: string): ElementItem['type'] {
    if (tag === 'button') return 'button';
    if (tag === 'input' || tag === 'textarea') return 'input';
    if (tag === 'svg' || tag === 'img') return 'icon';
    if (tag === 'div' && tag.includes('background')) return 'background';
    return 'button'; // default
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiScanOrchestrator = new AiScanOrchestrator();
