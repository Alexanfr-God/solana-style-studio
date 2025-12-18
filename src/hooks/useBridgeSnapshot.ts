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
  rawData?: any; // For debugging
}

export interface ExtensionOption {
  id: string;
  label: string;
  lastSeen: number;
}

interface UseBridgeSnapshotReturn {
  snapshot: BridgeSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  availableExtensions: ExtensionOption[];
  selectedExtension: string | null;
  setSelectedExtension: (id: string | null) => void;
}

export function useBridgeSnapshot(pollInterval = 3000): UseBridgeSnapshotReturn {
  const [snapshot, setSnapshot] = useState<BridgeSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableExtensions, setAvailableExtensions] = useState<ExtensionOption[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);

  // Fetch available extensions from recent snapshots
  const fetchExtensions = useCallback(async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('extension_bridge_snapshots')
        .select('extension_id, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (dbError) throw dbError;

      if (data) {
        // Group by extension_id, keep latest timestamp
        const extensionMap = new Map<string, number>();
        data.forEach(row => {
          const ts = new Date(row.created_at || '').getTime();
          if (!extensionMap.has(row.extension_id) || extensionMap.get(row.extension_id)! < ts) {
            extensionMap.set(row.extension_id, ts);
          }
        });

        const extensions: ExtensionOption[] = Array.from(extensionMap.entries())
          .map(([id, lastSeen]) => ({ id, label: id, lastSeen }))
          .sort((a, b) => b.lastSeen - a.lastSeen);

        setAvailableExtensions(extensions);

        // Auto-select first non-test extension, or first one
        if (!selectedExtension && extensions.length > 0) {
          const preferred = extensions.find(e => !e.id.includes('test')) || extensions[0];
          setSelectedExtension(preferred.id);
        }
      }
    } catch (err) {
      console.error('[useBridgeSnapshot] Error fetching extensions:', err);
    }
  }, [selectedExtension]);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('extension_bridge_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      // Filter by selected extension if set
      if (selectedExtension) {
        query = query.eq('extension_id', selectedExtension);
      }

      const { data, error: dbError } = await query.maybeSingle();

      if (dbError) {
        throw dbError;
      }

      if (!data) {
        setSnapshot(null);
        return;
      }

      const snapshotData = data.snapshot as any;
      const rawElements = snapshotData?.elements || [];
      
      // Normalize elements with fallback values for selector and rect
      const normalizedElements: BridgeElement[] = rawElements.map((el: any, index: number) => ({
        id: el.id || `element-${index}`,
        selector: el.selector || el.id || `${el.tag || 'UNKNOWN'}-${index}`,
        tag: el.tag || 'UNKNOWN',
        text: el.text,
        rect: el.rect || { x: 0, y: 0, width: 0, height: 0 },
        styles: el.styles,
        className: el.classes?.join(' ') || el.className,
        attributes: el.attributes,
      }));
      
      setSnapshot({
        id: data.id,
        extensionId: data.extension_id,
        screen: data.screen || 'unknown',
        elements: normalizedElements,
        screenshotDataUrl: snapshotData?.screenshotDataUrl,
        viewport: snapshotData?.viewport,
        devicePixelRatio: snapshotData?.devicePixelRatio,
        timestamp: new Date(data.created_at || '').getTime(),
        elementsCount: data.elements_count || 0,
        rawData: snapshotData,
      });
    } catch (err: any) {
      console.error('[useBridgeSnapshot] Error fetching snapshot:', err);
      setError(err.message || 'Failed to fetch snapshot');
    } finally {
      setLoading(false);
    }
  }, [selectedExtension]);

  // Fetch extensions on mount
  useEffect(() => {
    fetchExtensions();
  }, [fetchExtensions]);

  // Poll for latest snapshot
  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, pollInterval);
    return () => clearInterval(interval);
  }, [fetchLatest, pollInterval]);

  return { 
    snapshot, 
    loading, 
    error, 
    refresh: fetchLatest,
    availableExtensions,
    selectedExtension,
    setSelectedExtension,
  };
}
