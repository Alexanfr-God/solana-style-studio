
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore, ChatMode } from '@/stores/chatStore';
import { 
  Brain, 
  Image, 
  Sparkles
} from 'lucide-react';

const ModeSelector = () => {
  // ✅ ИСПРАВЛЕНИЕ ЭТАП 2: Используем унифицированный chatMode
  const { chatMode, setChatMode } = useChatStore();

  const modes: Array<{
    key: ChatMode;
    label: string;
    icon: React.ReactNode;
    description: string;
    color: string;
  }> = [
    {
      key: 'analysis',
      label: 'Style Analysis',
      icon: <Brain className="w-4 h-4" />,
      description: 'Analyze wallet style and apply smart customizations',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      key: 'leonardo',
      label: 'Leonardo AI',
      icon: <Image className="w-4 h-4" />,
      description: 'Generate artistic backgrounds with Leonardo.ai',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      key: 'replicate',
      label: 'Replicate Art',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Create unique art backgrounds with Replicate',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/60 uppercase tracking-wide font-medium">
        AI Generation Mode
      </p>
      
      <div className="grid grid-cols-1 gap-2">
        {modes.map((mode) => (
          <Button
            key={mode.key}
            variant={chatMode === mode.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChatMode(mode.key)}
            className={`
              flex items-center gap-2 text-xs transition-all h-auto py-3 px-3 w-full justify-start
              ${chatMode === mode.key 
                ? `${mode.color} text-white` 
                : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {mode.icon}
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium">{mode.label}</span>
              <span className="text-xs opacity-70">{mode.description}</span>
            </div>
          </Button>
        ))}
      </div>
      
      {/* Mode-specific tips */}
      <div className="text-xs text-white/40 mt-2 p-2 bg-white/5 rounded">
        {chatMode === 'leonardo' && (
          <p>💡 Tips: Try "cosmic nebula background", "neon cyberpunk cityscape", or "abstract crypto patterns"</p>
        )}
        
        {chatMode === 'replicate' && (
          <p>💡 Tips: Try "cartoon trump", "abstract crypto art", "pepe meme style", or "digital art with crypto symbols"</p>
        )}
        
        {chatMode === 'analysis' && (
          <p>💡 Tips: Try "make it dark mode with neon accents", "apply luxury gold theme", or "analyze current style and improve"</p>
        )}
      </div>
    </div>
  );
};

export default ModeSelector;
