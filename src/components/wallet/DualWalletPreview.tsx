
import React, { useRef, useState } from 'react';
import { useCustomizationStore } from '@/stores/customizationStore';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { LoginScreen, WalletScreen } from './WalletScreens';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, Eye, EyeOff } from 'lucide-react';
import MintNftButton from './ExportToIpfsButton';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';

const DualWalletPreview = () => {
  const { loginStyle, walletStyle } = useCustomizationStore();
  const { externalMask, safeZoneVisible, setSafeZoneVisible } = useMaskEditorStore();
  const dualPreviewRef = useRef<HTMLDivElement>(null);
  const [debugMode, setDebugMode] = useState(false);

  // For feedback purposes, create placeholder values
  const previewImageUrl = externalMask || "/placeholder.svg";
  const previewPrompt = "Dual wallet preview with custom styling";

  console.log('DualWalletPreview rendering with V3 mask:', { externalMask, safeZoneVisible });

  const hasActiveMask = !!externalMask;

  return (
    <div className="flex flex-col h-full w-full">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        {/* Debug Controls */}
        {debugMode && (
          <div className="mb-4 p-3 bg-black/20 border border-white/10 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Debug Info</h4>
            </div>
            <div className="text-xs text-white/70 space-y-1">
              <div>Login Style: Active</div>
              <div>Wallet Style: Active</div>
              <div>V3 External Mask: {externalMask ? 'Applied' : 'None'}</div>
              {externalMask && <div>Mask URL: {externalMask}</div>}
              <div>Safe Zone Visible: {safeZoneVisible ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full relative" ref={dualPreviewRef}>
          {/* Login View */}
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium text-white/90">Login View</h3>
              {hasActiveMask && (
                <p className="text-xs text-purple-300">Custom costume applied</p>
              )}
            </div>
            <div className="flex-1 rounded-lg bg-black/10 backdrop-blur-sm p-4 flex items-center justify-center relative">
              {/* V3 Mask overlay for Login View */}
              {externalMask && (
                <div 
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{
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
                    alt="V3 Wallet mask overlay" 
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('✅ V3 mask loaded in Login View:', externalMask)}
                    onError={(e) => console.error('❌ V3 mask failed to load in Login View:', externalMask, e)}
                  />
                </div>
              )}
              
              {/* Safe zone visualization */}
              {safeZoneVisible && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
                  <div className="border-2 border-purple-500/50 rounded-2xl bg-purple-500/5"
                    style={{
                      width: '320px',
                      height: '569px'
                    }}>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-300 whitespace-nowrap">
                      Protected UI Zone (320×569px)
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative z-50">
                <LoginScreen style={loginStyle} />
              </div>
            </div>
          </div>
          
          {/* DEMO Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60">
            <Badge 
              className={`px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20 rotate-[-10deg] scale-125 ${
                hasActiveMask 
                  ? 'bg-gradient-to-r from-yellow-500 to-purple-700 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-700 text-white'
              }`}
            >
              {hasActiveMask ? 'CUSTOM DEMO' : 'DEMO'}
            </Badge>
          </div>
          
          {/* Wallet View */}
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium text-white/90">Wallet View</h3>
              {hasActiveMask && (
                <p className="text-xs text-purple-300">Custom costume applied</p>
              )}
            </div>
            <div className="flex-1 rounded-lg bg-black/10 backdrop-blur-sm p-4 flex items-center justify-center relative">
              {/* V3 Mask overlay for Wallet View */}
              {externalMask && (
                <div 
                  className="absolute inset-0 z-30 pointer-events-none"
                  style={{
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
                    alt="V3 Wallet mask overlay" 
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('✅ V3 mask loaded in Wallet View:', externalMask)}
                    onError={(e) => console.error('❌ V3 mask failed to load in Wallet View:', externalMask, e)}
                  />
                </div>
              )}
              
              {/* Safe zone visualization */}
              {safeZoneVisible && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
                  <div className="border-2 border-purple-500/50 rounded-2xl bg-purple-500/5"
                    style={{
                      width: '320px',
                      height: '569px'
                    }}>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-300 whitespace-nowrap">
                      Protected UI Zone (320×569px)
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative z-50">
                <WalletScreen style={walletStyle} />
              </div>
            </div>
          </div>
        </div>
      </ImageFeedbackWrapper>
      
      {/* Controls */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={debugMode ? "default" : "outline"}
            size="sm"
            onClick={() => setDebugMode(!debugMode)}
            className="border-white/10"
          >
            <Bug className="mr-2 h-3 w-3" />
            {debugMode ? "Debug: ON" : "Debug: OFF"}
          </Button>
          
          <Button
            variant={safeZoneVisible ? "default" : "outline"}
            size="sm"
            onClick={() => setSafeZoneVisible(!safeZoneVisible)}
            className="border-white/10"
          >
            {safeZoneVisible ? <Eye className="mr-2 h-3 w-3" /> : <EyeOff className="mr-2 h-3 w-3" />}
            Safe Zone: {safeZoneVisible ? "ON" : "OFF"}
          </Button>
        </div>
        
        <div className="backdrop-blur-sm bg-black/20 rounded-xl p-3">
          <MintNftButton targetRef={dualPreviewRef} />
        </div>
      </div>
    </div>
  );
};

export default DualWalletPreview;
