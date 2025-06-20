
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Edit3, MessageCircle, Send, X } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import ElementSelector from './ElementSelector';
import { toast } from 'sonner';

interface MessageInputProps {
  selectedElement: string;
  onElementSelect: (element: string) => void;
}

const MessageInput = ({ selectedElement, onElementSelect }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showElementSelector, setShowElementSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading } = useChatStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
          toast.success('Image uploaded successfully');
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !uploadedImage) return;

    await sendMessage({
      content: message,
      imageUrl: uploadedImage,
      walletElement: selectedElement
    });

    setMessage('');
    setUploadedImage(null);
    onElementSelect('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-3">
      {uploadedImage && (
        <div className="relative inline-block">
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="max-w-32 h-auto rounded-lg border border-white/20"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={() => setUploadedImage(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to change in your wallet..."
            className="bg-black/30 border-white/20 text-white placeholder-white/50 resize-none"
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white/80"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4 mr-1" />
            File
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white/80"
            onClick={() => setShowElementSelector(true)}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-white/20 text-white/80"
            onClick={() => setMessage(prev => prev + '\n\n[Thinking mode: Please analyze the wallet structure and suggest improvements]')}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </div>

        <Button
          onClick={handleSendMessage}
          disabled={isLoading || (!message.trim() && !uploadedImage)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showElementSelector && (
        <ElementSelector
          onSelect={(element) => {
            onElementSelect(element);
            setShowElementSelector(false);
          }}
          onClose={() => setShowElementSelector(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;
