import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const PROTON_FORK_ID = 'jplgfhpmjnbigmhklmmbgecoobifkmpa';

// Test extension IDs to filter out
const TEST_EXTENSION_IDS = ['test-vpn', 'manual-test', 'test'];

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

export interface SnapshotMeta {
  source: 'playwright' | 'extension' | 'test' | null;
  extensionId?: string;
  capturedAt?: number;
  userAgent?: string;
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
  url?: string;
  meta?: SnapshotMeta;
}

export interface ExtensionOption {
  id: string;
  label: string;
  lastSeen: number;
  isProtonFork: boolean;
  hasScreenshot: boolean;
  elementsWithRect: number;
  source: string | null;
  isReal: boolean;
}

interface UseBridgeSnapshotReturn {
  snapshot: BridgeSnapshot | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  availableExtensions: ExtensionOption[];
  selectedExtension: string | null;
  setSelectedExtension: (id: string | null) => void;
  onlyRealSnapshots: boolean;
  setOnlyRealSnapshots: (value: boolean) => void;
  clearTestData: () => Promise<number>;
}

// Check if snapshot is "real" (from Playwright or real Proton fork)
function isRealSnapshot(row: any): boolean {
  const snapshotData = row.snapshot as any;
  const meta = snapshotData?.meta;
  const url = snapshotData?.url || '';
  const extensionId = row.extension_id || '';
  
  // Source = playwright → real
  if (meta?.source === 'playwright') return true;
  
  // Proton VPN extension with chrome-extension:// URL → real
  if (extensionId === 'proton-vpn' && url.includes('chrome-extension://')) return true;
  if (url.includes(PROTON_FORK_ID)) return true;
  
  // Test extensions → not real
  if (TEST_EXTENSION_IDS.some(t => extensionId.includes(t))) return false;
  
  // Null/missing source and no valid extension info → not real
  if (!meta?.source && !url.includes('chrome-extension://')) return false;
  
  return true;
}

