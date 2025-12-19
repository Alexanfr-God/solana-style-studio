import React, { useMemo } from 'react';
import { BridgeSnapshot } from '@/hooks/useBridgeSnapshot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Copy, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RawJsonViewerProps {
  snapshot: BridgeSnapshot;
  onClose: () => void;
}

interface FieldStatus {
  path: string;
  present: boolean;
  value?: any;
  critical: boolean;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ snapshot, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  
  const rawData = snapshot.rawData || snapshot;
  
  // Analyze critical fields
  const fieldStatuses = useMemo<FieldStatus[]>(() => {
    const statuses: FieldStatus[] = [];
    
    // screenshotDataUrl
    statuses.push({
      path: 'snapshot.screenshotDataUrl',
      present: !!rawData?.screenshotDataUrl,
      value: rawData?.screenshotDataUrl ? `${(rawData.screenshotDataUrl as string).length} chars` : null,
      critical: true,
    });
    
    // url
    statuses.push({
      path: 'snapshot.url',
      present: !!rawData?.url,
      value: rawData?.url,
      critical: true,
    });
    
    // viewport
    statuses.push({
      path: 'snapshot.viewport',
      present: !!rawData?.viewport,
      value: rawData?.viewport ? `${rawData.viewport.width}×${rawData.viewport.height}` : null,
      critical: true,
    });
    
    // devicePixelRatio
    statuses.push({
      path: 'snapshot.devicePixelRatio',
      present: !!rawData?.devicePixelRatio,
      value: rawData?.devicePixelRatio ? `${rawData.devicePixelRatio}x` : null,
      critical: false,
    });
    
    // elements with rect
    const elements = rawData?.elements || [];
    const withRect = elements.filter((el: any) => el.rect && el.rect.width > 0).length;
    statuses.push({
      path: 'elements[].rect',
      present: withRect > 0,
      value: `${withRect}/${elements.length} have rect`,
      critical: true,
    });
    
    return statuses;
  }, [rawData]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    setCopied(true);
    toast.success('JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Highlight JSON with critical fields
  const highlightedJson = useMemo(() => {
    const jsonStr = JSON.stringify(rawData, null, 2);
    
    // Split into lines and highlight
    return jsonStr.split('\n').map((line, i) => {
      let className = 'text-muted-foreground';
      
      // Highlight critical fields
      if (line.includes('"screenshotDataUrl"')) {
        className = rawData?.screenshotDataUrl 
          ? 'text-green-500 bg-green-500/10' 
          : 'text-red-500 bg-red-500/10';
      } else if (line.includes('"url"') && !line.includes('"baseUrl"')) {
        className = rawData?.url?.includes('jplgfhpmjnbigmhklmmbgecoobifkmpa')
          ? 'text-green-500 bg-green-500/10'
          : rawData?.url 
            ? 'text-amber-500 bg-amber-500/10'
            : 'text-red-500 bg-red-500/10';
      } else if (line.includes('"viewport"')) {
        className = rawData?.viewport 
          ? 'text-green-500 bg-green-500/10' 
          : 'text-amber-500 bg-amber-500/10';
      } else if (line.includes('"rect"')) {
        className = 'text-cyan-500';
      } else if (line.includes('"elements"')) {
        className = 'text-purple-500';
      } else if (line.includes('"devicePixelRatio"')) {
        className = 'text-blue-500';
      }
      
      return (
        <div key={i} className={cn('px-1 -mx-1 rounded', className)}>
          {line}
        </div>
      );
    });
  }, [rawData]);

  return (
    <div className="absolute inset-0 z-50 bg-background/98 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <h4 className="text-sm font-semibold">Raw Snapshot JSON</h4>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 gap-1"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Critical Fields Summary */}
      <div className="px-3 py-2 border-b bg-muted/20">
        <div className="text-xs font-medium mb-2 text-muted-foreground">Critical Fields:</div>
        <div className="flex flex-wrap gap-2">
          {fieldStatuses.map((field) => (
            <Badge
              key={field.path}
              variant="outline"
              className={cn(
                "text-[10px] gap-1",
                field.present 
                  ? "border-green-500/50 text-green-500 bg-green-500/10"
                  : field.critical
                    ? "border-red-500/50 text-red-500 bg-red-500/10"
                    : "border-amber-500/50 text-amber-500 bg-amber-500/10"
              )}
            >
              {field.present ? '✓' : '✗'}
              <span className="font-mono">{field.path}</span>
              {field.value && (
                <span className="text-muted-foreground ml-1 truncate max-w-[100px]">
                  = {field.value}
                </span>
              )}
            </Badge>
          ))}
        </div>
        
        {/* Warning for missing critical fields */}
        {fieldStatuses.some(f => f.critical && !f.present) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
            <AlertTriangle className="h-3 w-3" />
            Some critical fields are missing - snapshot may not render correctly
          </div>
        )}
      </div>
      
      {/* JSON Content */}
      <div className="flex-1 overflow-auto p-3">
        <pre className="text-[11px] font-mono leading-relaxed">
          {highlightedJson}
        </pre>
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
        Total size: {JSON.stringify(rawData).length.toLocaleString()} bytes
      </div>
    </div>
  );
};
