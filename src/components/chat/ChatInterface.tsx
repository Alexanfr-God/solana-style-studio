
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import ModeSelectionModal from './ModeSelectionModal';
import { useChatStore } from '@/stores/chatStore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  walletElement?: string;
  isGenerated?: boolean;
  autoApplied?: boolean;
}

const ChatInterface = () => {
  const { 
    messages, 
    isLoading, 
    chatMode,
    sessionId,
    sendMessage, 
    sendImageGenerationMessage,
    sendStyleAnalysis
  } = useChatStore();
  
  const [selectedElement, setSelectedElement] = useState<string>('');

  const handleStarterClick = (message: string) => {
    console.log('🎯 Handling starter click for mode:', chatMode);
    
    switch (chatMode) {
      case 'analysis':
        sendStyleAnalysis({ content: message, analysisDepth: 'comprehensive' });
        break;
      case 'leonardo':
        sendImageGenerationMessage({ content: message, mode: 'leonardo' });
        break;
      case 'replicate':
        sendImageGenerationMessage({ content: message, mode: 'replicate' });
        break;
      default:
        sendMessage({ content: message });
    }
  };

  const getModeTitle = () => {
    const titles = {
      'analysis': 'Smart Style Analysis',
      'leonardo': 'Leonardo AI Background Generator',
      'replicate': 'Replicate Art Background Generator'
    };
    return titles[chatMode] || 'AI Assistant';
  };

  const getModeDescription = () => {
    const descriptions = {
      'analysis': "Analyze your current wallet style and apply smart improvements. I'll preserve your background while enhancing colors, typography, and effects.",
      'leonardo': "Generate stunning artistic backgrounds with Leonardo.ai. Your new background will be automatically applied to both lock and unlock screens.",
      'replicate': "Create unique art backgrounds with Replicate. Perfect for creative and meme-style designs that will transform your wallet's appearance."
    };
    return descriptions[chatMode] || "AI-powered wallet customization assistant";
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-[835px] flex flex-col">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {getModeTitle()}
              </h3>
              <p className="text-sm text-white/70">
                {getModeDescription()}
              </p>
            </div>
            <ModeSelectionModal />
          </div>
          
          {/* Session Info */}
          <div className="text-xs text-white/40 mb-2">
            Session: {sessionId.split('_')[1]} | Mode: {chatMode} | Language: Auto-detect
          </div>
        </div>
        
        {/* Expanded Message Area */}
        <div className="flex-1 min-h-0 mb-4 h-[650px]">
          <MessageHistory 
            messages={messages} 
            isLoading={isLoading}
            onStarterClick={handleStarterClick}
            currentMode={chatMode}
          />
        </div>
        
        {/* Fixed Input Area */}
        <div className="flex-shrink-0">
          <MessageInput 
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            currentMode={chatMode}
          />
          
          {selectedElement && chatMode === 'analysis' && (
            <div className="mt-2 p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <p className="text-sm text-purple-300">
                Selected element: <span className="font-medium">{selectedElement}</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
