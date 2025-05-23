
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2, RotateCcw, AlertCircle, Bug } from 'lucide-react';
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
      toast.info("Generating enhanced wallet costume. This may take up to 30 seconds...");
      
      setProgress(30);
      
      // Simulate intermediate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress < 90 ? newProgress : prev;
        });
      }, 1000);
      
      console.log('Calling enhanced generateMask with:', { 
        prompt, 
        activeLayer, 
        maskImageUrl,
        useBackupStrategy,
        maskStyle,
        debugMode
      });
      
      // Generate the enhanced mask with full semantic preservation
      const generatedMask = await generateMask(
        prompt,
        activeLayer, 
        maskImageUrl,
        useBackupStrategy,
        maskStyle, // Pass selected style to backend
        debugMode
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('Enhanced mask generation result:', generatedMask);
      
      if (!generatedMask || !generatedMask.imageUrl) {
        throw new Error("Failed to generate enhanced mask - no image URL returned");
      }
      
      // Set the external mask with the generated image URL
      setExternalMask(generatedMask.imageUrl);
      
      // Show enhanced success message with debug info if available
      const successMessage = debugMode && generatedMask.debugInfo
        ? `Wallet costume generated! Safe zone: ${generatedMask.debugInfo.safeZoneValidation?.opaquePixelPercent?.toFixed(1)}% opaque`
        : "Enhanced wallet costume generated successfully";
      
      toast.success(successMessage);
      
      // Log debug information if available
      if (debugMode && generatedMask.debugInfo) {
        console.log('=== ENHANCED GENERATION DEBUG ===');
        console.log('Prompt used:', generatedMask.debugInfo.promptUsed);
        console.log('Input type:', generatedMask.debugInfo.inputType);
        console.log('Safe zone validation:', generatedMask.debugInfo.safeZoneValidation);
        console.log('Additional debug data:', generatedMask.debugInfo.debugData);
      }
      
      // Hide progress after success
      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Enhanced mask generation error:", error);
      setHasGenerationError(true);
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `Enhanced generation error: ${(error as Error).message}`
          : "Failed to generate enhanced costume. Using a demo mask instead."
      );
      
      // Use a fallback demo mask on error
      setExternalMask('/external-masks/abstract-mask.png');
      
      setShowProgress(false);
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseFallback = () => {
    setUseBackupStrategy(!useBackupStrategy);
    toast.info(useBackupStrategy 
      ? "Will try enhanced AI generation" 
      : "Will use predefined masks for faster results");
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
            Generating Enhanced Costume...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Enhanced Costume
          </>
        )}
      </Button>
      
      {showProgress && (
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-white/50 text-center">
            {progress < 30 ? "Analyzing prompt with GPT-4o..." : 
             progress < 60 ? "Building enhanced prompt..." : 
             progress < 90 ? "Generating with DALL-E..." : "Validating safe zone..."}
          </p>
        </div>
      )}
      
      {hasGenerationError && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          Enhanced generation error. Using fallback mask. Check console for details.
        </div>
      )}
      
      {hasExistingContent && !isGenerating && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-white/10 text-white/70"
            onClick={() => toast.info("Try a different prompt or style to generate a new enhanced mask")}
          >
            <RotateCcw className="mr-2 h-3 w-3" />
            Try Different Style
          </Button>
          
          <Button
            variant={useBackupStrategy ? "destructive" : "secondary"}
            size="sm"
            className="flex-1"
            onClick={handleUseFallback}
          >
            {useBackupStrategy ? "Use Enhanced AI" : "Use Fallbacks"}
          </Button>
        </div>
      )}

      {/* Debug Mode Toggle */}
      <div className="flex gap-2">
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
    </div>
  );
};

export default GenerateMaskButton;
