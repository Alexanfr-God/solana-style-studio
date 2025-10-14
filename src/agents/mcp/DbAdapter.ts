/**
 * DbAdapter Interface
 * 
 * Abstraction for database operations on wallet_elements table.
 * Current implementation: SupabaseDbAdapter
 */

export interface WalletElementRecord {
  id: string;
  selector: string;
  json_path: string;
  screen: 'lock' | 'home';
  name: string;
  type: string;
  description: string;
}

export interface UpsertResult {
  inserted: number;
  updated: number;
}

export interface DbAdapter {
  /**
   * Upsert wallet elements into database
   * @param items - Array of element records to upsert
   * @returns Count of inserted and updated records
   */
  upsertWalletElements(items: WalletElementRecord[]): Promise<UpsertResult>;
  
  /**
   * Fetch existing wallet elements for a screen
   * @param screen - 'lock' or 'home'
   * @returns Array of existing element records
   */
  fetchWalletElements(screen: 'lock' | 'home'): Promise<WalletElementRecord[]>;
}
