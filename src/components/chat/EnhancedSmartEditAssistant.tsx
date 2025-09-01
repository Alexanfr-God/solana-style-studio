import React, { useState } from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Wand2, Eye, Type, Layout, Lightbulb, Zap, Heart } from 'lucide-react';

interface EnhancedSmartEditAssistantProps {
  selectedElement: WalletElement | null;
  isEditMode: boolean;
  onSuggestionClick: (suggestion: string) => void;
  elementHistory?: WalletElement[];
}

export const EnhancedSmartEditAssistant: React.FC<EnhancedSmartEditAssistantProps> = ({
  selectedElement,
  isEditMode,
  onSuggestionClick,
  elementHistory = []
}) => {
  const [activeCategory, setActiveCategory] = useState<'quick' | 'advanced' | 'creative'>('quick');

  if (!isEditMode || !selectedElement) return null;

  const getQuickSuggestions = () => {
    const elementType = selectedElement.type;
    const elementName = selectedElement.name;

    switch (elementType) {
      case 'button':
        return [
          `Add purple gradient to ${elementName}`,
          `Make ${elementName} glow on hover`,
          `Round corners of ${elementName}`,
          `Add shadow to ${elementName}`
        ];
      case 'text':
        return [
          `Make ${elementName} bold and larger`,
          `Add gradient effect to ${elementName}`,
          `Change ${elementName} to modern font`,
          `Center align ${elementName}`
        ];
      case 'icon':
        return [
          `Colorize ${elementName} with theme`,
          `Make ${elementName} larger`,
          `Add animation to ${elementName}`,
          `Apply gradient to ${elementName}`
        ];
      default:
        return [
          `Style ${elementName} with modern design`,
          `Add visual effects to ${elementName}`,
          `Make ${elementName} more prominent`,
          `Apply theme colors to ${elementName}`
        ];
    }
  };

  const getAdvancedSuggestions = () => [
    `Create a comprehensive design system for ${selectedElement.name}`,
    `Apply advanced CSS animations and transitions`,
    `Implement responsive design optimizations`,
    `Add accessibility improvements and focus states`
  ];

  const getCreativeSuggestions = () => [
    `Transform ${selectedElement.name} with cyberpunk aesthetic`,
    `Apply glassmorphism effect with backdrop blur`,
    `Create neon glow effect with multiple shadows`,
    `Design with minimalist Scandinavian style`
  ];

  const getSuggestionsByCategory = () => {
    switch (activeCategory) {
      case 'quick': return getQuickSuggestions();
      case 'advanced': return getAdvancedSuggestions();
      case 'creative': return getCreativeSuggestions();
      default: return getQuickSuggestions();
    }
  };

  const getSuggestionIcon = (suggestion: string) => {
    if (suggestion.includes('gradient') || suggestion.includes('color')) return <Palette className="h-3 w-3" />;
    if (suggestion.includes('glow') || suggestion.includes('shadow')) return <Zap className="h-3 w-3" />;
    if (suggestion.includes('font') || suggestion.includes('text')) return <Type className="h-3 w-3" />;
    if (suggestion.includes('animation') || suggestion.includes('effect')) return <Wand2 className="h-3 w-3" />;
    return <Layout className="h-3 w-3" />;
  };

  const suggestions = getSuggestionsByCategory();

  return (
    <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-white">
                Smart Suggestions
              </h4>
            </div>
            <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
              {selectedElement.type}
            </Badge>
          </div>
          
          {/* Element Info */}
          <div className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded flex items-center justify-between">
            <span>"{selectedElement.name}" | {selectedElement.screen}</span>
            {elementHistory.length > 0 && (
              <span className="text-purple-400">
                <Heart className="h-3 w-3 inline mr-1" />
                {elementHistory.length} recent
              </span>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1">
            {(['quick', 'advanced', 'creative'] as const).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`h-7 px-2 text-xs ${
                  activeCategory === category 
                    ? 'bg-purple-600 text-white' 
                    : 'text-purple-300 hover:bg-purple-500/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Suggestions */}
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

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSuggestionClick(`Reset ${selectedElement.name} to default style`)}
              className="h-6 px-2 text-xs text-orange-400 hover:bg-orange-500/10"
            >
              Reset Style
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSuggestionClick(`Copy style from previous element to ${selectedElement.name}`)}
              className="h-6 px-2 text-xs text-blue-400 hover:bg-blue-500/10"
              disabled={elementHistory.length === 0}
            >
              Copy Style
            </Button>
          </div>

          <div className="text-xs text-white/60 text-center pt-1">
            💡 Use ↑↓ arrows to navigate history | ESC to exit
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSmartEditAssistant;
