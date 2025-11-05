import React from 'react';
import { motion } from 'framer-motion';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { cn } from '@/lib/utils';

const FLOW_STEPS = [
  { id: 'vision', label: 'Vision', icon: '🟢' },
  { id: 'snapshot', label: 'Snapshot', icon: '🔵' },
  { id: 'json-build', label: 'JSON-Build', icon: '🟣' },
  { id: 'verify', label: 'Verify', icon: '✅' }
] as const;

export const ScanFlowVisualization = () => {
  const { scanMode, isScanning } = useAiScannerStore();
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-4">Scan Flow</h3>
      
      <div className="relative space-y-6">
        {FLOW_STEPS.map((step, index) => {
          const isActive = scanMode === step.id;
          const isPassed = FLOW_STEPS.findIndex(s => s.id === scanMode) > index;
          
          return (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {index < FLOW_STEPS.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-[18px] top-[36px] w-0.5 h-6 transition-colors",
                    isPassed ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              
              {/* Step node */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: isActive && isScanning ? [1, 1.1, 1] : 1,
                  opacity: 1
                }}
                transition={{ 
                  duration: isActive && isScanning ? 1.5 : 0.3,
                  repeat: isActive && isScanning ? Infinity : 0
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  isActive && isScanning && "bg-primary/10 border-primary shadow-lg",
                  isPassed && "bg-muted/50",
                  !isActive && !isPassed && "bg-background"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full text-lg",
                  isActive && isScanning && "bg-primary/20",
                  isPassed && "bg-muted"
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  isActive && isScanning && "text-primary",
                  !isActive && !isPassed && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
