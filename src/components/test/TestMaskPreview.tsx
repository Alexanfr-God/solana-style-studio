
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { useCustomizationStore } from '@/stores/customizationStore';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { Badge } from '@/components/ui/badge';

const TestMaskPreview = () => {
  const { externalMask, maskImageUrl } = useMaskEditorStore();
  const { loginStyle } = useCustomizationStore();

  // Fixed dimensions for test preview
  const CONTAINER_WIDTH = 500;
  const CONTAINER_HEIGHT = 400;
  const WALLET_WIDTH = 200;
  const WALLET_HEIGHT = 356;

  const previewImageUrl = externalMask || maskImageUrl;

  return (
    <div 
      className="relative bg-gradient-to-br from-black/40 to-purple-900/20 rounded-xl overflow-hidden border border-white/10"
      style={{ 
        width: `${CONTAINER_WIDTH}px`,
        height: `${CONTAINER_HEIGHT}px`
      }}
    >
      {/* Test Canvas Info */}
      <div className="absolute top-2 left-2 z-50">
        <Badge className="bg-blue-500/80 text-white text-xs">
          Test Canvas {CONTAINER_WIDTH}×{CONTAINER_HEIGHT}
        </Badge>
      </div>

      {/* Wallet Container */}
      <div 
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          width: `${WALLET_WIDTH}px`,
          height: `${WALLET_HEIGHT}px`,
          backgroundColor: loginStyle.backgroundColor || '#131313',
          backgroundImage: loginStyle.backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: loginStyle.textColor || '#FFFFFF',
          fontFamily: loginStyle.fontFamily,
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          transform: 'translate(-50%, -50%) scale(0.6)'
        }}
      >
        <LoginScreen style={loginStyle} />
      </div>

      {/* External Mask Overlay */}
      {previewImageUrl && (
        <div 
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            width: `${CONTAINER_WIDTH}px`,
            height: `${CONTAINER_HEIGHT}px`,
          }}
        >
          <img 
            src={previewImageUrl} 
            alt="Test mask overlay" 
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
              imageRendering: 'crisp-edges'
            }}
          />
        </div>
      )}

      {/* Status Indicators */}
      <div className="absolute bottom-2 left-2 z-50">
        <Badge className={`text-xs ${previewImageUrl ? 'bg-green-500/80' : 'bg-gray-500/80'} text-white`}>
          {previewImageUrl ? '✅ Mask Loaded' : '⭕ No Mask'}
        </Badge>
      </div>

      <div className="absolute bottom-2 right-2 z-50">
        <Badge className="bg-purple-500/80 text-white text-xs">
          Wallet {WALLET_WIDTH}×{WALLET_HEIGHT}
        </Badge>
      </div>

      {/* No Preview State */}
      {!previewImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white/60">
            <div className="text-2xl mb-2">🎭</div>
            <div className="text-sm">Run a test to see mask preview</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestMaskPreview;
