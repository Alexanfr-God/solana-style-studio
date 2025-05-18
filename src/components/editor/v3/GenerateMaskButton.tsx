
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand, Loader2 } from 'lucide-react';
import { useMaskEditorStore } from '../../../stores/maskEditorStore';
import { useToast } from '@/hooks/use-toast';
import { generateMask } from '../../../services/maskService';

const GenerateMaskButton = () => {
  const { prompt, uploadedImage, isGenerating, setIsGenerating, setMaskImageUrl, setLayoutJson } = useMaskEditorStore();
  const { toast } = useToast();

  const handleGenerateMask = async () => {
    if (!prompt && !uploadedImage) {
      toast({
        title: "Missing information",
        description: "Please enter a mask description or upload an image",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Generating Mask",
      description: "Creating your custom mask decoration. This may take a moment...",
    });
    
    setIsGenerating(true);
    try {
      // In a real implementation, this would call your API
      const result = await generateMask(prompt, uploadedImage);
      
      setMaskImageUrl(result.imageUrl);
      setLayoutJson(result.layout);
      
      toast({
        title: "Mask generated successfully",
        description: "Your custom wallet decoration is ready to preview!",
      });
    } catch (error) {
      console.error("Mask generation error:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate mask. Please try again with a different prompt.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateMask}
      className="w-full transition-all duration-200"
      disabled={isGenerating || (!prompt && !uploadedImage)}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Mask...
        </>
      ) : (
        <>
          <Wand className="mr-2 h-4 w-4" />
          Generate Mask
        </>
      )}
    </Button>
  );
};

export default GenerateMaskButton;
