
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileImage, SlidersHorizontal, Layers } from 'lucide-react';
import { useCustomizationStore, EditorModeType } from '@/stores/customizationStore';
import { useNavigate } from 'react-router-dom';

const EditorTabs = () => {
  const { setEditorMode, editorMode } = useCustomizationStore();
  const navigate = useNavigate();

  const handleTabChange = (value: EditorModeType) => {
    setEditorMode(value);
  };

  const handleFineTuneClick = () => {
    navigate('/wallet-alive-playground');
  };

  return (
    <div className="mb-6">
      <Tabs value={editorMode} onValueChange={handleTabChange}>
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
          
          <button
            onClick={handleFineTuneClick}
            className="flex items-center gap-2 justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-white/10 text-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <div className="flex flex-col items-start text-xs">
              <span className="font-medium">Fine-tune</span>
              <span className="text-[10px] opacity-80">UI/UX customization</span>
            </div>
          </button>
          
          <TabsTrigger 
            value="decorate" 
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
