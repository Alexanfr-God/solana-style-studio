
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../../stores/customizationStore';
import { useToast } from '@/hooks/use-toast';
import { generateStyle } from '../../services/apiService';
import { Wand, Loader2, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  // Security: Check authentication status
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = async () => {
    // Security: Validate authentication
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate custom styles.",
        variant: "destructive",
      });
      return;
    }

    // Security: Input validation
    if (!prompt && !uploadedImage) {
      toast({
        title: "Missing information",
        description: "Please enter a style description or upload an image",
        variant: "destructive",
      });
      return;
    }

    // Security: Prompt length validation
    if (prompt && prompt.length > 500) {
      toast({
        title: "Prompt too long",
        description: "Please keep your style description under 500 characters",
        variant: "destructive",
      });
      return;
    }

    // Show initial generation toast
    toast({
      title: `Generating ${activeLayer === 'login' ? 'Login' : 'Wallet'} Style`,
      description: "Creating a custom background and color scheme. This may take a moment...",
    });
    
    setIsGenerating(true);
    try {
      const generatedStyle = await generateStyle(prompt, uploadedImage, activeLayer);
      setStyleForLayer(activeLayer, generatedStyle);
      
      // Security: Don't expose internal error details in success message
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
      
      // Security: Provide user-friendly error messages
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

  const isDisabled = isGenerating || (!prompt && !uploadedImage) || isAuthenticated === false;

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
          Login Required
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
