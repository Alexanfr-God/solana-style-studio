
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers } from 'lucide-react';

const MaskLayerSelector = () => {
  const { activeLayer, setActiveLayer } = useMaskEditorStore();

  const handleLayerChange = (value: string) => {
    setActiveLayer(value as 'login' | 'wallet');
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2 mb-1">
        <Layers className="h-5 w-5 text-white" />
        <h3 className="text-sm font-medium text-white">Select Mask Layer</h3>
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
            Login Mask
          </TabsTrigger>
          <TabsTrigger 
            value="wallet" 
            className={cn(
              "w-full text-white", 
              activeLayer === "wallet" ? "bg-primary text-primary-foreground" : "bg-transparent"
            )}
          >
            Wallet Mask
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MaskLayerSelector;
