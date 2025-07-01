
import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Bug } from 'lucide-react';

interface EditModeDebugPanelProps {
  isVisible: boolean;
  elements: WalletElement[];
  onToggle: () => void;
}

export const EditModeDebugPanel: React.FC<EditModeDebugPanelProps> = ({
  isVisible,
  elements,
  onToggle
}) => {
  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-[60]">
        <button
          onClick={onToggle}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-lg"
          title="Show Debug Panel"
        >
          <Bug className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const checkElementInDOM = (selector: string) => {
    const cleanSelector = selector.startsWith('.') ? selector.substring(1) : selector;
    
    // Check by class
    const byClass = document.querySelector(`.${cleanSelector}`);
    // Check by data-element-id
    const byDataId = document.querySelector(`[data-element-id="${cleanSelector}"]`);
    // Check by ID
    const byId = document.querySelector(`#${cleanSelector}`);
    
    return {
      found: !!(byClass || byDataId || byId),
      methods: {
        byClass: !!byClass,
        byDataId: !!byDataId,
        byId: !!byId
      }
    };
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-80">
      <Card className="bg-black/90 backdrop-blur-md border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">Edit Mode Debug</h4>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <div className="text-xs text-purple-300 mb-2">
              Elements in Database: {elements.length}
            </div>
            
            {elements.map((element) => {
              const domCheck = checkElementInDOM(element.selector || '');
              
              return (
                <div
                  key={element.id}
                  className={`p-2 rounded border ${
                    domCheck.found 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-red-500/50 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium">
                      {element.name}
                    </span>
                    <Badge 
                      variant={domCheck.found ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {domCheck.found ? 'Found' : 'Missing'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    Selector: {element.selector}
                  </div>
                  
                  {domCheck.found && (
                    <div className="text-xs text-green-400 mt-1">
                      Found by: {Object.entries(domCheck.methods)
                        .filter(([_, found]) => found)
                        .map(([method]) => method)
                        .join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
