
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMaskEditorStore } from '../../../stores/maskEditorStore';

const MaskPromptInput = () => {
  const { prompt, setPrompt } = useMaskEditorStore();

  const examplePrompts = [
    "Pepe with glasses hugging wallet",
    "Doge paws holding the wallet",
    "Cartoon astronaut in space surrounding wallet",
    "Egyptian hieroglyphs framing the screen",
    "Japanese koi fish swimming around wallet"
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Edit className="h-5 w-5 text-white" />
          <Label htmlFor="mask-prompt" className="text-white">Mask Description</Label>
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
                    <li 
                      key={index} 
                      className="cursor-pointer hover:text-primary" 
                      onClick={() => setPrompt(example)}
                    >
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
        placeholder="Describe the decoration to surround your wallet (e.g., 'Pepe with glasses hugging wallet')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[100px] resize-none bg-white/10 backdrop-blur-sm border-white/20 text-white"
      />
      
      <div className="text-xs text-white/60 italic">
        Important: The core UI area will remain clear. Your decoration will be applied around the central wallet interface.
      </div>
    </div>
  );
};

export default MaskPromptInput;
