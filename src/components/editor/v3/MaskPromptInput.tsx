
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const MaskPromptInput = () => {
  const { prompt, setPrompt } = useMaskEditorStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="mask-prompt" className="text-sm text-white/80">
        Describe your wallet costume
      </Label>
      
      <Textarea
        id="mask-prompt"
        placeholder="Example: Pepe hugging a wallet in vaporwave style"
        value={prompt}
        onChange={handlePromptChange}
        className="resize-none h-24 bg-black/20 border-white/10 placeholder:text-white/30 focus-visible:ring-purple-500"
      />
      
      <p className="text-xs text-white/50 italic">
        Tip: The AI will create decorative elements around your wallet while keeping the center transparent for the UI.
      </p>
    </div>
  );
};

export default MaskPromptInput;
