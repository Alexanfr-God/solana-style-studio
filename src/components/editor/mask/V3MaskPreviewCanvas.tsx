
import React, { useEffect, useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import { Badge } from '@/components/ui/badge';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { AlertCircle, Loader2 } from 'lucide-react';

const V3MaskPreviewCanvas = () => {
  const { 
    safeZoneVisible, 
    externalMask,
    maskImageUrl, // This will be used for custom full masks
    resetEditor
  } = useMaskEditorStore();
  
  const { loginStyle } = useCustomizationStore();
  
  const [masksLoaded, setMasksLoaded] = useState({
    external: false,
    custom: false
  });
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Log mask URLs for debugging
  useEffect(() => {
    console.log("🎭 Mask State Update:");
    console.log("  - maskImageUrl:", maskImageUrl);
    console.log("  - externalMask:", externalMask);
    console.log("  - Should show mask:", Boolean(maskImageUrl || externalMask));
    
    // Reset loading states when URLs change
    if (maskImageUrl) {
      setMasksLoaded(prev => ({ ...prev, custom: false }));
      setLoadingError(null);
    }
    
    if (externalMask) {
      setMasksLoaded(prev => ({ ...prev, external: false }));
      setLoadingError(null);
    }
  }, [maskImageUrl, externalMask]);

  // For feedback purposes, we need to capture the final rendered image "URL"
  // Since we don't have an actual image URL for the canvas, we use a placeholder
  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "Wallet mask customization";
  
  // Determine if a mask should be displayed
  const shouldDisplayMask = Boolean(maskImageUrl || externalMask);
  
  // Handle image load events
  const handleImageLoaded = (type: 'external' | 'custom') => {
    console.log(`🖼️ ${type} mask image loaded successfully`);
    setMasksLoaded(prev => ({
      ...prev,
      [type]: true
    }));
  };
  
  // Handle image error events
  const handleImageError = (type: 'external' | 'custom', e: React.SyntheticEvent<HTMLImageElement>) => {
    const url = type === 'external' ? externalMask : maskImageUrl;
    console.error(`❌ Failed to load ${type} mask image:`, url, e);
    setLoadingError(`Failed to load ${type} mask image. Please try again.`);
    
    // Reset the failing mask URL to clear the error state
    if (type === 'external' && externalMask) {
      setTimeout(() => resetEditor(), 500);
    } else if (type === 'custom' && maskImageUrl) {
      setTimeout(() => resetEditor(), 500);
    }
  };

  return (
    <div className="relative w-full h-[800px] flex items-center justify-center">
      <div className="relative">
        <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
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
                  onLoad={() => handleImageLoaded('external')}
                  onError={(e) => handleImageError('external', e)}
                />
              </div>
            )}
            
            {/* Regular mask (from draw-to-mask generator) - also with cutout */}
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
                  onLoad={() => handleImageLoaded('custom')}
                  onError={(e) => handleImageError('custom', e)}
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
            
            {/* Display message when no mask is present */}
            {!shouldDisplayMask && (
              <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-sm">
                  Draw and generate a mask to see it applied here
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {shouldDisplayMask && (
              (externalMask && !masksLoaded.external) || 
              (maskImageUrl && !masksLoaded.custom && !externalMask)
            ) && (
              <div className="absolute inset-0 flex items-center justify-center z-35 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg text-white flex items-center">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Loading your custom mask...
                </div>
              </div>
            )}
            
            {/* Error message */}
            {loadingError && (
              <div className="absolute inset-0 flex items-center justify-center z-35 pointer-events-none">
                <div className="bg-red-500/80 backdrop-blur-sm px-6 py-3 rounded-lg text-white flex items-center">
                  <AlertCircle className="mr-2" size={16} />
                  {loadingError}
                </div>
              </div>
            )}
            
            {/* Debug overlay (only in development) */}
            {process.env.NODE_ENV === 'development' && shouldDisplayMask && (
              <div className="absolute bottom-2 left-2 text-xs bg-black/80 text-white rounded p-2 max-w-[400px] z-60 overflow-hidden">
                <div><strong>Debug:</strong></div>
                <div className="truncate">maskImageUrl: {maskImageUrl || 'null'}</div>
                <div className="truncate">externalMask: {externalMask || 'null'}</div>
                <div>Loaded: {(externalMask && masksLoaded.external) || (maskImageUrl && masksLoaded.custom) ? '✅' : '❌'}</div>
              </div>
            )}
          </WalletSceneContainer>
        </ImageFeedbackWrapper>
      </div>
      
      {/* Feedback Button positioned at the same level as "Mint as NFT" would be */}
      <div className="absolute bottom-4 right-4">
        <div className="backdrop-blur-sm bg-black/20 rounded-xl p-3">
          <FeedbackButton 
            imageUrl={previewImageUrl} 
            prompt={previewPrompt}
          />
        </div>
      </div>
    </div>
  );
};

export default V3MaskPreviewCanvas;
