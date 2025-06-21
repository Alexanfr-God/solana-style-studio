
import React from 'react';
import WalletPreviewContainer from '@/components/customization/WalletPreviewContainer';
import ChatInterface from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletChatProvider } from '@/contexts/WalletChatContext';

const WalletAlivePlayground = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  const handleMintClick = () => {
    console.log('MINT clicked');
    // TODO: Implement mint functionality
  };

  return (
    <WalletChatProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={handleBackClick}
                className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
            
            {/* Title Section */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                Wallet UI Customization Studio
              </h1>
              <p className="text-gray-400 text-lg">
                AI-powered wallet interface customization with conversational interface
              </p>
              <div className="mt-2 inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 rounded-full">
                🤖 AI Chat Assistant + Real-time Preview
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Chat Interface */}
            <div className="space-y-6">
              <ChatInterface />
            </div>
            
            {/* Right Column - Wallet Preview - теперь использует новый контейнер с playground компонентами */}
            <div className="lg:col-span-2 space-y-4">
              <WalletPreviewContainer />
              
              {/* MINT Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleMintClick}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  🚀 MINT NFT
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WalletChatProvider>
  );
};

export default WalletAlivePlayground;
