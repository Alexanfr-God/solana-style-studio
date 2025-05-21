
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InfoCircle, Sparkles } from 'lucide-react';
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
    "Abstract geometric shapes",
    "Luxury gold ornamental pattern",
    "Cyberpunk neon elements",
    "Space and planets scene"
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="mask-style" className="text-sm text-white/80">Art Style</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircle className="h-4 w-4 text-white/50 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p className="text-xs">Select an art style to guide the AI generation. This will be added to your prompt.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <Select value={maskStyle} onValueChange={handleStyleChange} disabled={disabled}>
          <SelectTrigger className="bg-black/20 border-white/10">
            <SelectValue placeholder="Choose a style" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-white/10">
            {styleOptions.map((style) => (
              <SelectItem key={style.value} value={style.value} className="text-white">
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          placeholder="Example: A cute cat hugging the wallet, digital art style"
          value={prompt}
          onChange={handlePromptChange}
          disabled={disabled}
          className="resize-none h-24 bg-black/20 border-white/10 placeholder:text-white/30 focus-visible:ring-purple-500"
        />
        
        <p className="text-xs text-white/50 italic mt-1">
          Tip: Describe decorative elements that go around the wallet UI. The AI will leave the central wallet area untouched.
        </p>
      </div>
    </div>
  );
};

export default MaskPromptInput;
