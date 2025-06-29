
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChatStore, ChatMode } from '@/stores/chatStore';
import { 
  Brain, 
  Image, 
  Sparkles, 
  Building2, 
  MessageCircle, 
  Palette, 
  Save, 
  Download 
} from 'lucide-react';

const ModeSelector = () => {
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
      description: 'Analyze images and apply color schemes to wallet elements',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      key: 'leonardo',
      label: 'Leonardo AI',
      icon: <Image className="w-4 h-4" />,
      description: 'Generate high-quality artistic images with Leonardo.ai',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      key: 'replicate',
      label: 'Replicate Art',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Create artistic images with Replicate AI models',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      key: 'structure',
      label: 'Structure',
      icon: <Building2 className="w-4 h-4" />,
      description: 'Analyze wallet structure and element hierarchy',
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: <MessageCircle className="w-4 h-4" />,
      description: 'Conversational AI chat with context memory',
      color: 'bg-teal-600 hover:bg-teal-700'
    },
    {
      key: 'style-analysis',
      label: 'Deep Style Inspector',
      icon: <Palette className="w-4 h-4" />,
      description: 'Advanced style analysis with comprehensive design recommendations',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      key: 'save',
      label: 'Save',
      icon: <Save className="w-4 h-4" />,
      description: 'Save current customization to community library',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      key: 'load',
      label: 'Load',
      icon: <Download className="w-4 h-4" />,
      description: 'Load customizations from community library',
      color: 'bg-cyan-600 hover:bg-cyan-700'
    }
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/60 uppercase tracking-wide font-medium">
        AI Operation Mode
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {modes.map((mode) => (
          <Button
            key={mode.key}
            variant={chatMode === mode.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChatMode(mode.key)}
            className={`
              flex items-center gap-2 text-xs transition-all h-auto py-2 px-3
              ${chatMode === mode.key 
                ? `${mode.color} text-white` 
                : 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {mode.icon}
            <span className="text-xs">{mode.label}</span>
          </Button>
        ))}
      </div>
      
      {/* Mode Description */}
      <div className="text-xs text-white/50 mt-3 p-2 bg-white/5 rounded">
        {modes.find(m => m.key === chatMode)?.description}
      </div>
      
      {/* Mode-specific tips */}
      <div className="text-xs text-white/40 mt-2 p-2 bg-white/5 rounded">
        {chatMode === 'leonardo' && (
          <p>💡 Tips: Try "cosmic nebula background", "neon cyberpunk cityscape", or "abstract crypto patterns"</p>
        )}
        
        {chatMode === 'replicate' && (
          <p>💡 Tips: Try "abstract crypto art", "pepe meme style", or "digital art with crypto symbols"</p>
        )}
        
        {chatMode === 'analysis' && (
          <p>💡 Tips: Try "make it dark mode with neon accents", "apply luxury gold theme", or upload an inspiration image</p>
        )}
        
        {chatMode === 'structure' && (
          <p>💡 Tips: Try "analyze wallet hierarchy", "show element relationships", or "optimize layout structure"</p>
        )}
        
        {chatMode === 'chat' && (
          <p>💡 Tips: Have conversations with context memory. Ask follow-up questions and build on previous responses</p>
        )}
        
        {chatMode === 'style-analysis' && (
          <p>💡 Tips: Deep dive into design analysis. Upload images for comprehensive style breakdowns and advanced recommendations</p>
        )}
        
        {chatMode === 'save' && (
          <p>💡 Tips: Save your current wallet design to share with the community. Add tags for discoverability</p>
        )}
        
        {chatMode === 'load' && (
          <p>💡 Tips: Browse and load community designs. Search by tags or popularity</p>
        )}
      </div>
    </div>
  );
};

export default ModeSelector;
