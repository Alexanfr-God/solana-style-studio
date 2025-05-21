
import React from 'react';
import { Button } from '@/components/ui/button';
import { Cat, CreditCard, Flame, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface MaskExamplesSectionProps {
  setCustomMask: (mask: string | null) => void;
  setTopLayer: (layer: string | null) => void;
  setBottomLayer: (layer: string | null) => void;
  handleRemoveMask: () => void;
  showJson: boolean;
  handleToggleJson: () => void;
  customMask: string | null;
  topLayer: string | null;
  bottomLayer: string | null;
}

export const MaskExamplesSection = ({ 
  setCustomMask, 
  setTopLayer, 
  setBottomLayer, 
  handleRemoveMask, 
  showJson, 
  handleToggleJson,
  customMask,
  topLayer,
  bottomLayer
}: MaskExamplesSectionProps) => {
  
  const applyMaskLayers = (maskType: 'cats' | 'crypto' | 'pepe') => {
    // Clear any custom mask
    setCustomMask(null);
    
    // Set top and bottom layers based on the selected mask type
    switch (maskType) {
      case 'cats':
        // Using external mask that surrounds the wallet with a transparent center
        setTopLayer(null);
        setBottomLayer(null);
        setCustomMask('/external-masks/cats-mask.png');
        toast.success('Cute Cats mask applied');
        break;
      case 'crypto':
        // Apply the crypto meme as a single unified custom mask with transparent center
        setTopLayer(null);
        setBottomLayer(null);
        setCustomMask('/external-masks/crypto-mask.png');
        toast.success('Crypto Meme mask applied');
        break;
      case 'pepe':
        // Apply pepe with transparent center
        setTopLayer(null);
        setBottomLayer(null);
        setCustomMask('/external-masks/pepe-mask.png');
        toast.success('Pepe Hacker mask applied');
        break;
    }
  };

  return (
    <>
      <Separator className="bg-white/10" />
      
      {/* Example Masks (V3 Beta) Section */}
      <div className="rounded-lg border border-white/10 p-4 bg-black/30">
        <h3 className="text-white font-medium mb-3 flex items-center gap-2">
          🎨 Try Example Mask
        </h3>
        <p className="text-sm text-white/60 mb-4">
          This is a demo of how custom Wallet Masks work. The masks appear around the wallet UI, leaving the center transparent. Try it now!
        </p>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-4 border-white/10 bg-black/20 hover:bg-black/40"
            onClick={() => applyMaskLayers('cats')}
          >
            <Cat className="h-8 w-8 mb-2 text-purple-300" />
            <span className="text-xs text-white/80">Cute Cats</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-4 border-white/10 bg-black/20 hover:bg-black/40"
            onClick={() => applyMaskLayers('crypto')}
          >
            <CreditCard className="h-8 w-8 mb-2 text-blue-300" />
            <span className="text-xs text-white/80">Crypto Meme</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex flex-col items-center py-4 border-white/10 bg-black/20 hover:bg-black/40"
            onClick={() => applyMaskLayers('pepe')}
          >
            <Flame className="h-8 w-8 mb-2 text-green-400" />
            <span className="text-xs text-white/80">Pepe Hacker</span>
          </Button>
        </div>
        
        <Button
          variant="destructive"
          onClick={handleRemoveMask}
          className="w-full flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Remove Mask
        </Button>
      </div>
      
      <Separator className="my-4 bg-white/10" />
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">Show JSON</span>
        <Button
          variant="ghost"
          onClick={handleToggleJson}
          size="sm"
          className={`${showJson ? 'bg-purple-500/20 text-purple-300' : 'bg-transparent text-white/40'}`}
        >
          {showJson ? 'Hide' : 'Show'}
        </Button>
      </div>
      
      {showJson && (
        <div className="mt-3 bg-black/50 border border-white/10 rounded p-3 overflow-auto max-h-40">
          <pre className="text-xs text-green-400">
            {JSON.stringify({
              name: "Custom Wallet Mask",
              styles: {
                mask: customMask ? "external" : "none",
                topLayer: topLayer ? topLayer.split('/').pop() : null,
                bottomLayer: bottomLayer ? bottomLayer.split('/').pop() : null,
                theme: "dark",
                scale: 1.0
              },
              metadata: {
                version: "v3",
                generated: new Date().toISOString()
              }
            }, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="rounded-lg border border-white/10 p-4 bg-black/30 flex flex-col space-y-3 mt-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-white/40 text-xs">MASK PREVIEW TIPS</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>
        
        <ul className="text-sm text-white/60 space-y-2 list-disc pl-5">
          <li>Masks appear around the wallet UI, not over it</li>
          <li>The wallet UI area (320×569px) always remains visible</li>
          <li>Use PNG with transparent center where the wallet UI will be visible</li>
          <li>Light colors work best on the dark wallet background</li>
        </ul>
      </div>
    </>
  );
};
