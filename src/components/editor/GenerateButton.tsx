
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../../stores/customizationStore';
import { useToast } from '@/hooks/use-toast';
import { generateStyle } from '../../services/apiService';
import { Wand, Loader2, Lock } from 'lucide-react';
import { useExtendedWallet } from '@/context/WalletContextProvider';

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
  const { isAuthenticated, supabaseUser, isAuthenticating } = useExtendedWallet();

  const handleGenerate = async () => {
    // Проверяем аутентификацию через Supabase (связанную с Phantom)
    if (!isAuthenticated || !supabaseUser) {
      toast({
        title: "Phantom wallet required",
        description: "Please connect your Phantom wallet and sign the message to generate styles",
        variant: "destructive",
      });
      return;
    }

    // Валидация входных данных
    if (!prompt && !uploadedImage) {
      toast({
        title: "Missing information",
        description: "Please enter a style description or upload an image",
        variant: "destructive",
      });
      return;
    }

    if (prompt && prompt.length > 500) {
      toast({
        title: "Prompt too long",
        description: "Please keep your style description under 500 characters",
        variant: "destructive",
      });
      return;
    }

    // Показываем начальное уведомление
    toast({
      title: `Generating ${activeLayer === 'login' ? 'Login' : 'Wallet'} Style`,
      description: "Creating a custom background and color scheme. This may take a moment...",
    });
    
    setIsGenerating(true);
    try {
      const generatedStyle = await generateStyle(prompt, uploadedImage, activeLayer);
      setStyleForLayer(activeLayer, generatedStyle);
      
      const displayMessage = generatedStyle.styleNotes?.includes('Error:') 
        ? 'Style generation encountered an issue, but a default style has been applied.'
        : generatedStyle.styleNotes || `New collectible style applied to ${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'}`;
      
      toast({
        title: generatedStyle.styleNotes?.includes('Error:') ? "Style applied with fallback" : "Style generated successfully",
        description: displayMessage,
        variant: generatedStyle.styleNotes?.includes('Error:') ? "destructive" : "default"
      });
      
    } catch (error) {
      console.error("Generation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = isGenerating || (!prompt && !uploadedImage) || !isAuthenticated || isAuthenticating;

  return (
    <Button
      onClick={handleGenerate}
      className="w-full transition-all duration-200"
      disabled={isDisabled}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Style...
        </>
      ) : !isAuthenticated ? (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Connect Phantom Wallet
        </>
      ) : isAuthenticating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Authenticating...
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
