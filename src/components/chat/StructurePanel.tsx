
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Layers, Hash, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { walletStructureService } from '@/services/walletStructureService';

interface StructureElement {
  id: string;
  name: string;
  category: string;
  screen: string;
  parent_element?: string;
  z_index?: number;
  customizable: boolean;
  description?: string;
}

interface StructureData {
  elements: StructureElement[];
  hierarchy: any[];
  screens: string[];
  categories: string[];
  totalElements: number;
}

const StructurePanel = () => {
  const [structureData, setStructureData] = useState<StructureData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['screens']));
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());

  const loadStructure = async () => {
    setIsLoading(true);
    try {
      const data = await walletStructureService.getWalletStructure(
        'Phantom Wallet (WalletAlivePlayground)',
        true // force refresh
      );
      
      if (data) {
        setStructureData(data);
        console.log('✅ Structure loaded in panel:', data);
      }
    } catch (error) {
      console.error('❌ Failed to load structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStructure();
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const toggleElementSelection = (elementId: string) => {
    const newSelected = new Set(selectedElements);
    if (newSelected.has(elementId)) {
      newSelected.delete(elementId);
    } else {
      newSelected.add(elementId);
    }
    setSelectedElements(newSelected);
  };

  const groupElementsByScreen = (elements: StructureElement[]) => {
    const grouped = elements.reduce((acc, element) => {
      const screen = element.screen || 'unknown';
      if (!acc[screen]) {
        acc[screen] = [];
      }
      acc[screen].push(element);
      return acc;
    }, {} as Record<string, StructureElement[]>);

    // Sort elements within each screen by z_index
    Object.keys(grouped).forEach(screen => {
      grouped[screen].sort((a, b) => (b.z_index || 0) - (a.z_index || 0));
    });

    return grouped;
  };

  const groupElementsByCategory = (elements: StructureElement[]) => {
    const grouped = elements.reduce((acc, element) => {
      const category = element.category || 'unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(element);
      return acc;
    }, {} as Record<string, StructureElement[]>);

    return grouped;
  };

  if (!structureData) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Wallet Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadStructure} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Layers className="w-4 h-4 mr-2" />
            )}
            Load Structure
          </Button>
        </CardContent>
      </Card>
    );
  }

  const elementsByScreen = groupElementsByScreen(structureData.elements);
  const elementsByCategory = groupElementsByCategory(structureData.elements);

  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/10 max-h-[600px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Wallet Structure
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">
              {structureData.totalElements} elements
            </span>
            <Button size="sm" onClick={loadStructure} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{structureData.screens.length}</div>
            <div className="text-xs text-white/60">Screens</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{structureData.categories.length}</div>
            <div className="text-xs text-white/60">Categories</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-lg font-bold text-white">{selectedElements.size}</div>
            <div className="text-xs text-white/60">Selected</div>
          </div>
        </div>

        {/* Screen-based View */}
        <Collapsible 
          open={expandedSections.has('screens')}
          onOpenChange={() => toggleSection('screens')}
        >
          <CollapsibleTrigger className="flex items-center gap-2 text-white hover:text-white/80 w-full text-left">
            {expandedSections.has('screens') ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
            <span className="font-medium">By Screen</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {Object.entries(elementsByScreen).map(([screen, elements]) => (
              <div key={screen} className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2 capitalize">
                  {screen} ({elements.length})
                </h4>
                <div className="space-y-1">
                  {elements.map((element) => (
                    <div 
                      key={element.id}
                      className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
                        selectedElements.has(element.id) 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                      onClick={() => toggleElementSelection(element.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {element.customizable ? (
                          <Eye className="w-3 h-3 text-green-400" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-500" />
                        )}
                        <span>{element.name}</span>
                      </div>
                      {element.z_index && (
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Hash className="w-3 h-3" />
                          {element.z_index}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Category-based View */}
        <Collapsible 
          open={expandedSections.has('categories')}
          onOpenChange={() => toggleSection('categories')}
        >
          <CollapsibleTrigger className="flex items-center gap-2 text-white hover:text-white/80 w-full text-left">
            {expandedSections.has('categories') ? 
              <ChevronDown className="w-4 h-4" /> : 
              <ChevronRight className="w-4 h-4" />
            }
            <span className="font-medium">By Category</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {Object.entries(elementsByCategory).map(([category, elements]) => (
              <div key={category} className="bg-white/5 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2 capitalize">
                  {category} ({elements.length})
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  {elements.map((element) => (
                    <div 
                      key={element.id}
                      className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
                        selectedElements.has(element.id) 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'text-white/70 hover:bg-white/5'
                      }`}
                      onClick={() => toggleElementSelection(element.id)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {element.customizable ? (
                          <Eye className="w-3 h-3 text-green-400" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-gray-500" />
                        )}
                        <span className="truncate">{element.name}</span>
                      </div>
                      <span className="text-xs text-white/40 capitalize">
                        {element.screen}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Selected Elements Summary */}
        {selectedElements.size > 0 && (
          <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
            <h4 className="text-purple-300 font-medium mb-2">
              Selected Elements ({selectedElements.size})
            </h4>
            <div className="flex flex-wrap gap-1">
              {Array.from(selectedElements).map(elementId => {
                const element = structureData.elements.find(e => e.id === elementId);
                return element ? (
                  <span 
                    key={elementId}
                    className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded text-xs"
                  >
                    {element.name}
                  </span>
                ) : null;
              })}
            </div>
            <Button 
              size="sm" 
              className="mt-2 w-full" 
              onClick={() => setSelectedElements(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StructurePanel;
