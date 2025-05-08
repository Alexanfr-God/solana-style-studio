
import React from 'react';
import { useCustomizationStore, LayerType } from '../stores/customizationStore';
import { cn } from '../lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers } from 'lucide-react';

const LayerSelector = () => {
  const { activeLayer, setActiveLayer } = useCustomizationStore();

  const handleLayerChange = (value: string) => {
    setActiveLayer(value as LayerType);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 mb-1">
        <Layers className="h-5 w-5" />
        <h3 className="text-sm font-medium">Layer</h3>
      </div>
      <Tabs value={activeLayer} onValueChange={handleLayerChange} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger 
            value="login" 
            className={cn(
              "w-full", 
              activeLayer === "login" ? "bg-primary text-primary-foreground" : ""
            )}
          >
            Login Screen
          </TabsTrigger>
          <TabsTrigger 
            value="wallet" 
            className={cn(
              "w-full", 
              activeLayer === "wallet" ? "bg-primary text-primary-foreground" : ""
            )}
          >
            Wallet Screen
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LayerSelector;
