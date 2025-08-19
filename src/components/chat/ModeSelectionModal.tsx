
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useChatStore } from '@/stores/chatStore';
import { ChatMode } from '@/config/api';
import { 
  Brain, 
  Image, 
  Sparkles,
  Settings
} from 'lucide-react';

const ModeSelectionModal = () => {
  const { chatMode, setChatMode } = useChatStore();
  const [open, setOpen] = React.useState(false);

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
      icon: <Brain className="w-5 h-5" />,
      description: 'Analyze wallet style and apply smart customizations',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      key: 'leonardo',
      label: 'Leonardo AI',
      icon: <Image className="w-5 h-5" />,
      description: 'Generate artistic backgrounds with Leonardo.ai',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      key: 'replicate',
      label: 'Replicate Art',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Create unique art backgrounds with Replicate',
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const currentMode = modes.find(m => m.key === chatMode);

  const handleModeSelect = (mode: ChatMode) => {
    setChatMode(mode);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 text-white/80 hover:text-white hover:bg-white/10"
        >
          {currentMode?.icon}
          <span className="text-sm font-medium">{currentMode?.label}</span>
          <Settings className="w-4 h-4 opacity-60" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-black/90 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Select AI Generation Mode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {modes.map((mode) => (
            <Button
              key={mode.key}
              variant={chatMode === mode.key ? 'default' : 'outline'}
              onClick={() => handleModeSelect(mode.key)}
              className={`
                flex items-center gap-3 text-left transition-all h-auto py-4 px-4 w-full justify-start
                ${chatMode === mode.key 
                  ? `${mode.color} text-white` 
                  : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {mode.icon}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{mode.label}</span>
                <span className="text-xs opacity-70">{mode.description}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {/* Mode-specific tips */}
        <div className="text-xs text-white/40 mt-4 p-3 bg-white/5 rounded">
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
      </DialogContent>
    </Dialog>
  );
};

export default ModeSelectionModal;
