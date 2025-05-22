
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import { Badge } from '@/components/ui/badge';

const V3MaskPreviewCanvas = () => {
  const { 
    safeZoneVisible, 
    externalMask,
    maskImageUrl // This will be used for custom full masks
  } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      <div className="relative">
        {/* New scene container with larger area for external masks */}
        <WalletSceneContainer style={loginStyle}>
          {/* External mask layer - positioned ONLY around the wallet, not over it */}
          {externalMask && (
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
                src={externalMask} 
                alt="External mask" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Regular mask (for backward compatibility) - also with cutout */}
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
                alt="Full mask overlay" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* The Login Screen UI */}
          <div className="wallet-ui-container relative z-30">
            <LoginScreen style={loginStyle} />
          </div>
          
          {/* Safe zone visualization - only shown when enabled */}
          {safeZoneVisible && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
              <div className="border-2 border-red-500/50 rounded-2xl"
                style={{
                  width: '320px',
                  height: '569px'
                }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                  Protected UI Zone (320×569px)
                </div>
              </div>
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
    </div>
  );
};

export default V3MaskPreviewCanvas;
