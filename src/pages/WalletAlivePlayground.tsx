
import React from 'react';
import WalletPreviewContainer from '@/components/customization/WalletPreviewContainer';
import ChatInterface from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { WalletChatProvider } from '@/contexts/WalletChatContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const WalletAlivePlayground = () => {
  const handleMintClick = () => {
    console.log('MINT clicked');
    // TODO: Implement mint functionality
  };

  return (
    <WalletChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 pt-20 pb-6 px-6">
          <div className="max-w-7xl mx-auto">
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

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Chat Interface */}
              <div className="space-y-6">
                <ChatInterface />
              </div>
              
              {/* Right Column - Wallet Preview */}
              <div className="lg:col-span-2 space-y-4">
                <WalletPreviewContainer />
                
                {/* MINT Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleMintClick}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-[0_0_20px_rgba(153,69,255,0.4)]"
                  >
                    🚀 MINT NFT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </WalletChatProvider>
  );
};

export default WalletAlivePlayground;
