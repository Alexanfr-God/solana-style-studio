
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import { Badge } from '@/components/ui/badge';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';

const V3MaskPreviewCanvas = () => {
  const { 
    safeZoneVisible, 
    externalMask,
    maskImageUrl
  } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "V3 Wallet mask customization with auto-applied costume";

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        <div className="relative">
          <WalletSceneContainer style={loginStyle}>
            {/* V3 Enhanced mask layer with improved blending */}
            {externalMask && (
              <div 
                className="absolute pointer-events-none z-10 inset-0 transition-all duration-500 ease-in-out"
                style={{
                  width: '100%',
                  height: '100%',
                  maskImage: 'url(/mask-wallet-cutout.png)',
                  WebkitMaskImage: 'url(/mask-wallet-cutout.png)',
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  opacity: 0.95,
                  mixBlendMode: 'normal'
                }}
              >
                <img 
                  src={externalMask} 
                  alt="V3 Generated costume" 
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))'
                  }}
                />
              </div>
            )}
            
            {/* Fallback legacy mask support */}
            {maskImageUrl && !externalMask && (
              <div 
                className="absolute pointer-events-none z-20 inset-0"
                style={{
                  width: '100%',
                  height: '100%',
                  maskImage: 'url(/mask-wallet-cutout.png)',
                  WebkitMaskImage: 'url(/mask-wallet-cutout.png)',
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
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* The Login Screen UI - always on top */}
            <div className="wallet-ui-container relative z-30">
              <LoginScreen style={loginStyle} />
            </div>
            
            {/* Safe zone visualization */}
            {safeZoneVisible && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
                <div className="border-2 border-red-500/50 rounded-2xl bg-red-500/5"
                  style={{
                    width: '320px',
                    height: '569px'
                  }}>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                    🛡️ Protected UI Zone (320×569px)
                  </div>
                </div>
              </div>
            )}
            
            {/* Success badge when mask is applied */}
            {externalMask && !safeZoneVisible && (
              <div className="absolute top-4 right-4 z-50">
                <Badge 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(34,197,94,0.5)] border-white/20 animate-pulse"
                >
                  ✨ COSTUME APPLIED
                </Badge>
              </div>
            )}
            
            {/* DEMO Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <Badge 
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20 rotate-[-10deg] scale-125"
              >
                DEMO
              </Badge>
            </div>
          </WalletSceneContainer>
        </div>
      </ImageFeedbackWrapper>
    </div>
  );
};

export default V3MaskPreviewCanvas;
