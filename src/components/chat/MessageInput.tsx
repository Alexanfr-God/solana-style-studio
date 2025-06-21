
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { chatWithAI } from '@/services/apiService';
import { useCustomizationStore } from '@/stores/customizationStore';
import { toast } from 'sonner';

interface MessageInputProps {
  onMessageSent: (message: string, response: string, styleChanges?: any) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onMessageSent, disabled }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { uploadedImage, activeLayer, loginStyle, walletStyle } = useCustomizationStore();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      console.log('💬 Sending chat message:', {
        message: currentMessage,
        activeLayer,
        hasImage: !!uploadedImage
      });

      // Create wallet context for the AI
      const walletContext = {
        walletType: 'phantom',
        activeLayer: activeLayer,
        currentStyle: activeLayer === 'login' ? loginStyle : walletStyle,
        hasUploadedImage: !!uploadedImage
      };

      const result = await chatWithAI(currentMessage, uploadedImage || undefined, walletContext);
      
      console.log('✅ Chat response received:', result);
      
      onMessageSent(currentMessage, result.response, result.styleChanges);
      
      if (result.styleChanges) {
        toast.success('Style changes applied from AI suggestions!');
      }
    } catch (error) {
      console.error('💥 Chat error:', error);
      toast.error('Sorry, there was an error connecting to AI. Please check API settings or try again later.');
      
      // Still add the message to show what user tried to send
      onMessageSent(currentMessage, 'Sorry, there was an error connecting to AI. Please check API settings or try again later.');
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

  return (
    <div className="flex space-x-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={`Ask AI about your ${activeLayer} design...`}
        disabled={disabled || isLoading}
        className="flex-1"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || isLoading || !message.trim()}
        size="icon"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default MessageInput;
