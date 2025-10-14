import { DbAdapter } from '@/agents/mcp/DbAdapter';

/**
 * Helper to get value from nested object by path
 * Reuses logic from runtimeMappingEngine
 */
function getByPath(obj: any, path: string): any {
  if (!path) return obj;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath.split('/').filter(Boolean).reduce((acc, k) => acc?.[k], obj);
}

export interface ValidationResult {
  id: string;
  json_path: string;
  exists: boolean;
  value?: any;
  selector?: string;
}

/**
 * ValidationService - Validates json_path existence in Theme JSON
 * 
 * Fetches wallet_elements from DB and checks if their json_path
 * actually exists in the current theme.
 */
export class ValidationService {
  constructor(
    private db: DbAdapter,
    private getTheme: () => any
  ) {}

  /**
   * Validate all elements for a screen
   * 
   * @param screen - 'lock' or 'home'
   * @returns Array of validation results
   */
  async validate(screen: 'lock' | 'home'): Promise<ValidationResult[]> {
    console.log(`[VALIDATE] 🔍 Validating mappings for screen="${screen}"`);
    
    const elements = await this.db.fetchWalletElements(screen);
    const theme = this.getTheme();
    
    const results: ValidationResult[] = elements.map(el => {
      const value = getByPath(theme, el.json_path);
      const exists = value !== undefined;
      
      return {
        id: el.id,
        json_path: el.json_path,
        exists,
        value: exists ? value : undefined,
        selector: el.selector
      };
    });

    const okCount = results.filter(r => r.exists).length;
    const missingCount = results.filter(r => !r.exists).length;
    
    console.log(`[VALIDATE] ✅ ${okCount} OK, ❌ ${missingCount} missing`);
    
    return results;
  }
}
