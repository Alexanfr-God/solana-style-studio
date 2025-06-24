
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Image, Brain, Sparkles } from 'lucide-react';
import { chatWithAI } from '@/services/apiService';
import { useCustomizationStore } from '@/stores/customizationStore';
import { useChatStore } from '@/stores/chatStore';
import { toast } from 'sonner';

interface MessageInputProps {
  disabled?: boolean;
  selectedElement: string;
  onElementSelect: React.Dispatch<React.SetStateAction<string>>;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  disabled, 
  selectedElement, 
  onElementSelect 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { uploadedImage, activeLayer, loginStyle, walletStyle } = useCustomizationStore();
  const { sendMessage, sendImageGenerationMessage, imageGenerationMode, isLoading: chatIsLoading } = useChatStore();

  const handleSend = async () => {
    if (!message.trim() || isLoading || chatIsLoading) return;

    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      console.log('💬 Sending message in mode:', imageGenerationMode, 'Message:', currentMessage);

      // Направляем запрос в правильную функцию в зависимости от режима
      if (imageGenerationMode === 'analysis') {
        // Режим анализа стилей - используем обычную функцию chat
        await sendMessage({ content: currentMessage });
      } else {
        // Режимы генерации изображений - используем специальную функцию
        await sendImageGenerationMessage({ 
          content: currentMessage, 
          mode: imageGenerationMode 
        });
      }
      
    } catch (error) {
      console.error('💥 Message send error:', error);
      toast.error('Sorry, there was an error sending your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getModeIcon = () => {
    switch (imageGenerationMode) {
      case 'dalle': return <Image className="h-4 w-4 text-green-500" />;
      case 'replicate': return <Sparkles className="h-4 w-4 text-purple-500" />;
      default: return <Brain className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPlaceholder = () => {
    switch (imageGenerationMode) {
      case 'dalle':
        return 'Describe the background image you want DALL-E to generate...';
      case 'replicate':
        return 'Describe the artistic background you want Replicate to create...';
      default:
        return `Ask AI about your ${activeLayer} design${selectedElement ? ` (${selectedElement})` : ''}...`;
    }
  };

  return (
    <div className="space-y-2">
      {/* Mode Indicator */}
      <div className="flex items-center gap-2 text-xs text-white/60">
        {getModeIcon()}
        <span>
          {imageGenerationMode === 'analysis' ? 'Style Analysis Mode' : 
           imageGenerationMode === 'dalle' ? 'DALL-E Generation Mode' : 
           'Replicate Art Mode'}
        </span>
      </div>
      
      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          disabled={disabled || isLoading || chatIsLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || isLoading || chatIsLoading || !message.trim()}
          size="icon"
        >
          {(isLoading || chatIsLoading) ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
