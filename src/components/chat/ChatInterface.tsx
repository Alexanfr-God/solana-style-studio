
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import ImageGenerationSelector from './ImageGenerationSelector';
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
  const { messages, isLoading, sendMessage, sendImageGenerationMessage, imageGenerationMode } = useChatStore();
  const [selectedElement, setSelectedElement] = useState<string>('');

  const handleStarterClick = (message: string) => {
    // Правильно направляем запросы в зависимости от режима
    if (imageGenerationMode === 'analysis') {
      sendMessage({ content: message });
    } else {
      // Для режимов генерации изображений всегда используем специализированный метод
      sendImageGenerationMessage({ content: message, mode: imageGenerationMode });
    }
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-[835px] flex flex-col">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Wallet Customization Chat
          </h3>
          <p className="text-sm text-white/70 mb-3">
            {imageGenerationMode === 'analysis' 
              ? "Describe what you want to change in your wallet, upload images for inspiration, or select specific elements to modify."
              : imageGenerationMode === 'leonardo'
              ? "Describe the background image you want to generate with Leonardo.ai. Be creative and detailed!"
              : "Describe the artistic background you want to create with Replicate. Perfect for crypto art and memes!"
            }
          </p>
          
          {/* Image Generation Mode Selector */}
          <ImageGenerationSelector />
        </div>
        
        {/* Fixed Height Message Area */}
        <div className="flex-1 min-h-0 mb-4 h-[565px]">
          <MessageHistory 
            messages={messages} 
            isLoading={isLoading}
            onStarterClick={handleStarterClick}
          />
        </div>
        
        {/* Fixed Input Area */}
        <div className="flex-shrink-0">
          <MessageInput 
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
          />
          
          {selectedElement && imageGenerationMode === 'analysis' && (
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
