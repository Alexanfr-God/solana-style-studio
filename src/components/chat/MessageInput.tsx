
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Image, Brain, Sparkles, Upload, X } from 'lucide-react';
import { useChatStore, ChatMode } from '@/stores/chatStore';
import { toast } from 'sonner';

interface MessageInputProps {
  disabled?: boolean;
  selectedElement: string;
  onElementSelect: React.Dispatch<React.SetStateAction<string>>;
  currentMode?: ChatMode;
}

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
  size: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  disabled, 
  selectedElement, 
  onElementSelect,
  currentMode 
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, sendImageGenerationMessage, imageGenerationMode, isLoading: chatIsLoading } = useChatStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (images only for now)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select an image file (JPG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setUploadedFile({
        file,
        preview,
        name: file.name,
        size: formatFileSize(file.size)
      });
    };
    reader.readAsDataURL(file);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const handleSend = async () => {
    if ((!message.trim() && !uploadedFile) || isLoading || chatIsLoading) return;

    const currentMessage = message.trim() || 'Analyze this image';
    setMessage('');
    const fileToSend = uploadedFile;
    setUploadedFile(null);
    setIsLoading(true);

    try {
      console.log('💬 [ИСПРАВЛЕНИЕ] MessageInput отправка:');
      console.log('💬 [ИСПРАВЛЕНИЕ] Режим imageGenerationMode:', imageGenerationMode);
      console.log('💬 [ИСПРАВЛЕНИЕ] Сообщение:', currentMessage);
      console.log('💬 [ИСПРАВЛЕНИЕ] Есть файл:', !!fileToSend);

      // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Четкая логика выбора обработчика
      if (imageGenerationMode === 'leonardo') {
        console.log('🎨 [ИСПРАВЛЕНИЕ] Вызываем Leonardo генерацию через sendImageGenerationMessage');
        await sendImageGenerationMessage({ 
          content: currentMessage, 
          mode: 'leonardo' 
        });
      } else if (imageGenerationMode === 'replicate') {
        console.log('🎨 [ИСПРАВЛЕНИЕ] Вызываем Replicate генерацию через sendImageGenerationMessage');
        await sendImageGenerationMessage({ 
          content: currentMessage, 
          mode: 'replicate' 
        });
      } else {
        console.log('🧠 [ИСПРАВЛЕНИЕ] Вызываем анализ стилей через sendMessage');
        await sendMessage({ 
          content: currentMessage,
          imageUrl: fileToSend?.preview || null
        });
      }
      
    } catch (error) {
      console.error('💥 [ИСПРАВЛЕНИЕ] Ошибка отправки:', error);
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
      case 'leonardo': return <Image className="h-4 w-4 text-green-500" />;
      case 'replicate': return <Sparkles className="h-4 w-4 text-purple-500" />;
      default: return <Brain className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPlaceholder = () => {
    switch (imageGenerationMode) {
      case 'leonardo':
        return 'Describe the background image you want Leonardo.ai to generate...';
      case 'replicate':
        return 'Describe the artistic background you want Replicate to create...';
      default:
        return `Ask AI about your design${selectedElement ? ` (${selectedElement})` : ''}...`;
    }
  };

  return (
    <div className="space-y-3">
      {/* ✅ ИСПРАВЛЕНИЕ: Четкий индикатор режима */}
      <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 px-3 py-2 rounded-lg">
        {getModeIcon()}
        <span className="font-medium">
          {imageGenerationMode === 'analysis' ? '🧠 Style Analysis Mode' : 
           imageGenerationMode === 'leonardo' ? '🎨 Leonardo.ai Generation Mode' : 
           '🎨 Replicate Art Mode'}
        </span>
        {imageGenerationMode !== 'analysis' && (
          <span className="text-green-400 text-xs">→ Will generate image</span>
        )}
      </div>
      
      {/* File Preview */}
      {uploadedFile && (
        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="w-16 h-12 bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={uploadedFile.preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{uploadedFile.name}</p>
            <p className="text-xs text-white/60">{uploadedFile.size}</p>
          </div>
          <Button
            onClick={removeFile}
            size="sm"
            variant="ghost"
            className="p-1 h-auto text-white/60 hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          disabled={disabled || isLoading || chatIsLoading}
          className="flex-1 min-h-[80px] max-h-[120px] resize-none"
          rows={2}
        />
        
        {/* File Upload Button */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading || chatIsLoading}
            size="icon"
            variant="outline"
            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10"
          >
            <Upload className="h-4 w-4" />
          </Button>
          
          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={disabled || isLoading || chatIsLoading || (!message.trim() && !uploadedFile)}
            size="icon"
          >
            {(isLoading || chatIsLoading) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MessageInput;
