
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../stores/customizationStore';
import { useToast } from '@/components/ui/use-toast';
import { generateStyle } from '../services/apiService';
import { WandSparkles } from 'lucide-react';

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
    if (!prompt) {
      toast({
        title: "Missing description",
        description: "Please enter a style description first",
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
        description: `New style applied to ${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'}`,
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
      className="w-full"
      disabled={isGenerating || !prompt}
    >
      <WandSparkles className="mr-2 h-4 w-4" />
      {isGenerating ? 'Generating...' : 'Generate Style'}
    </Button>
  );
};

export default GenerateButton;
