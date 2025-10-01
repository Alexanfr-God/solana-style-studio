import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ColorScheme {
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
  };
}

interface ColorSchemeCardProps {
  scheme: ColorScheme;
  onApply: (scheme: ColorScheme) => void;
  isApplying?: boolean;
  isApplied?: boolean;
}

const ColorSchemeCard: React.FC<ColorSchemeCardProps> = ({ 
  scheme, 
  onApply, 
  isApplying = false,
  isApplied = false 
}) => {
  return (
    <Card 
      className="group relative overflow-hidden border-2 border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 animate-fade-in"
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <h3 className="font-bold text-white text-base">{scheme.name}</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
              {scheme.description}
            </p>
          </div>
          
          {isApplied && (
            <div className="flex items-center gap-1 text-green-400 text-xs animate-scale-in">
              <CheckCircle2 className="h-3 w-3" />
              <span>Applied</span>
            </div>
          )}
        </div>

        {/* Color Preview */}
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1">
            <div 
              className="h-12 rounded-md border border-white/20 shadow-sm transition-transform duration-200 group-hover:scale-105" 
              style={{ backgroundColor: scheme.colors.background }}
              title={scheme.colors.background}
            />
            <p className="text-[9px] text-white/40 text-center font-mono uppercase tracking-wider">BG</p>
          </div>
          <div className="space-y-1">
            <div 
              className="h-12 rounded-md border border-white/20 shadow-sm transition-transform duration-200 group-hover:scale-105" 
              style={{ backgroundColor: scheme.colors.text }}
              title={scheme.colors.text}
            />
            <p className="text-[9px] text-white/40 text-center font-mono uppercase tracking-wider">Text</p>
          </div>
          <div className="space-y-1">
            <div 
              className="h-12 rounded-md border border-white/20 shadow-sm transition-transform duration-200 group-hover:scale-105" 
              style={{ backgroundColor: scheme.colors.accent }}
              title={scheme.colors.accent}
            />
            <p className="text-[9px] text-white/40 text-center font-mono uppercase tracking-wider">Accent</p>
          </div>
          <div className="space-y-1">
            <div 
              className="h-12 rounded-md border border-white/20 shadow-sm transition-transform duration-200 group-hover:scale-105" 
              style={{ backgroundColor: scheme.colors.secondary }}
              title={scheme.colors.secondary}
            />
            <p className="text-[9px] text-white/40 text-center font-mono uppercase tracking-wider">2nd</p>
          </div>
        </div>

        {/* Apply Button */}
        <Button 
          onClick={() => onApply(scheme)}
          disabled={isApplying || isApplied}
          className="w-full h-9 text-sm font-medium bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isApplying ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Applying...</span>
            </div>
          ) : isApplied ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Applied</span>
            </div>
          ) : (
            <span>Apply This Scheme</span>
          )}
        </Button>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorSchemeCard;
