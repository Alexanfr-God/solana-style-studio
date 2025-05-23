
import React, { useEffect, useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import { Badge } from '@/components/ui/badge';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';
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
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Enhanced logging for debugging
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log("🎭 === MASK STATE DEBUG ===", timestamp);
    console.log("  - maskImageUrl:", maskImageUrl);
    console.log("  - maskImageUrl type:", typeof maskImageUrl);
    console.log("  - maskImageUrl length:", maskImageUrl ? maskImageUrl.length : 0);
    console.log("  - externalMask:", externalMask);
    console.log("  - externalMask type:", typeof externalMask);
    console.log("  - Should show mask:", Boolean(maskImageUrl || externalMask));
    console.log("  - Should show custom mask:", Boolean(maskImageUrl && !externalMask));
    console.log("  - Should show external mask:", Boolean(externalMask));
    
    // Check if URL is valid
    if (maskImageUrl) {
      console.log("  - URL starts with:", maskImageUrl.substring(0, 50));
      console.log("  - URL is blob:", maskImageUrl.startsWith('blob:'));
      console.log("  - URL is data:", maskImageUrl.startsWith('data:'));
      console.log("  - URL is http:", maskImageUrl.startsWith('http'));
      console.log("  - URL is https:", maskImageUrl.startsWith('https'));
    }
    
    // Update debug info for UI display
    setDebugInfo({
      timestamp,
      maskImageUrl,
      maskImageUrlLength: maskImageUrl ? maskImageUrl.length : 0,
      externalMask,
      shouldShowMask: Boolean(maskImageUrl || externalMask),
      shouldShowCustom: Boolean(maskImageUrl && !externalMask),
      shouldShowExternal: Boolean(externalMask),
      urlType: maskImageUrl ? (
        maskImageUrl.startsWith('blob:') ? 'blob' :
        maskImageUrl.startsWith('data:') ? 'data' :
        maskImageUrl.startsWith('http') ? 'http' : 'unknown'
      ) : 'none'
    });
    
    // Reset loading states when URLs change
    if (maskImageUrl) {
      setMasksLoaded(prev => ({ ...prev, custom: false }));
      setLoadingError(null);
      console.log("  - Reset custom loading state");
    }
    
    if (externalMask) {
      setMasksLoaded(prev => ({ ...prev, external: false }));
      setLoadingError(null);
      console.log("  - Reset external loading state");
    }
    
    console.log("🎭 === END MASK DEBUG ===");
  }, [maskImageUrl, externalMask]);

  // Test URL accessibility
  useEffect(() => {
    if (maskImageUrl) {
      console.log("🔍 Testing URL accessibility:", maskImageUrl);
      
      // Try to create an Image object to test if URL is accessible
      const testImg = new Image();
      testImg.onload = () => {
        console.log("✅ URL is accessible and valid");
      };
      testImg.onerror = (e) => {
        console.error("❌ URL failed to load:", e);
        console.error("URL:", maskImageUrl);
      };
      testImg.src = maskImageUrl;
    }
  }, [maskImageUrl]);

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
    console.error(`Error details:`, e.currentTarget.src);
    setLoadingError(`Failed to load ${type} mask image. Please try again.`);
    
    // Reset the failing mask URL to clear the error state
    if (type === 'external' && externalMask) {
      setTimeout(() => resetEditor(), 500);
    } else if (type === 'custom' && maskImageUrl) {
      setTimeout(() => resetEditor(), 500);
    }
  };

  return (
    <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
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
                  onLoad={() => handleImageLoaded('external')}
                  onError={(e) => handleImageError('external', e)}
                />
              </div>
            )}
            
            {/* Regular mask (from draw-to-mask generator) - also with cutout */}
            {maskImageUrl && !externalMask && (
              <>
                <div className="absolute z-15 top-2 left-2 bg-yellow-500 text-black text-xs p-1 rounded">
                  CUSTOM MASK RENDERING
                </div>
                <div 
                  className="absolute pointer-events-none z-20 inset-0 border-2 border-green-500"
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
                    className="w-full h-full object-cover border-4 border-red-500"
                    onLoad={() => handleImageLoaded('custom')}
                    onError={(e) => handleImageError('custom', e)}
                    style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                  />
                </div>
              </>
            )}
            
            {/* DEBUG: Direct image display without mask for testing */}
            {maskImageUrl && !externalMask && (
              <div className="absolute z-25 top-0 right-0 w-32 h-32 border-2 border-blue-500 bg-white">
                <div className="text-xs bg-blue-500 text-white p-1">Direct Test</div>
                <img 
                  src={maskImageUrl} 
                  alt="Direct test" 
                  className="w-full h-full object-cover"
                  onLoad={() => console.log("✅ Direct test image loaded")}
                  onError={(e) => console.error("❌ Direct test image failed", e)}
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
            
            {/* Enhanced debug overlay */}
            <div className="absolute bottom-2 left-2 text-xs bg-black/90 text-white rounded p-3 max-w-[500px] z-60 overflow-hidden">
              <div><strong>🐛 DEBUG INFO:</strong></div>
              <div className="truncate">maskImageUrl: {debugInfo.maskImageUrl || 'null'}</div>
              <div className="truncate">URL Length: {debugInfo.maskImageUrlLength}</div>
              <div className="truncate">URL Type: {debugInfo.urlType}</div>
              <div className="truncate">externalMask: {debugInfo.externalMask || 'null'}</div>
              <div>Should Show Mask: {debugInfo.shouldShowMask ? '✅' : '❌'}</div>
              <div>Should Show Custom: {debugInfo.shouldShowCustom ? '✅' : '❌'}</div>
              <div>Custom Loaded: {(maskImageUrl && masksLoaded.custom) ? '✅' : '❌'}</div>
              <div>External Loaded: {(externalMask && masksLoaded.external) ? '✅' : '❌'}</div>
              <div className="text-gray-300 text-xs">Last Update: {debugInfo.timestamp?.substring(11, 19)}</div>
            </div>
          </WalletSceneContainer>
        </div>
      </div>
    </ImageFeedbackWrapper>
  );
};

export default V3MaskPreviewCanvas;
