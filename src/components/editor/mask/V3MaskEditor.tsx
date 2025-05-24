
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskPromptInput from './MaskPromptInput';
import MaskUploadImage from './MaskUploadImage';
import GenerateMaskButton from './GenerateMaskButton';
import { Button } from '@/components/ui/button';
import { RotateCcw, Info, EyeOff } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import V3MaskPreviewCanvas from './V3MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';
import MaskPresets from './MaskPresets';

const V3MaskEditor = () => {
  const { 
    resetEditor, 
    maskImageUrl, 
    prompt, 
    externalMask
  } = useMaskEditorStore();
  
  const [showGuide, setShowGuide] = useState(true);

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor reset - check the wallet preview");
  };
  
  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  const hasActiveMask = !!(externalMask || maskImageUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Wallet Costume Creator</h2>
                <div className="bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-xs px-2 py-1 rounded">AI-Powered</div>
              </div>
              
              {showGuide && (
                <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-md">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-purple-300 mb-1">How it works:</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0" 
                      onClick={toggleGuide}
                    >
                      <EyeOff className="h-4 w-4 text-white/60" />
                    </Button>
                  </div>
                  <p className="text-xs text-white/70">
                    Create decorative masks that surround your wallet while keeping the central UI visible. All results appear directly in the wallet preview →
                  </p>
                </div>
              )}
              
              {!showGuide && (
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6" 
                    onClick={toggleGuide}
                  >
                    <Info className="h-4 w-4 mr-1 text-white/60" />
                    <span className="text-xs text-white/60">Show Guide</span>
                  </Button>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload Custom Image</h3>
                  <MaskUploadImage />
                </div>
                
                <Separator orientation="horizontal" className="bg-white/10" />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    AI Costume Creator
                  </h3>
                  <p className="text-xs text-white/70">
                    Describe your ideal wallet costume. The AI will create decorative elements around your wallet.
                  </p>
                  <MaskPromptInput />
                </div>
                
                <MaskPresets />
                
                <SafeZoneToggle />
                
                <div className="space-y-3">
                  <GenerateMaskButton />
                  
                  {hasActiveMask && (
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="w-full border-white/10 text-white/80 hover:text-white"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Clear & Reset
                    </Button>
                  )}
                </div>
                
                {hasActiveMask && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                    <p className="text-xs text-green-300">
                      ✓ Costume active! Check the wallet preview to see your custom design.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-between py-2 px-4">
            <h3 className="text-sm font-medium text-white">Wallet Preview</h3>
            <div className="text-xs text-white/50">
              {hasActiveMask ? "Custom costume active" : "No costume applied"}
            </div>
          </div>
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
