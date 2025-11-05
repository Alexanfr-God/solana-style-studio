import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Code2, Palette, Ruler, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const DevToolsPanel = () => {
  const { currentElement } = useAiScannerStore();
  
  if (!currentElement) {
    return (
      <div className="p-4">
        <div className="p-8 bg-muted/50 rounded-lg text-center space-y-3">
          <Code2 className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Click an element on the canvas to view its CSS properties
          </p>
        </div>
      </div>
    );
  }
  
  const { metrics, style, status, type, role, aiComment, aiConfidence } = currentElement;
  
  const statusColors = {
    found: 'bg-green-500',
    copied: 'bg-blue-500',
    verified: 'bg-emerald-500'
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Element Inspector</h3>
        </div>
        <Badge 
          variant="outline" 
          className={`${statusColors[status]} text-white border-0`}
        >
          {status}
        </Badge>
      </div>
      
      {/* Element Info */}
      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Type:</span>
          <Badge variant="secondary">{type}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Role:</span>
          <span className="font-mono text-xs">{role}</span>
        </div>
      </div>
      
      <Separator />
      
      {/* AI Commentary */}
      {aiComment && (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h4 className="text-xs font-semibold">AI Analysis</h4>
              {aiConfidence && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(aiConfidence * 100)}% confidence
                </Badge>
              )}
            </div>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-xs text-foreground/80 leading-relaxed">
                {aiComment}
              </p>
            </div>
          </div>
          <Separator />
        </>
      )}
      
      {/* CSS Properties */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" />
          <h4 className="text-xs font-semibold">CSS Properties</h4>
        </div>
        
        {/* Dimensions */}
        {metrics && (
          <>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Dimensions</div>
              <div className="font-mono text-sm bg-muted/50 px-3 py-2 rounded">
                {metrics.width} × {metrics.height} px
              </div>
            </div>
            
            {/* Border Radius */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Border Radius</div>
              <div className="font-mono text-sm bg-muted/50 px-3 py-2 rounded">
                {metrics.radius || 'none'}
              </div>
            </div>
            
            {/* Background Color */}
            {metrics.bg && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Background</div>
                <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded">
                  <div 
                    className="w-8 h-8 rounded border border-border shadow-sm"
                    style={{ backgroundColor: metrics.bg }}
                  />
                  <span className="font-mono text-xs text-foreground/80">
                    {metrics.bg}
                  </span>
                </div>
              </div>
            )}
            
            {/* Font Family */}
            {metrics.font && (
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Font Family</div>
                <div className="font-mono text-sm bg-muted/50 px-3 py-2 rounded truncate">
                  {metrics.font.split(',')[0].replace(/['"]/g, '')}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Additional Style Properties */}
        {style && Object.keys(style).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-semibold">Style Details</h4>
              </div>
              <div className="space-y-1 text-xs font-mono bg-muted/50 px-3 py-2 rounded">
                {style.text && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">text:</span>
                    <span className="truncate text-right">{style.text}</span>
                  </div>
                )}
                {style.border && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">border:</span>
                    <span className="truncate text-right">{style.border}</span>
                  </div>
                )}
                {style.radius && (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">radius:</span>
                    <span className="truncate text-right">{style.radius}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Copy to clipboard hint */}
      <div className="pt-2 text-xs text-muted-foreground text-center">
        Click different elements to inspect their styles
      </div>
    </motion.div>
  );
};
