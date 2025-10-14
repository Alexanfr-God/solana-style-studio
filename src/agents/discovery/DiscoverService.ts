import { mappingSpec } from '@/agents/spec/mappingSpec';
import { DomInspector } from '@/agents/mcp/DomInspector';
import { DbAdapter, WalletElementRecord } from '@/agents/mcp/DbAdapter';

/**
 * Helper to get value from nested object by path
 * Reuses logic from runtimeMappingEngine
 */
function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath.split('/').filter(Boolean).reduce((acc, k) => acc?.[k], obj);
}

export interface DiscoveryPlan {
  id: string;
  selector: string;
  json_path: string;
  screen: 'lock' | 'home';
  existsInTheme: boolean;
  name: string;
  description: string;
  type: string;
  hasExistingPath?: boolean;
  existingPath?: string;
}

export interface DiscoveryResult {
  planned: DiscoveryPlan[];
  inserted: number;
  updated: number;
}

export class DiscoverService {
  constructor(
    private dom: DomInspector,
    private db: DbAdapter,
    private getTheme: () => any
  ) {}

  /**
   * Discover elements and optionally apply to database
   * 
   * @param screen - 'lock' or 'home'
   * @param dryRun - if true, only return plan without applying
   * @returns Discovery result with plan and counts
   */
  async discover(
    screen: 'lock' | 'home',
    dryRun = true
  ): Promise<DiscoveryResult> {
    console.log(`[DISCOVER] 🔍 Starting discovery for screen="${screen}" (dry-run: ${dryRun})`);
    
    // 1. Scan DOM
    const nodes = this.dom.scan(screen);
    const theme = this.getTheme?.();
    const spec = mappingSpec[screen] || {};

    // 2. Fetch existing elements from DB to detect path changes
    const existing = await this.db.fetchWalletElements(screen);
    const existingMap = new Map(existing.map(e => [e.id, e]));

    // 3. Build plan
    const planned: DiscoveryPlan[] = nodes
      .map(n => {
        const json_path = spec[n.id];
        if (!json_path) {
          console.warn(`[DISCOVER] ⚠️ No mapping for element "${n.id}"`);
          return null;
        }

        const existsInTheme = getByPath(theme, json_path) !== undefined;
        const existingRecord = existingMap.get(n.id);
        const hasExistingPath = !!existingRecord;
        const pathChanged = existingRecord && existingRecord.json_path !== json_path;
        
        return {
          id: n.id,
          selector: n.selector,
          json_path,
          screen,
          existsInTheme,
          name: this.generateName(n.id),
          description: `Auto-discovered ${screen} element: ${n.id}`,
          type: 'style',
          hasExistingPath,
          existingPath: existingRecord?.json_path
        };
      })
      .filter(Boolean) as DiscoveryPlan[];

    console.log(`[DISCOVER] 📋 Planned ${planned.length} elements`);

    // 4. If dry-run, return only plan
    if (dryRun) {
      return { planned, inserted: 0, updated: 0 };
    }

    // 5. Apply (UPSERT to DB)
    const toUpsert: WalletElementRecord[] = planned.map(p => ({
      id: p.id,
      selector: p.selector,
      json_path: p.json_path,
      screen: p.screen,
      name: p.name,
      description: p.description,
      type: p.type
    }));

    const { inserted, updated } = await this.db.upsertWalletElements(toUpsert);
    
    console.log(`[DISCOVER] ✅ Applied: ${inserted} inserted, ${updated} updated`);
    
    return { planned, inserted, updated };
  }

  /**
   * Generate human-readable name from element ID
   * "home-send-button" → "Home Send Button"
   */
  private generateName(id: string): string {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
