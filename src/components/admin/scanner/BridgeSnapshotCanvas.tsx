import React, { useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BridgeSnapshot, BridgeElement } from '@/hooks/useBridgeSnapshot';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Plug, Image, Box, Clock } from 'lucide-react';

interface BridgeSnapshotCanvasProps {
  snapshot: BridgeSnapshot;
  onElementClick?: (element: BridgeElement) => void;
  selectedElementId?: string;
}

export const BridgeSnapshotCanvas: React.FC<BridgeSnapshotCanvasProps> = ({
  snapshot,
  onElementClick,
  selectedElementId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredElement, setHoveredElement] = useState<BridgeElement | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Canvas dimensions - account for devicePixelRatio
  const dpr = snapshot.devicePixelRatio || 1;
  const viewportWidth = snapshot.viewport?.width || 400;
  const viewportHeight = snapshot.viewport?.height || 600;
  
  // The screenshot is captured at DPR resolution, but represents viewport size
  // We display at viewport size, scaled to fit container
  const maxWidth = 420;
  const maxHeight = 650;
  const scale = Math.min(maxWidth / viewportWidth, maxHeight / viewportHeight, 1);

  const scaledWidth = viewportWidth * scale;
  const scaledHeight = viewportHeight * scale;

  // Scale element rect to canvas
  const scaleRect = useCallback((rect: BridgeElement['rect']) => ({
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  }), [scale]);

  // Filter valid elements (with rect)
  const validElements = useMemo(() => 
    snapshot.elements.filter(el => el.rect && el.rect.width > 0 && el.rect.height > 0),
    [snapshot.elements]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !hoveredElement) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 8,
    });
  }, [hoveredElement]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-semibold">
            {snapshot.extensionId}
          </h3>
          <Badge variant="outline" className="text-xs">
            {snapshot.screen}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Box className="h-3 w-3" />
            {validElements.length} elements
          </span>
          {snapshot.screenshotDataUrl && (
            <span className="flex items-center gap-1 text-green-500">
              <Image className="h-3 w-3" />
              Screenshot
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(snapshot.timestamp)}
          </span>
          <span className="text-muted-foreground">
            DPR: {dpr}x
          </span>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        className="flex-1 relative overflow-auto bg-muted/20 flex items-center justify-center p-4"
        onMouseMove={handleMouseMove}
      >
        <div
          ref={containerRef}
          className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-border/50"
          style={{
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          {/* Background: Screenshot or Wireframe */}
          {snapshot.screenshotDataUrl ? (
            <img
              src={snapshot.screenshotDataUrl}
              alt="Extension Screenshot"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ imageRendering: 'crisp-edges' }}
            />
          ) : (
            <div 
              className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
          )}

          {/* Element Overlays */}
          {validElements.map((element, index) => {
            const rect = scaleRect(element.rect);
            const isSelected = element.selector === selectedElementId || element.id === selectedElementId;
            const isHovered = hoveredElement?.selector === element.selector;

            return (
              <motion.div
                key={`${element.selector}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  "absolute cursor-pointer transition-all duration-150",
                  isSelected 
                    ? "ring-2 ring-green-500 ring-offset-1 ring-offset-background" 
                    : isHovered 
                      ? "ring-2 ring-cyan-400" 
                      : "ring-1 ring-purple-500/50"
                )}
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.width,
                  height: rect.height,
                  backgroundColor: isSelected 
                    ? 'rgba(34, 197, 94, 0.2)' 
                    : isHovered 
                      ? 'rgba(34, 211, 238, 0.15)' 
                      : 'rgba(168, 85, 247, 0.08)',
                  borderRadius: 2,
                }}
                onClick={() => onElementClick?.(element)}
                onMouseEnter={() => setHoveredElement(element)}
                onMouseLeave={() => setHoveredElement(null)}
              />
            );
          })}

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredElement && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-50 pointer-events-none"
                style={{
                  left: Math.min(tooltipPos.x, scaledWidth - 200),
                  top: Math.min(tooltipPos.y, scaledHeight - 80),
                }}
              >
                <div className="bg-popover border rounded-md shadow-lg p-2 text-xs max-w-[200px]">
                  <div className="font-mono text-cyan-400 truncate">
                    {hoveredElement.selector}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    <span className="text-purple-400">{hoveredElement.tag}</span>
                    {hoveredElement.text && (
                      <span className="ml-1 text-foreground truncate block">
                        "{hoveredElement.text.slice(0, 30)}{hoveredElement.text.length > 30 ? '...' : ''}"
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground/70 mt-1">
                    {Math.round(hoveredElement.rect.width)}×{Math.round(hoveredElement.rect.height)}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-2 border-t bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Viewport: {viewportWidth}×{viewportHeight} @{dpr}x
        </span>
        <span>
          Scale: {Math.round(scale * 100)}% | {validElements.length} elements
        </span>
      </div>
    </div>
  );
};
