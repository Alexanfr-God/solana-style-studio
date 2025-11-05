import React from 'react';
import { motion } from 'framer-motion';
import { ElementItem } from '@/stores/aiScannerStore';
import { cn } from '@/lib/utils';

interface ElementHighlightProps {
  element: ElementItem;
}

export const ElementHighlight: React.FC<ElementHighlightProps> = ({ element }) => {
  // This would need actual DOM coordinates - placeholder for now
  const getBoundingBox = () => {
    if (element.domElement) {
      const rect = element.domElement.getBoundingClientRect();
      return rect;
    }
    return null;
  };
  
  const rect = getBoundingBox();
  if (!rect) return null;
  
  const statusColors = {
    found: 'border-blue-500',
    copied: 'border-purple-500',
    verified: 'border-green-500'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "absolute border-2 rounded pointer-events-none",
        statusColors[element.status]
      )}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }}
    >
      <div className="absolute -top-6 left-0 bg-background/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-mono">
        {element.role}
      </div>
    </motion.div>
  );
};
