import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BridgeElement {
  id: string;
  selector: string;
  tag: string;
  text?: string;
  rect: { x: number; y: number; width: number; height: number };
  styles?: Record<string, string>;
  className?: string;
  attributes?: Record<string, string>;
}

export interface BridgeSnapshot {
  id: string;
  extensionId: string;
  screen: string;
  elements: BridgeElement[];
  screenshotDataUrl?: string;
  viewport?: { width: number; height: number };
  devicePixelRatio?: number;
  timestamp: number;
  elementsCount: number;
}

interface UseBridgeSnapshotReturn {
  snapshot: BridgeSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBridgeSnapshot(pollInterval = 3000): UseBridgeSnapshotReturn {
  const [snapshot, setSnapshot] = useState<BridgeSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('extension_bridge_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) {
        throw dbError;
      }

      if (!data) {
        setSnapshot(null);
        return;
      }

      if (data) {
        const snapshotData = data.snapshot as any;
        
        setSnapshot({
          id: data.id,
          extensionId: data.extension_id,
          screen: data.screen || 'unknown',
          elements: snapshotData?.elements || [],
          screenshotDataUrl: snapshotData?.screenshotDataUrl,
          viewport: snapshotData?.viewport,
          devicePixelRatio: snapshotData?.devicePixelRatio,
          timestamp: new Date(data.created_at || '').getTime(),
          elementsCount: data.elements_count || 0,
        });
      }
    } catch (err: any) {
      console.error('[useBridgeSnapshot] Error fetching snapshot:', err);
      setError(err.message || 'Failed to fetch snapshot');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
    
    const interval = setInterval(fetchLatest, pollInterval);
    
    return () => clearInterval(interval);
  }, [fetchLatest, pollInterval]);

  return { snapshot, loading, error, refresh: fetchLatest };
}
