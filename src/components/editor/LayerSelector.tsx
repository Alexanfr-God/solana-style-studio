
import React from 'react';
import { useCustomizationStore, LayerType } from '../../stores/customizationStore';
import { cn } from '@/lib/utils';
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
        <Layers className="h-5 w-5 text-white" />
        <h3 className="text-sm font-medium text-white">Select Layer</h3>
      </div>
      <Tabs value={activeLayer} onValueChange={handleLayerChange}>
        <TabsList className="w-full bg-white/10">
          <TabsTrigger 
            value="login" 
            className={cn(
              "w-full text-white", 
              activeLayer === "login" ? "bg-primary text-primary-foreground" : "bg-transparent"
            )}
          >
            Login Screen
          </TabsTrigger>
          <TabsTrigger 
            value="wallet" 
            className={cn(
              "w-full text-white", 
              activeLayer === "wallet" ? "bg-primary text-primary-foreground" : "bg-transparent"
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
