
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore, ImageGenerationMode } from '@/stores/chatStore';
import { Brain, Image, Sparkles } from 'lucide-react';

const ImageGenerationSelector = () => {
  const { imageGenerationMode, setImageGenerationMode } = useChatStore();

  const modes: Array<{
    key: ImageGenerationMode;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
  }> = [
    {
      key: 'analysis',
      label: 'Style Analysis',
      icon: <Brain className="w-4 h-4" />,
      description: 'Analyze images and apply color schemes',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      key: 'dalle',
      label: 'DALL-E Images',
      icon: <Image className="w-4 h-4" />,
      description: 'Generate realistic backgrounds with DALL-E',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      key: 'replicate',
      label: 'Replicate Art',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Create artistic images with Replicate',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/60 uppercase tracking-wide font-medium">
        AI Generation Mode
      </p>
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <Button
            key={mode.key}
            variant={imageGenerationMode === mode.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setImageGenerationMode(mode.key)}
            className={`
              flex items-center gap-2 text-xs transition-all
              ${imageGenerationMode === mode.key 
                ? `${mode.color} text-white` 
                : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
            <span className="sm:hidden">{mode.key === 'analysis' ? 'Style' : mode.key === 'dalle' ? 'DALL-E' : 'Art'}</span>
          </Button>
        ))}
      </div>
      
      {/* Mode Description */}
      <div className="text-xs text-white/50 mt-2">
        {modes.find(m => m.key === imageGenerationMode)?.description}
      </div>
      
      {/* Quick Prompts based on mode */}
      <div className="flex flex-wrap gap-1 mt-2">
        {imageGenerationMode === 'dalle' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-green-400 hover:text-green-300 h-6 px-2"
              onClick={() => {
                const { sendImageGenerationMessage } = useChatStore.getState();
                sendImageGenerationMessage({ content: 'Generate a cosmic nebula background', mode: 'dalle' });
              }}
            >
              Cosmic
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-green-400 hover:text-green-300 h-6 px-2"
              onClick={() => {
                const { sendImageGenerationMessage } = useChatStore.getState();
                sendImageGenerationMessage({ content: 'Generate a neon cyberpunk background', mode: 'dalle' });
              }}
            >
              Cyberpunk
            </Button>
          </>
        )}
        
        {imageGenerationMode === 'replicate' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-purple-400 hover:text-purple-300 h-6 px-2"
              onClick={() => {
                const { sendImageGenerationMessage } = useChatStore.getState();
                sendImageGenerationMessage({ content: 'Create abstract crypto art', mode: 'replicate' });
              }}
            >
              Abstract
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-purple-400 hover:text-purple-300 h-6 px-2"
              onClick={() => {
                const { sendImageGenerationMessage } = useChatStore.getState();
                sendImageGenerationMessage({ content: 'Generate pepe meme art', mode: 'replicate' });
              }}
            >
              Meme Art
            </Button>
          </>
        )}
        
        {imageGenerationMode === 'analysis' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
              onClick={() => {
                const { sendMessage } = useChatStore.getState();
                sendMessage({ content: 'Make it dark mode with neon accents' });
              }}
            >
              Dark Mode
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
              onClick={() => {
                const { sendMessage } = useChatStore.getState();
                sendMessage({ content: 'Apply luxury gold theme' });
              }}
            >
              Luxury
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationSelector;
