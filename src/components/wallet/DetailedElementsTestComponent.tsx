
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DETAILED_WALLET_ELEMENTS_REGISTRY,
  getDetailedElementsByCategory,
  getDetailedElementsByLayer,
  getAllDetailedCategories,
  getAllDetailedLayers,
  searchDetailedElements
} from './DetailedWalletElementsRegistry';

const DetailedElementsTestComponent: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [apiTestResult, setApiTestResult] = useState<any>(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  const categories = getAllDetailedCategories();
  const layers = getAllDetailedLayers();
  const totalElements = DETAILED_WALLET_ELEMENTS_REGISTRY.length;
  const customizableElements = DETAILED_WALLET_ELEMENTS_REGISTRY.filter(e => e.customizable).length;

  // Получаем отфильтрованные элементы
  const getFilteredElements = () => {
    let elements = DETAILED_WALLET_ELEMENTS_REGISTRY;
    
    if (searchQuery) {
      elements = searchDetailedElements(searchQuery);
    }
    
    if (selectedCategory) {
      elements = elements.filter(e => e.category === selectedCategory);
    }
    
    if (selectedLayer) {
      elements = elements.filter(e => e.layer === selectedLayer);
    }
    
    return elements;
  };

  const filteredElements = getFilteredElements();

  // Тест API
  const testAPI = async () => {
    setIsTestingAPI(true);
    try {
      const response = await fetch('/api/test-detailed-elements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: 'Test detailed elements registry',
          mode: 'analysis'
        })
      });
      
      const result = await response.json();
      setApiTestResult(result);
    } catch (error) {
      console.error('API test failed:', error);
      setApiTestResult({ error: 'API test failed' });
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detailed Wallet Elements Registry Test</span>
            <div className="flex gap-2">
              <Badge variant="outline">{totalElements} Total</Badge>
              <Badge variant="default">{customizableElements} Customizable</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Статистика */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{totalElements}</div>
              <div className="text-sm text-blue-800">Total Elements</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{customizableElements}</div>
              <div className="text-sm text-green-800">Customizable</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-purple-800">Categories</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-2xl font-bold text-orange-600">{layers.length}</div>
              <div className="text-sm text-orange-800">Layers</div>
            </div>
          </div>

          {/* Фильтры */}
          <div className="flex gap-4 items-center flex-wrap">
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border rounded"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Layers</option>
              {layers.map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </select>
            
            <Button onClick={() => {
              setSelectedCategory('');
              setSelectedLayer('');
              setSearchQuery('');
            }}>
              Clear Filters
            </Button>
          </div>

          {/* API Test */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={testAPI} 
                disabled={isTestingAPI}
                className="bg-green-600 hover:bg-green-700"
              >
                {isTestingAPI ? 'Testing API...' : 'Test API Integration'}
              </Button>
              
              {apiTestResult && (
                <Badge variant={apiTestResult.success ? 'default' : 'destructive'}>
                  {apiTestResult.success ? 'API Works' : 'API Failed'}
                </Badge>
              )}
            </div>
            
            {apiTestResult && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre>{JSON.stringify(apiTestResult, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Результаты */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">
              Filtered Elements ({filteredElements.length})
            </h3>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredElements.map(element => (
                <div key={element.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{element.name}</div>
                      <div className="text-sm text-gray-600">{element.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Selector: {element.selector}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Badge variant="outline" className="text-xs">
                        {element.category}
                      </Badge>
                      {element.layer && (
                        <Badge variant="secondary" className="text-xs">
                          {element.layer}
                        </Badge>
                      )}
                      {element.elementType && (
                        <Badge variant="outline" className="text-xs">
                          {element.elementType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedElementsTestComponent;
