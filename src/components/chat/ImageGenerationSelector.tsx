
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
      description: 'Analyze images and apply color schemes to wallet elements',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      key: 'dalle',
      label: 'DALL-E Images',
      icon: <Image className="w-4 h-4" />,
      description: 'Generate realistic backgrounds with DALL-E (describe what you want)',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      key: 'replicate',
      label: 'Replicate Art',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Create artistic images with Replicate (describe your vision)',
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
      
      {/* Mode-specific tips instead of fixed prompts */}
      <div className="text-xs text-white/40 mt-2 p-2 bg-white/5 rounded">
        {imageGenerationMode === 'dalle' && (
          <p>💡 Tips: Try "cosmic nebula background", "neon cyberpunk cityscape", or "abstract crypto patterns"</p>
        )}
        
        {imageGenerationMode === 'replicate' && (
          <p>💡 Tips: Try "abstract crypto art", "pepe meme style", or "digital art with crypto symbols"</p>
        )}
        
        {imageGenerationMode === 'analysis' && (
          <p>💡 Tips: Try "make it dark mode with neon accents", "apply luxury gold theme", or upload an inspiration image</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationSelector;
