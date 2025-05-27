
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

  // Updated V4 Enhanced mask cutout URL with proper coordinates
  const MASK_CUTOUT_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png';

  // All character PNG files that should be displayed over the wallet
  const characterPngs = [
    '/lovable-uploads/c953a08b-6f7f-4cb4-bbf9-8872f02468ca.png', // DOGE
    '/lovable-uploads/d4ec5dbf-9943-46d4-abcb-33fdbd4616c1.png', // PEPE
    '/lovable-uploads/4fce14b3-1a45-4f0a-b599-4f439227e037.png', // TRUMP
    '/lovable-uploads/78d15f07-7430-48a3-bfcd-159efeb38a9e.png'  // CAT
  ];

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "V4 Enhanced wallet mask with transparent background and multiple character overlays";

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
      characterPngsCount: characterPngs.length,
      v4EnhancedMultiCharacter: true
    });
  }, [externalMask, maskImageUrl, safeZoneVisible]);

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center bg-gradient-to-br from-black/40 to-purple-900/20 rounded-xl overflow-hidden">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        {/* V4 Enhanced main preview container with improved transparency handling */}
        <div 
          className="relative bg-transparent" 
          style={{ 
            width: `${OUTPUT_WIDTH * PREVIEW_SCALE}px`,
            height: `${OUTPUT_HEIGHT * PREVIEW_SCALE}px`,
            background: 'transparent'
          }}
        >
          
          {/* V4 Enhanced: Render all character PNGs over the wallet */}
          {characterPngs.map((pngPath, index) => (
            <div 
              key={`character-${index}`}
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
                background: 'transparent',
                opacity: 0.8 - (index * 0.15), // Gradually reduce opacity for layering effect
                transform: `scale(${1 - (index * 0.05)}) rotate(${index * 5}deg)` // Slight scale and rotation for visual variety
              }}
            >
              <img 
                src={pngPath} 
                alt={`V4 Enhanced character overlay ${index + 1}`} 
                className="w-full h-full object-contain"
                style={{
                  filter: `drop-shadow(0 0 20px rgba(255, 255, 255, ${0.2 - (index * 0.03)})) hue-rotate(${index * 30}deg)`,
                  background: 'transparent',
                  imageRendering: 'crisp-edges',
                  mixBlendMode: index % 2 === 0 ? 'multiply' : 'screen'
                }}
                onLoad={() => console.log(`✅ V4 Enhanced character PNG ${index + 1} loaded:`, pngPath)}
                onError={(e) => console.error(`❌ V4 Enhanced character PNG ${index + 1} failed:`, pngPath, e)}
              />
            </div>
          ))}
          
          {/* Legacy external mask support (if needed) */}
          {externalMask && !characterPngs.includes(externalMask) && (
            <div 
              className="absolute inset-0 pointer-events-none z-15"
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
                background: 'transparent'
              }}
            >
              <img 
                src={externalMask} 
                alt="V4 Enhanced external decorative mask" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))',
                  background: 'transparent',
                  imageRendering: 'crisp-edges'
                }}
                onLoad={() => console.log('✅ V4 Enhanced external mask loaded:', externalMask)}
                onError={(e) => console.error('❌ V4 Enhanced external mask failed:', externalMask, e)}
              />
            </div>
          )}
          
          {/* Legacy mask support with enhanced transparency */}
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
                background: 'transparent'
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
          
          {/* V4 Enhanced safe zone visualization */}
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
                V4 Multi-Character
              </div>
              <div className="absolute bottom-2 right-2 bg-green-500/70 px-2 py-1 rounded text-xs text-green-200">
                x={WALLET_X}, y={WALLET_Y}
              </div>
            </div>
          )}
          
          {/* V4 Enhanced multi-character success badge */}
          {!safeZoneVisible && (
            <div className="absolute top-4 right-4 z-40">
              <Badge 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)] border-white/20 animate-pulse"
              >
                ✨ MULTI-CHARACTER OVERLAY
              </Badge>
            </div>
          )}
          
          {/* V4 Enhanced architecture badge */}
          <div className="absolute top-4 left-4 z-40">
            <Badge 
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20"
            >
              V4 MULTI-LAYER
            </Badge>
          </div>

          {/* V4 Enhanced character count indicator */}
          <div className="absolute bottom-4 left-4 z-40">
            <Badge 
              className="bg-emerald-500/80 text-white px-2 py-1 text-xs"
            >
              🎭 {characterPngs.length} Characters
            </Badge>
          </div>

          {/* V4 Enhanced coordinate display */}
          <div className="absolute bottom-4 right-4 z-40">
            <Badge 
              className="bg-yellow-500/80 text-black px-2 py-1 text-xs font-mono"
            >
              Multi: {WALLET_X},{WALLET_Y}
            </Badge>
          </div>

          {/* Enhanced layering indicator */}
          <div className="absolute top-1/2 left-4 z-40">
            <Badge 
              className="bg-blue-500/80 text-white px-2 py-1 text-xs"
            >
              📐 Layered Blend
            </Badge>
          </div>

          {/* Enhanced quality scale indicator */}
          <div className="absolute top-1/2 right-4 z-40">
            <Badge 
              className="bg-orange-500/80 text-white px-2 py-1 text-xs font-mono"
            >
              Quality: Multi-HD
            </Badge>
          </div>
        </div>
      </ImageFeedbackWrapper>
    </div>
  );
};

export default V3MaskPreviewCanvas;
