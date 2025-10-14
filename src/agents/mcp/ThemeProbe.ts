/**
 * ThemeProbe - Wallet-Scoped Layered Probe
 * 
 * Strategy:
 * 1. Find wallet root container (required)
 * 2. For each layer: activate → scan → probe
 * 3. Enumerate scalar properties in theme JSON
 * 4. Temporarily mutate values, observe changes in layer elements
 * 5. Build mapping: data-element-id → json_path with confidence
 */

import { ThemeAdapter } from './ThemeAdapter';

const WALLET_ROOT_SELECTORS = [
  '[data-wallet-root]',
  '#wallet-root',
  '.wallet-root',
  '#extension-root',
  '#app-root'
];

const LAYERS = ['lock', 'home', 'send', 'receive', 'apps', 'buy', 'swap', 'history', 'search', 'sidebar'];

export type ProbeOptions = {
  scope?: 'all' | string; // 'all' or specific layer name
  styleProps?: string[];
  batchSize?: number;
  waitFrames?: number;
};

export type MappingItem = {
  id: string;
  layer: string;
  bestPath: string;
  confidence: number;
  changedProps?: string[];
  candidates?: Array<{ path: string; weight: number; changedProps: string[] }>;
  status: 'OK' | 'AMBIGUOUS' | 'UNMAPPED' | 'NON_SCALAR' | 'INACTIVE_LAYER';
};

export type ProbeResult = {
  walletRoot: string;
  activeLayers: string[];
  items: MappingItem[];
  coverage: number;
  totals: {
    OK: number;
    AMBIGUOUS: number;
    UNMAPPED: number;
    NON_SCALAR: number;
    INACTIVE_LAYER: number;
  };
  layerSummary: Array<{
    layer: string;
    total: number;
    ok: number;
    status: 'SCANNED' | 'INACTIVE_OR_EMPTY';
  }>;
};

const DEFAULT_STYLE_PROPS = [
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'fill',
  'stroke',
  'font-size',
  'font-weight',
  'opacity',
  'box-shadow',
  'text-shadow'
];

export class ThemeProbe {
  private progressCallback?: (current: number, total: number, path: string) => void;

  constructor(private adapter: ThemeAdapter) {}

  onProgress(callback: (current: number, total: number, path: string) => void) {
    this.progressCallback = callback;
  }

  /**
   * Find wallet root container
   */
  private findWalletRoot(): HTMLElement {
    for (const sel of WALLET_ROOT_SELECTORS) {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        console.log(`[ThemeProbe] ✅ Wallet root found: ${sel}`);
        return el;
      }
    }
    
