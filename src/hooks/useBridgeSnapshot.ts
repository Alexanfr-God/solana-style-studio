import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const PROTON_FORK_ID = 'jplgfhpmjnbigmhklmmbgecoobifkmpa';

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
  rawData?: any;
}

export interface ExtensionOption {
  id: string;
  label: string;
  lastSeen: number;
  isProtonFork: boolean;
  hasScreenshot: boolean;
  elementsWithRect: number;
}

interface UseBridgeSnapshotReturn {
  snapshot: BridgeSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  availableExtensions: ExtensionOption[];
  selectedExtension: string | null;
  setSelectedExtension: (id: string | null) => void;
  protonForkOnly: boolean;
  setProtonForkOnly: (value: boolean) => void;
}

export function useBridgeSnapshot(pollInterval = 3000): UseBridgeSnapshotReturn {
  const [snapshot, setSnapshot] = useState<BridgeSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableExtensions, setAvailableExtensions] = useState<ExtensionOption[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [protonForkOnly, setProtonForkOnly] = useState(false);

  // Check if a snapshot is from Proton fork
  const isProtonForkSnapshot = useCallback((row: any): boolean => {
    const snapshotData = row.snapshot as any;
    const url = snapshotData?.url || '';
    return url.includes(PROTON_FORK_ID) || row.extension_id.includes(PROTON_FORK_ID);
  }, []);

  // Fetch available extensions from recent snapshots
  const fetchExtensions = useCallback(async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('extension_bridge_snapshots')
        .select('extension_id, created_at, snapshot')
        .order('created_at', { ascending: false })
        .limit(100);

      if (dbError) throw dbError;

      if (data) {
        // Group by extension_id, keep latest with metadata
        const extensionMap = new Map<string, ExtensionOption>();
        data.forEach(row => {
          const ts = new Date(row.created_at || '').getTime();
          const snapshotData = row.snapshot as any;
          const hasScreenshot = !!snapshotData?.screenshotDataUrl;
          const elements = snapshotData?.elements || [];
          const elementsWithRect = elements.filter((el: any) => el.rect && el.rect.width > 0).length;
          const isProton = isProtonForkSnapshot(row);
          
          const existing = extensionMap.get(row.extension_id);
          if (!existing || existing.lastSeen < ts) {
            extensionMap.set(row.extension_id, {
              id: row.extension_id,
              label: row.extension_id,
              lastSeen: ts,
              isProtonFork: isProton,
              hasScreenshot,
              elementsWithRect,
            });
          }
        });

        let extensions = Array.from(extensionMap.values())
          .sort((a, b) => b.lastSeen - a.lastSeen);

        setAvailableExtensions(extensions);

        // Auto-select best extension
        if (!selectedExtension && extensions.length > 0) {
          // Prefer: Proton fork with screenshot > Proton fork > non-test with screenshot > any
          const preferred = 
            extensions.find(e => e.isProtonFork && e.hasScreenshot) ||
            extensions.find(e => e.isProtonFork) ||
            extensions.find(e => !e.id.includes('test') && e.hasScreenshot) ||
            extensions.find(e => !e.id.includes('test')) ||
            extensions[0];
          setSelectedExtension(preferred.id);
        }
      }
    } catch (err) {
      console.error('[useBridgeSnapshot] Error fetching extensions:', err);
    }
  }, [selectedExtension, isProtonForkSnapshot]);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('extension_bridge_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(protonForkOnly ? 50 : 1); // Fetch more if filtering

      // Filter by selected extension if set
      if (selectedExtension) {
        query = query.eq('extension_id', selectedExtension);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw dbError;
      }

      if (!data || data.length === 0) {
        setSnapshot(null);
        return;
      }

      // Find best snapshot
      let targetRow = data[0];
      
      if (protonForkOnly) {
        // Filter to only Proton fork snapshots
        const protonSnapshots = data.filter(row => isProtonForkSnapshot(row));
        
        if (protonSnapshots.length === 0) {
          setError('No Proton fork snapshots found');
          setSnapshot(null);
          return;
        }
        
        // Prefer snapshots with screenshot and more elements with rect
        targetRow = protonSnapshots.reduce((best, current) => {
          const bestData = best.snapshot as any;
          const currentData = current.snapshot as any;
          
          const bestHasScreenshot = !!bestData?.screenshotDataUrl;
          const currentHasScreenshot = !!currentData?.screenshotDataUrl;
          
          const bestRects = (bestData?.elements || []).filter((e: any) => e.rect?.width > 0).length;
          const currentRects = (currentData?.elements || []).filter((e: any) => e.rect?.width > 0).length;
          
          // Prefer screenshot > more rects > newer
          if (currentHasScreenshot && !bestHasScreenshot) return current;
          if (!currentHasScreenshot && bestHasScreenshot) return best;
          if (currentRects > bestRects) return current;
          if (currentRects < bestRects) return best;
          return current; // Newer
        }, protonSnapshots[0]);
      }

      const snapshotData = targetRow.snapshot as any;
      const rawElements = snapshotData?.elements || [];
      
      // Normalize elements with fallback values
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
        id: targetRow.id,
        extensionId: targetRow.extension_id,
        screen: targetRow.screen || 'unknown',
        elements: normalizedElements,
        screenshotDataUrl: snapshotData?.screenshotDataUrl,
        viewport: snapshotData?.viewport,
        devicePixelRatio: snapshotData?.devicePixelRatio,
        timestamp: new Date(targetRow.created_at || '').getTime(),
        elementsCount: targetRow.elements_count || 0,
        rawData: snapshotData,
      });
    } catch (err: any) {
      console.error('[useBridgeSnapshot] Error fetching snapshot:', err);
      setError(err.message || 'Failed to fetch snapshot');
    } finally {
      setLoading(false);
    }
  }, [selectedExtension, protonForkOnly, isProtonForkSnapshot]);

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
    protonForkOnly,
    setProtonForkOnly,
  };
}
