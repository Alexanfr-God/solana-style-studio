
import React, { useState, useEffect } from 'react';
import { walletElementsService, WalletElement } from '@/services/walletElementsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TreePine, Users, Layers, Zap } from 'lucide-react';

export const WalletElementsHierarchyTest: React.FC = () => {
  const [elements, setElements] = useState<WalletElement[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing enhanced wallet elements service...');
      
      // Test getting all elements
      const allResponse = await walletElementsService.getAllElements();
      if (allResponse.success && allResponse.elements) {
        setElements(allResponse.elements);
        console.log('✅ Elements loaded:', allResponse.elements.length);
      }

      // Test statistics
      const statsResponse = await walletElementsService.getStatistics();
      if (statsResponse.success) {
        setStatistics(statsResponse.statistics);
        console.log('✅ Statistics loaded:', statsResponse.statistics);
      }

    } catch (error) {
      console.error('❌ Error testing service:', error);
    } finally {
      setLoading(false);
    }
  };

  const testHierarchy = async () => {
    console.log('🔍 Testing hierarchy methods...');
    
    // Test elements by parent
    const parentElements = elements.filter(e => !e.parent_element);
    if (parentElements.length > 0) {
      const parentId = parentElements[0].id;
      const childrenResponse = await walletElementsService.getElementsByParent(parentId);
      console.log(`👨‍👧‍👦 Children of ${parentId}:`, childrenResponse);
    }

    // Test z-index sorting
    const zIndexResponse = await walletElementsService.getElementsByZIndex('home');
    console.log('🔢 Elements by z-index:', zIndexResponse);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredElements = selectedScreen === 'all' 
    ? elements 
    : elements.filter(e => e.screen === selectedScreen);

  const screens = [...new Set(elements.map(e => e.screen))];
  
  const renderHierarchy = (elements: WalletElement[], level = 0) => {
    const topLevel = elements.filter(e => !e.parent_element);
    const childElements = elements.filter(e => e.parent_element);
    
    return topLevel.map(element => (
      <div key={element.id} className={`ml-${level * 4} mb-2`}>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4" />
            <span className="font-medium">{element.name}</span>
            <Badge variant="outline">{element.type}</Badge>
            {element.z_index !== undefined && (
              <Badge variant="secondary">z:{element.z_index}</Badge>
            )}
            {element.customizable && (
              <Badge variant="default">Customizable</Badge>
            )}
          </div>
        </div>
        
        {/* Render children */}
        {childElements
          .filter(child => child.parent_element === element.id)
          .map(child => (
            <div key={child.id} className={`ml-${(level + 1) * 4} mb-1`}>
              <div className="flex items-center gap-2 p-1 bg-blue-50 rounded border-l-2 border-blue-200">
                <Users className="w-3 h-3" />
                <span className="text-sm">{child.name}</span>
                <Badge variant="outline" className="text-xs">{child.type}</Badge>
                {child.z_index !== undefined && (
                  <Badge variant="secondary" className="text-xs">z:{child.z_index}</Badge>
                )}
              </div>
            </div>
          ))}
      </div>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Wallet Elements Hierarchy Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={loadData} disabled={loading}>
              {loading ? 'Loading...' : 'Reload Data'}
            </Button>
            <Button onClick={testHierarchy} variant="outline">
              Test Hierarchy Methods
            </Button>
          </div>

          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{statistics.total}</div>
                  <div className="text-xs text-muted-foreground">Total Elements</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{statistics.hierarchical}</div>
                  <div className="text-xs text-muted-foreground">Hierarchical</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{statistics.topLevel}</div>
                  <div className="text-xs text-muted-foreground">Top Level</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{statistics.maxZIndex}</div>
                  <div className="text-xs text-muted-foreground">Max Z-Index</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedScreen === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedScreen('all')}
              >
                All Screens ({elements.length})
              </Button>
              {screens.map(screen => (
                <Button
                  key={screen}
                  variant={selectedScreen === screen ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedScreen(screen)}
                >
                  {screen} ({elements.filter(e => e.screen === screen).length})
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Elements Hierarchy {selectedScreen !== 'all' && `(${selectedScreen})`}
            </h3>
            {filteredElements.length > 0 ? (
              <div className="max-h-96 overflow-y-auto border rounded p-4">
                {renderHierarchy(filteredElements)}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No elements found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
