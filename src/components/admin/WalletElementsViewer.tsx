
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, BarChart3, Database } from 'lucide-react';
import { walletElementsService, WalletElement, GroupedElements } from '@/services/walletElementsService';

const WalletElementsViewer = () => {
  const [groupedElements, setGroupedElements] = useState<GroupedElements>({});
  const [statistics, setStatistics] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WalletElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем сгруппированные элементы
      const groupedData = await walletElementsService.getAllGrouped();
      setGroupedElements(groupedData.grouped);
      
      // Устанавливаем первый экран как активный
      if (groupedData.screens.length > 0) {
        setActiveScreen(groupedData.screens[0]);
      }

      // Загружаем статистику
      const statsData = await walletElementsService.getStatistics();
      setStatistics(statsData.statistics);
      
    } catch (error) {
      console.error('Error loading wallet elements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await walletElementsService.searchElements(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching elements:', error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      container: 'bg-blue-100 text-blue-800',
      button: 'bg-green-100 text-green-800',
      text: 'bg-purple-100 text-purple-800',
      input: 'bg-orange-100 text-orange-800',
      icon: 'bg-pink-100 text-pink-800',
      background: 'bg-gray-100 text-gray-800',
      image: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getScreenColor = (screen: string) => {
    const colors: { [key: string]: string } = {
      global: 'bg-indigo-100 text-indigo-800',
      login: 'bg-red-100 text-red-800',
      home: 'bg-green-100 text-green-800',
      send: 'bg-blue-100 text-blue-800',
      receive: 'bg-purple-100 text-purple-800',
      buy: 'bg-orange-100 text-orange-800',
      swap: 'bg-pink-100 text-pink-800',
      apps: 'bg-yellow-100 text-yellow-800',
      history: 'bg-gray-100 text-gray-800',
      search: 'bg-cyan-100 text-cyan-800',
      overlay: 'bg-teal-100 text-teal-800',
      sidebar: 'bg-lime-100 text-lime-800',
    };
    return colors[screen] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading wallet elements...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Wallet Elements Database Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="elements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="elements">Elements</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Screens Sidebar */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold mb-2">Screens</h3>
                  <div className="space-y-1">
                    {Object.keys(groupedElements).map((screen) => (
                      <Button
                        key={screen}
                        variant={activeScreen === screen ? 'default' : 'ghost'}
                        className="w-full justify-start text-sm"
                        onClick={() => setActiveScreen(screen)}
                      >
                        <Badge className={`mr-2 ${getScreenColor(screen)}`}>
                          {groupedElements[screen].counts.total}
                        </Badge>
                        {screen}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Elements List */}
                <div className="lg:col-span-3">
                  {activeScreen && groupedElements[activeScreen] && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">
                          {activeScreen} Elements ({groupedElements[activeScreen].counts.total})
                        </h3>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            Customizable: {groupedElements[activeScreen].counts.customizable}
                          </Badge>
                          <Badge variant="outline">
                            Types: {Object.keys(groupedElements[activeScreen].counts.byType).length}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {groupedElements[activeScreen].elements.map((element) => (
                          <Card key={element.id} className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{element.name}</span>
                                  <Badge className={getTypeColor(element.type)}>
                                    {element.type}
                                  </Badge>
                                  {element.customizable && (
                                    <Badge variant="secondary">Customizable</Badge>
                                  )}
                                  {element.position && (
                                    <Badge variant="outline">{element.position}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {element.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>ID: {element.id}</span>
                                  {element.selector && <span>Selector: {element.selector}</span>}
                                </div>
                                {element.custom_props && element.custom_props.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs font-medium text-muted-foreground">Custom Props:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {element.custom_props.map((prop, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                          {prop}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Elements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {statistics.customizable} customizable ({statistics.customizationPercentage}%)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Screens</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics.screens.count}</div>
                      <div className="space-y-1 mt-2">
                        {statistics.screens.list.slice(0, 3).map((screen: string) => (
                          <div key={screen} className="flex justify-between text-xs">
                            <span>{screen}</span>
                            <span>{statistics.screens.details[screen]?.total || 0}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Element Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{statistics.types.count}</div>
                      <div className="space-y-1 mt-2">
                        {statistics.types.list.slice(0, 3).map((type: string) => (
                          <div key={type} className="flex justify-between text-xs">
                            <span>{type}</span>
                            <span>{statistics.types.details[type]?.total || 0}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search elements by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
                  {searchResults.map((element) => (
                    <Card key={element.id} className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{element.name}</span>
                        <Badge className={getScreenColor(element.screen)}>
                          {element.screen}
                        </Badge>
                        <Badge className={getTypeColor(element.type)}>
                          {element.type}
                        </Badge>
                        {element.customizable && (
                          <Badge variant="secondary">Customizable</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {element.description}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletElementsViewer;
