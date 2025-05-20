
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskLayerSelector from './MaskLayerSelector';
import MaskUploadImage from './MaskUploadImage';
import MaskPromptInput from './MaskPromptInput';
import GenerateMaskButton from './GenerateMaskButton';
import SafeZoneToggle from './SafeZoneToggle';
import ApplyMaskButton from './ApplyMaskButton';
import MaskPreviewCanvas from './MaskPreviewCanvas';
import TryV3BetaButton from './TryV3BetaButton';
import { Button } from '@/components/ui/button';
import { RotateCcw, Ban } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

const MaskEditor = () => {
  const { resetEditor } = useMaskEditorStore();
  const [interactionsDisabled, setInteractionsDisabled] = useState(true);

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };

  const toggleInteractions = () => {
    setInteractionsDisabled(!interactionsDisabled);
    if (interactionsDisabled) {
      toast.success("Interactions enabled");
    } else {
      toast.success("Interactions disabled");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
      {interactionsDisabled && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="bg-black/80 p-6 rounded-lg border border-white/10 text-center max-w-md">
            <Ban className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Demo Version</h3>
            <p className="text-white/70 mb-4">
              Interactions are currently disabled in this preview. This is a demonstration version only.
            </p>
            <Button 
              onClick={toggleInteractions} 
              variant="outline"
              className="border-white/10 text-white hover:bg-white/10"
            >
              Enable Interactions
            </Button>
          </div>
        </div>
      )}

      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create Wallet Costume</h2>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleInteractions}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    {interactionsDisabled ? "Enable" : "Disable"}
                  </Button>
                  <TryV3BetaButton />
                </div>
              </div>
              
              <div className="space-y-6">
                <MaskLayerSelector />
                
                <Separator orientation="horizontal" />
                
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload your own wallet skin</h3>
                  <MaskUploadImage />
                </div>
                
                <Separator orientation="horizontal" />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    AI Mask Creator
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
