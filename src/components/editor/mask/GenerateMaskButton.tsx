
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, AlertCircle, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface GenerateMaskButtonProps {
  disabled?: boolean;
}

const GenerateMaskButton = ({ disabled = false }: GenerateMaskButtonProps) => {
  const { 
    prompt, 
    referenceImage,
    styleHintImage,
    maskStyle,
    setExternalMask,
    isGenerating, 
    setIsGenerating,
    setSafeZoneVisible
  } = useMaskEditorStore();
  
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [hasGenerationError, setHasGenerationError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt && !referenceImage) {
      toast.error("Please enter a description or upload a reference image first");
      return;
    }

    setHasGenerationError(false);
    setIsGenerating(true);
    setShowProgress(true);
    setProgress(10);
    setSafeZoneVisible(true);
    setDebugInfo(null);
    
    try {
      toast.info("🚀 Generating optimized V3 wallet costume...");
      
      setProgress(20);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 6;
          return newProgress < 80 ? newProgress : prev;
        });
      }, 2000);
      
      console.log('🎯 Calling optimized generate-wallet-mask-v3 with:', { 
        prompt, 
        referenceImage,
        styleHintImage,
        maskStyle 
      });
      
      setProgress(40);
      
      // Get current user for storage
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: {
          prompt: prompt,
          reference_image_url: referenceImage,
          style_hint_image_url: styleHintImage,
          style: maskStyle,
          user_id: user?.id
        }
      });
      
      clearInterval(progressInterval);
      setProgress(90);
      
      console.log('🎉 V3 optimized mask generation result:', data);
      
      if (error) {
        throw new Error(`V3 Optimized generation failed: ${error.message}`);
      }
      
      if (!data || !data.image_url) {
        throw new Error("Failed to generate mask - no image URL returned");
      }
      
      setProgress(100);
      setExternalMask(data.image_url);
      
      // Store debug information from the response
      if (data.debug_info) {
        setDebugInfo(data.debug_info);
        console.log('🔍 Debug information received:', data.debug_info);
      }
      
      toast.success("🎉 Optimized V3 wallet costume generated and applied! Check the preview.");
      
      if (data.storage_path) {
        console.log("💾 Image stored at:", data.storage_path);
        toast.info("💾 Costume saved to your collection");
      }
      
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1500);
      
    } catch (error) {
      console.error("💥 Error generating V3 optimized mask:", error);
      setHasGenerationError(true);
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `Error: ${(error as Error).message}`
          : "Failed to generate costume. Using a demo mask instead."
      );
      
      const fallbacks = {
        cartoon: '/external-masks/cats-mask.png',
        meme: '/external-masks/pepe-mask.png',
        luxury: '/external-masks/crypto-mask.png',
        modern: '/external-masks/abstract-mask.png',
        realistic: '/external-masks/abstract-mask.png',
        fantasy: '/external-masks/abstract-mask.png',
        minimalist: '/external-masks/clean Example.png'
      };
      
      setExternalMask(fallbacks[maskStyle] || '/external-masks/abstract-mask.png');
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasValidInput = !!prompt || !!referenceImage;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 text-black font-bold"
        disabled={isGenerating || !hasValidInput || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Optimized Costume...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate V3 Optimized Costume
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 20 ? "🔍 Analyzing wallet base and images..." : 
             progress < 40 ? "🧠 Enhanced GPT-4o with optimized prompt handling..." :
             progress < 60 ? "🎨 Creating artwork with DALL-E 3 (corrected coordinates)..." : 
             progress < 80 ? "✨ Validating transparency and sizing..." : 
             progress < 90 ? "💾 Storing optimized result..." : "🎉 Finalizing V3 optimization!"}
          </p>
        </div>
      )}
      
      {hasGenerationError && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Generation error. Using fallback mask. Check console for details.
        </div>
      )}
      
      {!hasValidInput && (
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-300">
          💡 Upload a reference image or enter a description to get started
        </div>
      )}
      
      {hasValidInput && !isGenerating && (
        <div className="text-xs text-white/60 text-center">
          🚀 Style: <span className="text-purple-300 font-medium">{maskStyle}</span> | 
          🖼️ Images: {referenceImage ? "✅" : "✗"} {styleHintImage ? "+ Style Hint" : ""} + Wallet Base
        </div>
      )}

      {/* ENHANCED Debug information display */}
      {debugInfo && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
          <div className="flex items-center text-xs text-blue-300 mb-2">
            <Info className="h-3 w-3 mr-1" />
            Debug Information (V3 Optimized)
          </div>
          <div className="text-xs text-white/70 space-y-1">
            <div>📐 Safe Zone: x={debugInfo.safeZone?.x}, y={debugInfo.safeZone?.y}, {debugInfo.safeZone?.width}×{debugInfo.safeZone?.height}px</div>
            <div>📱 Container: {debugInfo.containerDimensions?.width}×{debugInfo.containerDimensions?.height}px</div>
            <div>🖼️ Output: {debugInfo.outputImageSize}</div>
            <div>🎯 Attempts: {debugInfo.attempts}</div>
            <div>✅ Transparency: {debugInfo.transparencyValidated ? "Valid" : "Failed"}</div>
            <div>📸 Images: {debugInfo.hasReferenceImage ? "✓" : "✗"} ref, {debugInfo.hasStyleHint ? "✓" : "✗"} hint</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateMaskButton;
