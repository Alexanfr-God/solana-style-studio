
import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Image, Sparkles, Settings } from 'lucide-react';

interface ChatStartersProps {
  onStarterClick: (message: string) => void;
}

const ChatStarters = ({ onStarterClick }: ChatStartersProps) => {
  const starters = [
    {
      icon: <Palette className="h-4 w-4" />,
      title: "Change Colors",
      message: "I want to change the color scheme of my wallet to something more modern"
    },
    {
      icon: <Image className="h-4 w-4" />,
      title: "Add Background",
      message: "Help me add a beautiful gradient background to my wallet"
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      title: "Style Analysis",
      message: "Analyze my current wallet design and suggest improvements"
    },
    {
      icon: <Settings className="h-4 w-4" />,
      title: "Customize Elements",
      message: "I want to customize the button styles and typography"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-2">
      <p className="text-sm text-white/60 mb-2">Quick start suggestions:</p>
      {starters.map((starter, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className="justify-start h-auto p-3 border-white/20 text-white/80 hover:text-white hover:bg-white/10"
          onClick={() => onStarterClick(starter.message)}
        >
          <div className="flex items-center gap-2">
            {starter.icon}
            <div className="text-left">
              <div className="font-medium text-xs">{starter.title}</div>
              <div className="text-xs opacity-70 truncate">{starter.message}</div>
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default ChatStarters;
