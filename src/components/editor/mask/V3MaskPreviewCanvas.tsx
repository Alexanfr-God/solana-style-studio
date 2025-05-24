
import React, { useEffect } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Badge } from '@/components/ui/badge';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';

const V3MaskPreviewCanvas = () => {
  const { 
    safeZoneVisible, 
    externalMask,
    maskImageUrl
  } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  // V3 Enhanced mask cutout URL
  const MASK_CUTOUT_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png';

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "V3 Enhanced wallet mask with optimized coordinates and sizing";

  // V3 Enhanced: Corrected dimensions and positioning
  const CONTAINER_WIDTH = 480;
  const CONTAINER_HEIGHT = 854;
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;
  
  // V3 Enhanced: Corrected safe zone coordinates for 480x854 container
  const SAFE_ZONE_X = 80; // (480 - 320) / 2
  const SAFE_ZONE_Y = 142; // (854 - 569) / 2

  // V3 Enhanced debug logging
  useEffect(() => {
    console.log('🔍 V3 Enhanced Debug Info:', {
      externalMask: externalMask ? 'loaded' : 'null',
      externalMaskUrl: externalMask,
      maskImageUrl: maskImageUrl ? 'loaded' : 'null',
      safeZoneVisible,
      maskCutoutUrl: MASK_CUTOUT_URL,
      renderingMode: 'V3_ENHANCED',
      containerDimensions: `${CONTAINER_WIDTH}x${CONTAINER_HEIGHT}`,
      walletDimensions: `${WALLET_WIDTH}x${WALLET_HEIGHT}`,
      safeZoneCoordinates: `x=${SAFE_ZONE_X}, y=${SAFE_ZONE_Y}`,
      coordinateMapping: 'Container(480x854) -> Output(1024x1024)',
      scalingFactors: {
        x: 1024 / CONTAINER_WIDTH,
        y: 1024 / CONTAINER_HEIGHT
      }
    });
  }, [externalMask, maskImageUrl, safeZoneVisible]);

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center bg-black/20 rounded-xl overflow-hidden">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        {/* V3 Enhanced main preview container */}
        <div 
          className="relative" 
          style={{ 
            width: `${CONTAINER_WIDTH}px`, 
            height: `${CONTAINER_HEIGHT}px` 
          }}
        >
          
          {/* V3 Enhanced external mask layer with improved positioning */}
          {externalMask && (
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                width: '100%',
                height: '100%',
                maskImage: `url('${MASK_CUTOUT_URL}')`,
                WebkitMaskImage: `url('${MASK_CUTOUT_URL}')`,
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            >
              <img 
                src={externalMask} 
                alt="V3 Enhanced decorative mask" 
                className="w-full h-full object-cover"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))',
                  objectFit: 'cover'
                }}
                onLoad={() => console.log('✅ V3 Enhanced external mask loaded:', externalMask)}
                onError={(e) => console.error('❌ V3 Enhanced external mask failed:', externalMask, e)}
              />
            </div>
          )}
          
          {/* Legacy mask support with V3 Enhanced sizing */}
          {maskImageUrl && !externalMask && (
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                width: '100%',
                height: '100%',
                maskImage: `url('${MASK_CUTOUT_URL}')`,
                WebkitMaskImage: `url('${MASK_CUTOUT_URL}')`,
                maskSize: 'cover',
                WebkitMaskSize: 'cover',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            >
              <img 
                src={maskImageUrl} 
                alt="Legacy mask overlay" 
                className="w-full h-full object-cover"
                onLoad={() => console.log('✅ Legacy mask loaded with V3 Enhanced sizing:', maskImageUrl)}
                onError={(e) => console.error('❌ Legacy mask failed:', maskImageUrl, e)}
              />
            </div>
          )}
          
          {/* V3 Enhanced wallet UI container with corrected positioning */}
          <div 
            className="absolute z-20"
            style={{
              width: `${WALLET_WIDTH}px`,
              height: `${WALLET_HEIGHT}px`,
              left: `${SAFE_ZONE_X}px`,
              top: `${SAFE_ZONE_Y}px`,
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
          
          {/* V3 Enhanced safe zone visualization with corrected coordinates */}
          {safeZoneVisible && (
            <div 
              className="absolute z-30 pointer-events-none"
              style={{
                width: `${WALLET_WIDTH}px`,
                height: `${WALLET_HEIGHT}px`,
                left: `${SAFE_ZONE_X}px`,
                top: `${SAFE_ZONE_Y}px`,
                border: '2px solid #10b981',
                borderRadius: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500/90 px-3 py-2 rounded text-xs text-white whitespace-nowrap">
                ✅ V3 Enhanced Safe Zone ({WALLET_WIDTH}×{WALLET_HEIGHT}px)
              </div>
              <div className="absolute top-2 left-2 bg-green-500/70 px-2 py-1 rounded text-xs text-green-200">
                V3 Enhanced
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500/70 px-2 py-1 rounded text-xs text-green-200">
                x={SAFE_ZONE_X}, y={SAFE_ZONE_Y}
              </div>
            </div>
          )}
          
          {/* V3 Enhanced success badge */}
          {externalMask && !safeZoneVisible && (
            <div className="absolute top-4 right-4 z-40">
              <Badge 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)] border-white/20 animate-pulse"
              >
                ✨ V3 ENHANCED COSTUME
              </Badge>
            </div>
          )}
          
          {/* V3 Enhanced architecture badge */}
          <div className="absolute top-4 left-4 z-40">
            <Badge 
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20"
            >
              V3 ENHANCED
            </Badge>
          </div>

          {/* V3 Enhanced debug indicator */}
          {externalMask && (
            <div className="absolute bottom-4 left-4 z-40">
              <Badge 
                className="bg-blue-500/80 text-white px-2 py-1 text-xs"
              >
                🎭 V3 Enhanced Active ({CONTAINER_WIDTH}×{CONTAINER_HEIGHT})
              </Badge>
            </div>
          )}

          {/* V3 Enhanced coordinate display */}
          {externalMask && (
            <div className="absolute bottom-4 right-4 z-40">
              <Badge 
                className="bg-yellow-500/80 text-black px-2 py-1 text-xs font-mono"
              >
                Safe: {SAFE_ZONE_X},{SAFE_ZONE_Y}
              </Badge>
            </div>
          )}

          {/* V3 Enhanced debug boundaries */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <div className="absolute inset-0 border border-red-500/30 z-50 pointer-events-none">
                <span className="absolute top-0 left-0 bg-red-500/80 text-white text-xs px-1">
                  Container: {CONTAINER_WIDTH}×{CONTAINER_HEIGHT}
                </span>
              </div>
              <div 
                className="absolute border border-blue-500/30 z-50 pointer-events-none"
                style={{
                  width: `${WALLET_WIDTH}px`,
                  height: `${WALLET_HEIGHT}px`,
                  left: `${SAFE_ZONE_X}px`,
                  top: `${SAFE_ZONE_Y}px`,
                }}
              >
                <span className="absolute top-0 left-0 bg-blue-500/80 text-white text-xs px-1">
                  UI: {WALLET_WIDTH}×{WALLET_HEIGHT}
                </span>
              </div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 text-white p-2 rounded text-xs">
                <div className="text-center">🔍 V3 Enhanced Debug:</div>
                <div>Container: {CONTAINER_WIDTH}×{CONTAINER_HEIGHT}</div>
                <div>Wallet UI: {WALLET_WIDTH}×{WALLET_HEIGHT}</div>
                <div>Safe Zone: {SAFE_ZONE_X},{SAFE_ZONE_Y}</div>
                <div>Output: 1024×1024</div>
                <div>Scale: {(1024/CONTAINER_WIDTH).toFixed(2)}x</div>
              </div>
            </>
          )}
        </div>
      </ImageFeedbackWrapper>
    </div>
  );
};

export default V3MaskPreviewCanvas;
