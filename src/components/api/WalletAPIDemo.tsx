
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWalletUIAPI } from '@/hooks/useWalletUIAPI';
import { Download, FileText, Loader2, RefreshCw, Palette } from 'lucide-react';

const WalletAPIDemo: React.FC = () => {
  const {
    schema,
    isLoading,
    error,
    analyzeWallet,
    applyStyles,
    exportToGitHub,
    generateDocumentation
  } = useWalletUIAPI();

  const [selectedElement, setSelectedElement] = useState<string>('');

  const handleDownloadSchema = async () => {
    const exportData = await exportToGitHub();
    if (exportData) {
      const blob = new Blob([exportData.jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadDocs = () => {
    const docs = generateDocumentation();
    if (docs) {
      const blob = new Blob([docs], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${schema?.walletType}-api-docs.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleApplyTestStyles = async () => {
    if (!selectedElement) return;
    
    const testStyles = {
      backgroundColor: '#9945FF',
      color: '#FFFFFF',
      borderRadius: '8px',
      padding: '8px 16px'
    };
    
    await applyStyles(selectedElement, testStyles);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔌 Wallet UI API Demo
            <Badge variant="outline">v1.0.0</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={() => analyzeWallet('phantom')} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Analyze Wallet
            </Button>
            
            <Button 
              onClick={handleDownloadSchema} 
              disabled={!schema}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Schema
            </Button>
            
            <Button 
              onClick={handleDownloadDocs} 
              disabled={!schema}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Download Docs
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">Error: {error}</p>
            </div>
          )}

          {schema && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Total Elements</p>
                <p className="text-2xl font-bold text-blue-900">{schema.totalElements}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Categories</p>
                <p className="text-2xl font-bold text-green-900">{schema.categories.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">Screens</p>
                <p className="text-2xl font-bold text-purple-900">{schema.screens.length}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {schema && (
        <Card>
          <CardHeader>
            <CardTitle>API Schema Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="elements" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="elements">Elements</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="testing">Testing</TabsTrigger>
                <TabsTrigger value="json">JSON Schema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="elements" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {schema.elements.map((element) => (
                      <div
                        key={element.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedElement === element.id 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{element.name}</h4>
                          <div className="flex gap-1">
                            <Badge variant={element.properties.customizable ? "default" : "secondary"} className="text-xs">
                              {element.properties.customizable ? "Customizable" : "Fixed"}
                            </Badge>
                            {element.properties.interactive && (
                              <Badge variant="outline" className="text-xs">Interactive</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{element.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <code>{element.selector}</code> • Category: {element.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {schema.categories.map((category) => {
                    const categoryElements = schema.elements.filter(e => e.category === category);
                    return (
                      <div key={category} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900">{category}</h3>
                        <p className="text-sm text-gray-600">{categoryElements.length} elements</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Customizable: {categoryElements.filter(e => e.properties.customizable).length}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="testing" className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Style Testing</h3>
                  {selectedElement ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Selected element: <code className="bg-gray-100 px-2 py-1 rounded">{selectedElement}</code>
                      </p>
                      <Button 
                        onClick={handleApplyTestStyles}
                        className="flex items-center gap-2"
                      >
                        <Palette className="h-4 w-4" />
                        Apply Test Styles
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Select an element above to test style application</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="json" className="space-y-4">
                <ScrollArea className="h-[400px]">
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(schema, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletAPIDemo;
