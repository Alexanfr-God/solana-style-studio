
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, AlertCircle } from 'lucide-react';
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
    
    try {
      toast.info("Generating wallet costume with advanced AI. This may take up to 45 seconds...");
      
      setProgress(30);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 8;
          return newProgress < 85 ? newProgress : prev;
        });
      }, 1500);
      
      console.log('Calling generate-wallet-mask-v3 with:', { 
        prompt, 
        referenceImage,
        styleHintImage,
        maskStyle 
      });
      
      const { data, error } = await supabase.functions.invoke('generate-wallet-mask-v3', {
        body: {
          prompt: prompt,
          reference_image_url: referenceImage,
          style_hint_image_url: styleHintImage,
          style: maskStyle
        }
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('V3 mask generation result:', data);
      
      if (error) {
        throw new Error(`V3 Generation failed: ${error.message}`);
      }
      
      if (!data || !data.image_url) {
        throw new Error("Failed to generate mask - no image URL returned");
      }
      
      setExternalMask(data.image_url);
      toast.success("🎉 Wallet costume generated and applied! Check the preview on the right.");
      
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating V3 mask:", error);
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
            Generating Costume...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Wallet Costume
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 30 ? "🔍 Analyzing your images..." : 
             progress < 60 ? "🎨 Creating artwork with AI..." : 
             progress < 85 ? "✨ Adding WOW effects..." : "🎉 Almost ready!"}
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
          🖼️ Images: {referenceImage ? "✓" : "✗"} {styleHintImage ? "+ Style Hint" : ""}
        </div>
      )}
    </div>
  );
};

export default GenerateMaskButton;
