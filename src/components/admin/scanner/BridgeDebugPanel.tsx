import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Bug, Clock, Database, Layers } from 'lucide-react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export const BridgeDebugPanel: React.FC = () => {
  const { extensionSnapshot, bridgeConnection } = useAiScannerStore();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!bridgeConnection.isConnected) {
    return null;
  }
  
  const snapshotData = extensionSnapshot?.state || extensionSnapshot?.ui;
  const elements = Array.isArray(snapshotData?.elements) ? snapshotData.elements : [];
  const elementsCount = elements.length;
  
  // Check if snapshot is stale (older than 30 seconds)
  const isStale = bridgeConnection.lastSnapshotAt 
    ? (Date.now() - bridgeConnection.lastSnapshotAt) > 30000
    : false;
  
  return (
    <div className="mt-3 border-t pt-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-xs">
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <Bug className="h-3 w-3" />
            Raw Snapshot Debug
            {elementsCount > 0 && (
              <span className="ml-auto text-muted-foreground">
                {elementsCount} elements
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2 space-y-2">
          {/* Snapshot Metadata */}
          <div className="text-xs space-y-1 p-2 bg-muted/30 rounded">
            <div className="flex items-center gap-2">
              <Database className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Extension:</span>
              <span className="text-foreground/80">
                {bridgeConnection.extensionName || extensionSnapshot?.extension || 'unknown'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Screen:</span>
              <span className="text-foreground/80">
                {bridgeConnection.lastScreen || extensionSnapshot?.screen || 'unknown'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">Received:</span>
              <span className={`${isStale ? 'text-amber-500' : 'text-foreground/80'}`}>
                {bridgeConnection.lastSnapshotAt 
                  ? `${formatDistanceToNow(bridgeConnection.lastSnapshotAt)} ago`
                  : 'never'
                }
                {isStale && ' (stale)'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Elements:</span>
              <span className="text-foreground/80">{elementsCount}</span>
            </div>
            
            {bridgeConnection.snapshotCount !== undefined && bridgeConnection.snapshotCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Total snapshots:</span>
                <span className="text-foreground/80">{bridgeConnection.snapshotCount}</span>
              </div>
            )}
          </div>
          
          {/* Elements Preview */}
          {elementsCount > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Elements (first 10):</div>
              <div className="max-h-32 overflow-auto text-[10px] bg-muted/20 p-2 rounded font-mono">
                {elements.slice(0, 10).map((el: Record<string, any>, idx: number) => (
                  <div key={idx} className="truncate">
                    {el.tag || el.tagName || 'UNKNOWN'} 
                    {el.id && ` #${el.id}`}
                    {(el.classes || el.className) && ` .${Array.isArray(el.classes) ? el.classes.join('.') : el.className}`}
                    {el.text && ` "${el.text.slice(0, 30)}${el.text.length > 30 ? '...' : ''}"`}
                  </div>
                ))}
                {elementsCount > 10 && (
                  <div className="text-muted-foreground mt-1">
                    ... and {elementsCount - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Raw JSON (truncated) */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">Raw JSON (truncated):</div>
            <pre className="max-h-40 overflow-auto text-[9px] bg-muted/20 p-2 rounded whitespace-pre-wrap break-all">
              {snapshotData 
                ? JSON.stringify(snapshotData, null, 2).slice(0, 2000) + 
                  (JSON.stringify(snapshotData).length > 2000 ? '\n... (truncated)' : '')
                : 'No snapshot data'}
            </pre>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