export function useBridgeSnapshot(pollInterval = 3000): UseBridgeSnapshotReturn {
  const [snapshot, setSnapshot] = useState<BridgeSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableExtensions, setAvailableExtensions] = useState<ExtensionOption[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [onlyRealSnapshots, setOnlyRealSnapshots] = useState(true); // Default ON

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
          const source = snapshotData?.meta?.source || null;
          const isReal = isRealSnapshot(row);
          
          const existing = extensionMap.get(row.extension_id);
          if (!existing || existing.lastSeen < ts) {
            extensionMap.set(row.extension_id, {
              id: row.extension_id,
              label: row.extension_id,
              lastSeen: ts,
              isProtonFork: isProton,
              hasScreenshot,
              elementsWithRect,
              source,
              isReal,
            });
          }
        });

        let extensions = Array.from(extensionMap.values())
          .sort((a, b) => {
            // Sort by: Real first, then Proton fork, then elements with rect
            if (a.isReal && !b.isReal) return -1;
            if (!a.isReal && b.isReal) return 1;
            if (a.isProtonFork && !b.isProtonFork) return -1;
            if (!a.isProtonFork && b.isProtonFork) return 1;
            if (a.elementsWithRect > 20 && b.elementsWithRect <= 20) return -1;
            if (a.elementsWithRect <= 20 && b.elementsWithRect > 20) return 1;
            if (a.hasScreenshot && !b.hasScreenshot) return -1;
            if (!a.hasScreenshot && b.hasScreenshot) return 1;
            return b.lastSeen - a.lastSeen;
          });

        setAvailableExtensions(extensions);

        // Auto-select best extension
        if (!selectedExtension && extensions.length > 0) {
          // Filter to real snapshots if enabled
          const candidates = onlyRealSnapshots 
            ? extensions.filter(e => e.isReal)
            : extensions;
          
          const preferred = 
            // Priority 1: Real with screenshot + many rects (>20)
            candidates.find(e => e.isReal && e.hasScreenshot && e.elementsWithRect > 20) ||
            // Priority 2: Real with many rects
            candidates.find(e => e.isReal && e.elementsWithRect > 20) ||
            // Priority 3: Real with screenshot
            candidates.find(e => e.isReal && e.hasScreenshot) ||
            // Priority 4: Any real
            candidates.find(e => e.isReal) ||
            // Fallback: first available (only if not filtering)
            (!onlyRealSnapshots ? extensions[0] : null);
          
          if (preferred) {
            setSelectedExtension(preferred.id);
          }
        }
      }
    } catch (err) {
      console.error('[useBridgeSnapshot] Error fetching extensions:', err);
    }
  }, [selectedExtension, isProtonForkSnapshot, onlyRealSnapshots]);

  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch more to filter
      let query = supabase
        .from('extension_bridge_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by selected extension if set
      if (selectedExtension) {
        query = query.eq('extension_id', selectedExtension);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw dbError;
      }

      if (!data || data.length === 0) {
        if (onlyRealSnapshots) {
          setError('Waiting for Playwright snapshot...');
        }
        setSnapshot(null);
        return;
      }

      // Filter based on onlyRealSnapshots
      let filteredData = onlyRealSnapshots 
        ? data.filter(row => isRealSnapshot(row))
        : data;

      if (filteredData.length === 0) {
        setError('Waiting for Playwright snapshot...');
        setSnapshot(null);
        return;
      }

      // Find best snapshot: hasScreenshotDataUrl AND elementsWithRect > 20
      const targetRow = filteredData.reduce((best, current) => {
        const bestData = best.snapshot as any;
        const currentData = current.snapshot as any;
        
        const bestHasScreenshot = !!bestData?.screenshotDataUrl;
        const currentHasScreenshot = !!currentData?.screenshotDataUrl;
        
        const bestRects = (bestData?.elements || []).filter((e: any) => e.rect?.width > 0).length;
        const currentRects = (currentData?.elements || []).filter((e: any) => e.rect?.width > 0).length;
        
        // Prefer: screenshot + rects > 20
        const bestValid = bestHasScreenshot && bestRects > 20;
        const currentValid = currentHasScreenshot && currentRects > 20;
        
        if (currentValid && !bestValid) return current;
        if (!currentValid && bestValid) return best;
        if (currentHasScreenshot && !bestHasScreenshot) return current;
        if (!currentHasScreenshot && bestHasScreenshot) return best;
        if (currentRects > bestRects) return current;
        if (currentRects < bestRects) return best;
        return current; // Newer
      }, filteredData[0]);

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
        url: snapshotData?.url,
        meta: {
          source: snapshotData?.meta?.source || null,
          extensionId: snapshotData?.meta?.extensionId,
          capturedAt: snapshotData?.meta?.capturedAt,
          userAgent: snapshotData?.meta?.userAgent,
        },
      });
      setError(null);
    } catch (err: any) {
      console.error('[useBridgeSnapshot] Error fetching snapshot:', err);
      setError(err.message || 'Failed to fetch snapshot');
    } finally {
      setLoading(false);
    }
  }, [selectedExtension, onlyRealSnapshots]);

  // Clear test data from database
  const clearTestData = useCallback(async (): Promise<number> => {
    try {
      // Delete test snapshots
      const { data, error: dbError } = await supabase
        .from('extension_bridge_snapshots')
        .delete()
        .or('extension_id.eq.test-vpn,extension_id.eq.manual-test,extension_id.ilike.%test%')
        .select('id');

      if (dbError) throw dbError;
      
      const deletedCount = data?.length || 0;
      
      // Refresh extensions list
      await fetchExtensions();
      await fetchLatest();
      
      return deletedCount;
    } catch (err) {
      console.error('[useBridgeSnapshot] Error clearing test data:', err);
      throw err;
    }
  }, [fetchExtensions, fetchLatest]);

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
    onlyRealSnapshots,
    setOnlyRealSnapshots,
    clearTestData,
  };
}
