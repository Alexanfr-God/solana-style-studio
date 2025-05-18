
import React from 'react';
import { useCustomizationStore } from '../../stores/customizationStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PromptInput = () => {
  const { prompt, setPrompt } = useCustomizationStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const examplePrompts = [
    "Gucci cat",
    "Cyberpunk neon city",
    "Peaceful zen garden",
    "Abstract geometric shapes",
    "Luxury gold and diamond theme"
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-white" />
          <Label htmlFor="prompt" className="text-white">AI Style Description</Label>
        </div>
        
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
                <p className="font-medium">Try these prompts:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {examplePrompts.map((example, index) => (
                    <li key={index} className="cursor-pointer hover:text-primary" onClick={() => setPrompt(example)}>
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
        id="prompt"
        placeholder="Describe your desired style (e.g., 'Gucci cat', 'Cyberpunk neon', 'Luxury gold pattern')"
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[100px] resize-none bg-white/10 backdrop-blur-sm border-white/20 text-white"
      />
      
      <div className="text-xs text-white/60 italic">
        For best results, keep your descriptions simple and specific. The AI will generate a stylish background and matching color scheme.
      </div>
    </div>
  );
};

export default PromptInput;
