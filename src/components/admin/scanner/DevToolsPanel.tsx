import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const DevToolsPanel = () => {
  const { currentElement } = useAiScannerStore();
  
  if (!currentElement) {
    return (
      <div className="p-4">
        <div className="p-8 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Select an element to view metrics
          </p>
        </div>
      </div>
    );
  }
  
  const { metrics, style, status } = currentElement;
  
  const statusColors = {
    found: 'bg-blue-500',
    copied: 'bg-purple-500',
    verified: 'bg-green-500'
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Element Metrics</h3>
        <Badge 
          variant="outline" 
          className={`${statusColors[status]} text-white border-0`}
        >
          {status}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {/* Dimensions */}
        {metrics && (
          <>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Dimensions</div>
              <div className="font-mono text-sm">
                {metrics.width} × {metrics.height} px
              </div>
            </div>
            
            <Separator />
            
            {/* Border Radius */}
            <div>
              <div className="text-xs text-muted-foreground mb-1">Border Radius</div>
              <div className="font-mono text-sm">
                {metrics.radius || 'none'}
              </div>
            </div>
            
            <Separator />
            
            {/* Background */}
            {metrics.bg && (
              <>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Background</div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: metrics.bg }}
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {metrics.bg}
                    </span>
                  </div>
                </div>
                
                <Separator />
              </>
            )}
            
            {/* Font */}
            {metrics.font && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Font Family</div>
                <div className="font-mono text-sm truncate">
                  {metrics.font.split(',')[0].replace(/['"]/g, '')}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Style Info */}
        {style && Object.keys(style).length > 0 && (
          <>
            <Separator />
            <div>
              <div className="text-xs text-muted-foreground mb-2">Style Properties</div>
              <div className="space-y-1 text-xs font-mono">
                {style.text && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">text:</span>
                    <span className="truncate ml-2">{style.text}</span>
                  </div>
                )}
                {style.border && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">border:</span>
                    <span className="truncate ml-2">{style.border}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
