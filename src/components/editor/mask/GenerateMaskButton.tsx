
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
    setSelectedMask, 
    isGenerating, 
    setIsGenerating 
  } = useMaskEditorStore();

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a mask description first");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedMask = await generateMask(prompt, activeLayer);
      setSelectedMask(generatedMask);
      
      toast.success("Mask generated successfully");
    } catch (error) {
      console.error("Error generating mask:", error);
      toast.error("Failed to generate mask. Please try again.");
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
      <Wand className="mr-2 h-4 w-4" />
      {isGenerating ? 'Generating Mask...' : 'Generate Mask'}
    </Button>
  );
};

export default GenerateMaskButton;
