
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MaskPromptInputProps {
  disabled?: boolean;
}

const MaskPromptInput = ({ disabled = false }: MaskPromptInputProps) => {
  const { prompt, setPrompt } = useMaskEditorStore();

  return (
    <div className="space-y-2">
      <Label htmlFor="prompt" className="text-sm font-medium text-white">
        Costume Description
      </Label>
      <Textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the wallet costume you want (e.g. 'A cyberpunk Wallet with neon colors and digital effects')"
        className="min-h-[80px] bg-black/20 border-white/10 placeholder:text-white/30 text-white"
        disabled={disabled}
      />
    </div>
  );
};

export default MaskPromptInput;
