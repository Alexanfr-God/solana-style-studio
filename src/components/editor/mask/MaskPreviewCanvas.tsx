
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Badge } from '@/components/ui/badge';

const MaskPreviewCanvas = () => {
  const { 
    selectedMask, 
    safeZoneVisible, 
    topLayer, 
    bottomLayer,
    maskImageUrl // This will be used for custom full masks
  } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  // Define precise safe zone based on DALL-E canvas dimensions (1024x1024)
  const safeZone = selectedMask?.safeZone || {
    x: 432, // center X - width/2
    y: 344, // center Y - height/2
    width: 160,
    height: 336
  };

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      <div className="relative max-w-[320px]">
        {/* Background to represent the actual canvas where designs should appear */}
        {safeZoneVisible && (
          <div 
            className="absolute z-0" 
            style={{
              width: '250%',
              height: '250%',
              top: '-75%',
              left: '-75%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark background representing the canvas
              border: '1px dashed rgba(255, 255, 255, 0.3)'
            }}
          />
        )}
        
        {/* Base wallet UI */}
        <div className="relative z-10">
          {/* Top Layer Overlay - Positioned to slightly overlap the top of wallet */}
          {topLayer && (
            <div 
              className="absolute w-full pointer-events-none z-20"
              style={{
                top: '-205px', // Position adjusted to slightly overlap the top edge
                left: 0,
                height: '40px',
                overflow: 'visible'
              }}
            >
              <img 
                src={topLayer} 
                alt="Top mask layer" 
                className="w-full h-auto"
              />
            </div>
          )}
          
          <LoginScreen style={loginStyle} />
          
          {/* Bottom Layer Overlay - Positioned to align perfectly with the bottom edge */}
          {bottomLayer && (
            <div 
              className="absolute w-full pointer-events-none z-20"
              style={{
                bottom: '-5px', // Better positioned at bottom
                left: 0,
                height: '40px',
                overflow: 'visible'
              }}
            >
              <img 
                src={bottomLayer} 
                alt="Bottom mask layer" 
                className="w-full h-auto"
              />
            </div>
          )}
          
          {/* Full mask overlay for custom uploads */}
          {maskImageUrl && (
            <div 
              className="absolute pointer-events-none z-20"
              style={{
                top: '-205px', // Position as requested
                left: 0,
                width: '100%',
                height: 'auto',
                overflow: 'visible'
              }}
            >
              <img 
                src={maskImageUrl} 
                alt="Full mask overlay" 
                className="w-full h-auto"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'unset'
                }}
              />
            </div>
          )}
        </div>
        
        {/* Safe zone overlay - only visible when safeZoneVisible is true */}
        {safeZoneVisible && (
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%'
            }}
          >
            {/* Red highlight for the DO NOT DRAW zone */}
            <div
              className="absolute"
              style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,0,0,0.3)',
                border: '2px dashed red'
              }}
            >
              {/* "DO NOT DRAW HERE" label */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                ❌ DO NOT DRAW HERE
              </div>
              
              {/* Add dimensions display */}
              <div className="absolute bottom-0 right-0 m-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                Wallet UI: {safeZone.width} × {safeZone.height}
              </div>
            </div>
          </div>
        )}
        
        {/* Mask overlay - centered and sized to accommodate the mask content */}
        {selectedMask && (
          <div 
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 flex items-center justify-center"
          >
            <div
              style={{
                position: 'absolute',
                width: '150%', // Expanded to allow mask to grow around the wallet
                height: '150%', // Expanded to allow mask to grow around the wallet
                backgroundImage: `url(${selectedMask.imageUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          </div>
        )}
        
        {/* DEMO Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
          <Badge 
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20 rotate-[-10deg] scale-125"
          >
            DEMO
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default MaskPreviewCanvas;
