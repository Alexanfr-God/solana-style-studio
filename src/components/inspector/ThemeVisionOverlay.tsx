import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useThemeProbeStore, ProbeStatus } from '@/stores/themeProbeStore';
import { queryAllDeep, isElementVisible, getRelativeBoundingRect } from '@/utils/inspector/domDeep';

const STATUS_COLORS: Record<ProbeStatus, { bg: string; border: string }> = {
  OK: { bg: 'rgba(34, 197, 94, 0.35)', border: 'rgb(34, 197, 94)' },
  AMBIGUOUS: { bg: 'rgba(234, 179, 8, 0.35)', border: 'rgb(234, 179, 8)' },
  UNMAPPED: { bg: 'rgba(239, 68, 68, 0.35)', border: 'rgb(239, 68, 68)' },
  NON_SCALAR: { bg: 'rgba(107, 114, 128, 0.35)', border: 'rgb(107, 114, 128)' },
};

const MAX_BOXES = 2000;

interface BoxData {
  id: string;
  rect: DOMRect;
  status: ProbeStatus;
  bestPath?: string;
  confidence?: number;
  changedProps?: string[];
}

interface ThemeVisionOverlayProps {
  screen: string;
  highlightedId?: string | null;
}

export const ThemeVisionOverlay: React.FC<ThemeVisionOverlayProps> = ({ 
  screen, 
  highlightedId 
}) => {
  const { result, overlayEnabled, activeFilters } = useThemeProbeStore();
  const [boxes, setBoxes] = useState<BoxData[]>([]);
  const [hoveredBox, setHoveredBox] = useState<BoxData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tooManyElements, setTooManyElements] = useState(false);
  const frameRef = useRef<number>();
  const containerRef = useRef<HTMLElement | null>(null);

  const calculateBoxes = useCallback(() => {
    if (!overlayEnabled || !result || !result.items.length) {
      setBoxes([]);
      return;
    }

    try {
      const walletRoot = document.querySelector('[data-wallet-container]') as HTMLElement;
      if (!walletRoot) {
        console.warn('[ThemeVisionOverlay] Wallet root not found');
        setBoxes([]);
        return;
      }

      containerRef.current = walletRoot;

      // Find all elements with data-element-id
      const allElements = queryAllDeep(walletRoot, '[data-element-id]');
      
      // Filter by screen prefix
      const screenPrefix = screen === 'all' ? '' : `${screen}-`;
      const filteredElements = screenPrefix 
        ? allElements.filter(el => el.getAttribute('data-element-id')?.startsWith(screenPrefix))
        : allElements;

      if (filteredElements.length > MAX_BOXES) {
        setTooManyElements(true);
        setBoxes([]);
        return;
      }
      setTooManyElements(false);

      // Map elements to boxes
      const newBoxes: BoxData[] = [];
      
      filteredElements.forEach(el => {
        const id = el.getAttribute('data-element-id');
        if (!id) return;

        const resultItem = result.items.find(item => item.id === id);
        if (!resultItem) return;

        // Apply filters
        if (!activeFilters.has(resultItem.status)) return;

        const rect = getRelativeBoundingRect(el, walletRoot);
        if (!rect) return;

        newBoxes.push({
          id,
          rect,
          status: resultItem.status,
          bestPath: resultItem.bestPath,
          confidence: resultItem.confidence,
          changedProps: resultItem.changedProps,
        });
      });

      setBoxes(newBoxes);
    } catch (error) {
      console.error('[ThemeVisionOverlay] Error calculating boxes:', error);
    }
  }, [overlayEnabled, result, screen, activeFilters]);

  // Recalculate on dependencies change
  useEffect(() => {
    calculateBoxes();
  }, [calculateBoxes]);

  // Throttled recalculation on resize/scroll
  useEffect(() => {
    if (!overlayEnabled) return;

    const handleUpdate = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(calculateBoxes);
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, { capture: true });

    // MutationObserver for dynamic changes
    const observer = new MutationObserver(handleUpdate);
    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, { capture: true });
      observer.disconnect();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [overlayEnabled, calculateBoxes]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (!overlayEnabled) return null;

  if (tooManyElements) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div className="bg-destructive/90 text-destructive-foreground px-6 py-4 rounded-lg shadow-xl">
          <p className="font-semibold">Too many elements ({'>'}2000)</p>
          <p className="text-sm opacity-90">Overlay automatically disabled for performance</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      onMouseMove={handleMouseMove}
    >
      {/* Render boxes */}
      {boxes.map((box) => {
        const colors = STATUS_COLORS[box.status];
        const isHighlighted = highlightedId === box.id;
        
        return (
          <div
            key={box.id}
            className={`absolute pointer-events-auto cursor-pointer transition-all ${
              isHighlighted ? 'animate-pulse' : ''
            }`}
            style={{
              left: box.rect.left,
              top: box.rect.top,
              width: box.rect.width,
              height: box.rect.height,
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              boxShadow: isHighlighted ? `0 0 0 4px ${colors.border}40` : undefined,
            }}
            onMouseEnter={() => setHoveredBox(box)}
            onMouseLeave={() => setHoveredBox(null)}
          />
        );
      })}

      {/* Tooltip */}
      {hoveredBox && (
        <div
          className="absolute pointer-events-none bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-xs z-[60]"
          style={{
            left: mousePos.x + 12,
            top: mousePos.y + 12,
            maxWidth: 300,
          }}
        >
          <div className="font-semibold mb-1">{hoveredBox.id}</div>
          {hoveredBox.bestPath && (
            <div className="text-muted-foreground mb-1">
              Path: {hoveredBox.bestPath}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium">{hoveredBox.status}</span>
            {hoveredBox.confidence !== undefined && (
              <span className="text-muted-foreground">
                {Math.round(hoveredBox.confidence * 100)}%
              </span>
            )}
          </div>
          {hoveredBox.changedProps && hoveredBox.changedProps.length > 0 && (
            <div className="text-muted-foreground mt-1">
              Props: {hoveredBox.changedProps.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
