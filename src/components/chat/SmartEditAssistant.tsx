// LEGACY COMPONENT - DO NOT USE
// This component has been replaced by src/components/ai/ThemeChat.tsx
// All new AI chat features should be added to ThemeChat.tsx only
// This file is kept for reference but should not be modified

import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Wand2, Eye, Type, Layout } from 'lucide-react';

interface SmartEditAssistantProps {
  selectedElement: WalletElement | null;
  isEditMode: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export const SmartEditAssistant: React.FC<SmartEditAssistantProps> = ({
  selectedElement,
  isEditMode,
  onSuggestionClick
}) => {
  if (!isEditMode || !selectedElement) return null;

  const getElementSuggestions = () => {
    const elementType = selectedElement.type;
    const elementName = selectedElement.name;

    switch (elementType) {
      case 'button':
        return [
          `Make ${elementName} button more prominent with purple gradient`,
          `Add hover effects to ${elementName}`,
          `Change ${elementName} button to rounded corners`,
          `Make ${elementName} glow with neon effect`
        ];
      case 'text':
        return [
          `Make ${elementName} text bolder and larger`,
          `Change ${elementName} font to modern sans-serif`,
          `Add gradient text effect to ${elementName}`,
          `Center align ${elementName} text`
        ];
      case 'icon':
        return [
          `Add colorful gradient to ${elementName} icon`,
          `Make ${elementName} icon larger and more visible`,
          `Add animation to ${elementName} icon`,
          `Change ${elementName} icon color to match theme`
        ];
      case 'container':
        return [
          `Add subtle background to ${elementName}`,
          `Add border radius to ${elementName} container`,
          `Apply glass effect to ${elementName}`,
          `Add shadow to ${elementName} container`
        ];
      default:
        return [
          `Style ${elementName} with modern design`,
          `Add visual effects to ${elementName}`,
          `Make ${elementName} more prominent`,
          `Apply gradient colors to ${elementName}`
        ];
    }
  };

  const getSuggestionIcon = (suggestion: string) => {
    if (suggestion.includes('gradient') || suggestion.includes('color')) return <Palette className="h-3 w-3" />;
    if (suggestion.includes('effect') || suggestion.includes('glow')) return <Wand2 className="h-3 w-3" />;
    if (suggestion.includes('font') || suggestion.includes('text')) return <Type className="h-3 w-3" />;
    if (suggestion.includes('visible') || suggestion.includes('prominent')) return <Eye className="h-3 w-3" />;
    return <Layout className="h-3 w-3" />;
  };

  const suggestions = getElementSuggestions();

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-purple-400" />
            <h4 className="text-sm font-semibold text-white">
              Smart Suggestions for "{selectedElement.name}"
            </h4>
          </div>
          
          <div className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
            Type: {selectedElement.type} | Screen: {selectedElement.screen}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className="h-auto p-2 text-left justify-start text-wrap border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10 text-white/90 hover:text-white"
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="mt-0.5 text-purple-400">
                    {getSuggestionIcon(suggestion)}
                  </div>
                  <span className="text-xs leading-relaxed">{suggestion}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-xs text-white/60 text-center pt-2 border-t border-white/10">
            💡 Click any suggestion to apply AI styling
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartEditAssistant;
