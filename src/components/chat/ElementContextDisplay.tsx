import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { Badge } from '@/components/ui/badge';
import { Target, Layers, Eye, Code, AlertTriangle, Settings } from 'lucide-react';

interface ElementContextDisplayProps {
  element: WalletElement | null;
  isVisible: boolean;
}

export const ElementContextDisplay: React.FC<ElementContextDisplayProps> = ({
  element,
  isVisible
}) => {
  if (!isVisible || !element) return null;

  return (
    <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-purple-400" />
        <span className="text-sm font-semibold text-white">Selected Element</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-medium">{element.name}</h4>
          <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
            {element.type}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-white/70">
            <Layers className="h-3 w-3" />
            <span>Screen: {element.screen}</span>
          </div>
          
          {element.position && (
            <div className="flex items-center gap-1 text-white/70">
              <Eye className="h-3 w-3" />
              <span>Position: {element.position}</span>
            </div>
          )}
        </div>
        
        {element.selector && (
          <div className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
            <Code className="h-3 w-3" />
            <span className="font-mono">{element.selector}</span>
          </div>
        )}
        
        {element.json_path ? (
          <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
            <Code className="h-3 w-3" />
            <span className="font-mono">{element.json_path}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>No JSON path found</span>
          </div>
        )}

        {element.json_path && (
          <div className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
            <Settings className="h-3 w-3" />
            <span>Editable: color, backgroundColor, fontSize, borderRadius, padding</span>
          </div>
        )}
        
        {element.description && (
          <p className="text-xs text-white/60 italic">
            {element.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ElementContextDisplay;
