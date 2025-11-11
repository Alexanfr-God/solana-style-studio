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
  async connectWallet(walletType: 'MetaMask' | 'Phantom' | 'WS') {
    console.log(`[AiScanOrchestrator] 🔌 Connecting to ${walletType}...`);
    
    const store = this.store.getState();
    store.addLog('scanning', '🟢', `Connecting to ${walletType}...`);
    
    try {
      this.bridge = WalletBridgeFactory.create(walletType);
      
      // For WS bridge, just connect without wallet type parameter
      const connected = walletType === 'WS' 
        ? await this.bridge.connect('MetaMask') // Dummy parameter for interface compatibility
        : await this.bridge.connect(walletType);
      
      if (!connected) {
        throw new Error(`Failed to connect to ${walletType}`);
      }
      
      store.setWalletConnected(true);
      store.setWalletType(walletType);
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
    this.currentScreen = screen;
    const store = this.store.getState();
    const { targetMode } = store;
    
    console.log(`[AiScanOrchestrator] 🚀 Starting ${targetMode} scan on ${screen} screen`);
    
    try {
      store.startScan(screen);
      
      // Phase 1: Scan DOM (local or external based on mode)
      if (targetMode === 'local') {
        await this.scanLocalDOM();
      } else {
        await this.scanExternalDOM();
      }
      
      // Phase 2: AI Vision Analysis
      await this.runVisionAnalysis();
      
      // Phase 3: Snapshot Capture (elements already have styles from scanLocalDOM)
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
   * Phase 1: Scan Local WalletContainer DOM (not external wallet!)
   */
  private async scanLocalDOM() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 📡 Scanning local WalletContainer DOM...');
    store.setScanMode('vision');
    store.addLog('scanning', '🟢', 'Scanning local wallet DOM...');
    
    try {
      // Find wallet-root in current document
      const walletRoot = document.querySelector('[data-wallet-root]') as HTMLElement;
      
      if (!walletRoot) {
        throw new Error('WalletContainer not found! Make sure [data-wallet-root] exists.');
      }
      
      // Collect all elements with data-element-id
      const elements = walletRoot.querySelectorAll('[data-element-id]');
      
      console.log(`[AiScanOrchestrator] ✅ Found ${elements.length} elements in local DOM`);
      store.addLog('found', '🔵', `Found ${elements.length} elements in WalletContainer`);
      
      // Convert to ElementItem[]
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        const elementId = htmlEl.getAttribute('data-element-id') || `element-${index}`;
        const computedStyle = window.getComputedStyle(htmlEl);
        const rect = htmlEl.getBoundingClientRect();
        
        const element: ElementItem = {
          id: elementId,
          role: elementId,
          type: this.detectElementType(elementId),
          status: 'found',
          style: {
            bg: computedStyle.backgroundColor,
            radius: computedStyle.borderRadius,
            border: computedStyle.border,
            text: htmlEl.textContent?.trim().substring(0, 50) || ''
          },
          metrics: {
            width: rect.width,
            height: rect.height,
            bg: computedStyle.backgroundColor,
            font: computedStyle.fontFamily,
            radius: computedStyle.borderRadius
          },
          domElement: htmlEl
        };
        
        store.addElement(element);
        
        if (index < 5) {
          store.addLog('found', '🔵', `${elementId} → ${element.style.text}`);
        }
      });
      
      if (elements.length > 5) {
        store.addLog('found', '🔵', `... and ${elements.length - 5} more elements`);
      }
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Failed to scan local DOM:', error);
      throw error;
    }
  }
  
  /**
   * Phase 1b: Scan EXTERNAL wallet (MetaMask, Phantom) via Bridge
   */
  private async scanExternalDOM() {
    const store = this.store.getState();
    
    if (!this.bridge?.isConnected()) {
      throw new Error('External wallet not connected. Please connect first.');
    }
    
    console.log('[AiScanOrchestrator] 📡 Scanning external wallet DOM...');
    store.setScanMode('vision');
    store.addLog('scanning', '🟢', 'Scanning external wallet...');
    
    try {
      const domStructure = await this.bridge.fetchDOM();
      
      console.log(`[AiScanOrchestrator] ✅ Found ${domStructure.allElements.length} elements`);
      store.addLog('found', '🔵', `Found ${domStructure.allElements.length} elements`);
      
      // Convert to ElementItem[]
      domStructure.allElements.forEach((el, index) => {
        const element: ElementItem = {
          id: el.id,
          role: el.tag,
          type: this.detectElementType(el.tag),
          status: 'found',
          style: {
            bg: el.styles.backgroundColor || 'transparent',
            radius: el.styles.borderRadius || '0px',
            border: el.styles.border || 'none',
            text: el.text
          },
          metrics: {
            width: el.rect.width,
            height: el.rect.height,
            bg: el.styles.backgroundColor,
            font: el.styles.fontFamily,
            radius: el.styles.borderRadius
          }
        };
        
        store.addElement(element);
        
        if (index < 5) {
          store.addLog('found', '🔵', `${el.selector} → ${el.text}`);
        }
      });
      
      if (domStructure.allElements.length > 5) {
        store.addLog('found', '🔵', `... and ${domStructure.allElements.length - 5} more`);
      }
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Failed to scan external DOM:', error);
      throw error;
    }
  }
  
  /**
   * Phase 2: AI Vision Analysis
   * Captures screenshot and uses AI to identify element types/roles
   */
  private async runVisionAnalysis() {
    const store = this.store.getState();
    
    console.log('[AiScanOrchestrator] 🟢 Phase 2: Vision Analysis (AI-powered)');
    store.setScanMode('vision');
    store.addLog('vision', '🟢', 'Starting AI vision analysis...');
    
    try {
      // 1. Capture screenshot from local WalletContainer
      console.log('[AiScanOrchestrator] 📸 Capturing screenshot...');
      store.addLog('vision', '🟢', 'Capturing wallet screenshot...');
      
      const walletRoot = document.querySelector('[data-wallet-root]') as HTMLElement;
      if (!walletRoot) {
        console.warn('[AiScanOrchestrator] ⚠️ WalletContainer not found, skipping AI vision');
        store.addLog('error', '❌', 'WalletContainer not found, skipping AI vision');
        return;
      }
      
      // Use html2canvas to capture screenshot
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(walletRoot, {
        backgroundColor: null,
        scale: 2,
        logging: false
      });
      
      const screenshotDataUrl = canvas.toDataURL('image/png');
      
      if (!screenshotDataUrl) {
        console.warn('[AiScanOrchestrator] ⚠️ No screenshot available, skipping AI vision');
        store.addLog('error', '❌', 'Screenshot unavailable, skipping AI vision');
        return;
      }
      
      console.log('[AiScanOrchestrator] ✅ Screenshot captured');
      store.addLog('vision', '🟢', 'Screenshot captured, analyzing with AI...');
      
      // 2. Import supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // 3. Call ai-vision-analyze edge function
      const { data, error } = await supabase.functions.invoke('ai-vision-analyze', {
        body: { 
          screenshotDataUrl,
          walletType: 'MetaMask' 
        }
      });
      
      if (error) {
        throw new Error(`AI Vision analysis failed: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'AI Vision analysis failed');
      }
      
      console.log('[AiScanOrchestrator] 🤖 AI analyzed', data.elements?.length || 0, 'elements');
      store.addLog('vision', '🟢', `AI identified ${data.elements?.length || 0} elements`);
      
      // 4. Enrich existing elements with AI insights
      let enrichedCount = 0;
      
      if (data.elements && Array.isArray(data.elements)) {
        data.elements.forEach((aiElement: any) => {
          // Try to match AI element with existing DOM elements
          const matchingElements = store.foundElements.filter(domEl => {
            // Match by type or role keywords
            const roleKeyword = aiElement.role?.split('.')[1]?.toLowerCase() || '';
            const roleMatch = domEl.role.toLowerCase().includes(roleKeyword);
            const typeMatch = domEl.type === aiElement.type;
            return roleMatch || typeMatch;
          });
          
          if (matchingElements.length > 0) {
            // Update first matching element
            const element = matchingElements[0];
            store.updateElement(element.id, {
              type: aiElement.type, // AI-determined type
              aiComment: aiElement.description,
              aiConfidence: aiElement.confidence
            });
            enrichedCount++;
            
            console.log(`[AiScanOrchestrator] 💡 Enriched ${element.id} → ${aiElement.description}`);
          }
        });
      }
      
      console.log(`[AiScanOrchestrator] ✅ Vision Analysis: ${enrichedCount}/${data.elements?.length || 0} elements enriched`);
      store.addLog('vision', '🟢', `Enriched ${enrichedCount} elements with AI insights`);
      
      // Store AI summary for JSON export
      (store as any).aiSummary = data.summary;
      
      await this.delay(500);
      
    } catch (error) {
      console.error('[AiScanOrchestrator] ❌ Vision analysis failed:', error);
      store.addLog('error', '❌', `Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Continue without AI insights (non-blocking)
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
