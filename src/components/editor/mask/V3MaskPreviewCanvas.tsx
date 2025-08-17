
import React, { useEffect } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Badge } from '@/components/ui/badge';

const V3MaskPreviewCanvas = () => {
  const { 
    safeZoneVisible, 
    externalMask,
    maskImageUrl
  } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  // Updated V4 Enhanced mask cutout URL with proper coordinates
  const MASK_CUTOUT_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png';

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "V4 Enhanced wallet mask with transparent background and character interaction";

  // V4 Enhanced: Output coordinates (1024x1024 canvas)
  const OUTPUT_WIDTH = 1024;
  const OUTPUT_HEIGHT = 1024;
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;
  const WALLET_X = 352; // Centered in 1024x1024 canvas
  const WALLET_Y = 228; // Centered in 1024x1024 canvas

  // Enhanced preview scale factor for better visibility
  const PREVIEW_SCALE = 0.75;

  // Debug logging with V4 transparency tracking
  useEffect(() => {
    console.log('🔍 V4 Enhanced Preview Debug:', {
      externalMask: externalMask ? 'loaded' : 'null',
      maskImageUrl: maskImageUrl ? 'loaded' : 'null',
      safeZoneVisible,
      outputDimensions: `${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}`,
      walletDimensions: `${WALLET_WIDTH}x${WALLET_HEIGHT}`,
      walletPosition: `x=${WALLET_X}, y=${WALLET_Y}`,
      previewScale: PREVIEW_SCALE,
      actualCanvasSize: `${OUTPUT_WIDTH * PREVIEW_SCALE}x${OUTPUT_HEIGHT * PREVIEW_SCALE}`,
      actualWalletSize: `${WALLET_WIDTH * PREVIEW_SCALE}x${WALLET_HEIGHT * PREVIEW_SCALE}`,
      maskCutoutUrl: MASK_CUTOUT_URL,
      v4EnhancedTransparency: true
    });
  }, [externalMask, maskImageUrl, safeZoneVisible]);

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center bg-gradient-to-br from-black/40 to-purple-900/20 rounded-xl overflow-hidden">
      {/* V4 Enhanced main preview container with improved transparency handling */}
      <div 
        className="relative bg-transparent" 
        style={{ 
          width: `${OUTPUT_WIDTH * PREVIEW_SCALE}px`,
          height: `${OUTPUT_HEIGHT * PREVIEW_SCALE}px`,
          background: 'transparent'
        }}
      >
        
        {/* V4 Enhanced wallet UI container - positioned at exact coordinates */}
        <div 
          className="absolute z-20"
          style={{
            width: `${WALLET_WIDTH * PREVIEW_SCALE}px`,
            height: `${WALLET_HEIGHT * PREVIEW_SCALE}px`,
            left: `${WALLET_X * PREVIEW_SCALE}px`,
            top: `${WALLET_Y * PREVIEW_SCALE}px`,
            backgroundColor: loginStyle.backgroundColor || '#131313',
            backgroundImage: loginStyle.backgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: loginStyle.textColor || '#FFFFFF',
            fontFamily: loginStyle.fontFamily,
            borderRadius: '16px',
            boxShadow: loginStyle.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}
        >
          <LoginScreen style={loginStyle} />
        </div>

        {/* V4 Enhanced external mask layer rendered on top of wallet */}
        {externalMask && (
          <div 
            className="absolute z-30 pointer-events-none"
            style={{
              width: `${OUTPUT_WIDTH * PREVIEW_SCALE}px`,
              height: `${OUTPUT_HEIGHT * PREVIEW_SCALE}px`,
              left: 0,
              top: 0
            }}
          >
            <img 
              src={externalMask} 
              alt="V4 Enhanced decorative mask with transparency" 
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))',
                background: 'transparent',
                imageRendering: 'crisp-edges'
              }}
              onLoad={() => console.log('✅ V4 Enhanced external mask loaded with transparency:', externalMask)}
              onError={(e) => console.error('❌ V4 Enhanced external mask failed:', externalMask, e)}
            />
          </div>
        )}
        
        {/* Legacy mask support with enhanced transparency */}
        {maskImageUrl && !externalMask && (
          <div 
            className="absolute z-30 pointer-events-none"
            style={{
              width: `${OUTPUT_WIDTH * PREVIEW_SCALE}px`,
              height: `${OUTPUT_HEIGHT * PREVIEW_SCALE}px`,
              left: 0,
              top: 0
            }}
          >
            <img 
              src={maskImageUrl} 
              alt="Legacy mask with enhanced transparency" 
              className="w-full h-full object-contain"
              style={{
                background: 'transparent',
                imageRendering: 'crisp-edges'
              }}
              onLoad={() => console.log('✅ Legacy mask loaded with transparency:', maskImageUrl)}
              onError={(e) => console.error('❌ Legacy mask failed:', maskImageUrl, e)}
            />
          </div>
        )}
        
        {/* V4 Enhanced safe zone visualization */}
        {safeZoneVisible && (
          <div 
            className="absolute z-40 pointer-events-none"
            style={{
              width: `${WALLET_WIDTH * PREVIEW_SCALE}px`,
              height: `${WALLET_HEIGHT * PREVIEW_SCALE}px`,
              left: `${WALLET_X * PREVIEW_SCALE}px`,
              top: `${WALLET_Y * PREVIEW_SCALE}px`,
              border: '2px solid #10b981',
              borderRadius: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500/90 px-3 py-2 rounded text-xs text-white whitespace-nowrap">
              ✅ Safe Zone ({WALLET_WIDTH}×{WALLET_HEIGHT}px)
            </div>
            <div className="absolute top-2 left-2 bg-green-500/70 px-2 py-1 rounded text-xs text-green-200">
              V4 Enhanced
            </div>
            <div className="absolute bottom-2 right-2 bg-green-500/70 px-2 py-1 rounded text-xs text-green-200">
              x={WALLET_X}, y={WALLET_Y}
            </div>
          </div>
        )}
        
        {/* V4 Enhanced success badge */}
        {externalMask && !safeZoneVisible && (
          <div className="absolute top-4 right-4 z-50">
            <Badge 
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)] border-white/20 animate-pulse"
            >
              ✨ V4 ENHANCED TRANSPARENCY
            </Badge>
          </div>
        )}
        
        {/* V4 Enhanced architecture badge */}
        <div className="absolute top-4 left-4 z-50">
          <Badge 
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20"
          >
            V4 ENHANCED
          </Badge>
        </div>

        {/* V4 Enhanced transparency indicator */}
        {externalMask && (
          <div className="absolute bottom-4 left-4 z-50">
            <Badge 
              className="bg-emerald-500/80 text-white px-2 py-1 text-xs"
            >
              🎯 No Background
            </Badge>
          </div>
        )}

        {/* V4 Enhanced coordinate display */}
        {externalMask && (
          <div className="absolute bottom-4 right-4 z-50">
            <Badge 
              className="bg-yellow-500/80 text-black px-2 py-1 text-xs font-mono"
            >
              Enhanced: {WALLET_X},{WALLET_Y}
            </Badge>
          </div>
        )}

        {/* Enhanced background removal indicator */}
        {externalMask && (
          <div className="absolute top-1/2 left-4 z-50">
            <Badge 
              className="bg-blue-500/80 text-white px-2 py-1 text-xs"
            >
              📐 Background Removed
            </Badge>
          </div>
        )}

        {/* Enhanced quality scale indicator */}
        <div className="absolute top-1/2 right-4 z-50">
          <Badge 
            className="bg-orange-500/80 text-white px-2 py-1 text-xs font-mono"
          >
            Quality: HD (Enhanced)
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default V3MaskPreviewCanvas;
