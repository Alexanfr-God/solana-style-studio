
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MaskPromptInput = () => {
  const { prompt, setPrompt } = useMaskEditorStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const examplePrompts = [
    "Cute cat ears around wallet",
    "Cyberpunk neon frame",
    "Golden luxury decorations",
    "Pepe the frog theme",
    "Anime girl holding the wallet"
  ];

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-white" />
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
        id="mask-prompt"
        placeholder="Describe your desired mask (e.g., 'Cute cat ears and paws', 'Dragon wings surrounding wallet')"
        value={prompt}
        onChange={handlePromptChange}
        className="min-h-[100px] resize-none bg-white/10 backdrop-blur-sm border-white/20 text-white"
      />
      
      <div className="text-xs text-white/60 italic">
        Describe a frame or character that will surround your wallet UI. The center area will remain clear.
      </div>
    </div>
  );
};

export default MaskPromptInput;
