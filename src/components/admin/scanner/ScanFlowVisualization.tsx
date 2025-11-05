import React from 'react';
import { motion } from 'framer-motion';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { cn } from '@/lib/utils';

const FLOW_STEPS = [
  { id: 'connect', label: 'Connect', icon: '🔌' },
  { id: 'vision', label: 'Fetch DOM', icon: '📡' },
  { id: 'snapshot', label: 'Vision', icon: '👁️' },
  { id: 'json-build', label: 'Snapshot', icon: '📸' },
  { id: 'verify', label: 'JSON', icon: '📦' }
] as const;

export const ScanFlowVisualization = () => {
  const { scanMode, isScanning, isWalletConnected } = useAiScannerStore();
  
  const getStepStatus = (stepId: string) => {
    if (stepId === 'connect') {
      return isWalletConnected ? 'completed' : 'pending';
    }
    
    if (!isScanning) return 'pending';
    if (scanMode === stepId) return 'active';
    
    const stepIndex = FLOW_STEPS.findIndex(s => s.id === stepId);
    const currentIndex = FLOW_STEPS.findIndex(s => s.id === scanMode);
    
    return stepIndex < currentIndex ? 'completed' : 'pending';
  };
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground/80 mb-4">Scan Flow</h3>
      
      <div className="relative space-y-6">
        {FLOW_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const isActive = status === 'active';
          const isPassed = status === 'completed';
          
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
                  scale: isActive ? [1, 1.1, 1] : 1,
                  opacity: 1
                }}
                transition={{ 
                  duration: isActive ? 1.5 : 0.3,
                  repeat: isActive ? Infinity : 0
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  isActive && "bg-primary/10 border-primary shadow-lg",
                  isPassed && "bg-muted/50",
                  status === 'pending' && "bg-background"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full text-lg",
                  isActive && "bg-primary/20",
                  isPassed && "bg-muted"
                )}>
                  {step.icon}
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  isActive && "text-primary",
                  status === 'pending' && "text-muted-foreground"
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
