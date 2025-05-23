
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

  // ✅ Use the same priority as before: externalMask first, then maskImageUrl
  // externalMask now contains V3-generated masks from the new GPT-4o + DALL-E flow
  const activeMask = externalMask || maskImageUrl;
  
  console.log('V3MaskPreviewCanvas rendering with:', {
    externalMask,
    maskImageUrl,
    activeMask,
    safeZoneVisible
  });

  // For feedback purposes, we need to capture the final rendered image "URL"
  const previewImageUrl = activeMask || "/placeholder.svg";
  const previewPrompt = "V3 wallet mask customization with GPT-4o + DALL-E";

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        <div className="relative">
          {/* V3 scene container with larger area for V3-generated masks */}
          <WalletSceneContainer style={loginStyle}>
            {/* ✅ V3 Mask layer - positioned ONLY around the wallet, not over it */}
            {activeMask && (
              <div 
                className="absolute pointer-events-none z-10 inset-0"
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
                  src={activeMask} 
                  alt="V3 Wallet mask generated with GPT-4o + DALL-E" 
                  className="w-full h-full object-cover"
                  onLoad={() => console.log('✅ V3 mask image loaded successfully:', activeMask)}
                  onError={(e) => console.error('❌ V3 mask image failed to load:', activeMask, e)}
                />
              </div>
            )}
            
            {/* The Login Screen UI - remains untouched in center */}
            <div className="wallet-ui-container relative z-30">
              <LoginScreen style={loginStyle} />
            </div>
            
            {/* V3 Safe zone visualization - only shown when enabled */}
            {safeZoneVisible && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
                <div className="border-2 border-red-500/50 rounded-2xl"
                  style={{
                    width: '320px',
                    height: '569px'
                  }}>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                    V3 Protected UI Zone (320×569px)
                  </div>
                </div>
              </div>
            )}
            
            {/* V3 DEMO Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <Badge 
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20 rotate-[-10deg] scale-125"
              >
                V3 DEMO
              </Badge>
            </div>
          </WalletSceneContainer>
        </div>
      </ImageFeedbackWrapper>
    </div>
  );
};

export default V3MaskPreviewCanvas;
