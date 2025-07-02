
import React from 'react';
import { WalletElement, ElementCategory } from '@/hooks/useWalletElements';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Bug, Search, Grid } from 'lucide-react';

interface EditModeDebugPanelProps {
  isVisible: boolean;
  elements: WalletElement[];
  categories?: ElementCategory[];
  onToggle: () => void;
}

// Helper-функция для работы с customization_types
const parseCustomizationTypes = (types: any): string[] => {
  if (Array.isArray(types)) {
    return types as string[];
  }
  return [];
};

export const EditModeDebugPanel: React.FC<EditModeDebugPanelProps> = ({
  isVisible,
  elements,
  categories = [],
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

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; found: number; category?: ElementCategory }> = {};
    
    categories.forEach(category => {
      stats[category.id] = { total: 0, found: 0, category };
    });
    
    elements.forEach(element => {
      const category = element.category || 'uncategorized';
      if (!stats[category]) {
        stats[category] = { total: 0, found: 0 };
      }
      stats[category].total++;
      
      if (checkElementInDOM(element.selector || '').found) {
        stats[category].found++;
      }
    });
    
    return stats;
  };

  const categoryStats = getCategoryStats();

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
          
          {/* Общая статистика */}
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

          {/* Статистика по категориям */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Grid className="h-3 w-3 text-purple-400" />
              <span className="text-xs text-purple-300">Categories ({categories.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(categoryStats).map(([categoryId, stats]) => (
                <div
                  key={categoryId}
                  className="flex items-center justify-between text-xs"
                >
                  <span 
                    className="text-white truncate"
                    style={{ color: stats.category?.icon_color }}
                  >
                    {stats.category?.name || categoryId}
                  </span>
                  <span className="text-gray-400">
                    {stats.found}/{stats.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-purple-300 mb-2">
            Database Elements: {elements.length}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {elements.map((element) => {
              const domCheck = checkElementInDOM(element.selector || '');
              const category = categories.find(cat => cat.id === element.category);
              
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
                      {element.category && (
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: category?.icon_color }}
                        >
                          {element.category}
                        </Badge>
                      )}
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
                  
                  {element.asset_library_path && (
                    <div className="text-xs text-blue-400 mt-1">
                      Asset Path: {element.asset_library_path}
                    </div>
                  )}
                  
                  {category && (
                    <div className="text-xs text-purple-400 mt-1">
                      Types: {parseCustomizationTypes(category.customization_types).join(', ')}
                    </div>
                  )}
                  
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
