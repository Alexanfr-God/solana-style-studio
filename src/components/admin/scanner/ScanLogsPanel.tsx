import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info } from 'lucide-react';

export const ScanLogsPanel = () => {
  const { scanLogs } = useAiScannerStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [scanLogs]);
  
  return (
    <div className="border-t bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h3 className="text-sm font-semibold">Scan Logs</h3>
        <span className="text-xs text-muted-foreground">{scanLogs.length} entries</span>
      </div>
      
      <ScrollArea className="h-48">
        <div ref={scrollRef} className="p-4 space-y-2">
          {scanLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No logs yet. Start a scan to see activity.
            </p>
          ) : (
            scanLogs.map(log => (
              <div 
                key={log.id} 
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">{log.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{log.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {log.details && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="flex-shrink-0 h-7 w-7 p-0"
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Details</DialogTitle>
                      </DialogHeader>
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
