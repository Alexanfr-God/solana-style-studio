
import React from 'react';
import { useMaskEditorStore } from '../../../stores/maskEditorStore';
import { LoginScreenPreview } from '../../wallet/preview/LoginScreenPreview';
import { useCustomizationStore } from '../../../stores/customizationStore';

const MaskPreviewCanvas = () => {
  const { loginStyle } = useCustomizationStore();
  const { maskImageUrl, safeZoneVisible } = useMaskEditorStore();

  return (
    <div className="relative w-full aspect-[9/16] max-w-[320px] mx-auto">
      {/* Base wallet UI */}
      <div className="absolute inset-0 z-10">
        <LoginScreenPreview style={loginStyle} />
      </div>
      
      {/* Mask overlay */}
      {maskImageUrl && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <img 
            src={maskImageUrl} 
            alt="Decoration mask" 
            className="w-full h-full object-contain"
          />
        </div>
      )}
      
      {/* Safe zone overlay */}
      {safeZoneVisible && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
          <div className="w-3/5 h-3/5 border-2 border-white/40 border-dashed rounded-lg flex items-center justify-center">
            <div className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded">
              Safe Zone
            </div>
          </div>
        </div>
      )}
      
      {/* No mask placeholder */}
      {!maskImageUrl && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-white/60 bg-black/50 px-4 py-2 rounded text-center max-w-[80%]">
            Generate or upload a mask to see preview
          </div>
        </div>
      )}
    </div>
  );
};

export default MaskPreviewCanvas;
