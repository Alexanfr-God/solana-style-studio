
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskPromptInput from './MaskPromptInput';
import MaskUploadImage from './MaskUploadImage';
import GenerateMaskButton from './GenerateMaskButton';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import V3MaskPreviewCanvas from './V3MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';

const V3MaskEditor = () => {
  const { resetEditor, maskImageUrl, prompt } = useMaskEditorStore();

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create Wallet Costume</h2>
                <div className="bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-xs px-2 py-1 rounded">V3</div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload your own wallet skin</h3>
                  <MaskUploadImage />
                </div>
                
                <Separator orientation="horizontal" />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    AI Mask Creator
                  </h3>
                  <p className="text-xs text-white/70">
                    Create beautiful decorative masks that go around your wallet. The mask will leave the central wallet UI untouched.
                  </p>
                  <MaskPromptInput />
                </div>
                
                <SafeZoneToggle />
                
                <div className="flex flex-col space-y-3">
                  <GenerateMaskButton />
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
              <V3MaskPreviewCanvas />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default V3MaskEditor;
