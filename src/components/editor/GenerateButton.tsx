
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

    console.log('🚀 Starting generation for layer:', activeLayer);
    console.log('📝 Prompt:', prompt);
    console.log('🖼️ Has image:', !!uploadedImage);

    // Show initial generation toast with layer info
    toast({
      title: `Generating ${activeLayer === 'login' ? 'Login Screen' : 'Wallet'} Style`,
      description: `Creating custom background and color scheme for ${activeLayer} layer. This may take a moment...`,
    });
    
    setIsGenerating(true);
    try {
      // Pass additional context to help with layer detection
      const generatedStyle = await generateStyle(prompt, uploadedImage, activeLayer, {
        layerContext: activeLayer,
        isLoginScreen: activeLayer === 'login',
        isWalletScreen: activeLayer === 'wallet'
      });
      
      console.log('✅ Generated style:', generatedStyle);
      setStyleForLayer(activeLayer, generatedStyle);
      
      toast({
        title: "Style generated successfully",
        description: generatedStyle.styleNotes 
          ? `Applied style: ${generatedStyle.styleNotes}` 
          : `New custom style applied to ${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'}`,
      });
    } catch (error) {
      console.error("💥 Generation error:", error);
      toast({
        title: "Generation failed",
        description: `Failed to generate style for ${activeLayer} layer. Please try again with a different prompt.`,
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
          Generating {activeLayer === 'login' ? 'Login' : 'Wallet'} Style...
        </>
      ) : (
        <>
          <Wand className="mr-2 h-4 w-4" />
          Generate {activeLayer === 'login' ? 'Login' : 'Wallet'} Style
        </>
      )}
    </Button>
  );
};

export default GenerateButton;
