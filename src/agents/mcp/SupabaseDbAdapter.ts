import { supabase } from '@/integrations/supabase/client';
import { DbAdapter, WalletElementRecord, UpsertResult } from './DbAdapter';

/**
 * SupabaseDbAdapter - Database operations via Supabase
 * 
 * Implements upsert logic for wallet_elements table.
 */

export class SupabaseDbAdapter implements DbAdapter {
  async upsertWalletElements(items: WalletElementRecord[]): Promise<UpsertResult> {
    if (items.length === 0) {
      return { inserted: 0, updated: 0 };
    }

    console.log(`[SupabaseDbAdapter] 🔄 Upserting ${items.length} elements...`);

    // Batch upsert
    const { data, error } = await supabase
      .from('wallet_elements')
      .upsert(
        items.map(item => ({
          id: item.id,
          selector: item.selector,
          json_path: item.json_path,
          screen: item.screen,
          name: item.name,
          type: item.type,
          description: item.description,
          updated_at: new Date().toISOString()
        })),
        { 
          onConflict: 'id',
          count: 'exact'
        }
      )
      .select();

    if (error) {
      console.error('[SupabaseDbAdapter] ❌ Upsert error:', error);
      throw error;
    }

    // Count is not reliable for upserts, so we'll return the data length
    const count = data?.length || items.length;
    
    console.log(`[SupabaseDbAdapter] ✅ Upserted ${count} elements`);
    
    // Note: Supabase doesn't distinguish between INSERT/UPDATE in upsert responses
    // We'll return the total count as "updated" for simplicity
    return { 
      inserted: 0, 
      updated: count 
    };
  }

  async fetchWalletElements(screen: 'lock' | 'home'): Promise<WalletElementRecord[]> {
    console.log(`[SupabaseDbAdapter] 📥 Fetching elements for screen="${screen}"`);

    const { data, error } = await supabase
      .from('wallet_elements')
      .select('id, selector, json_path, screen, name, type, description')
      .eq('screen', screen);

    if (error) {
      console.error('[SupabaseDbAdapter] ❌ Fetch error:', error);
      throw error;
    }

    console.log(`[SupabaseDbAdapter] ✅ Fetched ${data?.length || 0} elements`);
    return (data || []) as WalletElementRecord[];
  }
}
