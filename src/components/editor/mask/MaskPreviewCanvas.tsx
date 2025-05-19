
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Badge } from '@/components/ui/badge';

const MaskPreviewCanvas = () => {
  const { selectedMask, safeZoneVisible } = useMaskEditorStore();
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
        {/* Base wallet UI */}
        <div className="relative z-10">
          <LoginScreen style={loginStyle} />
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
            {/* Dark overlay for the entire area */}
            <div 
              className="absolute inset-0" 
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            />
            
            {/* Red highlight for the DO NOT DRAW zone */}
            <div
              className="absolute"
              style={{
                top: `${safeZone.y / 1024 * 100}%`,
                left: `${safeZone.x / 1024 * 100}%`,
                width: `${safeZone.width / 1024 * 100}%`,
                height: `${safeZone.height / 1024 * 100}%`,
                backgroundColor: 'rgba(255,0,0,0.3)',
                border: '2px dashed red'
              }}
            >
              {/* "DO NOT DRAW" label */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                ❌ DO NOT DRAW
              </div>
            </div>
            
            {/* "DRAW HERE" labels for the four sides */}
            <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              ✅ DRAW HERE
            </div>
            <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              ✅ DRAW HERE
            </div>
            <div className="absolute left-[10%] top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              ✅ DRAW HERE
            </div>
            <div className="absolute right-[10%] top-1/2 transform -translate-y-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              ✅ DRAW HERE
            </div>
            
            {/* Add dimensions display */}
            <div className="absolute bottom-0 right-0 m-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
              Safe Zone: {safeZone.width} × {safeZone.height} at ({safeZone.x}, {safeZone.y})
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
