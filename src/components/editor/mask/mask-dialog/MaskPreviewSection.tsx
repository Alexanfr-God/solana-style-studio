
import React from 'react';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';

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
        {/* Base wallet UI */}
        <div className="w-[320px] relative">
          {/* Top Layer - Positioned to slightly overlap the top of wallet */}
          {topLayer && (
            <div 
              className="absolute w-full pointer-events-none z-10"
              style={{
                top: '-205px', // Position adjusted to slightly overlap the top edge
                left: 0,
                height: '40px',
                overflow: 'visible'
              }}
            >
              <img 
                src={topLayer} 
                alt="Top mask layer" 
                className="w-full h-auto"
              />
            </div>
          )}
          
          <LoginScreen style={loginStyle} />
          
          {/* Bottom Layer - Positioned to align perfectly with the bottom edge */}
          {bottomLayer && (
            <div 
              className="absolute w-full pointer-events-none z-10"
              style={{
                bottom: '-5px', // Positioned at the bottom edge
                left: 0,
                height: '40px',
                overflow: 'visible'
              }}
            >
              <img 
                src={bottomLayer} 
                alt="Bottom mask layer" 
                className="w-full h-auto"
              />
            </div>
          )}
          
          {/* Full mask overlay - only shown when using the custom upload or example mask */}
          {customMask && (
            <div 
              className="absolute pointer-events-none z-10"
              style={{
                top: '-205px', // Position as requested
                left: 0,
                width: '100%',
                height: 'auto',
                overflow: 'visible'
              }}
            >
              <img 
                src={customMask} 
                alt="Mask overlay" 
                className="w-full h-auto"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'unset'
                }}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-white/40 text-center mb-2">This is a preview of how your mask will appear</p>
      </div>
    </div>
  );
};
