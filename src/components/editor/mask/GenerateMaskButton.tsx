
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, AlertCircle, Bug } from 'lucide-react';
import { generateWalletMaskV3 } from '@/services/maskServiceV3';
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
  const [useBackupStrategy, setUseBackupStrategy] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

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
    
    // Always show safe zone during generation
    setSafeZoneVisible(true);
    
    try {
      toast.info("Generating wallet costume with AI...");
      
      setProgress(30);
      
      // Simulate intermediate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 1000);
      
      console.log('Calling V3 generateWalletMaskV3 with:', { 
        prompt, 
        activeLayer, 
        maskImageUrl,
        useBackupStrategy,
        maskStyle,
        debugMode
      });
      
      // Generate the V3 mask using the new architecture
      const generatedMask = await generateWalletMaskV3({
        prompt,
        layer: activeLayer,
        referenceImageUrl: maskImageUrl,
        selectedStyle: maskStyle,
        useBackupStrategy,
        debugMode
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('V3 mask generation result:', generatedMask);
      
      if (!generatedMask || !generatedMask.imageUrl) {
        throw new Error("Failed to generate V3 mask - no image URL returned");
      }
      
      // ✅ CRITICAL: Set the external mask with the generated image URL for V3 wallet preview
      setExternalMask(generatedMask.imageUrl);
      console.log('✅ V3 externalMask set to:', generatedMask.imageUrl);
      
      // Show success message
      const successMessage = debugMode && generatedMask.metadata.layout
        ? `Wallet costume generated! Check the preview → Layout: ${generatedMask.metadata.layout.top || 'decorative'} (top), ${generatedMask.metadata.layout.bottom || 'decorative'} (bottom)`
        : "Wallet costume generated! Check the preview →";
      
      toast.success(successMessage);
      
      // Log V3 debug information if available
      if (debugMode && generatedMask.debugInfo) {
        console.log('=== V3 GENERATION DEBUG ===');
        console.log('Prompt used:', generatedMask.debugInfo.promptUsed);
        console.log('Input type:', generatedMask.debugInfo.inputType);
        console.log('Metadata:', generatedMask.metadata);
        console.log('Additional debug data:', generatedMask.debugInfo.debugData);
      }
      
      // Hide progress after success
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("V3 mask generation error:", error);
      setHasGenerationError(true);
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `Generation error: ${(error as Error).message}`
          : "Failed to generate costume. Using a demo mask instead."
      );
      
      // Use a fallback demo mask on error and set it to externalMask
      setExternalMask('/external-masks/abstract-mask.png');
      console.log('✅ V3 fallback externalMask set to: /external-masks/abstract-mask.png');
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleBackup = () => {
    setUseBackupStrategy(!useBackupStrategy);
    toast.info(useBackupStrategy 
      ? "Will use AI generation (GPT-4o + DALL-E)" 
      : "Will use quick fallback masks");
  };

  const handleToggleDebug = () => {
    setDebugMode(!debugMode);
    toast.info(debugMode 
      ? "Debug mode disabled" 
      : "Debug mode enabled - will show detailed generation info");
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
            Generate Wallet Costume
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 30 ? "Analyzing prompt..." : 
             progress < 60 ? "Building enhanced prompt..." : 
             progress < 90 ? "Generating with AI..." : "Finalizing mask..."}
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
        <div className="flex gap-2">
          <Button
            variant={useBackupStrategy ? "destructive" : "secondary"}
            size="sm"
            className="flex-1"
            onClick={handleToggleBackup}
          >
            {useBackupStrategy ? "Use AI Generation" : "Use Quick Fallbacks"}
          </Button>
          
          <Button
            variant={debugMode ? "default" : "outline"}
            size="sm"
            className="flex-1 border-white/10"
            onClick={handleToggleDebug}
          >
            <Bug className="mr-2 h-3 w-3" />
            {debugMode ? "Debug: ON" : "Debug: OFF"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GenerateMaskButton;
