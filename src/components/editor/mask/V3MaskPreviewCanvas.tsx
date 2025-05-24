
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

  // Updated V3 Enhanced mask cutout URL with proper coordinates
  const MASK_CUTOUT_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png';

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "V3 Enhanced wallet mask with optimized coordinates and sizing";

  // V3 Enhanced: Output coordinates (1024x1024 canvas)
  const OUTPUT_WIDTH = 1024;
  const OUTPUT_HEIGHT = 1024;
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;
  const WALLET_X = 352; // Centered in 1024x1024 canvas
  const WALLET_Y = 228; // Centered in 1024x1024 canvas

  // Preview scale factor for display (only for the entire preview container)
  const PREVIEW_SCALE = 0.6;

  // Debug logging
  useEffect(() => {
    console.log('🔍 V3 Enhanced Preview Debug:', {
      externalMask: externalMask ? 'loaded' : 'null',
      maskImageUrl: maskImageUrl ? 'loaded' : 'null',
      safeZoneVisible,
      outputDimensions: `${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}`,
      walletDimensions: `${WALLET_WIDTH}x${WALLET_HEIGHT}`,
      walletPosition: `x=${WALLET_X}, y=${WALLET_Y}`,
      previewScale: PREVIEW_SCALE,
      maskCutoutUrl: MASK_CUTOUT_URL
    });
  }, [externalMask, maskImageUrl, safeZoneVisible]);

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center bg-black/20 rounded-xl overflow-hidden">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        {/* V3 Enhanced main preview container - 1024x1024 output simulation */}
        <div 
          className="relative" 
          style={{ 
            width: `${OUTPUT_WIDTH * PREVIEW_SCALE}px`,
            height: `${OUTPUT_HEIGHT * PREVIEW_SCALE}px`,
          }}
        >
          
          {/* V3 Enhanced external mask layer with CSS mask-image */}
          {externalMask && (
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                width: '100%',
                height: '100%',
                maskImage: `url('${MASK_CUTOUT_URL}')`,
                WebkitMaskImage: `url('${MASK_CUTOUT_URL}')`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            >
              <img 
                src={externalMask} 
                alt="V3 Enhanced decorative mask" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))',
                }}
                onLoad={() => console.log('✅ V3 Enhanced external mask loaded with new cutout:', externalMask)}
                onError={(e) => console.error('❌ V3 Enhanced external mask failed:', externalMask, e)}
              />
            </div>
          )}
          
          {/* Legacy mask support */}
          {maskImageUrl && !externalMask && (
            <div 
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                width: '100%',
                height: '100%',
                maskImage: `url('${MASK_CUTOUT_URL}')`,
                WebkitMaskImage: `url('${MASK_CUTOUT_URL}')`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            >
              <img 
                src={maskImageUrl} 
                alt="Legacy mask overlay" 
                className="w-full h-full object-contain"
                onLoad={() => console.log('✅ Legacy mask loaded with new cutout:', maskImageUrl)}
                onError={(e) => console.error('❌ Legacy mask failed:', maskImageUrl, e)}
              />
            </div>
          )}
          
          {/* V3 Enhanced wallet UI container - positioned at exact coordinates with full size */}
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
          
          {/* V3 Enhanced safe zone visualization */}
          {safeZoneVisible && (
            <div 
              className="absolute z-30 pointer-events-none"
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
                V3 Enhanced
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500/70 px-2 py-1 rounded text-xs text-green-200">
                x={WALLET_X}, y={WALLET_Y}
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
                🎭 V3 Active ({OUTPUT_WIDTH}×{OUTPUT_HEIGHT})
              </Badge>
            </div>
          )}

          {/* V3 Enhanced coordinate display */}
          {externalMask && (
            <div className="absolute bottom-4 right-4 z-40">
              <Badge 
                className="bg-yellow-500/80 text-black px-2 py-1 text-xs font-mono"
              >
                Wallet: {WALLET_X},{WALLET_Y}
              </Badge>
            </div>
          )}

          {/* Cutout mask indicator */}
          {externalMask && (
            <div className="absolute top-1/2 left-4 z-40">
              <Badge 
                className="bg-emerald-500/80 text-white px-2 py-1 text-xs"
              >
                🎭 Cutout Applied
              </Badge>
            </div>
          )}

          {/* Scale indicator for debugging */}
          <div className="absolute top-1/2 right-4 z-40">
            <Badge 
              className="bg-orange-500/80 text-white px-2 py-1 text-xs font-mono"
            >
              Scale: {PREVIEW_SCALE}x
            </Badge>
          </div>
        </div>
      </ImageFeedbackWrapper>
    </div>
  );
};

export default V3MaskPreviewCanvas;
