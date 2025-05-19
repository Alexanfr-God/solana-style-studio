
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Wand } from 'lucide-react';
import { generateMask } from '@/services/maskService';

const GenerateMaskButton = () => {
  const { 
    prompt, 
    activeLayer, 
    maskImageUrl,
    setSelectedMask, 
    isGenerating, 
    setIsGenerating 
  } = useMaskEditorStore();

  const handleGenerate = async () => {
    if (!prompt && !maskImageUrl) {
      toast.error("Please enter a description or upload an image first");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedMask = await generateMask(prompt, activeLayer, maskImageUrl);
      setSelectedMask(generatedMask);
      
      toast.success("Wallet costume generated successfully");
    } catch (error) {
      console.error("Error generating mask:", error);
      toast.error("Failed to generate costume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      className="w-full"
      disabled={isGenerating || (!prompt && !maskImageUrl)}
    >
      <Wand className="mr-2 h-4 w-4" />
      {isGenerating ? 'Generating Costume...' : 'Generate Costume'}
    </Button>
  );
};

export default GenerateMaskButton;
