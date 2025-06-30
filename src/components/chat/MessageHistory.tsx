
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './ChatInterface';
import ChatStarters from './ChatStarters';
import { useChatStore, ChatMode } from '@/stores/chatStore';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Download, Lock, Unlock, Sparkles, CheckCircle } from 'lucide-react';

interface MessageHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onStarterClick: (message: string) => void;
  currentMode?: ChatMode;
}

const MessageHistory = ({ messages, isLoading, onStarterClick }: MessageHistoryProps) => {
  const { applyGeneratedImage } = useChatStore();
  const { 
    applyBackgroundToLoginLayer, 
    applyBackgroundToWalletLayer, 
    applyBackgroundToBothLayers 
  } = useWalletCustomizationStore();

  const handleDownloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `wallet-background-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-2">
        {messages.length === 0 && (
          <ChatStarters onStarterClick={onStarterClick} />
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[80%] p-3 rounded-lg
                ${message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white backdrop-blur-sm'
                }
              `}
            >
              {/* Message Content */}
              <p className="text-sm whitespace-pre-wrap">
                {message.content}
              </p>
              
              {/* User uploaded image */}
              {message.imageUrl && !message.isGenerated && (
                <div className="mt-2">
                  <img
                    src={message.imageUrl}
                    alt="Uploaded reference"
                    className="max-w-full h-auto rounded-lg border border-white/20"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
              
              {/* Generated image with new layer-specific action buttons */}
              {message.imageUrl && message.isGenerated && (
                <div className="mt-3 space-y-2">
                  <img
                    src={message.imageUrl}
                    alt="Generated background"
                    className="max-w-full h-auto rounded-lg border border-white/20"
                    style={{ maxHeight: '200px' }}
                  />
                  
                  {/* Status indicator for auto-applied images */}
                  {message.autoApplied && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/20 rounded border border-green-500/30">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-green-300">
                        ✨ Automatically applied as wallet background
                      </span>
                    </div>
                  )}
                  
                  {/* NEW: Layer-specific action buttons */}
                  <div className="flex flex-col gap-2">
                    {/* Show layer-specific buttons only for non-auto-applied images */}
                    {!message.autoApplied && (
                      <>
                        {/* First row - Layer specific buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            onClick={() => applyBackgroundToLoginLayer(message.imageUrl!)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1"
                            title="Apply to Login Screen"
                          >
                            <Lock className="w-3 h-3" />
                            Apply Lock 🔒
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => applyBackgroundToWalletLayer(message.imageUrl!)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs flex items-center gap-1"
                            title="Apply to Wallet Screen"
                          >
                            <Unlock className="w-3 h-3" />
                            Apply Unlock 🔓
                          </Button>
                        </div>

                        {/* Second row - Apply Both button */}
                        <Button
                          size="sm"
                          onClick={() => applyBackgroundToBothLayers(message.imageUrl!)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center gap-1 w-full"
                          title="Apply to Both Screens"
                        >
                          <Sparkles className="w-3 h-3" />
                          Apply Both 🔒✨
                        </Button>
                      </>
                    )}
                    
                    {/* Always show Download button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadImage(message.imageUrl!)}
                      className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Timestamp */}
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white backdrop-blur-sm p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageHistory;
