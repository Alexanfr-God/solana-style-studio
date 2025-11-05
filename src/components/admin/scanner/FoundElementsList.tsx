import React from 'react';
import { motion } from 'framer-motion';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

export const FoundElementsList = () => {
  const { foundElements, currentElement, setCurrentElement } = useAiScannerStore();
  
  const statusColors = {
    found: 'text-blue-500 border-blue-500',
    copied: 'text-purple-500 border-purple-500',
    verified: 'text-green-500 border-green-500'
  };
  
  const typeIcons: Record<string, string> = {
    button: '🔘',
    input: '📝',
    icon: '⭐',
    background: '🎨'
  };
  
  if (foundElements.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground text-center py-8">
          No elements found yet. Start a scan to discover elements.
        </p>
      </div>
    );
  }
  
  return (
    <div className="border-t">
      <div className="px-4 py-2 border-b bg-muted/30">
        <h4 className="text-xs font-semibold text-muted-foreground">
          Found Elements ({foundElements.length})
        </h4>
      </div>
      
      <ScrollArea className="h-64">
        <div className="p-2 space-y-1">
          {foundElements.map((element, index) => (
            <motion.div
              key={element.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50",
                currentElement?.id === element.id && "bg-accent border-primary"
              )}
              onClick={() => setCurrentElement(element)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeIcons[element.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono truncate">
                      {element.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {element.type}
                    </Badge>
                    <Circle 
                      className={cn("h-2 w-2 fill-current", statusColors[element.status])} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
