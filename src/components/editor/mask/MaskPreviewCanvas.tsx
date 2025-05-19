
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Badge } from '@/components/ui/badge';

const MaskPreviewCanvas = () => {
  const { selectedMask, safeZoneVisible } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  // Define precise safe zone based on the edge function dimensions
  const safeZone = selectedMask?.safeZone || {
    x: "80px",
    y: "108px", 
    width: "160px",
    height: "336px"
  };

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      <div className="relative max-w-[320px]">
        {/* Base wallet UI */}
        <div className="relative z-10">
          <LoginScreen style={loginStyle} />
        </div>
        
        {/* Safe zone overlay - only visible when safeZoneVisible is true */}
        {safeZoneVisible && (
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
            style={{
              background: `
                linear-gradient(to right, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0.1) ${safeZone.x}, transparent ${safeZone.x}, transparent calc(${safeZone.x} + ${safeZone.width}), rgba(255,0,0,0.1) calc(${safeZone.x} + ${safeZone.width}), rgba(255,0,0,0.1) 100%),
                linear-gradient(to bottom, rgba(255,0,0,0.1) 0%, rgba(255,0,0,0.1) ${safeZone.y}, transparent ${safeZone.y}, transparent calc(${safeZone.y} + ${safeZone.height}), rgba(255,0,0,0.1) calc(${safeZone.y} + ${safeZone.height}), rgba(255,0,0,0.1) 100%)
              `,
              boxShadow: 'inset 0 0 0 1px rgba(255,0,0,0.3)'
            }}
          >
            <div className="absolute top-0 left-0 m-1 bg-black/50 text-red-400 text-xs px-1.5 py-0.5 rounded">
              Safe Zone
            </div>
            
            {/* Add dimensions display */}
            <div className="absolute bottom-0 right-0 m-1 bg-black/50 text-red-400 text-xs px-1.5 py-0.5 rounded">
              {safeZone.width} × {safeZone.height}
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
