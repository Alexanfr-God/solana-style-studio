import React from 'react';
import { BridgeSnapshot } from '@/hooks/useBridgeSnapshot';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Image, 
  Box, 
  Clock, 
  Monitor,
  Globe,
  Fingerprint
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PROTON_FORK_ID = 'jplgfhpmjnbigmhklmmbgecoobifkmpa';

export interface SnapshotIntegrity {
  extensionId: string;
  extensionName: string | null;
  url: string | null;
  isProtonFork: boolean;
  hasScreenshotDataUrl: boolean;
  elementsTotal: number;
  elementsWithRect: number;
  timestampAge: number;
  viewport: { width: number; height: number } | null;
  devicePixelRatio: number | null;
}

export function computeIntegrity(snapshot: BridgeSnapshot | null): SnapshotIntegrity | null {
  if (!snapshot) return null;
  
  const url = snapshot.rawData?.url || null;
  const elementsWithRect = snapshot.elements.filter(
    el => el.rect && el.rect.width > 0 && el.rect.height > 0
  ).length;
  
  return {
    extensionId: snapshot.extensionId,
    extensionName: snapshot.rawData?.title || snapshot.rawData?.extensionName || null,
    url,
    isProtonFork: url ? url.includes(PROTON_FORK_ID) : snapshot.extensionId.includes(PROTON_FORK_ID),
    hasScreenshotDataUrl: !!snapshot.screenshotDataUrl,
    elementsTotal: snapshot.elements.length,
    elementsWithRect,
    timestampAge: Date.now() - snapshot.timestamp,
    viewport: snapshot.viewport || null,
    devicePixelRatio: snapshot.devicePixelRatio || null,
  };
}

interface IntegrityItemProps {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
}

const IntegrityItem: React.FC<IntegrityItemProps> = ({ label, value, status, icon }) => {
  const statusColors = {
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    neutral: 'text-muted-foreground',
  };
  
  const StatusIcon = {
    success: <CheckCircle className="h-3 w-3" />,
    warning: <AlertTriangle className="h-3 w-3" />,
    error: <XCircle className="h-3 w-3" />,
    neutral: null,
  }[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", statusColors[status])}>
      {icon || StatusIcon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate max-w-[150px]" title={value}>{value}</span>
    </div>
  );
};

interface SnapshotIntegrityPanelProps {
  snapshot: BridgeSnapshot | null;
  compact?: boolean;
}

export const SnapshotIntegrityPanel: React.FC<SnapshotIntegrityPanelProps> = ({ 
  snapshot,
  compact = false 
}) => {
  const integrity = computeIntegrity(snapshot);
  
  if (!integrity) {
    return (
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        No snapshot loaded
      </div>
    );
  }
  
  const hasValidData = integrity.hasScreenshotDataUrl || integrity.elementsWithRect > 0;
  const isStale = integrity.timestampAge > 60000;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* Proton Fork Badge */}
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            integrity.isProtonFork 
              ? "border-green-500/50 text-green-500 bg-green-500/10" 
              : "border-amber-500/50 text-amber-500 bg-amber-500/10"
          )}
        >
          {integrity.isProtonFork ? '✓ Proton Fork' : '⚠ Not Proton Fork'}
        </Badge>
        
        {/* Screenshot Badge */}
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            integrity.hasScreenshotDataUrl 
              ? "border-green-500/50 text-green-500 bg-green-500/10" 
              : "border-red-500/50 text-red-500 bg-red-500/10"
          )}
        >
          {integrity.hasScreenshotDataUrl ? '✓ Screenshot' : '✗ No Screenshot'}
        </Badge>
        
        {/* Elements Badge */}
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px]",
            integrity.elementsWithRect > 10 
              ? "border-green-500/50 text-green-500 bg-green-500/10" 
              : integrity.elementsWithRect > 0
                ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                : "border-red-500/50 text-red-500 bg-red-500/10"
          )}
        >
          {integrity.elementsWithRect}/{integrity.elementsTotal} rects
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg border text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground flex items-center gap-1.5">
          <Fingerprint className="h-4 w-4 text-purple-500" />
          Snapshot Integrity
        </h4>
        <Badge 
          variant={hasValidData ? "default" : "destructive"}
          className="text-[10px]"
        >
          {hasValidData ? 'VALID' : 'INVALID'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {/* Extension ID */}
        <IntegrityItem 
          label="Extension"
          value={integrity.extensionId}
          status="neutral"
          icon={<Globe className="h-3 w-3" />}
        />
        
        {/* Extension Name */}
        {integrity.extensionName && (
          <IntegrityItem 
            label="Name"
            value={integrity.extensionName}
            status="neutral"
          />
        )}
        
        {/* URL */}
        <IntegrityItem 
          label="URL"
          value={integrity.url || 'N/A'}
          status={integrity.isProtonFork ? 'success' : integrity.url ? 'warning' : 'neutral'}
          icon={<Globe className="h-3 w-3" />}
        />
        
        {/* Proton Fork Check */}
        <IntegrityItem 
          label="Proton Fork"
          value={integrity.isProtonFork ? 'Yes' : 'No'}
          status={integrity.isProtonFork ? 'success' : 'warning'}
        />
        
        {/* Screenshot */}
        <IntegrityItem 
          label="Screenshot"
          value={integrity.hasScreenshotDataUrl ? 'Present' : 'Missing'}
          status={integrity.hasScreenshotDataUrl ? 'success' : 'error'}
          icon={<Image className="h-3 w-3" />}
        />
        
        {/* Elements */}
        <IntegrityItem 
          label="Elements"
          value={`${integrity.elementsWithRect}/${integrity.elementsTotal} with rect`}
          status={
            integrity.elementsWithRect > 10 ? 'success' : 
            integrity.elementsWithRect > 0 ? 'warning' : 'error'
          }
          icon={<Box className="h-3 w-3" />}
        />
        
        {/* Viewport */}
        <IntegrityItem 
          label="Viewport"
          value={integrity.viewport 
            ? `${integrity.viewport.width}×${integrity.viewport.height}` 
            : 'N/A'}
          status={integrity.viewport ? 'success' : 'warning'}
          icon={<Monitor className="h-3 w-3" />}
        />
        
        {/* DPR */}
        <IntegrityItem 
          label="DPR"
          value={integrity.devicePixelRatio ? `${integrity.devicePixelRatio}x` : 'N/A'}
          status={integrity.devicePixelRatio ? 'neutral' : 'warning'}
        />
        
        {/* Age */}
        <IntegrityItem 
          label="Age"
          value={formatDistanceToNow(Date.now() - integrity.timestampAge)}
          status={isStale ? 'warning' : 'neutral'}
          icon={<Clock className="h-3 w-3" />}
        />
      </div>
      
      {/* Warnings */}
      {!integrity.isProtonFork && (
        <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-600">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>Not from Proton fork popup (expected: {PROTON_FORK_ID})</span>
        </div>
      )}
      
      {!integrity.hasScreenshotDataUrl && integrity.elementsWithRect === 0 && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-red-600">
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span>No rects in payload → cannot render overlays</span>
        </div>
      )}
    </div>
  );
};
