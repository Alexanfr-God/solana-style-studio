
import React, { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatInterface';
import { Bot, User, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatStarters from './ChatStarters';

interface MessageHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onStarterClick?: (message: string) => void;
}

const MessageHistory = ({ messages, isLoading, onStarterClick }: MessageHistoryProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0 && !userScrolled) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [messages, isLoading, userScrolled]);

  // Handle scroll events to detect user scrolling
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setShowScrollButton(!isAtBottom && messages.length > 0);
    
    // Detect if user manually scrolled
    if (!isAtBottom) {
      setUserScrolled(true);
    } else {
      setUserScrolled(false);
    }
  };

  const handleScrollToBottom = () => {
    setUserScrolled(false);
    scrollToBottom(true);
  };

  return (
    <div className="relative h-full">
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-full w-full"
        onScrollCapture={handleScroll}
      >
        <div className="space-y-4 pr-4 pb-4 min-h-full">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 text-sm mb-6">
                Start customizing your wallet by describing what you want to change!
              </p>
              {onStarterClick && <ChatStarters onStarterClick={onStarterClick} />}
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {message.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={message.imageUrl}
                      alt="Uploaded image"
                      className="max-w-full h-auto rounded-lg"
                    />
                    <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                      <ImageIcon className="h-3 w-3" />
                      <span>Uploaded image</span>
                    </div>
                  </div>
                )}
                
                {message.walletElement && (
                  <div className="mb-2 p-2 bg-black/20 rounded text-xs">
                    <span className="opacity-70">Element: </span>
                    <span className="font-medium">{message.walletElement}</span>
                  </div>
                )}
                
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
                
                <div className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-lg p-3 bg-gray-700 text-white">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Button
          onClick={handleScrollToBottom}
          className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700 border-2 border-white/20 shadow-lg"
          size="sm"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default MessageHistory;
