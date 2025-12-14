import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plug, Clock, Layers, Eye, Code, ChevronDown } from 'lucide-react';

export const ExtensionSnapshotViewer = () => {
  const { extensionSnapshot, lastExtensionMessage } = useAiScannerStore();
  
  if (!extensionSnapshot) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
        <Plug className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Waiting for extension bridge connection...
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Connect ProtonVPN or other extension with WCC SDK
        </p>
      </div>
    );
  }
  
  const elementsCount = extensionSnapshot.ui?.elements?.length || 0;
  const timeAgo = lastExtensionMessage 
    ? Math.round((Date.now() - lastExtensionMessage) / 1000)
    : null;
  
  // Get screenshot from snapshot (may be nested in different places)
  // Use type assertion since screenshot is dynamically added by SDK
  const snapshotAny = extensionSnapshot as any;
  const screenshot = snapshotAny?.screenshot || 
                     snapshotAny?.state?.screenshot || 
                     snapshotAny?.ui?.screenshot;
  
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {extensionSnapshot.extension}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {extensionSnapshot.screen}
          </Badge>
        </div>
        {timeAgo !== null && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}s ago
          </span>
        )}
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {elementsCount} elements
        </span>
        {extensionSnapshot.state && (
          <span>
            State: {Object.keys(extensionSnapshot.state).length} keys
          </span>
        )}
        {screenshot && (
          <span className="flex items-center gap-1 text-green-500">
            <Eye className="h-3 w-3" />
            Live preview
          </span>
        )}
      </div>
      
      {/* Screenshot Preview */}
      {screenshot && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Extension UI Preview
          </div>
          <div className="flex justify-center bg-black/30 rounded-lg p-3 border border-border/50">
            <img 
              src={screenshot} 
              alt="Extension UI" 
              className="max-w-[320px] max-h-[480px] rounded-lg shadow-xl object-contain"
            />
          </div>
        </div>
      )}
      
      {/* Raw JSON - Collapsible */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-between py-1">
          <span className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Raw JSON Data
          </span>
          <ChevronDown className="h-3 w-3" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="h-48 rounded border border-border/50 bg-background/50 mt-2">
            <pre className="p-2 text-xs font-mono text-foreground/80 whitespace-pre-wrap">
              {JSON.stringify(extensionSnapshot, (key, value) => {
                // Truncate screenshot in JSON view for readability
                if (key === 'screenshot' && typeof value === 'string' && value.length > 100) {
                  return value.substring(0, 100) + '... [base64 truncated]';
                }
                return value;
              }, 2)}
            </pre>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
