
import React, { useRef } from 'react';
import { useCustomizationStore } from '@/stores/customizationStore';
import { LoginScreen, WalletScreen } from './WalletScreens';
import { Badge } from '@/components/ui/badge';
import MintNftButton from './ExportToIpfsButton';
import ImageFeedbackWrapper from '@/components/feedback/ImageFeedbackWrapper';

const DualWalletPreview = () => {
  const { loginStyle, walletStyle } = useCustomizationStore();
  const dualPreviewRef = useRef<HTMLDivElement>(null);

  // For feedback purposes, create placeholder values
  const previewImageUrl = "/placeholder.svg"; // This would ideally be the actual rendered image
  const previewPrompt = "Dual wallet preview with custom styling";

  return (
    <div className="flex flex-col h-full w-full">
      <ImageFeedbackWrapper imageUrl={previewImageUrl} prompt={previewPrompt}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full" ref={dualPreviewRef}>
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium text-white/90">Login View</h3>
            </div>
            <div className="flex-1 rounded-lg bg-black/10 backdrop-blur-sm p-4 flex items-center justify-center">
              <LoginScreen style={loginStyle} isIndexPage={true} />
            </div>
          </div>
          
          {/* DEMO Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Badge 
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-3 py-1 text-sm font-bold shadow-[0_0_15px_rgba(153,69,255,0.5)] border-white/20 rotate-[-10deg] scale-125"
            >
              DEMO
            </Badge>
          </div>
          
          <div className="flex flex-col h-full">
            <div className="text-center mb-2">
              <h3 className="text-lg font-medium text-white/90">Wallet View</h3>
            </div>
            <div className="flex-1 rounded-lg bg-black/10 backdrop-blur-sm p-4 flex items-center justify-center">
              <WalletScreen style={walletStyle} isIndexPage={true} />
            </div>
          </div>
        </div>
      </ImageFeedbackWrapper>
      
      {/* Mint as NFT Button */}
      <div className="mt-6 flex justify-center">
        <div className="backdrop-blur-sm bg-black/20 rounded-xl p-3">
          <MintNftButton targetRef={dualPreviewRef} />
        </div>
      </div>
    </div>
  );
};

export default DualWalletPreview;
