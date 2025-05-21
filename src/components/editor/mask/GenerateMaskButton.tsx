import React from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand, Loader2 } from 'lucide-react';
import { generateMask } from '@/services/maskService';

interface GenerateMaskButtonProps {
  disabled?: boolean;
}

const GenerateMaskButton = ({ disabled = false }: GenerateMaskButtonProps) => {
  const { 
    prompt, 
    activeLayer, 
    maskImageUrl,
    setExternalMask,
    isGenerating, 
    setIsGenerating,
    setSafeZoneVisible
  } = useMaskEditorStore();

  const handleGenerate = async () => {
    if (!prompt && !maskImageUrl) {
      toast.error("Please enter a description or upload an image first");
      return;
    }

    // Validate image URL if provided
    if (maskImageUrl && maskImageUrl.startsWith('blob:')) {
      toast.error("Please wait for the image to finish uploading");
      return;
    }

    setIsGenerating(true);
    // Always show safe zone during generation to help the user understand the process
    setSafeZoneVisible(true);
    
    try {
      toast.info("Generating wallet costume. This may take a moment...");
      
      // For V3, we're generating an external mask
      // In a real implementation, this would send instructions to keep the central wallet UI area clear
      const generatedMask = await generateMask(
        prompt + " - Important: Create a decorative mask AROUND a wallet. Leave the central rectangle (320x569px) completely transparent and clear.",
        activeLayer, 
        maskImageUrl
      );
      
      // Set the external mask with the generated image URL
      setExternalMask(generatedMask.imageUrl);
      
      toast.success("Wallet costume generated successfully");
    } catch (error) {
      console.error("Error generating mask:", error);
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? `Error: ${(error as Error).message}`
          : "Failed to generate costume. Please try again."
      );
    } finally {
      setIsGenerating(false);
      // Keep safe zone visible after generation so user can see the result in context
    }
  };

  return (
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
  );
};

export default GenerateMaskButton;
