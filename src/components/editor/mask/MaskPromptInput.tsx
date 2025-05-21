
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MaskPromptInputProps {
  disabled?: boolean;
}

const MaskPromptInput = ({ disabled = false }: MaskPromptInputProps) => {
  const { prompt, setPrompt } = useMaskEditorStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="mask-prompt" className="text-sm text-white/80">Describe your wallet costume</Label>
      <Textarea
        id="mask-prompt"
        placeholder="Example: A cute cat hugging the wallet, digital art style"
        value={prompt}
        onChange={handlePromptChange}
        disabled={disabled}
        className="resize-none h-24 bg-black/20 border-white/10 placeholder:text-white/30 focus-visible:ring-purple-500"
      />
      <p className="text-xs text-white/50 italic mt-1">
        Tip: Describe decorative elements that go around the wallet UI, like animals, characters, or abstract designs.
      </p>
    </div>
  );
};

export default MaskPromptInput;
