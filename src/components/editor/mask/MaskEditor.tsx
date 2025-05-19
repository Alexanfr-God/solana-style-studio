
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskLayerSelector from './MaskLayerSelector';
import MaskUploadImage from './MaskUploadImage';
import MaskPromptInput from './MaskPromptInput';
import GenerateMaskButton from './GenerateMaskButton';
import SafeZoneToggle from './SafeZoneToggle';
import ApplyMaskButton from './ApplyMaskButton';
import MaskPreviewCanvas from './MaskPreviewCanvas';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

const MaskEditor = () => {
  const { resetEditor } = useMaskEditorStore();

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Create Custom Mask</h2>
              
              <div className="space-y-6">
                <MaskLayerSelector />
                
                <Separator orientation="horizontal" />
                
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload your own mask image</h3>
                  <MaskUploadImage />
                </div>
                
                <Separator orientation="horizontal" />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    AI Mask Generator
                  </h3>
                  <MaskPromptInput />
                </div>
                
                <SafeZoneToggle />
                
                <div className="flex flex-col space-y-3">
                  <GenerateMaskButton />
                  <ApplyMaskButton />
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full border-white/10 text-white/80 hover:text-white"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-center py-4">
            <div className="w-full h-full">
              <MaskPreviewCanvas />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MaskEditor;
