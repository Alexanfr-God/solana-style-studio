
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
    { value: 'modern', label: 'Modern Digital Art' },
    { value: 'cartoon', label: 'Cartoon Style' },
    { value: 'realistic', label: 'Realistic' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'minimalist', label: 'Minimalist' },
  ];

  const promptExamples = [
    "Cute animals surrounding the wallet",
    "Abstract geometric shapes around the wallet",
    "Luxury gold ornamental pattern as a frame",
    "Cyberpunk neon elements surrounding the wallet",
    "Space and planets scene with central transparent area"
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mask-style" className="text-sm text-white/80">Art Style</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-white/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p className="text-xs">Select an art style to guide the AI generation. This will be added to your prompt.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="relative">
          <select 
            value={maskStyle} 
            onChange={(e) => handleStyleChange(e.target.value)}
            disabled={disabled}
            className="w-full h-10 px-3 py-2 bg-black/20 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            <option value="" disabled className="bg-black text-white">Choose a style</option>
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
          <Label htmlFor="mask-prompt" className="text-sm text-white/80">Describe your wallet costume</Label>
          
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
          placeholder="Example: A cute cat hugging the wallet, with transparent center"
          value={prompt}
          onChange={handlePromptChange}
          disabled={disabled}
          className="resize-none h-24 bg-black/20 border-white/10 placeholder:text-white/30 focus-visible:ring-purple-500"
        />
        
        <p className="text-xs text-white/50 italic mt-1">
          Tip: Describe decorative elements that surround the wallet. The central wallet area (320×569px) will always remain visible with a transparent cutout.
        </p>
      </div>
    </div>
  );
};

export default MaskPromptInput;
