
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MaskPromptInput from './MaskPromptInput';
import MaskUploadImage from './MaskUploadImage';
import GenerateMaskButton from './GenerateMaskButton';
import { Button } from '@/components/ui/button';
import { RotateCcw, Info, Eye, EyeOff, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import V3MaskPreviewCanvas from './V3MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';
import MaskPresets from './MaskPresets';
import CreateGuideImageButton from '@/components/admin/CreateGuideImageButton';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const V3MaskEditor = () => {
  const { 
    resetEditor, 
    maskImageUrl, 
    prompt, 
    safeZoneVisible,
    setSafeZoneVisible
  } = useMaskEditorStore();
  
  const [showGuide, setShowGuide] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };
  
  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create Wallet Costume</h2>
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
                    Our AI generates decorative masks that surround your wallet while keeping the central wallet UI visible and functional. Try our presets or create your own design!
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
                  <h3 className="text-sm font-medium mb-4 text-white">Upload your own wallet skin</h3>
                  <MaskUploadImage />
                </div>
                
                <Separator orientation="horizontal" className="bg-white/10" />
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    AI Mask Creator
                  </h3>
                  <p className="text-xs text-white/70">
                    Create beautiful decorative masks that go around your wallet. The mask will leave the central wallet UI untouched.
                  </p>
                  <MaskPromptInput />
                </div>
                
                <MaskPresets />
                
                <SafeZoneToggle />
                
                <div className="space-y-3">
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
                
                {/* Admin Section - Simple Toggle */}
                <div className="space-y-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-white/50 hover:text-white/70 flex items-center justify-between"
                    onClick={() => setShowAdmin(!showAdmin)}
                  >
                    <div className="flex items-center">
                      <Settings className="mr-2 h-3 w-3" />
                      {showAdmin ? 'Hide Admin' : 'Show Admin'}
                    </div>
                    {showAdmin ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>
                  
                  {showAdmin && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                        <h4 className="text-xs font-medium text-blue-300 mb-2">Reference Guide Setup</h4>
                        <p className="text-xs text-white/60 mb-3">
                          Create the mask-guide-v3.png reference image for better positioning accuracy.
                        </p>
                        <CreateGuideImageButton />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-between py-2 px-4">
            <h3 className="text-sm font-medium text-white">Wallet Preview</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSafeZoneVisible(!safeZoneVisible)}
                  >
                    {safeZoneVisible ? (
                      <Eye className="h-4 w-4 text-purple-400" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{safeZoneVisible ? "Hide" : "Show"} Safe Zone</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
