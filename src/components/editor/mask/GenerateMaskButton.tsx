
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { generateMask } from '@/services/maskService';
import { Progress } from '@/components/ui/progress';

interface GenerateMaskButtonProps {
  disabled?: boolean;
}

const GenerateMaskButton = ({ disabled = false }: GenerateMaskButtonProps) => {
  const { 
    prompt, 
    activeLayer, 
    maskImageUrl,
    externalMask,
    maskStyle,
    setExternalMask,
    setMaskImageUrl,
    isGenerating, 
    setIsGenerating,
    setSafeZoneVisible
  } = useMaskEditorStore();
  
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [hasGenerationError, setHasGenerationError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleGenerate = async (isRetry: boolean = false) => {
    if (!prompt && !maskImageUrl) {
      toast.error("Please enter a description or upload an image first");
      return;
    }

    if (!isRetry) {
      setRetryCount(0);
      setHasGenerationError(false);
    }

    setIsGenerating(true);
    setShowProgress(true);
    setProgress(10);
    setSafeZoneVisible(true);
    
    try {
      const currentRetry = isRetry ? retryCount + 1 : 1;
      setRetryCount(currentRetry);
      
      toast.info(`🎨 Generating cat mask... ${currentRetry > 1 ? `(Attempt ${currentRetry})` : ''}`, {
        description: 'AI is creating your custom wallet decoration'
      });
      
      let enhancedPrompt = prompt;
      if (maskStyle) {
        enhancedPrompt += `, ${maskStyle} style`;
      }
      enhancedPrompt += " - Important: Create a decorative mask AROUND a wallet. The central rectangle (320x569px) MUST BE COMPLETELY TRANSPARENT.";
      
      setProgress(30);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 1000);
      
      console.log('🔄 Calling generateMask with:', { 
        enhancedPrompt, 
        activeLayer, 
        maskImageUrl,
        attempt: currentRetry
      });
      
      const generatedMask = await generateMask(
        enhancedPrompt,
        activeLayer, 
        maskImageUrl,
        false
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('✅ Generated mask result:', generatedMask);
      
      if (!generatedMask || !generatedMask.imageUrl) {
        throw new Error("Failed to generate mask - no image URL returned");
      }
      
      // Check if it's base64 data or URL
      if (generatedMask.imageUrl.startsWith('data:')) {
        console.log('✅ Setting base64 image as maskImageUrl');
        setMaskImageUrl(generatedMask.imageUrl);
        setExternalMask(null); // Clear external mask to show custom
      } else {
        console.log('✅ Setting external mask URL');
        setExternalMask(generatedMask.imageUrl);
      }
      
      toast.success("🐱 Cat mask generated successfully!", {
        description: "Your custom wallet decoration is ready"
      });
      
      setHasGenerationError(false);
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error("❌ Error generating mask:", error);
      setHasGenerationError(true);
      
      if (retryCount < 2) {
        toast.error(`Generation failed. Will retry automatically...`, {
          description: `Attempt ${retryCount + 1}/3`
        });
        
        // Auto-retry after 2 seconds
        setTimeout(() => {
          handleGenerate(true);
        }, 2000);
        return;
      }
      
      toast.error("❌ Generation failed after retries. Using demo mask.", {
        description: "Check console for detailed error information"
      });
      
      setExternalMask('/external-masks/cats-mask.png');
      setShowProgress(false);
      setProgress(0);
    } finally {
      if (retryCount >= 2 || !hasGenerationError) {
        setIsGenerating(false);
      }
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setHasGenerationError(false);
    handleGenerate(false);
  };

  const hasExistingContent = !!prompt || !!maskImageUrl || !!externalMask;

  return (
    <div className="space-y-3">
      <Button
        onClick={() => handleGenerate(false)}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600"
        disabled={isGenerating || (!prompt && !maskImageUrl) || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating... {retryCount > 0 && `(${retryCount}/3)`}
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Cat Mask
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 30 ? "Analyzing prompt..." : 
             progress < 60 ? "Creating artwork..." : 
             progress < 90 ? "Converting to base64..." : "Almost done!"}
            {retryCount > 0 && ` (Attempt ${retryCount})`}
          </p>
        </div>
      )}
      
      {hasGenerationError && retryCount >= 2 && (
        <div className="space-y-2">
          <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Generation failed after retries. Using fallback mask.
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/10"
            onClick={handleManualRetry}
            disabled={isGenerating}
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Try Again
          </Button>
        </div>
      )}
      
      {hasExistingContent && !isGenerating && !hasGenerationError && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full border-white/10 text-white/70"
          onClick={() => toast.info("Try a different prompt or style to generate a new mask")}
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          Try Different Style
        </Button>
      )}
    </div>
  );
};

export default GenerateMaskButton;
