
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, RotateCcw, AlertCircle } from 'lucide-react';
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
    isGenerating, 
    setIsGenerating,
    setSafeZoneVisible
  } = useMaskEditorStore();
  
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [hasGenerationError, setHasGenerationError] = useState(false);

  const handleGenerate = async () => {
    if (!prompt && !maskImageUrl) {
      toast.error("Please enter a description or upload an image first");
      return;
    }

    // Reset error state
    setHasGenerationError(false);

    // Validate image URL if provided
    if (maskImageUrl && maskImageUrl.startsWith('blob:')) {
      toast.error("Please wait for the image to finish uploading");
      return;
    }

    setIsGenerating(true);
    setShowProgress(true);
    setProgress(10);
    
    // Always show safe zone during generation to help the user understand the process
    setSafeZoneVisible(true);
    
    try {
      toast.info("Generating wallet costume. This may take up to 30 seconds...");
      
      // Enhanced prompt with style instructions and safe zone guidance
      let enhancedPrompt = prompt;
      
      // Add style modifier if selected
      if (maskStyle) {
        enhancedPrompt += `, ${maskStyle} style`;
      }
      
      // Always add safe zone instructions to ensure transparency in the center
      enhancedPrompt += " - Important: Create a decorative mask AROUND a wallet. Leave the central rectangle (320x569px) completely transparent and clear.";
      
      setProgress(30);
      
      // Simulate intermediate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 1000);
      
      console.log('Calling generateMask with:', { enhancedPrompt, activeLayer, maskImageUrl });
      
      // Generate the external mask that surrounds the wallet
      const generatedMask = await generateMask(
        enhancedPrompt,
        activeLayer, 
        maskImageUrl
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('Generated mask result:', generatedMask);
      
      if (!generatedMask || !generatedMask.imageUrl) {
        throw new Error("Failed to generate mask - no image URL returned");
      }
      
      // Set the external mask with the generated image URL
      setExternalMask(generatedMask.imageUrl);
      
      toast.success("Wallet costume generated successfully");
      
      // Hide progress after success
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Error generating mask:", error);
      setHasGenerationError(true);
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `Error: ${(error as Error).message}`
          : "Failed to generate costume. Using a demo mask instead."
      );
      
      // Use a fallback demo mask on error
      setExternalMask('/external-masks/abstract-mask.png');
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setIsGenerating(false);
      // Keep safe zone visible after generation so user can see the result in context
    }
  };

  const hasExistingContent = !!prompt || !!maskImageUrl || !!externalMask;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600"
        disabled={isGenerating || (!prompt && !maskImageUrl) || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Costume...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Costume
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 30 ? "Analyzing prompt..." : 
             progress < 60 ? "Creating artwork..." : 
             progress < 90 ? "Finalizing mask..." : "Almost done!"}
          </p>
        </div>
      )}
      
      {hasGenerationError && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Generation error. Using fallback mask. Check console for details.
        </div>
      )}
      
      {hasExistingContent && !isGenerating && (
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
