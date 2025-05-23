
import React, { useEffect, useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import { Badge } from '@/components/ui/badge';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';
import { AlertCircle, Loader2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

const V3MaskPreviewCanvas = () => {
  const { 
    safeZoneVisible, 
    externalMask,
    maskImageUrl,
    resetEditor
  } = useMaskEditorStore();
  
  const { loginStyle } = useCustomizationStore();
  
  const [masksLoaded, setMasksLoaded] = useState({
    external: false,
    custom: false
  });
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Enhanced logging and validation
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log("🎭 === MASK PREVIEW STATE DEBUG ===", timestamp);
    console.log("  - maskImageUrl:", maskImageUrl ? 'PRESENT' : 'NULL');
    console.log("  - maskImageUrl type:", typeof maskImageUrl);
    console.log("  - maskImageUrl length:", maskImageUrl ? maskImageUrl.length : 0);
    console.log("  - maskImageUrl is base64:", maskImageUrl ? maskImageUrl.startsWith('data:') : false);
    console.log("  - externalMask:", externalMask ? 'PRESENT' : 'NULL');
    console.log("  - Should show mask:", Boolean(maskImageUrl || externalMask));
    console.log("  - Priority: custom mask =", Boolean(maskImageUrl), ", external =", Boolean(externalMask && !maskImageUrl));
    
    // Update debug info for UI display
    setDebugInfo({
      timestamp,
      maskImageUrl: maskImageUrl ? (maskImageUrl.startsWith('data:') ? 'BASE64_DATA' : maskImageUrl) : null,
      maskImageUrlLength: maskImageUrl ? maskImageUrl.length : 0,
      externalMask,
      shouldShowMask: Boolean(maskImageUrl || externalMask),
      shouldShowCustom: Boolean(maskImageUrl),
      shouldShowExternal: Boolean(externalMask && !maskImageUrl),
      urlType: maskImageUrl ? (
        maskImageUrl.startsWith('data:') ? 'base64' :
        maskImageUrl.startsWith('blob:') ? 'blob' :
        maskImageUrl.startsWith('http') ? 'http' : 'local'
      ) : 'none'
    });
    
    // Reset loading states when URLs change
    setMasksLoaded({ external: false, custom: false });
    setLoadingError(null);
    
    console.log("🎭 === END DEBUG ===");
  }, [maskImageUrl, externalMask]);

  const previewImageUrl = maskImageUrl || externalMask || "/placeholder.svg";
  const previewPrompt = "AI-generated wallet mask customization";
  
  const shouldDisplayMask = Boolean(maskImageUrl || externalMask);
  const showCustomMask = Boolean(maskImageUrl);
  const showExternalMask = Boolean(externalMask && !maskImageUrl);
  
  const handleImageLoaded = (type: 'external' | 'custom') => {
    console.log(`🖼️ ${type} mask image loaded successfully`);
    setMasksLoaded(prev => ({
      ...prev,
      [type]: true
    }));
  };
  
  const handleImageError = (type: 'external' | 'custom', e: React.SyntheticEvent<HTMLImageElement>) => {
    const url = type === 'external' ? externalMask : maskImageUrl;
    console.error(`❌ Failed to load ${type} mask image:`, url);
    console.error(`Error event:`, e);
    setLoadingError(`Failed to load ${type} mask image`);
  };

  return (
    <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
      <div className="relative w-full h-[800px] flex items-center justify-center">
        <div className="relative">
          <WalletSceneContainer style={loginStyle}>
            {/* Custom mask layer (AI generated - highest priority) */}
            {showCustomMask && (
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
                  alt="AI generated cat mask" 
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoaded('custom')}
                  onError={(e) => handleImageError('custom', e)}
                />
              </div>
            )}
            
            {/* External mask layer (fallback or preset masks) */}
            {showExternalMask && (
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
            
            {/* The Login Screen UI */}
            <div className="wallet-ui-container relative z-30">
              <LoginScreen style={loginStyle} />
            </div>
            
            {/* Safe zone visualization */}
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
            
            {/* Enhanced status indicators */}
            <div className="absolute top-2 right-2 z-35 space-y-1">
              {shouldDisplayMask && (
                <>
                  {((showCustomMask && masksLoaded.custom) || (showExternalMask && masksLoaded.external)) && (
                    <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-white flex items-center text-sm">
                      <CheckCircle className="mr-1" size={14} />
                      {showCustomMask ? 'AI Mask Active' : 'Preset Mask Active'}
                    </div>
                  )}
                  
                  {((showCustomMask && !masksLoaded.custom) || (showExternalMask && !masksLoaded.external)) && (
                    <div className="bg-blue-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-white flex items-center text-sm">
                      <Loader2 className="animate-spin mr-1" size={14} />
                      Loading Mask...
                    </div>
                  )}
                  
                  {loadingError && (
                    <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-lg text-white flex items-center text-sm">
                      <XCircle className="mr-1" size={14} />
                      Load Failed
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* No mask message */}
            {!shouldDisplayMask && (
              <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm px-6 py-4 rounded-lg text-white text-center">
                  <ImageIcon className="mx-auto mb-2" size={24} />
                  <div className="text-sm font-medium">No mask applied</div>
                  <div className="text-xs text-white/70">Draw and generate a cat mask to see it here</div>
                </div>
              </div>
            )}
            
            {/* Compact debug overlay */}
            <div className="absolute bottom-2 left-2 text-xs bg-black/90 text-white rounded p-2 max-w-[400px] z-60">
              <div><strong>🐛 DEBUG:</strong></div>
              <div>Type: {debugInfo.urlType} | Length: {debugInfo.maskImageUrlLength}</div>
              <div>Custom: {showCustomMask ? '✅' : '❌'} | External: {showExternalMask ? '✅' : '❌'}</div>
              <div>Loaded: C:{masksLoaded.custom ? '✅' : '❌'} E:{masksLoaded.external ? '✅' : '❌'}</div>
              {loadingError && <div className="text-red-300">Error: {loadingError}</div>}
            </div>
          </WalletSceneContainer>
        </div>
      </div>
    </ImageFeedbackWrapper>
  );
};

export default V3MaskPreviewCanvas;
