
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { analyzeThemeStructure, JsonThemeCategory, JsonThemeElement } from '@/utils/jsonThemeAnalyzer';
import { useWalletTheme } from '@/hooks/useWalletTheme';

interface JSONElementDebuggerProps {
  isVisible: boolean;
  onToggle: () => void;
  onElementSelect?: (element: JsonThemeElement) => void;
}

export const JSONElementDebugger: React.FC<JSONElementDebuggerProps> = ({
  isVisible,
  onToggle,
  onElementSelect
}) => {
  const { theme } = useWalletTheme();
  const [categories, setCategories] = useState<JsonThemeCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Buttons', 'Text']));
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [detailedView, setDetailedView] = useState(false);

  useEffect(() => {
    if (theme && Object.keys(theme).length > 0) {
      const analyzedCategories = analyzeThemeStructure(theme);
      setCategories(analyzedCategories);
      console.log('🔍 JSON Theme analyzed:', analyzedCategories);
    }
  }, [theme]);

  // Gold highlight overlay effect
  useEffect(() => {
    if (!hoveredElement) {
      removeHighlight();
      return;
    }

    const elements = document.querySelectorAll(`[data-element-id="${hoveredElement}"]`);
    if (elements.length === 0) {
      // Fallback: try to find by class name
      const fallbackElements = document.querySelectorAll(`.${hoveredElement}`);
      fallbackElements.forEach(el => addGoldHighlight(el as HTMLElement));
    } else {
      elements.forEach(el => addGoldHighlight(el as HTMLElement));
    }

    return () => removeHighlight();
  }, [hoveredElement]);

  const addGoldHighlight = (element: HTMLElement) => {
    element.style.outline = '2px solid #FFD700';
    element.style.outlineOffset = '2px';
    element.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.5)';
    element.style.transition = 'all 0.2s ease';
    element.setAttribute('data-json-highlighted', 'true');
  };

  const removeHighlight = () => {
    const highlighted = document.querySelectorAll('[data-json-highlighted="true"]');
    highlighted.forEach(el => {
      const element = el as HTMLElement;
      element.style.outline = '';
      element.style.outlineOffset = '';
      element.style.boxShadow = '';
      element.removeAttribute('data-json-highlighted');
    });
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const handleElementHover = (elementKey: string | null) => {
    setHoveredElement(elementKey);
  };

  const handleElementClick = (element: JsonThemeElement) => {
    console.log('🎯 JSON Element selected:', element);
    onElementSelect?.(element);
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    elements: category.elements.filter(element =>
      element.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      element.path.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.elements.length > 0);

  const totalElements = categories.reduce((sum, cat) => sum + cat.elements.length, 0);
  const visibleElements = filteredCategories.reduce((sum, cat) => sum + cat.elements.length, 0);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-20 z-[60]">
        <Button
          onClick={onToggle}
          className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold px-4 py-2 shadow-lg"
          title="Debug JSON Theme"
        >
          Debug JSON
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-96 max-h-[600px]">
      <Card className="bg-black/95 backdrop-blur-md border-[#FFD700]/30 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#FFD700] text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-[#FFD700] rounded-full"></div>
              JSON Debug Panel
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDetailedView(!detailedView)}
                className="text-[#FFD700] hover:bg-[#FFD700]/20"
              >
                {detailedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Elements: {visibleElements}/{totalElements}</span>
            <Badge variant="outline" className="border-[#FFD700] text-[#FFD700]">
              Active
            </Badge>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FFD700]" />
            <Input
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-black/50 border-[#FFD700]/30 text-white placeholder-white/40"
            />
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 max-h-[400px] overflow-y-auto">
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <div key={category.name} className="border border-white/10 rounded-lg p-2">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories.has(category.name) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-white font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-white/10">
                    {category.elements.length}
                  </Badge>
                </button>

                {expandedCategories.has(category.name) && (
                  <div className="mt-2 space-y-1 pl-4">
                    {category.elements.map((element) => (
                      <div
                        key={element.key}
                        className="p-2 rounded border border-white/5 hover:bg-[#FFD700]/10 cursor-pointer transition-colors"
                        onMouseEnter={() => handleElementHover(element.key)}
                        onMouseLeave={() => handleElementHover(null)}
                        onClick={() => handleElementClick(element)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-mono text-sm">
                            {element.key}
                          </span>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: category.color, color: category.color }}
                          >
                            {element.properties.length}
                          </Badge>
                        </div>
                        
                        {detailedView && (
                          <div className="mt-1 space-y-1">
                            <div className="text-xs text-white/60">
                              Path: {element.path}
                            </div>
                            <div className="text-xs text-[#FFD700]">
                              Properties: {element.properties.join(', ')}
                            </div>
                            {element.domSelector && (
                              <div className="text-xs text-blue-400">
                                Selector: {element.domSelector}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && searchQuery && (
            <div className="text-center py-8 text-white/60">
              No elements found for "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
