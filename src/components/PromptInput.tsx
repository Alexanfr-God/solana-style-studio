
import React from 'react';
import { useCustomizationStore } from '../stores/customizationStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

const PromptInput = () => {
  const { prompt, setPrompt } = useCustomizationStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <FileText className="h-5 w-5" />
        <Label htmlFor="prompt" className="text-sm font-medium">Style Description</Label>
      </div>
      <Textarea
        id="prompt"
        placeholder="Describe your desired style. For example: 'Modern dark theme with neon purple accents and rounded corners'"
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[100px] resize-none"
      />
    </div>
  );
};

export default PromptInput;
