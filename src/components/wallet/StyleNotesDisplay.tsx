
import React from 'react';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Badge } from '@/components/ui/badge';
import { InfoCircle } from 'lucide-react';

const StyleNotesDisplay = () => {
  const { activeLayer, loginStyle, walletStyle } = useCustomizationStore();
  const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;
  
  if (!currentStyle.styleNotes) return null;
  
  // Parse notes into tags
  const tags = currentStyle.styleNotes.split(',').map(tag => tag.trim());
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <InfoCircle className="h-3.5 w-3.5" />
        <span>Generated Style:</span>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="bg-black/20 hover:bg-black/30 text-xs"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default StyleNotesDisplay;
