
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const MaskPromptInput = () => {
  const { prompt, setPrompt, isGenerating } = useMaskEditorStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div>
      <Label htmlFor="mask-prompt" className="text-white text-sm mb-2 flex">Describe your wallet costume</Label>
      <Textarea
        id="mask-prompt"
        placeholder="E.g., 'A cute cat character design that frames the wallet', 'A sleek cyberpunk frame with glowing edges'"
        className="bg-black/25 border-white/10 text-white placeholder:text-white/30 resize-none"
        value={prompt}
        onChange={handlePromptChange}
        disabled={isGenerating}
        rows={3}
      />
      <p className="text-xs text-white/60 mt-2">
        Describe a design that frames the wallet UI. The design will appear around the wallet, 
        not on top of it. Think of the wallet as floating on the canvas.
      </p>
    </div>
  );
};

export default MaskPromptInput;
