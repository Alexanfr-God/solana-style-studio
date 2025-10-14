/**
 * ThemeProbe - Runtime Diff Mapper
 * Automatically builds data-element-id → json_path mappings by probing theme scalars
 */

import { ThemeAdapter } from './ThemeAdapter';
import { findWalletRoot } from './LocalDomInspector';

export type ProbeOptions = {
  screen: 'home' | 'lock' | string;
  idPrefixes?: string[];
  styleProps?: string[];
  batchSize?: number;
  waitFrames?: number;
};

export type MappingItem = {
  id: string;
  bestPath?: string;
  confidence: number;
  changedProps?: string[];
  candidates?: Array<{ path: string; weight: number; changedProps: string[] }>;
  status: 'OK' | 'AMBIGUOUS' | 'UNMAPPED' | 'NON_SCALAR';
};

export type ProbeResult = {
  items: MappingItem[];
  coverage: number;
  totals: Record<'OK' | 'AMBIGUOUS' | 'UNMAPPED' | 'NON_SCALAR', number>;
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

const DEFAULT_PREFIXES = {
  home: ['home-', 'action-', 'header-'],
  lock: ['lock-', 'unlock-']
};

export class ThemeProbe {
  private progressCallback?: (current: number, total: number, path: string) => void;

  constructor(private adapter: ThemeAdapter) {}

  onProgress(callback: (current: number, total: number, path: string) => void) {
    this.progressCallback = callback;
  }

  /**
   * Deep DOM walker - traverses shadow roots and iframes
   * Safely handles cross-origin iframes
   */
  private *walkDeep(root: Node): Generator<Element> {
    // Get document for createTreeWalker
    const doc = root instanceof Document ? root : 
                (root as ShadowRoot).ownerDocument || document;
    
    const walker = doc.createTreeWalker(
      root, 
      NodeFilter.SHOW_ELEMENT
    );
    
    while (walker.nextNode()) {
      const el = walker.currentNode as Element;
      yield el;
      
      // Traverse shadow DOM
      const sr = (el as HTMLElement).shadowRoot;
      if (sr) {
        yield* this.walkDeep(sr);
      }
      
      // Traverse iframes - with cross-origin safety
      if (el.tagName === 'IFRAME') {
        try {
          const doc = (el as HTMLIFrameElement).contentDocument;
          if (doc) {
            yield* this.walkDeep(doc);
          }
        } catch (e) {
          // Cross-origin iframe - skip silently
          console.debug('[ThemeProbe] Skipping cross-origin iframe');
        }
      }
    }
  }

  /**
   * Soft visibility check using getClientRects
   * More reliable than offsetParent for SVG/shadow DOM
   */
  private isRenderable(el: Element): boolean {
    // SVG elements are always considered visible
    if (el instanceof SVGElement) return true;
    
    // Check if element has any rendered boxes
    return el.getClientRects().length > 0;
  }

  /**
   * Query all elements deeply with specified prefixes
   */
  private queryAllDeep(root: Node, prefixes: string[]): Element[] {
    const out: Element[] = [];
    
    for (const el of this.walkDeep(root)) {
      const id = el.getAttribute?.('data-element-id');
      if (!id) continue;
      
      if (prefixes.some(pref => id.startsWith(pref))) {
        out.push(el);
      }
    }
    
    return out;
  }

  /**
   * List all visible element IDs with specified prefixes
   */
  listElementIds(prefixes: string[]): string[] {
    const walletRoot = findWalletRoot();
    
    if (!walletRoot) {
      console.warn('[ThemeProbe] Wallet container not found');
      console.warn('[ThemeProbe] Tried candidates:', [
        '[data-wallet-container]',
        '[data-testid="wallet-preview"]',
        '.wallet-preview'
      ]);
      return [];
    }

    console.log('[ThemeProbe] Starting element scan from wallet root');

    // Deep query with prefix filtering
    const elements = this.queryAllDeep(walletRoot, prefixes);
    
    // Filter to only visible/renderable elements
    const visible = elements.filter(el => this.isRenderable(el));

    console.log(`[ThemeProbe] Found ${elements.length} elements total, ${visible.length} visible`);

    // Count by prefix for diagnostics
    const byPrefix: Record<string, number> = {};
    prefixes.forEach(p => byPrefix[p] = 0);
    
    visible.forEach((el) => {
      const id = el.getAttribute('data-element-id');
      if (!id) return;
      
      // Track prefix
      for (const prefix of prefixes) {
        if (id.startsWith(prefix)) {
          byPrefix[prefix]++;
          break;
        }
      }
    });

    console.log(`[ThemeProbe] Visible elements by prefix:`, byPrefix);
    console.log(`[ThemeProbe] First 5 IDs:`, visible.slice(0, 5).map(el => el.getAttribute('data-element-id')));
    
    return visible.map(el => el.getAttribute('data-element-id')!);
  }

  /**
   * Enumerate all scalar paths in theme
   */
  enumerateScalars(theme: any): Array<{ path: string; type: 'string' | 'number' | 'boolean' }> {
    const scalars: Array<{ path: string; type: 'string' | 'number' | 'boolean' }> = [];

    const traverse = (obj: any, path: string) => {
      if (obj === null || obj === undefined) return;

      const type = typeof obj;
      
      if (type === 'string' || type === 'number' || type === 'boolean') {
        scalars.push({ path, type });
        return;
      }

      if (type === 'object' && !Array.isArray(obj)) {
        for (const key in obj) {
          traverse(obj[key], `${path}/${key}`);
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

    // Boolean - only for known visual flags
    if (type === 'boolean') {
      // Skip - too risky to flip behavioral flags
      return null;
    }

    return null;
  }

  private async waitForFrames(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  }

  /**
   * Build complete mapping for a screen
   */
  async buildMapping(opts: ProbeOptions): Promise<ProbeResult> {
    const {
      screen,
      idPrefixes = DEFAULT_PREFIXES[screen as 'home' | 'lock'] || DEFAULT_PREFIXES.home,
      styleProps = DEFAULT_STYLE_PROPS,
      batchSize = 20,
      waitFrames = 2
    } = opts;

    console.log(`[ThemeProbe] 🔍 Building mapping for screen="${screen}"`);

    // 1. Collect IDs
    const ids = this.listElementIds(idPrefixes);
    if (ids.length === 0) {
      console.warn('[ThemeProbe] No elements found');
      return {
        items: [],
        coverage: 0,
        totals: { OK: 0, AMBIGUOUS: 0, UNMAPPED: 0, NON_SCALAR: 0 }
      };
    }

    // 2. Enumerate scalars
    const theme = this.adapter.getTheme();
    const scalars = this.enumerateScalars(theme);

    // 3. Probe in batches
    const pathToChanges = new Map<string, Array<{ id: string; diff: number; changedProps: string[] }>>();

    for (let i = 0; i < scalars.length; i += batchSize) {
      const batch = scalars.slice(i, Math.min(i + batchSize, scalars.length));

      for (const scalar of batch) {
        if (this.progressCallback) {
          this.progressCallback(i, scalars.length, scalar.path);
        }

        const changes = await this.probeOne(scalar.path, ids, styleProps, waitFrames);
        if (changes.length > 0) {
          pathToChanges.set(scalar.path, changes);
        }
      }
    }

    // 4. Aggregate results
    const idToPathWeights = new Map<string, Map<string, { weight: number; changedProps: string[] }>>();

    pathToChanges.forEach((changes, path) => {
      changes.forEach(({ id, diff, changedProps }) => {
        if (!idToPathWeights.has(id)) {
          idToPathWeights.set(id, new Map());
        }
        idToPathWeights.get(id)!.set(path, { weight: diff, changedProps });
      });
    });

    // 5. Select best paths
    const items: MappingItem[] = ids.map(id => {
      const pathWeights = idToPathWeights.get(id);

      if (!pathWeights || pathWeights.size === 0) {
        return {
          id,
          confidence: 0,
          status: 'UNMAPPED' as const
        };
      }

      const candidates = Array.from(pathWeights.entries())
        .map(([path, { weight, changedProps }]) => ({ path, weight, changedProps }))
        .sort((a, b) => b.weight - a.weight);

      const best = candidates[0];
      const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
      const confidence = best.weight / totalWeight;

      if (confidence < 0.6 && candidates.length >= 2) {
        return {
          id,
          bestPath: best.path,
          confidence,
          changedProps: best.changedProps,
          candidates,
          status: 'AMBIGUOUS' as const
        };
      }

      return {
        id,
        bestPath: best.path,
        confidence,
        changedProps: best.changedProps,
        candidates,
        status: 'OK' as const
      };
    });

    // 6. Calculate totals
    const totals = {
      OK: items.filter(i => i.status === 'OK').length,
      AMBIGUOUS: items.filter(i => i.status === 'AMBIGUOUS').length,
      UNMAPPED: items.filter(i => i.status === 'UNMAPPED').length,
      NON_SCALAR: 0
    };

    const coverage = ids.length > 0 ? totals.OK / ids.length : 0;

    console.log(`[ThemeProbe] ✅ Complete: ${totals.OK} OK, ${totals.AMBIGUOUS} AMBIGUOUS, ${totals.UNMAPPED} UNMAPPED`);
    console.log(`[ThemeProbe] Coverage: ${(coverage * 100).toFixed(1)}%`);

    return { items, coverage, totals };
  }

  /**
   * Export results to /out directory
   */
  async exportResults(result: ProbeResult, screen: string): Promise<void> {
    const timestamp = new Date().toISOString();

    // 1. autogen.json
    const autogen = {
      screen,
      generatedAt: timestamp,
      coverage: result.coverage,
      items: result.items
        .filter(i => i.status === 'OK')
        .map(i => ({
          id: i.id,
          path: i.bestPath,
          confidence: i.confidence,
          changedProps: i.changedProps,
          status: i.status
        }))
    };

    // 2. report.json
    const report = {
      screen,
      generatedAt: timestamp,
      coverage: result.coverage,
      totals: result.totals,
      items: result.items
    };

    // 3. summary.md
    const summary = this.generateSummary(result, screen);

    // Log to console (since we can't actually write to /out in browser)
    console.log('[ThemeProbe] 📄 Export Results:');
    console.log('=== mapping.' + screen + '.autogen.json ===');
    console.log(JSON.stringify(autogen, null, 2));
    console.log('\n=== mapping.' + screen + '.report.json ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('\n=== mapping.' + screen + '.summary.md ===');
    console.log(summary);

    // Also download files
    this.downloadJSON(`mapping.${screen}.autogen.json`, autogen);
    this.downloadJSON(`mapping.${screen}.report.json`, report);
    this.downloadText(`mapping.${screen}.summary.md`, summary);
  }

  private generateSummary(result: ProbeResult, screen: string): string {
    const { items, coverage, totals } = result;

    let md = `# ThemeProbe Mapping Summary: ${screen}\n\n`;
    md += `Generated: ${new Date().toISOString()}\n\n`;
    md += `## Overview\n\n`;
    md += `- **Coverage**: ${(coverage * 100).toFixed(1)}%\n`;
    md += `- **Total Elements**: ${items.length}\n\n`;
    md += `## Status Breakdown\n\n`;
    md += `| Status | Count |\n`;
    md += `|--------|-------|\n`;
    md += `| ✅ OK | ${totals.OK} |\n`;
    md += `| ⚠️ AMBIGUOUS | ${totals.AMBIGUOUS} |\n`;
    md += `| ❌ UNMAPPED | ${totals.UNMAPPED} |\n`;
    md += `| 🚫 NON_SCALAR | ${totals.NON_SCALAR} |\n\n`;

    // Problematic elements
    const problematic = items.filter(i => i.status !== 'OK');
    if (problematic.length > 0) {
      md += `## Problematic Elements (${problematic.length})\n\n`;
      md += `| ID | Status | Confidence | Best Path |\n`;
      md += `|----|--------|------------|----------|\n`;
      problematic.forEach(item => {
        md += `| ${item.id} | ${item.status} | ${(item.confidence * 100).toFixed(1)}% | ${item.bestPath || 'N/A'} |\n`;
      });
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

  private getByPath(obj: any, path: string): any {
    if (!path) return obj;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return cleanPath.split('/').filter(Boolean).reduce((acc, k) => acc?.[k], obj);
  }
}
