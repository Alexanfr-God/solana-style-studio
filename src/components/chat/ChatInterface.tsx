
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import ModeSelector from './ModeSelector';
import { useChatStore } from '@/stores/chatStore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  walletElement?: string;
  isGenerated?: boolean;
}

const ChatInterface = () => {
  const { 
    messages, 
    isLoading, 
    chatMode,
    sessionId,
    sendMessage, 
    sendImageGenerationMessage,
    sendStructureRequest,
    sendChatMessage,
    sendStyleAnalysis,
    saveCommunityCustomization,
    loadCustomization
  } = useChatStore();
  
  const [selectedElement, setSelectedElement] = useState<string>('');

  const handleStarterClick = (message: string) => {
    console.log('🎯 Handling starter click for mode:', chatMode);
    
    switch (chatMode) {
      case 'analysis':
        sendMessage({ content: message });
        break;
      case 'leonardo':
      case 'replicate':
        sendImageGenerationMessage({ content: message, mode: chatMode });
        break;
      case 'structure':
        sendStructureRequest({ content: message, analysisType: 'detailed' });
        break;
      case 'chat':
        sendChatMessage({ content: message, contextual: true });
        break;
      case 'style-analysis':
        sendStyleAnalysis({ content: message, analysisDepth: 'comprehensive' });
        break;
      case 'save':
        // Handle save mode - would typically open a save dialog
        console.log('💾 Save mode activated');
        break;
      case 'load':
        // Handle load mode - would typically open a load dialog
        console.log('📥 Load mode activated');
        break;
      default:
        sendMessage({ content: message });
    }
  };

  const getModeTitle = () => {
    const titles = {
      'analysis': 'Style Analysis Chat',
      'leonardo': 'Leonardo AI Image Generation',
      'replicate': 'Replicate Art Generation',
      'structure': 'Wallet Structure Analysis',
      'chat': 'Conversational AI Chat',
      'style-analysis': 'Deep Style Analysis',
      'save': 'Save to Community',
      'load': 'Load from Community'
    };
    return titles[chatMode] || 'AI Assistant';
  };

  const getModeDescription = () => {
    const descriptions = {
      'analysis': "Describe what you want to change in your wallet, upload images for inspiration, or select specific elements to modify.",
      'leonardo': "Describe the background image you want to generate with Leonardo.ai. Be creative and detailed!",
      'replicate': "Describe the artistic background you want to create with Replicate. Perfect for crypto art and memes!",
      'structure': "Analyze your wallet's structure, element hierarchy, and layout relationships.",
      'chat': "Have conversations with AI that remembers context. Ask follow-up questions and build on ideas.",
      'style-analysis': "Deep dive into style analysis with comprehensive design recommendations and insights.",
      'save': "Save your current wallet customization to the community library for others to discover.",
      'load': "Browse and load customizations from the community library created by other users."
    };
    return descriptions[chatMode] || "AI-powered wallet customization assistant";
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-[835px] flex flex-col">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            {getModeTitle()}
          </h3>
          <p className="text-sm text-white/70 mb-3">
            {getModeDescription()}
          </p>
          
          {/* Session Info */}
          <div className="text-xs text-white/40 mb-3">
            Session: {sessionId.split('_')[1]} | Mode: {chatMode}
          </div>
          
          {/* Mode Selector */}
          <ModeSelector />
        </div>
        
        {/* Fixed Height Message Area */}
        <div className="flex-1 min-h-0 mb-4 h-[565px]">
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
          
          {selectedElement && (chatMode === 'analysis' || chatMode === 'style-analysis') && (
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
