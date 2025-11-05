import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Circle, CheckCircle2, AlertCircle } from 'lucide-react';

const statusConfig = {
  found: {
    color: 'text-blue-500 border-blue-500 bg-blue-500/10',
    icon: Circle,
    label: 'Found'
  },
  copied: {
    color: 'text-purple-500 border-purple-500 bg-purple-500/10',
    icon: AlertCircle,
    label: 'Copied'
  },
  verified: {
    color: 'text-green-500 border-green-500 bg-green-500/10',
    icon: CheckCircle2,
    label: 'Verified'
  }
};

export const FoundElementsList = () => {
  const { foundElements, currentElement, setCurrentElement } = useAiScannerStore();
  
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
          <AnimatePresence mode="popLayout">
            {foundElements.map((element, index) => {
              const StatusIcon = statusConfig[element.status].icon;
              
              return (
                <motion.div
                  key={element.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ 
                    delay: index * 0.03,
                    type: "spring",
                    stiffness: 300,
                    damping: 25
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all",
                    "hover:shadow-md hover:border-primary/50",
                    currentElement?.id === element.id 
                      ? "bg-primary/10 border-primary shadow-md" 
                      : "bg-background border-border"
                  )}
                  onClick={() => setCurrentElement(element)}
                >
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className="text-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: index * 0.03 }}
                    >
                      {typeIcons[element.type]}
                    </motion.span>
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
                        <div className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                          statusConfig[element.status].color
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          <span className="text-xs">{statusConfig[element.status].label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};
