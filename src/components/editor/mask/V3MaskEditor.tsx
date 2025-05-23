
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Info, Eye, EyeOff } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import V3MaskPreviewCanvas from './V3MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import DrawToMaskCanvas from './DrawToMaskCanvas';

const V3MaskEditor = () => {
  const { 
    resetEditor, 
    maskImageUrl, 
    safeZoneVisible,
    setSafeZoneVisible
  } = useMaskEditorStore();
  
  const [showGuide, setShowGuide] = useState(true);

  const handleReset = () => {
    resetEditor();
    toast.success("Mask editor has been reset");
  };
  
  const toggleGuide = () => {
    setShowGuide(!showGuide);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 relative">
      <Card className="bg-black/30 backdrop-blur-md border-white/10">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Draw-to-Mask Editor</h2>
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
                Draw the outline of your wallet costume directly on the canvas. Our AI will turn your sketch into a beautiful decorative mask while keeping the wallet UI visible and functional.
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
          
          <DrawToMaskCanvas />
          
          <div className="mt-4">
            <SafeZoneToggle />
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full mt-4 border-white/10 text-white/80 hover:text-white"
          >
            Reset All
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default V3MaskEditor;
