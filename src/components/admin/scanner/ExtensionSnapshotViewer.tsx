import React, { useState } from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plug, Clock, Layers, Eye, Code, ChevronDown, RefreshCw, Loader2, MousePointer } from 'lucide-react';
import { realtimeBridgeClient } from '@/services/extensionBridge';
import { SnapshotDOMRenderer } from './SnapshotDOMRenderer';

interface SnapshotElement {
  tag: string;
  id?: string | null;
  classes?: string[];
  text?: string | null;
}

export const ExtensionSnapshotViewer = () => {
  const { extensionSnapshot, lastExtensionMessage } = useAiScannerStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SnapshotElement | null>(null);
  const [activeTab, setActiveTab] = useState('visual');
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await realtimeBridgeClient.requestSnapshot();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  if (!extensionSnapshot) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
        <Plug className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Waiting for extension snapshot...
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Click "Send Test Snapshot" or connect extension
        </p>
      </div>
    );
  }
  
  const snapshotAny = extensionSnapshot as any;
  const elements: SnapshotElement[] = snapshotAny?.snapshot?.elements || snapshotAny?.ui?.elements || [];
  const theme = snapshotAny?.snapshot?.theme || snapshotAny?.theme || {};
  const title = snapshotAny?.snapshot?.title || snapshotAny?.title || extensionSnapshot.extension;
  const elementsCount = elements.length;
  const timeAgo = lastExtensionMessage 
    ? Math.round((Date.now() - lastExtensionMessage) / 1000)
    : null;
  
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
        <div className="flex items-center gap-2">
          {timeAgo !== null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}s ago
            </span>
          )}
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers className="h-3 w-3" />
          {elementsCount} elements
        </span>
        {selectedElement && (
          <span className="flex items-center gap-1 text-primary">
            <MousePointer className="h-3 w-3" />
            {selectedElement.tag}#{selectedElement.id || 'unknown'}
          </span>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="visual" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            Visual
          </TabsTrigger>
          <TabsTrigger value="elements" className="text-xs">
            <Layers className="h-3 w-3 mr-1" />
            Elements
          </TabsTrigger>
          <TabsTrigger value="raw" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            Raw
          </TabsTrigger>
        </TabsList>

        {/* Visual Tab - DOM Renderer */}
        <TabsContent value="visual" className="mt-3">
          {elements.length > 0 ? (
            <div className="flex justify-center bg-black/20 rounded-lg p-4">
              <SnapshotDOMRenderer
                elements={elements}
                theme={theme}
                title={title}
                selectedElementId={selectedElement?.id}
                onElementClick={(el) => setSelectedElement(el)}
              />
            </div>
          ) : screenshot ? (
            <div className="flex justify-center bg-black/30 rounded-lg p-3">
              <img 
                src={screenshot} 
                alt="Extension UI" 
                className="max-w-[320px] max-h-[480px] rounded-lg shadow-xl object-contain"
              />
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No visual data available
            </div>
          )}
        </TabsContent>

        {/* Elements Tab - List view */}
        <TabsContent value="elements" className="mt-3">
          <ScrollArea className="h-48 rounded border border-border/50 bg-background/50">
            <div className="p-2 space-y-1">
              {elements.map((el, i) => (
                <div
                  key={el.id || i}
                  className={`text-xs p-2 rounded cursor-pointer transition-colors ${
                    selectedElement?.id === el.id 
                      ? 'bg-primary/20 border border-primary/50' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedElement(el)}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {el.tag}
                    </Badge>
                    {el.id && (
                      <span className="text-muted-foreground font-mono">#{el.id}</span>
                    )}
                  </div>
                  {el.text && (
                    <div className="mt-1 text-muted-foreground truncate">
                      "{el.text}"
                    </div>
                  )}
                  {el.classes && el.classes.length > 0 && (
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {el.classes.slice(0, 3).map((c, ci) => (
                        <span key={ci} className="text-[10px] text-blue-400">.{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {elements.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No elements in snapshot
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Raw Tab - JSON view */}
        <TabsContent value="raw" className="mt-3">
          <Collapsible defaultOpen>
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
                    if (key === 'screenshot' && typeof value === 'string' && value.length > 100) {
                      return value.substring(0, 100) + '... [base64 truncated]';
                    }
                    return value;
                  }, 2)}
                </pre>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>
      </Tabs>
    </div>
  );
};
