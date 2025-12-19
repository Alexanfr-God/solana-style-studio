import React, { useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BridgeSnapshot, BridgeElement, PROTON_FORK_ID } from '@/hooks/useBridgeSnapshot';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plug, Box, Clock, Code, AlertTriangle, CheckCircle, XCircle, Filter, Zap, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SnapshotIntegrityPanel, computeIntegrity } from './SnapshotIntegrityPanel';
import { RawJsonViewer } from './RawJsonViewer';

interface BridgeSnapshotCanvasProps {
  snapshot: BridgeSnapshot | null;
  onElementClick?: (element: BridgeElement) => void;
  selectedElementId?: string;
  onlyRealSnapshots?: boolean;
  onOnlyRealSnapshotsChange?: (value: boolean) => void;
  loading?: boolean;
  error?: string | null;
}

export const BridgeSnapshotCanvas: React.FC<BridgeSnapshotCanvasProps> = ({
  snapshot,
  onElementClick,
  selectedElementId,
  onlyRealSnapshots = true,
  onOnlyRealSnapshotsChange,
  loading = false,
  error = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredElement, setHoveredElement] = useState<BridgeElement | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showRawJson, setShowRawJson] = useState(false);
  const [showIntegrity, setShowIntegrity] = useState(false);

  // Compute integrity
  const integrity = useMemo(() => computeIntegrity(snapshot), [snapshot]);

  // Waiting state
  if (!snapshot && (loading || error)) {
    return (
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-semibold">Bridge Canvas</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {onOnlyRealSnapshotsChange && (
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Real Only</span>
                <Switch
                  checked={onlyRealSnapshots}
                  onCheckedChange={onOnlyRealSnapshotsChange}
                  className="scale-75"
                />
              </div>
            )}
          </div>
        </div>

        {/* Waiting State */}
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center p-8">
            {loading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-500" />
                <p className="text-lg font-medium text-foreground">Loading snapshot...</p>
              </>
            ) : (
              <>
                <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-cyan-500" />
                </div>
                <p className="text-lg font-medium text-foreground">Waiting for Playwright snapshot</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Run the Playwright scanner to capture real extension UI
                </p>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground font-mono">
                  cd wcc-cdp-bridge && npm run scan
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No snapshot available
      </div>
    );
  }

  // Canvas dimensions with DPR scaling
  const dpr = snapshot.devicePixelRatio || 1;
  const viewportWidth = snapshot.viewport?.width || 400;
  const viewportHeight = snapshot.viewport?.height || 600;
  
  const maxWidth = 420;
  const maxHeight = 650;
  const scale = Math.min(maxWidth / viewportWidth, maxHeight / viewportHeight, 1);

  const scaledWidth = viewportWidth * scale;
  const scaledHeight = viewportHeight * scale;

  // Scale element rect to canvas (accounting for DPR if needed)
  const scaleRect = (rect: BridgeElement['rect']) => ({
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  });

  // Filter valid elements
  const validElements = snapshot.elements.filter(el => el.rect && el.rect.width > 0 && el.rect.height > 0);

  // Status flags
  const hasScreenshot = !!snapshot.screenshotDataUrl;
  const hasValidRects = validElements.length > 0;
  const isPlaywright = integrity?.isPlaywright || false;
  const isReal = integrity?.isReal || false;
  const isStale = integrity ? integrity.timestampAge > 60000 : false;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !hoveredElement) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 8,
    });
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <div className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-purple-500" />
          <h3 className="text-sm font-semibold truncate max-w-[140px]" title={snapshot.extensionId}>
            {snapshot.extensionId}
          </h3>
          <Badge variant="outline" className="text-xs">
            {snapshot.screen}
          </Badge>
          
          {/* Playwright Badge */}
          {isPlaywright && (
            <Badge variant="outline" className="text-[10px] border-cyan-500/50 text-cyan-500 bg-cyan-500/10">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              Playwright
            </Badge>
          )}
          
          {/* Real Badge */}
          {isReal && !isPlaywright && (
            <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-500 bg-green-500/10">
              ✓ Real
            </Badge>
          )}
          
          {/* Test Badge */}
          {!isReal && (
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/50 bg-amber-500/10">
              TEST
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Only Real Snapshots Toggle */}
          {onOnlyRealSnapshotsChange && (
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Real Only</span>
              <Switch
                checked={onlyRealSnapshots}
                onCheckedChange={onOnlyRealSnapshotsChange}
                className="scale-75"
              />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setShowIntegrity(!showIntegrity)}
          >
            {showIntegrity ? 'Hide' : 'Integrity'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => setShowRawJson(true)}
          >
            <Code className="h-3 w-3" />
            Raw
          </Button>
        </div>
      </div>

      {/* Integrity Panel (collapsible) */}
      {showIntegrity && (
        <div className="border-b">
          <SnapshotIntegrityPanel snapshot={snapshot} />
        </div>
      )}

      {/* Compact Status Bar */}
      <div className="px-3 py-2 border-b bg-muted/30 flex flex-wrap items-center gap-3 text-xs">
        <SnapshotIntegrityPanel snapshot={snapshot} compact />
        
        {/* Age indicator */}
        <span className={cn(
          "flex items-center gap-1 ml-auto",
          isStale ? "text-amber-500" : "text-muted-foreground"
        )}>
          {isStale && <AlertTriangle className="h-3 w-3" />}
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(snapshot.timestamp)} ago
        </span>
      </div>

      {/* Error States */}
      {!hasScreenshot && !hasValidRects && (
        <div className="px-3 py-3 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2 text-sm text-red-600">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <div className="font-medium">No rects in payload → cannot render overlays</div>
            <div className="text-xs text-red-500/80 mt-0.5">
              Snapshot missing both <code className="bg-red-500/20 px-1 rounded">screenshotDataUrl</code> and element <code className="bg-red-500/20 px-1 rounded">rect</code> data
            </div>
          </div>
        </div>
      )}

      {!hasScreenshot && hasValidRects && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <span>No <code className="bg-amber-500/20 px-1 rounded">screenshotDataUrl</code> — showing wireframe with {validElements.length} element overlays</span>
        </div>
      )}

      {/* Raw JSON Viewer */}
      {showRawJson && (
        <RawJsonViewer snapshot={snapshot} onClose={() => setShowRawJson(false)} />
      )}

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
          {hasScreenshot ? (
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
                transition={{ delay: index * 0.005 }}
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
              >
                {/* Show label on wireframe mode */}
                {!hasScreenshot && rect.height > 16 && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-1">
                    <span className="text-[9px] text-white/70 truncate">
                      {element.tag}
                    </span>
                  </div>
                )}
              </motion.div>
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
                  left: Math.min(tooltipPos.x, scaledWidth - 220),
                  top: Math.min(tooltipPos.y, scaledHeight - 100),
                }}
              >
                <div className="bg-popover border rounded-md shadow-lg p-2 text-xs max-w-[220px]">
                  <div className="font-mono text-cyan-400 truncate">
                    {hoveredElement.selector || hoveredElement.id || `${hoveredElement.tag}-unknown`}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    <span className="text-purple-400">{hoveredElement.tag}</span>
                    {hoveredElement.text && (
                      <span className="ml-1 text-foreground truncate block">
                        "{hoveredElement.text.slice(0, 40)}{hoveredElement.text.length > 40 ? '...' : ''}"
                      </span>
                    )}
                  </div>
                  {hoveredElement.rect && (
                    <div className="text-muted-foreground/70 mt-1">
                      {Math.round(hoveredElement.rect.width)}×{Math.round(hoveredElement.rect.height)} @ ({Math.round(hoveredElement.rect.x)}, {Math.round(hoveredElement.rect.y)})
                    </div>
                  )}
                  {hoveredElement.styles && Object.keys(hoveredElement.styles).length > 0 && (
                    <div className="mt-1 pt-1 border-t border-border/50 space-y-0.5">
                      {hoveredElement.styles.backgroundColor && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: hoveredElement.styles.backgroundColor }} />
                          <span className="text-muted-foreground">bg: {hoveredElement.styles.backgroundColor}</span>
                        </div>
                      )}
                      {hoveredElement.styles.color && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: hoveredElement.styles.color }} />
                          <span className="text-muted-foreground">color: {hoveredElement.styles.color}</span>
                        </div>
                      )}
                    </div>
                  )}
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
          Scale: {Math.round(scale * 100)}% | {validElements.length} clickable
        </span>
      </div>
    </div>
  );
};
