
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../../stores/customizationStore';
import { useToast } from '@/hooks/use-toast';
import { generateStyle } from '../../services/apiService';
import { Wand, Loader2 } from 'lucide-react';

const GenerateButton = () => {
  const { 
    prompt, 
    uploadedImage, 
    activeLayer, 
    setStyleForLayer, 
    isGenerating, 
    setIsGenerating 
  } = useCustomizationStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt && !uploadedImage) {
      toast({
        title: "Missing information",
        description: "Please enter a style description or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedStyle = await generateStyle(prompt, uploadedImage, activeLayer);
      setStyleForLayer(activeLayer, generatedStyle);
      
      toast({
        title: "Style generated",
        description: generatedStyle.styleNotes 
          ? `Applied style: ${generatedStyle.styleNotes}` 
          : `New style applied to ${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'}`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate style. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      className="w-full transition-all duration-200"
      disabled={isGenerating || (!prompt && !uploadedImage)}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Style...
        </>
      ) : (
        <>
          <Wand className="mr-2 h-4 w-4" />
          Generate Style
        </>
      )}
    </Button>
  );
};

export default GenerateButton;
