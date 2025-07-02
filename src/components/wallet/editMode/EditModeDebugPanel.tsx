
import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Bug, Search } from 'lucide-react';

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
    if (!selector) return { found: false, methods: {} };
    
    // Селекторы теперь без точек, проверяем все варианты
    const byClass = document.querySelector(`.${selector}`);
    const byDataId = document.querySelector(`[data-element-id="${selector}"]`);
    const byId = document.querySelector(`#${selector}`);
    
    return {
      found: !!(byClass || byDataId || byId),
      methods: {
        byClass: !!byClass,
        byDataId: !!byDataId,
        byId: !!byId
      },
      elements: {
        byClass: byClass?.tagName,
        byDataId: byDataId?.tagName,
        byId: byId?.tagName
      }
    };
  };

  const foundElements = elements.filter(el => checkElementInDOM(el.selector || '').found);
  const missingElements = elements.filter(el => !checkElementInDOM(el.selector || '').found);

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-96">
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
          
          {/* Статистика */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-green-500/20 p-2 rounded text-center">
              <div className="text-lg font-bold text-green-400">{foundElements.length}</div>
              <div className="text-xs text-green-300">Found</div>
            </div>
            <div className="bg-red-500/20 p-2 rounded text-center">
              <div className="text-lg font-bold text-red-400">{missingElements.length}</div>
              <div className="text-xs text-red-300">Missing</div>
            </div>
          </div>

          <div className="text-xs text-purple-300 mb-2">
            Database Elements: {elements.length}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
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
                    <div className="flex gap-1">
                      <Badge 
                        variant={domCheck.found ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {domCheck.found ? 'Found' : 'Missing'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {element.screen}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mt-1">
                    Selector: {element.selector || 'None'}
                  </div>
                  
                  {domCheck.found && (
                    <div className="text-xs text-green-400 mt-1">
                      Found by: {Object.entries(domCheck.methods)
                        .filter(([_, found]) => found)
                        .map(([method, _]) => {
                          const elementType = domCheck.elements[method as keyof typeof domCheck.elements];
                          return `${method}${elementType ? `(${elementType})` : ''}`;
                        })
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
