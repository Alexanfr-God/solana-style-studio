
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImage, SlidersHorizontal, Layers } from 'lucide-react';

const EditorTabs = () => {
  return (
    <div className="mb-6">
      <Tabs defaultValue="create-style">
        <TabsList className="grid grid-cols-3 w-full bg-black/20 backdrop-blur-sm">
          <TabsTrigger 
            value="create-style" 
            className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r from-purple-600/80 to-blue-500/80"
          >
            <FileImage className="h-4 w-4" />
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">Create Style</span>
              <span className="text-[10px] opacity-80">Interior design & colors</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="fine-tune" 
            disabled 
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">Fine-tune</span>
              <span className="text-[10px] opacity-80">UI/UX customization</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="decorate" 
            disabled 
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">Decorate</span>
              <span className="text-[10px] opacity-80">External iconography</span>
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default EditorTabs;