    console.error('[ThemeProbe] ❌ Wallet root not found. Tried:', WALLET_ROOT_SELECTORS);
    throw new Error('Wallet root not found. Ensure [data-wallet-root] or similar selector exists.');
  }

  /**
   * Check if element is visible
   */
  private isVisible(el: Element): boolean {
    const htmlEl = el as HTMLElement;
    const rect = htmlEl.getBoundingClientRect?.();
    const style = getComputedStyle(htmlEl);
    return !!rect && rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden';
  }

  /**
   * Collect visible elements for a specific layer within wallet root
   */
  private collectLayerElements(root: HTMLElement, layer: string): HTMLElement[] {
    const selector = `[data-element-id^="${layer}-"]`;
    const elements = Array.from(root.querySelectorAll(selector)) as HTMLElement[];
    const visible = elements.filter(el => this.isVisible(el));
    
    console.log(`[ThemeProbe] Layer "${layer}": found ${elements.length} elements, ${visible.length} visible`);
    
    if (visible.length === 0 && elements.length > 0) {
      console.warn(`[ThemeProbe] ⚠️ Layer "${layer}" has ${elements.length} elements but none are visible`);
    }
    
    return visible;
  }

  /**
   * Ensure layer is visible and active
   */
  private async ensureLayerVisible(root: HTMLElement, layer: string): Promise<boolean> {
    console.log(`[ThemeProbe] 🔄 Activating layer "${layer}"...`);
    
    // Try programmatic router first
    try {
      const router = (window as any).WalletRouter;
      if (router?.navigate) {
        await router.navigate(layer);
        console.log(`[ThemeProbe] ✅ Navigated via WalletRouter to "${layer}"`);
      }
    } catch (err) {
      console.log(`[ThemeProbe] WalletRouter not available, trying UI navigation`);
    }

    // Fallback: click navigation control
    const navSelectors = [
      `[data-nav="${layer}"]`,
      `[data-element-id="nav-${layer}"]`,
      `[data-element-id="home-nav-${layer}"]`
    ];
    
    for (const sel of navSelectors) {
      const nav = root.querySelector(sel) as HTMLElement | null;
      if (nav) {
        console.log(`[ThemeProbe] 🖱️ Clicking navigation: ${sel}`);
        nav.click();
        break;
      }
    }

    // Wait for render
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve());
        } else {
          setTimeout(resolve, 300);
        }
      });
    });

    // Verify layer is active
    const activeLayer = root.getAttribute('data-layer');
    const elements = this.collectLayerElements(root, layer);
    
    const isActive = activeLayer === layer && elements.length > 0;
    
    if (!isActive) {
      console.warn(`[ThemeProbe] ⚠️ Layer "${layer}" inactive or empty (data-layer="${activeLayer}", elements=${elements.length})`);
    } else {
      console.log(`[ThemeProbe] ✅ Layer "${layer}" active with ${elements.length} elements`);
    }
    
    return isActive;
  }

  /**
   * Enumerate all scalar paths in theme
   */
  enumerateScalars(theme: any): Array<{ path: string; value: any; type: 'string' | 'number' | 'boolean' }> {
    const scalars: Array<{ path: string; value: any; type: 'string' | 'number' | 'boolean' }> = [];

    const traverse = (obj: any, path: string) => {
      if (obj === null || obj === undefined) return;

      const type = typeof obj;
      
      if (type === 'string' || type === 'number' || type === 'boolean') {
        scalars.push({ path, value: obj, type });
        return;
      }

      if (type === 'object' && !Array.isArray(obj)) {
        for (const key in obj) {
          traverse(obj[key], path ? `${path}/${key}` : key);
        }
      }
    };

    traverse(theme, '');
    console.log(`[ThemeProbe] Found ${scalars.length} scalar paths`);
    return scalars;
  }

  /**
   * Take snapshot of element styles
   */
  snapshot(ids: string[], props: string[]): Record<string, Record<string, string>> {
    const result: Record<string, Record<string, string>> = {};

    ids.forEach(id => {
      const el = document.querySelector(`[data-element-id="${id}"]`);
      if (!el) return;

      const styles: Record<string, string> = {};
      const computed = getComputedStyle(el);

      props.forEach(prop => {
        styles[prop] = computed.getPropertyValue(prop);
      });

      // For SVG elements, also check fill/stroke
      if (el instanceof SVGElement) {
        styles['fill'] = computed.getPropertyValue('fill');
        styles['stroke'] = computed.getPropertyValue('stroke');
      }

      result[id] = styles;
    });

    return result;
  }

  /**
   * Probe a single scalar path and detect changes
   */
  async probeOne(
    path: string,
    ids: string[],
    props: string[],
    waitFrames: number
  ): Promise<Array<{ id: string; diff: number; changedProps: string[] }>> {
    const theme = this.adapter.getTheme();
    const prevValue = this.getByPath(theme, path);
    
    if (prevValue === undefined) {
      return [];
    }

    // Generate signal value
    const signalValue = this.generateSignal(path, prevValue);
    if (signalValue === null) {
      return []; // Skip non-visual properties
    }

    // Take snapshot before
    const before = this.snapshot(ids, props);

    try {
      // Apply signal
      this.adapter.setScalar(path, signalValue);
      this.adapter.forceRerender();

      // Wait for render
      await this.waitForFrames(waitFrames);

      // Take snapshot after
      const after = this.snapshot(ids, props);

      // Calculate diffs
      const results: Array<{ id: string; diff: number; changedProps: string[] }> = [];

      ids.forEach(id => {
        const beforeStyles = before[id];
        const afterStyles = after[id];
        if (!beforeStyles || !afterStyles) return;

        const changedProps: string[] = [];
        props.forEach(prop => {
          if (beforeStyles[prop] !== afterStyles[prop]) {
            changedProps.push(prop);
          }
        });

        if (changedProps.length > 0) {
          // Weight key properties higher
          let weight = changedProps.length;
          const keyProps = ['color', 'background-color', 'fill', 'stroke'];
          changedProps.forEach(prop => {
            if (keyProps.includes(prop)) weight += 1;
          });

          results.push({ id, diff: weight, changedProps });
        }
      });

      return results;
    } finally {
      // ALWAYS restore
      this.adapter.restoreScalar(path, prevValue);
      this.adapter.forceRerender();
      await this.waitForFrames(waitFrames);
    }
  }

  private generateSignal(path: string, prevValue: any): any {
    const type = typeof prevValue;
    const pathLower = path.toLowerCase();

    // String (color-like)
    if (type === 'string') {
      const isColor = pathLower.includes('color') || 
                     pathLower.includes('gradient') ||
                     /^#|rgb|hsl/.test(prevValue);
      
      if (isColor) {
        return 'rgb(1, 2, 3)'; // Unique signal color
      }

      // Font size
      if (pathLower.includes('size') && /\d+px/.test(prevValue)) {
        return '999px';
      }

      // Other string properties - skip
      return null;
    }

    // Number
    if (type === 'number') {
      const isVisual = pathLower.includes('size') ||
                      pathLower.includes('width') ||
                      pathLower.includes('radius') ||
                      pathLower.includes('opacity') ||
                      pathLower.includes('weight');
      
      if (isVisual) {
        return prevValue + 10;
      }
      return null;
    }

    // Boolean - skip
    if (type === 'boolean') {
      return null;
    }

    return null;
  }

  private async waitForFrames(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  }

  private getByPath(obj: any, path: string): any {
    const parts = path.split('/').filter(Boolean);
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }

  /**
   * Main entry point: Wallet-Scoped Layered Probe
   */
  async buildMapping(opts: ProbeOptions = {}): Promise<ProbeResult> {
    const { scope = 'all', styleProps = DEFAULT_STYLE_PROPS, batchSize = 10, waitFrames = 2 } = opts;
    
    console.log(`[ThemeProbe] 🚀 Starting Wallet-Scoped Layered Probe (scope="${scope}")`);
    
    // Step 1: Find wallet root
    const walletRoot = this.findWalletRoot();
    const walletRootSelector = WALLET_ROOT_SELECTORS.find(sel => document.querySelector(sel)) || 'unknown';
    
    // Step 2: Determine layers to scan
    const layersToScan = scope === 'all' ? LAYERS : [scope];
    console.log(`[ThemeProbe] 📋 Layers to scan:`, layersToScan);
    
    // Step 3: Enumerate theme scalars
    const theme = this.adapter.getTheme();
    const scalars = this.enumerateScalars(theme);
    console.log(`[ThemeProbe] 📊 Theme scalars: ${scalars.length}`);
    
    const allItems: MappingItem[] = [];
    const layerSummary: ProbeResult['layerSummary'] = [];
    const activeLayers: string[] = [];
    
    // Step 4: Process each layer
    for (const layer of layersToScan) {
      console.log(`\n[ThemeProbe] 🔬 Processing layer: "${layer}"`);
      
      // Activate layer
      const isActive = await this.ensureLayerVisible(walletRoot, layer);
      
      if (!isActive) {
        layerSummary.push({
          layer,
          total: 0,
          ok: 0,
          status: 'INACTIVE_OR_EMPTY'
        });
        
        // Add INACTIVE items for diagnostics
        const inactiveElements = Array.from(walletRoot.querySelectorAll(`[data-element-id^="${layer}-"]`));
        inactiveElements.forEach(el => {
          const id = el.getAttribute('data-element-id');
          if (id) {
            allItems.push({
              id,
              layer,
              bestPath: '',
              confidence: 0,
              status: 'INACTIVE_LAYER'
            });
          }
        });
        
        continue;
      }
      
      activeLayers.push(layer);
      
      // Collect visible elements
      const elements = this.collectLayerElements(walletRoot, layer);
      const elementIds = elements.map(el => el.getAttribute('data-element-id')).filter(Boolean) as string[];
      
      if (elementIds.length === 0) {
        console.warn(`[ThemeProbe] ⚠️ Layer "${layer}": no visible elements with data-element-id`);
        layerSummary.push({
          layer,
          total: 0,
          ok: 0,
          status: 'INACTIVE_OR_EMPTY'
        });
        continue;
      }
      
      console.log(`[ThemeProbe] 🎯 Layer "${layer}": probing ${elementIds.length} elements against ${scalars.length} scalars`);
      
      // Probe scalars in batches
      const hitsByElement: Map<string, Array<{ path: string; magnitude: number; props: string[] }>> = new Map();
      
      for (let i = 0; i < scalars.length; i += batchSize) {
        const batch = scalars.slice(i, i + batchSize);
        
        for (const scalar of batch) {
          if (this.progressCallback) {
            this.progressCallback(i, scalars.length, scalar.path);
          }

          const hits = await this.probeOne(scalar.path, elementIds, styleProps, waitFrames);
          
          hits.forEach(({ id, diff, changedProps }) => {
            if (!hitsByElement.has(id)) hitsByElement.set(id, []);
            hitsByElement.get(id)!.push({ path: scalar.path, magnitude: diff, props: changedProps });
          });
        }
      }
      
      // Build mapping items for this layer
      let okCount = 0;
      
      for (const id of elementIds) {
        const hits = hitsByElement.get(id) || [];
        
        if (hits.length === 0) {
          allItems.push({ id, layer, bestPath: '', confidence: 0, status: 'UNMAPPED' });
          continue;
        }
        
        // Sort by magnitude (strongest signal first)
        hits.sort((a, b) => b.magnitude - a.magnitude);
        const best = hits[0];
        
        // Calculate confidence
        const totalWeight = hits.reduce((sum, h) => sum + h.magnitude, 0);
        const confidence = best.magnitude / totalWeight;
        
        const status = hits.length === 1 
          ? 'OK' 
          : confidence > 0.8 
            ? 'OK' 
            : 'AMBIGUOUS';
        
        if (status === 'OK') okCount++;
        
        const candidates = hits.map(h => ({
          path: h.path,
          weight: h.magnitude,
          changedProps: h.props
        }));
        
        allItems.push({
          id,
          layer,
          bestPath: best.path,
          confidence: Math.min(confidence, 1.0),
          changedProps: best.props,
          candidates,
          status
        });
      }
      
      layerSummary.push({
        layer,
        total: elementIds.length,
        ok: okCount,
        status: 'SCANNED'
      });
      
      console.log(`[ThemeProbe] ✅ Layer "${layer}": ${okCount}/${elementIds.length} OK`);
    }
    
    // Step 5: Calculate totals
    const totals = {
      OK: allItems.filter(i => i.status === 'OK').length,
      AMBIGUOUS: allItems.filter(i => i.status === 'AMBIGUOUS').length,
      UNMAPPED: allItems.filter(i => i.status === 'UNMAPPED').length,
      NON_SCALAR: allItems.filter(i => i.status === 'NON_SCALAR').length,
      INACTIVE_LAYER: allItems.filter(i => i.status === 'INACTIVE_LAYER').length
    };
    
    const coverage = allItems.length > 0 ? totals.OK / allItems.length : 0;
    
    console.log(`\n[ThemeProbe] 🎉 Probe complete!`);
    console.log(`[ThemeProbe] 📊 Wallet Root: ${walletRootSelector}`);
    console.log(`[ThemeProbe] 📊 Active Layers: ${activeLayers.join(', ')}`);
    console.log(`[ThemeProbe] 📊 Coverage: ${(coverage * 100).toFixed(1)}%`);
    console.log(`[ThemeProbe] 📊 Totals:`, totals);
    
    return {
      walletRoot: walletRootSelector,
      activeLayers,
      items: allItems,
      coverage,
      totals,
      layerSummary
    };
  }

  /**
   * Export results to downloads
   */
  async exportResults(result: ProbeResult, screen: string): Promise<void> {
    const timestamp = new Date().toISOString();

    // 1. autogen.json
    const autogen = {
      screen,
      walletRoot: result.walletRoot,
      activeLayers: result.activeLayers,
      generatedAt: timestamp,
      coverage: result.coverage,
      items: result.items
        .filter(i => i.status === 'OK')
        .map(i => ({
          id: i.id,
          layer: i.layer,
          path: i.bestPath,
          confidence: i.confidence,
          changedProps: i.changedProps
        }))
    };

    // 2. report.json
    const report = {
      screen,
      walletRoot: result.walletRoot,
      activeLayers: result.activeLayers,
      generatedAt: timestamp,
      coverage: result.coverage,
      totals: result.totals,
      layerSummary: result.layerSummary,
      items: result.items
    };

    // 3. summary.md
    const summary = this.generateSummary(result, screen);

    // Log and download
    console.log('[ThemeProbe] 📄 Export Results:');
    console.log(`=== mapping.${screen}.autogen.json ===`);
    console.log(JSON.stringify(autogen, null, 2));
    console.log(`\n=== mapping.${screen}.report.json ===`);
    console.log(JSON.stringify(report, null, 2));
    console.log(`\n=== mapping.${screen}.summary.md ===`);
    console.log(summary);

    this.downloadJSON(`mapping.${screen}.autogen.json`, autogen);
    this.downloadJSON(`mapping.${screen}.report.json`, report);
    this.downloadText(`mapping.${screen}.summary.md`, summary);
  }

  private generateSummary(result: ProbeResult, screen: string): string {
    let md = `# ThemeProbe Mapping Summary: ${screen}\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `## Overview\n\n`;
    md += `- **Wallet Root**: \`${result.walletRoot}\`\n`;
    md += `- **Active Layers**: ${result.activeLayers.join(', ')}\n`;
    md += `- **Coverage**: ${(result.coverage * 100).toFixed(1)}%\n`;
    md += `- **Total Elements**: ${result.items.length}\n\n`;

    md += `## Status Breakdown\n\n`;
    md += `| Status | Count |\n`;
    md += `|--------|-------|\n`;
    md += `| ✅ OK | ${result.totals.OK} |\n`;
    md += `| ⚠️ AMBIGUOUS | ${result.totals.AMBIGUOUS} |\n`;
    md += `| ❌ UNMAPPED | ${result.totals.UNMAPPED} |\n`;
    md += `| 🚫 NON_SCALAR | ${result.totals.NON_SCALAR} |\n`;
    md += `| 💤 INACTIVE_LAYER | ${result.totals.INACTIVE_LAYER} |\n\n`;

    md += `## Layer Summary\n\n`;
    md += `| Layer | Total | OK | Status |\n`;
    md += `|-------|-------|----|---------|\n`;
    result.layerSummary.forEach(ls => {
      md += `| ${ls.layer} | ${ls.total} | ${ls.ok} | ${ls.status} |\n`;
    });
    md += `\n`;

    // OK mappings
    const okItems = result.items.filter(i => i.status === 'OK');
    if (okItems.length > 0) {
      md += `## ✅ OK Mappings (${okItems.length})\n\n`;
      md += `| Element ID | Layer | JSON Path | Confidence | Changed Props |\n`;
      md += `|------------|-------|-----------|------------|---------------|\n`;
      okItems.forEach(item => {
        md += `| \`${item.id}\` | ${item.layer} | \`${item.bestPath}\` | ${(item.confidence * 100).toFixed(0)}% | ${item.changedProps?.join(', ') || '—'} |\n`;
      });
      md += `\n`;
    }

    return md;
  }

  private downloadJSON(filename: string, data: any) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadText(filename: string, text: string) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
