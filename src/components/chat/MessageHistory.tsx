import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Bot, Image as ImageIcon, Sparkles, GitCompare } from 'lucide-react';
import { ChatMessage } from './types';

interface MessageHistoryProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onStarterClick?: (message: string) => void;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ 
  messages, 
  isLoading,
  onStarterClick 
}) => {
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <Card className={`
              max-w-[80%] p-3 border-white/10
              ${message.type === 'user' 
                ? 'bg-blue-600/20 ml-8' 
                : 'bg-black/30 mr-8'
              }
            `}>
              <div className="flex items-center gap-2 mb-2">
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-blue-400" />
                ) : (
                  <Bot className="h-4 w-4 text-purple-400" />
                )}
                
                <span className="text-xs text-white/60">
                  {formatTimestamp(message.timestamp)}
                </span>

                {message.isGenerated && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Generated
                  </Badge>
                )}

                {message.autoApplied && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Auto-Applied
                  </Badge>
                )}

                {message.isPatchPreview && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 text-xs">
                    <GitCompare className="h-3 w-3 mr-1" />
                    Preview
                  </Badge>
                )}
              </div>

              <div className="text-sm text-white/90 whitespace-pre-wrap">
                {message.content}
              </div>

              {message.imageUrl && (
                <div className="mt-2">
                  <img 
                    src={message.imageUrl} 
                    alt="Generated content" 
                    className="max-w-full h-auto rounded border border-white/10"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}

              {message.walletElement && (
                <Badge variant="outline" className="mt-2 border-white/20 text-white/70">
                  Element: {message.walletElement}
                </Badge>
              )}
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-black/30 mr-8 p-3 border-white/10">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-400" />
                <Loader2 className="h-4 w-4 animate-spin text-white/60" />
                <span className="text-sm text-white/60">Thinking...</span>
              </div>
            </Card>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8 text-white/60">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start a conversation with your AI assistant</p>
            {onStarterClick && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-white/40">Quick starters:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Analyze my wallet style",
                    "Make it darker",
                    "Add neon accents"
                  ].map((starter) => (
                    <button
                      key={starter}
                      onClick={() => onStarterClick(starter)}
                      className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageHistory;
