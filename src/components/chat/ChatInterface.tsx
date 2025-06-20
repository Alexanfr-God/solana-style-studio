
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MessageHistory from './MessageHistory';
import MessageInput from './MessageInput';
import { useChatStore } from '@/stores/chatStore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  walletElement?: string;
}

const ChatInterface = () => {
  const { messages, isLoading, sendMessage } = useChatStore();
  const [selectedElement, setSelectedElement] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStarterClick = (message: string) => {
    sendMessage({ content: message });
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full flex flex-col">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">
            Wallet Customization Chat
          </h3>
          <p className="text-sm text-white/70">
            Describe what you want to change in your wallet, upload images for inspiration, or select specific elements to modify.
          </p>
        </div>
        
        <div className="flex-1 flex flex-col min-h-0">
          <MessageHistory 
            messages={messages} 
            isLoading={isLoading}
            onStarterClick={handleStarterClick}
          />
          <div ref={messagesEndRef} />
        </div>
        
        <div className="mt-4">
          <MessageInput 
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
          />
        </div>
        
        {selectedElement && (
          <div className="mt-2 p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
            <p className="text-sm text-purple-300">
              Selected element: <span className="font-medium">{selectedElement}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
