
import React, { useState } from 'react';
import WalletPreviewContainer from '@/components/customization/WalletPreviewContainer';
// import ChatInterface from '@/components/chat/ChatInterface'; // Временно закомментировано
import { Button } from '@/components/ui/button';
import { WalletChatProvider } from '@/contexts/WalletChatContext';
import { SmartEditContextProvider } from '@/contexts/SmartEditContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ThemeSelectorCoverflow from '@/components/customization/ThemeSelectorCoverflow';
import ThemeChat from '@/components/ai/ThemeChat';
import { useUserThemeLoader } from '@/hooks/useUserThemeLoader';

const WalletAlivePlayground = () => {
  // Load user theme from database when wallet connects
  useUserThemeLoader();
  
  const [selectedElementFromPreview, setSelectedElementFromPreview] = useState<string>('');

  const handleMintClick = () => {
    console.log('MINT clicked');
    // TODO: Implement mint functionality
  };

  const handleElementSelectFromPreview = (elementSelector: string) => {
    setSelectedElementFromPreview(elementSelector);
    console.log('🎯 Element selected from preview:', elementSelector);
  };

  return (
    <WalletChatProvider>
      <SmartEditContextProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Fixed Chat Panel - Right Side */}
        <div className="fixed right-4 top-20 bottom-4 w-[360px] z-40">
          <div className="h-full rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm shadow-xl overflow-hidden">
            <ThemeChat />
          </div>
        </div>
        
        {/* Main Content - with right padding to avoid chat overlap */}
        <main className="flex-grow pt-20 pb-6 px-6 pr-[392px]">
          <div className="max-w-full mx-auto">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Wallet UI Customization Studio
                </span>
              </h1>
              <p className="text-gray-400 text-lg">
                AI-powered wallet interface customization with conversational interface
              </p>
              <div className="mt-2 inline-block bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 text-white text-sm px-4 py-2 rounded-full">
                🤖 AI Chat Assistant + Real-time Preview
              </div>
            </div>

            {/* Main Layout - Single Column (chat is now fixed) */}
            <div className="mb-8">
              {/* Wallet Preview */}
              <WalletPreviewContainer 
                onElementSelect={handleElementSelectFromPreview}
              />
            </div>

            {/* MINT NFT Button - Between Preview and Coverflow */}
            <div className="flex justify-center mb-8">
              <Button
                onClick={handleMintClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(153,69,255,0.4)]"
              >
                🚀 MINT NFT
              </Button>
            </div>
            
            {/* Theme Selector Coverflow */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg">
              <ThemeSelectorCoverflow />
            </div>
          </div>
        </main>

        {/* Footer - Will stick to bottom with mt-auto from flex layout */}
        <Footer />
        </div>
      </SmartEditContextProvider>
    </WalletChatProvider>
  );
};

export default WalletAlivePlayground;
