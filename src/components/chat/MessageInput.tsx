
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
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
  const { sendMessage } = useChatStore();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const currentMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      console.log('💬 Sending chat message:', {
        message: currentMessage,
        activeLayer,
        hasImage: !!uploadedImage,
        selectedElement
      });

      // Create enhanced wallet context for the AI
      const walletContext = {
        walletType: 'phantom',
        activeLayer: activeLayer,
        currentStyle: activeLayer === 'login' ? loginStyle : walletStyle,
        hasUploadedImage: !!uploadedImage,
        selectedElement: selectedElement || undefined,
        layerContext: `${activeLayer} layer customization`,
        isLoginScreen: activeLayer === 'login',
        isWalletScreen: activeLayer === 'wallet'
      };

      const result = await chatWithAI(currentMessage, uploadedImage || undefined, walletContext);
      
      console.log('✅ Chat response received:', result);
      
      // Use the chat store to send the message
      sendMessage({ content: currentMessage });
      
      if (result.styleChanges) {
        toast.success('Style changes applied from AI suggestions!');
      }
    } catch (error) {
      console.error('💥 Chat error:', error);
      toast.error('Sorry, there was an error connecting to AI. Please check API settings or try again later.');
      
      // Still add the message to show what user tried to send
      sendMessage({ content: currentMessage });
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
        placeholder={`Ask AI about your ${activeLayer} design${selectedElement ? ` (${selectedElement})` : ''}...`}
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
