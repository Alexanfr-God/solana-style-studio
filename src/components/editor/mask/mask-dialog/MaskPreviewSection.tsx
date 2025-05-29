
import React from 'react';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import WalletSceneContainer from '@/components/wallet/WalletSceneContainer';

interface MaskPreviewSectionProps {
  topLayer: string | null;
  bottomLayer: string | null;
  customMask: string | null;
}

export const MaskPreviewSection = ({ topLayer, bottomLayer, customMask }: MaskPreviewSectionProps) => {
  const { loginStyle } = useCustomizationStore();
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative bg-black/20 p-6 rounded-xl border border-white/10 w-full h-full flex items-center justify-center">
        {/* Base wallet UI with proper container */}
        <div className="relative">
          <WalletSceneContainer style={loginStyle} renderMode="direct" className="relative">
            {/* Full mask overlay - only shown when using the custom upload or example mask */}
            {customMask && (
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
                  WebkitMaskRepeat: 'no-repeat'
                }}
              >
                <img 
                  src={customMask} 
                  alt="Mask overlay" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Top Layer - Positioned at the top of wallet */}
            {topLayer && (
              <div 
                className="absolute pointer-events-none z-10 top-0 left-0 w-full"
              >
                <img 
                  src={topLayer} 
                  alt="Top mask layer" 
                  className="w-full h-auto"
                />
              </div>
            )}
            
            {/* Bottom Layer - Positioned at the bottom of wallet */}
            {bottomLayer && (
              <div 
                className="absolute pointer-events-none z-10 bottom-0 left-0 w-full"
              >
                <img 
                  src={bottomLayer} 
                  alt="Bottom mask layer" 
                  className="w-full h-auto"
                />
              </div>
            )}
            
            <LoginScreen style={loginStyle} />
          </WalletSceneContainer>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-white/40 text-center mb-2">This is a preview of how your mask will appear</p>
      </div>
    </div>
  );
};
