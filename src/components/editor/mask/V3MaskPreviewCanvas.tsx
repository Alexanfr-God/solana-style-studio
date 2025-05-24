
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

  // Updated mask URL from Supabase Storage
  const MASK_CUTOUT_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png';

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "V3 Enhanced wallet mask customization with optimized sizing and positioning";

  // FIXED: Corrected dimensions and positioning to match the edge function
  const CONTAINER_WIDTH = 480;
  const CONTAINER_HEIGHT = 854;
  const WALLET_WIDTH = 320;
  const WALLET_HEIGHT = 569;

  // Debug logging for mask state with enhanced information
  useEffect(() => {
    console.log('🔍 V3MaskPreviewCanvas - Enhanced Debug Info:', {
      externalMask: externalMask ? 'loaded' : 'null',
      externalMaskUrl: externalMask,
      maskImageUrl: maskImageUrl ? 'loaded' : 'null',
      safeZoneVisible,
      maskCutoutUrl: MASK_CUTOUT_URL,
      renderingMode: 'V3_OPTIMIZED',
      containerDimensions: `${CONTAINER_WIDTH}x${CONTAINER_HEIGHT}`,
      walletDimensions: `${WALLET_WIDTH}x${WALLET_HEIGHT}`,
      expectedMaskSize: '1024x1024',
      safeZoneCoordinates: 'x=352, y=228 (in 1024x1024 space)'
    });
  }, [externalMask, maskImageUrl, safeZoneVisible]);

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center bg-black/20 rounded-xl overflow-hidden">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        {/* Main preview container with corrected fixed dimensions */}
        <div 
          className="relative" 
          style={{ 
            width: `${CONTAINER_WIDTH}px`, 
            height: `${CONTAINER_HEIGHT}px` 
          }}
        >
          
          {/* External mask layer - IMPROVED positioning and sizing */}
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
                  // IMPROVED: Better scaling to match container dimensions
                  objectFit: 'contain'
                }}
                onLoad={() => console.log('✅ V3 External mask loaded successfully:', externalMask)}
                onError={(e) => console.error('❌ V3 External mask failed to load:', externalMask, e)}
              />
            </div>
          )}
          
          {/* Fallback legacy mask support with improved sizing */}
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
                onLoad={() => console.log('✅ Legacy mask loaded successfully:', maskImageUrl)}
                onError={(e) => console.error('❌ Legacy mask failed to load:', maskImageUrl, e)}
              />
            </div>
          )}
          
          {/* Central wallet UI container - CORRECTED positioning */}
          <div 
            className="absolute z-20"
            style={{
              width: `${WALLET_WIDTH}px`,
              height: `${WALLET_HEIGHT}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
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
          
          {/* ENHANCED Safe zone visualization with corrected coordinates */}
          {safeZoneVisible && (
            <div 
              className="absolute z-30 pointer-events-none"
              style={{
                width: `${WALLET_WIDTH}px`,
                height: `${WALLET_HEIGHT}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid #10b981',
                borderRadius: '16px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
              }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500/80 px-3 py-2 rounded text-xs text-white whitespace-nowrap">
                ✅ V3 Safe Zone ({WALLET_WIDTH}×{WALLET_HEIGHT}px)
              </div>
              <div className="absolute top-2 left-2 bg-green-500/60 px-2 py-1 rounded text-xs text-green-200">
                Optimized
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500/60 px-2 py-1 rounded text-xs text-green-200">
                x=352, y=228 (1024px)
              </div>
            </div>
          )}
          
          {/* Success badge when V3 mask is applied */}
          {externalMask && !safeZoneVisible && (
            <div className="absolute top-4 right-4 z-40">
              <Badge 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)] border-white/20 animate-pulse"
              >
                ✨ V3 OPTIMIZED COSTUME
              </Badge>
            </div>
          )}
          
          {/* V3 Architecture Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
            <Badge 
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20 rotate-[-10deg] scale-125"
            >
              V3 OPTIMIZED
            </Badge>
          </div>

          {/* Debug indicator when mask is loaded */}
          {externalMask && (
            <div className="absolute bottom-4 left-4 z-40">
              <Badge 
                className="bg-blue-500/80 text-white px-2 py-1 text-xs"
              >
                🎭 Mask Active ({CONTAINER_WIDTH}×{CONTAINER_HEIGHT})
              </Badge>
            </div>
          )}

          {/* ENHANCED Debug layer boundaries with corrected dimensions */}
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
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span className="absolute top-0 left-0 bg-blue-500/80 text-white text-xs px-1">
                  UI: {WALLET_WIDTH}×{WALLET_HEIGHT}
                </span>
              </div>
              <div className="absolute top-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
                <div>🔍 Debug Info:</div>
                <div>Container: {CONTAINER_WIDTH}×{CONTAINER_HEIGHT}</div>
                <div>Wallet UI: {WALLET_WIDTH}×{WALLET_HEIGHT}</div>
                <div>Mask Output: 1024×1024</div>
                <div>Safe Zone: x=352, y=228</div>
              </div>
            </>
          )}
        </div>
      </ImageFeedbackWrapper>
    </div>
  );
};

export default V3MaskPreviewCanvas;
