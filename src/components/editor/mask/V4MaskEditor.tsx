
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import MaskPromptInput from './MaskPromptInput';
import MaskUploadImage from './MaskUploadImage';
import V3MaskPreviewCanvas from './V3MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';
import MaskPresets from './MaskPresets';

const V4MaskEditor = () => {
  const { 
    resetEditor, 
    prompt,
    maskStyle,
    setMaskImageUrl,
    setIsGenerating,
    isGenerating
  } = useMaskEditorStore();
  
  const [backgroundRemoval, setBackgroundRemoval] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const handleV4Generate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info("🚀 Generating with V4 (Simple + Background Removal)...");
      
      const response = await fetch('/api/generate-wallet-mask-v4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          style: maskStyle,
          enable_background_removal: backgroundRemoval,
          reference_image_url: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-guide.png'
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.details || result.error);
      }

      setMaskImageUrl(result.image_url);
      
      const bgStatus = result.background_removed ? "✅ Background removed" : "⚠️ Original kept";
      toast.success(`V4 Generation complete! ${bgStatus}`);
      
      if (result.debug_info) {
        console.log('V4 Debug Info:', result.debug_info);
      }

    } catch (error) {
      console.error('V4 Generation error:', error);
      toast.error(`V4 Generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    resetEditor();
    toast.success("V4 Editor reset");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 relative">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6">
          
          {/* V4 Header */}
          <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-md border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">V4 Simple Generator</h2>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-purple-600 text-white text-xs">
                  NEW
                </Badge>
              </div>
              
              <p className="text-xs text-white/70 mb-4">
                Ultra-simple prompts + automatic background removal. Focus only on character and black rectangle interaction!
              </p>

              {/* Background Removal Toggle */}
              <div className="flex items-center space-x-2 mb-4 p-3 bg-black/20 rounded-lg">
                <Switch
                  id="background-removal"
                  checked={backgroundRemoval}
                  onCheckedChange={setBackgroundRemoval}
                />
                <Label htmlFor="background-removal" className="text-sm text-white">
                  Auto Background Removal
                </Label>
                <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                  {backgroundRemoval ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Main Controls */}
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload Reference Image</h3>
                  <MaskUploadImage />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-white flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Character Prompt (V4 Simple)
                  </h3>
                  <p className="text-xs text-white/70">
                    Just describe your character! V4 automatically handles positioning and background removal.
                  </p>
                  <MaskPromptInput />
                </div>
                
                <MaskPresets />
                <SafeZoneToggle />
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleV4Generate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating V4...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate V4 (Simple)
                      </div>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full border-white/10 text-white/80 hover:text-white"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset V4
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Preview */}
      <div className="lg:col-span-2">
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-between py-2 px-4">
            <h3 className="text-sm font-medium text-white">V4 Preview</h3>
            <Badge className="bg-purple-600/50 text-white text-xs">
              Simple + Auto BG Removal
            </Badge>
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

export default V4MaskEditor;
