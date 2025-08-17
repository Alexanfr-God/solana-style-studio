
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChatMode } from '@/stores/chatStore';

interface ModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  availableModes: Array<{
    mode: ChatMode;
    label: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  availableModes
}) => {
  return (
    <div className="space-y-3">
      <p className="text-xs text-white/60 uppercase tracking-wide font-medium">
        AI Generation Mode
      </p>
      
      <div className="grid grid-cols-1 gap-2">
        {availableModes.map((mode) => (
          <Button
            key={mode.mode}
            variant={currentMode === mode.mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange(mode.mode)}
            className={`
              flex items-center gap-2 text-xs transition-all h-auto py-3 px-3 w-full justify-start
              ${currentMode === mode.mode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
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
        {currentMode === 'leonardo' && (
          <p>💡 Tips: Try "cosmic nebula background", "neon cyberpunk cityscape", or "abstract crypto patterns"</p>
        )}
        
        {currentMode === 'replicate' && (
          <p>💡 Tips: Try "cartoon trump", "abstract crypto art", "pepe meme style", or "digital art with crypto symbols"</p>
        )}
        
        {currentMode === 'analysis' && (
          <p>💡 Tips: Try "make it dark mode with neon accents", "apply luxury gold theme", or "analyze current style and improve"</p>
        )}

        {currentMode === 'theme-patch' && (
          <p>💡 Tips: Try "make background darker", "change accent color to purple", or "apply rounded corners"</p>
        )}
      </div>
    </div>
  );
};

export default ModeSelector;
