
import React, { useState } from 'react';
import WalletPreviewContainer from '@/components/customization/WalletPreviewContainer';
import ChatInterface from '@/components/chat/ChatInterface';
import WalletAPIDemo from '@/components/api/WalletAPIDemo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageSquare, Palette, Code2 } from 'lucide-react';
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
                AI-powered wallet interface customization with API integration
              </p>
              <div className="mt-2 inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 rounded-full">
                🤖 AI Chat Assistant + Real-time Preview + API Access
              </div>
            </div>
          </div>

          {/* Main Content with Tabs */}
          <Tabs defaultValue="chat" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3 bg-black/30 border-white/10">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat Studio</span>
                  <span className="sm:hidden">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                  <span className="sm:hidden">View</span>
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="hidden sm:inline">API Demo</span>
                  <span className="sm:hidden">API</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="space-y-6">
              {/* Original Chat + Preview Layout */}
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
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      🚀 MINT NFT
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {/* Full Width Preview */}
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <WalletPreviewContainer />
                  
                  {/* MINT Button */}
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleMintClick}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                      🚀 MINT NFT
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-6">
              {/* API Demo Interface */}
              <WalletAPIDemo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </WalletChatProvider>
  );
};

export default WalletAlivePlayground;
