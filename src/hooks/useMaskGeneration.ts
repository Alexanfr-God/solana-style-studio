
import { useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { generateWalletMaskV3 } from '@/services/maskServiceV3';

export const useMaskGeneration = () => {
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

  const toggleBackupStrategy = () => {
    setUseBackupStrategy(!useBackupStrategy);
    toast.info(useBackupStrategy 
      ? "Will use AI generation (GPT-4o + DALL-E)" 
      : "Will use quick fallback masks");
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    toast.info(debugMode 
      ? "Debug mode disabled" 
      : "Debug mode enabled - will show detailed generation info");
  };

  return {
    progress,
    showProgress,
    hasGenerationError,
    useBackupStrategy,
    debugMode,
    isGenerating,
    handleGenerate,
    toggleBackupStrategy,
    toggleDebugMode
  };
};
