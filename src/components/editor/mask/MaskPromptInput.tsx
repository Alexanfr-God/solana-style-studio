
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Info, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MaskPromptInputProps {
  disabled?: boolean;
}

const MaskPromptInput = ({ disabled = false }: MaskPromptInputProps) => {
  const { prompt, setPrompt, maskStyle, setMaskStyle } = useMaskEditorStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleStyleChange = (value: string) => {
    setMaskStyle(value as any);
  };

  const styleOptions = [
    { value: 'cartoon', label: 'Cartoon Style' },
    { value: 'realistic', label: 'Realistic' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'modern', label: 'Modern Digital' },
    { value: 'minimalist', label: 'Minimalist' },
  ];

  const promptExamples = [
    "cute cat character",
    "magical fairy with wings", 
    "robot guardian",
    "mystical dragon",
    "friendly monster"
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="mask-style" className="text-sm text-white/80">Art Style</Label>
        
        <div className="relative">
          <select 
            value={maskStyle} 
            onChange={(e) => handleStyleChange(e.target.value)}
            disabled={disabled}
            className="w-full h-10 px-3 py-2 bg-black/20 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {styleOptions.map((style) => (
              <option key={style.value} value={style.value} className="bg-black text-white">
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mask-prompt" className="text-sm text-white/80">Character Description</Label>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-white/60 cursor-help">
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>Examples</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="w-64 p-2">
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Try these ideas:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {promptExamples.map((example, index) => (
                      <li key={index} className="cursor-pointer hover:text-primary text-xs" onClick={() => setPrompt(example)}>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Textarea
          id="mask-prompt"
          placeholder="Example: cute cat character, magical fairy, friendly robot..."
          value={prompt}
          onChange={handlePromptChange}
          disabled={disabled}
          className="resize-none h-20 bg-black/20 border-white/10 placeholder:text-white/30 focus-visible:ring-purple-500"
        />
        
        <p className="text-xs text-white/50 italic mt-1">
          The character will appear around your wallet while keeping the central wallet area (320×569px) completely visible.
        </p>
      </div>
    </div>
  );
};

export default MaskPromptInput;
