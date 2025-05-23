
import React, { useEffect, useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { WalletSceneContainer } from '@/components/wallet/WalletSceneContainer';
import { Badge } from '@/components/ui/badge';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';
import { AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

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
  const [urlTestResults, setUrlTestResults] = useState<any>({});
  
  // Enhanced logging and URL testing
  useEffect(() => {
    const timestamp = new Date().toISOString();
    console.log("🎭 === ENHANCED MASK STATE DEBUG ===", timestamp);
    console.log("  - maskImageUrl:", maskImageUrl);
    console.log("  - maskImageUrl type:", typeof maskImageUrl);
    console.log("  - maskImageUrl length:", maskImageUrl ? maskImageUrl.length : 0);
    console.log("  - externalMask:", externalMask);
    console.log("  - Should show mask:", Boolean(maskImageUrl || externalMask));
    
    // Test URL accessibility
    const testUrls = async () => {
      const results: any = {};
      
      if (maskImageUrl) {
        console.log("🔍 Testing maskImageUrl accessibility...");
        try {
          if (maskImageUrl.startsWith('http')) {
            const response = await fetch(maskImageUrl, { method: 'HEAD' });
            results.custom = {
              url: maskImageUrl,
              status: response.status,
              ok: response.ok,
              accessible: response.ok
            };
            console.log("Custom mask URL test:", results.custom);
          } else {
            results.custom = {
              url: maskImageUrl,
              status: 'local',
              ok: true,
              accessible: true
            };
          }
        } catch (error) {
          results.custom = {
            url: maskImageUrl,
            error: error.message,
            accessible: false
          };
          console.error("❌ Custom mask URL test failed:", error);
        }
      }
      
      if (externalMask) {
        console.log("🔍 Testing externalMask accessibility...");
        try {
          if (externalMask.startsWith('http')) {
            const response = await fetch(externalMask, { method: 'HEAD' });
            results.external = {
              url: externalMask,
              status: response.status,
              ok: response.ok,
              accessible: response.ok
            };
          } else {
            results.external = {
              url: externalMask,
              status: 'local',
              ok: true,
              accessible: true
            };
          }
          console.log("External mask URL test:", results.external);
        } catch (error) {
          results.external = {
            url: externalMask,
            error: error.message,
            accessible: false
          };
          console.error("❌ External mask URL test failed:", error);
        }
      }
      
      setUrlTestResults(results);
    };
    
    testUrls();
    
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
        maskImageUrl.startsWith('http') ? 'http' : 'local'
      ) : 'none'
    });
    
    // Reset loading states when URLs change
    if (maskImageUrl) {
      setMasksLoaded(prev => ({ ...prev, custom: false }));
      setLoadingError(null);
    }
    
    if (externalMask) {
      setMasksLoaded(prev => ({ ...prev, external: false }));
      setLoadingError(null);
    }
    
    console.log("🎭 === END ENHANCED DEBUG ===");
  }, [maskImageUrl, externalMask]);

  const previewImageUrl = externalMask || maskImageUrl || "/placeholder.svg";
  const previewPrompt = "AI-generated wallet mask customization";
  
  const shouldDisplayMask = Boolean(maskImageUrl || externalMask);
  
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
    setLoadingError(`Failed to load ${type} mask image. URL may be expired or inaccessible.`);
  };

  return (
    <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
      <div className="relative w-full h-[800px] flex items-center justify-center">
        <div className="relative">
          <WalletSceneContainer style={loginStyle}>
            {/* External mask layer */}
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
            
            {/* Custom mask (from AI generation) */}
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
                  alt="AI generated mask" 
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
            
            {/* Status indicators */}
            {shouldDisplayMask && (
              <div className="absolute top-2 right-2 z-35">
                {((externalMask && masksLoaded.external) || (maskImageUrl && masksLoaded.custom && !externalMask)) && (
                  <div className="bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-lg text-white flex items-center text-sm">
                    <CheckCircle className="mr-1" size={14} />
                    Mask Active
                  </div>
                )}
                
                {((externalMask && !masksLoaded.external) || (maskImageUrl && !masksLoaded.custom && !externalMask)) && (
                  <div className="bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-lg text-white flex items-center text-sm">
                    <Loader2 className="animate-spin mr-1" size={14} />
                    Loading Mask...
                  </div>
                )}
                
                {loadingError && (
                  <div className="bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-lg text-white flex items-center text-sm">
                    <XCircle className="mr-1" size={14} />
                    Load Failed
                  </div>
                )}
              </div>
            )}
            
            {/* No mask message */}
            {!shouldDisplayMask && (
              <div className="absolute inset-0 flex items-center justify-center z-25 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-sm">
                  Draw and generate a mask to see it applied here
                </div>
              </div>
            )}
            
            {/* Enhanced debug overlay */}
            <div className="absolute bottom-2 left-2 text-xs bg-black/90 text-white rounded p-3 max-w-[600px] z-60 overflow-hidden">
              <div><strong>🐛 ENHANCED DEBUG INFO:</strong></div>
              <div className="truncate">maskImageUrl: {debugInfo.maskImageUrl || 'null'}</div>
              <div className="truncate">URL Length: {debugInfo.maskImageUrlLength}</div>
              <div className="truncate">URL Type: {debugInfo.urlType}</div>
              <div className="truncate">externalMask: {debugInfo.externalMask || 'null'}</div>
              <div>Should Show Mask: {debugInfo.shouldShowMask ? '✅' : '❌'}</div>
              <div>Custom Loaded: {(maskImageUrl && masksLoaded.custom) ? '✅' : '❌'}</div>
              <div>External Loaded: {(externalMask && masksLoaded.external) ? '✅' : '❌'}</div>
              
              {/* URL test results */}
              {urlTestResults.custom && (
                <div className="text-yellow-300">
                  Custom URL Test: {urlTestResults.custom.accessible ? '✅' : '❌'} 
                  {urlTestResults.custom.status && ` (${urlTestResults.custom.status})`}
                </div>
              )}
              {urlTestResults.external && (
                <div className="text-yellow-300">
                  External URL Test: {urlTestResults.external.accessible ? '✅' : '❌'}
                  {urlTestResults.external.status && ` (${urlTestResults.external.status})`}
                </div>
              )}
              
              <div className="text-gray-300 text-xs">Last Update: {debugInfo.timestamp?.substring(11, 19)}</div>
            </div>
          </WalletSceneContainer>
        </div>
      </div>
    </ImageFeedbackWrapper>
  );
};

export default V3MaskPreviewCanvas;
