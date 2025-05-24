
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand, Loader2 } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { generateWalletMaskV3 } from '@/services/maskServiceV3';
import { toast } from 'sonner';

const GenerateMaskButton = () => {
  const { 
    prompt, 
    maskStyle,
    isGenerating, 
    setIsGenerating,
    setExternalMask
  } = useMaskEditorStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description first");
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info("Generating wallet costume with AI...");
      
      const generatedMask = await generateWalletMaskV3({
        prompt,
        selectedStyle: maskStyle,
        debugMode: false
      });
      
      if (!generatedMask || !generatedMask.imageUrl) {
        throw new Error("Failed to generate mask");
      }
      
      // Immediately apply to wallet
      setExternalMask(generatedMask.imageUrl);
      toast.success("Wallet costume generated! Check the preview →");
      
    } catch (error) {
      console.error("Mask generation error:", error);
      toast.error("Generation failed. Using demo mask instead.");
      
      // Fallback demo mask
      setExternalMask('/external-masks/abstract-mask.png');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600"
      disabled={isGenerating || !prompt.trim()}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand className="mr-2 h-4 w-4" />
          Generate Wallet Costume
        </>
      )}
    </Button>
  );
};

export default GenerateMaskButton;
