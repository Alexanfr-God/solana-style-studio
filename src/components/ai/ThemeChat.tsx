import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Send, Paperclip, X } from 'lucide-react';
import { handleUserMessage } from '@/ai/agent';
import { useThemeStore, THEME_STORE_INSTANCE_ID } from '@/state/themeStore';
import type { ThemePatch } from '@/state/themeStore';
import { v4 as uuidv4 } from 'uuid';
import { uploadToStorage } from '@/ai/storage';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// Language detection function
function detectLang(text: string): 'en' | 'ru' {
  if (/[а-яё]/i.test(text)) return 'ru';
  return 'en';
}

export default function ThemeChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const applyPatch = useThemeStore(s => s.applyPatch);
  const theme = useThemeStore(s => s.theme);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notifiedRef = useRef<string | null>(null);

  // Диагностика store instance
  console.log('[AI] theme store id', THEME_STORE_INSTANCE_ID);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = viewportRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('[UPLOAD] start', file.name, 'size=', file.size, 'type=', file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (8MB limit)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (file.size > maxSize) {
      toast.error('Max file size is 8MB');
      return;
    }

    setIsUploading(true);

    try {
      // Generate path: user-uploads/YYYY/MM/DD/timestamp-random.ext
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const timestamp = now.getTime();
      const random = Math.random().toString(36).substring(2, 8);
      const extension = file.name.split('.').pop() || 'jpg';
      const path = `user-uploads/${year}/${month}/${day}/${timestamp}-${random}.${extension}`;

      const publicUrl = await uploadToStorage(file, path);
      
      console.log('[STORAGE] uploaded url=', publicUrl);

      // Guard against double calls in StrictMode
      if (publicUrl && publicUrl !== notifiedRef.current) {
        notifiedRef.current = publicUrl;
        setUploadedImageUrl(publicUrl);
        
        // Add system message
        const systemMessage: Message = {
          role: 'ai',
          text: 'Image uploaded successfully! Choose where to apply it:',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
        
        toast.success('🖼️ Image uploaded successfully!');
      }
    } catch (error) {
      console.error('[UPLOAD] error:', error);
      toast.error('Failed to upload image. Please check the connection and try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const applyImageTo = (target: 'home' | 'lock' | 'all' | 'headers') => {
    if (!uploadedImageUrl) return;

    let operations = [];
    let description = '';

    switch (target) {
      case 'home':
        operations = [
          { op: 'replace', path: '/homeLayer/backgroundImage', value: uploadedImageUrl }
        ];
        description = 'Applied to Home screen';
        break;
      
      case 'lock':
        operations = [
          { op: 'replace', path: '/lockLayer/backgroundImage', value: uploadedImageUrl }
        ];
        description = 'Applied to Lock screen';
        break;
      
      case 'all':
        operations = [
          { op: 'replace', path: '/lockLayer/backgroundImage', value: uploadedImageUrl },
          { op: 'replace', path: '/homeLayer/backgroundImage', value: uploadedImageUrl }
        ];
        description = 'Applied to all main screens (Lock + Home)';
        break;
      
      case 'headers':
        operations = [
          { op: 'replace', path: '/homeLayer/header/backgroundImage', value: uploadedImageUrl },
          { op: 'replace', path: '/homeLayer/footer/backgroundImage', value: uploadedImageUrl }
        ];
        description = 'Applied to headers and footers';
        break;
    }

    const patchEntry: ThemePatch = {
      id: uuidv4(),
      operations,
      userPrompt: `Apply uploaded image: ${description}`,
      pageId: 'ai-chat',
      timestamp: new Date(),
      theme: theme
    };

    applyPatch(patchEntry);

    // Add confirmation message
    const confirmMessage: Message = {
      role: 'ai',
      text: `✅ ${description}. Your wallet theme has been updated!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmMessage]);

    toast.success(`🎨 ${description}!`);
  };

  const removeUploadedImage = () => {
    setUploadedImageUrl('');
    notifiedRef.current = null;
    toast.success('Image removed');
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || isProcessing) return;

    // Detect language from user input
    const detectedLang = detectLang(message);

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      role: 'user',
      text: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      console.log('[AI] processing command:', message);
      const result = await handleUserMessage(message, detectedLang);
      console.log('[AI] patch result:', result.patch);

      // Log patch operations count for mass operations
      if (result.patch.length > 0) {
        console.log(`[STORE] AI patch ops ${result.patch.length}`);
      }

      // Применяем патч локально (оптимистично)
      if (result.patch.length > 0) {
        const patchEntry: ThemePatch = {
          id: uuidv4(),
          operations: result.patch,
          userPrompt: message,
          pageId: 'global', // Default page
          timestamp: new Date(),
          theme: theme // Current theme state
        };
        
        applyPatch(patchEntry);
        
        // Отправляем на backend (fire-and-forget)
        fetch('/api/theme/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patch: result.patch })
        }).catch(error => {
          console.warn('[AI] backend save failed:', error);
        });
      }

      // Добавляем ответ AI (agent now handles localization)
      const aiMessage: Message = {
        role: 'ai',
        text: result.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('[AI] processing error:', error);
      const errorMessage: Message = {
        role: 'ai',
        text: detectedLang === 'ru' 
          ? 'Произошла ошибка при обработке команды. Попробуйте ещё раз.'
          : 'An error occurred while processing the command. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-400" />
          AI Theme Chat
        </CardTitle>
        <p className="text-sm text-white/70">
          Modify wallet theme with simple commands or upload images
        </p>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-4 overflow-hidden">
        {/* Message History with native scroll */}
        <div 
          ref={viewportRef}
          className="flex-1 overflow-auto border border-white/10 rounded p-3 bg-black/20"
        >
          {messages.length === 0 ? (
            <div className="text-white/50 text-sm">
              Write a command to change the theme or upload an image...
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`text-sm ${
                  msg.role === 'user' 
                    ? 'text-blue-300 font-medium' 
                    : 'text-green-300'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          {isProcessing && (
            <div className="text-sm text-purple-300 animate-pulse">
              Processing command...
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="flex-shrink-0 space-y-2">
          <form className="flex flex-col gap-2" onSubmit={handleSend}>
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Try: Make all buttons #FF5C00 · Dark theme for the whole wallet · Font: Sora"
                className="flex-1 min-h-[100px] max-h-[200px] resize-none overflow-y-auto bg-white/10 border-white/20 text-white placeholder:text-white/40"
                disabled={isProcessing}
                rows={3}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50 transition-colors"
                aria-label="Upload image"
                title="Upload background image"
              >
                <Paperclip className={`h-5 w-5 ${isUploading ? 'animate-pulse' : ''}`} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFilePick}
              />
            </div>

            {/* Uploaded image preview and enhanced application options */}
            {uploadedImageUrl && (
              <div className="flex flex-col gap-2 p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={uploadedImageUrl} 
                    alt="Uploaded background" 
                    className="h-12 w-12 rounded-lg object-cover border border-white/20"
                  />
                  <div className="flex-1 text-sm text-white/80">
                    Background image ready to apply
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeUploadedImage}
                    className="text-white/60 hover:text-white h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Application buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyImageTo('home')}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs"
                  >
                    Apply to Home
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyImageTo('lock')}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs"
                  >
                    Apply to Lock
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyImageTo('all')}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium"
                  >
                    Apply to All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyImageTo('headers')}
                    className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs"
                  >
                    Apply to Headers
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Send'}
            </Button>
          </form>

          <div className="text-xs text-white/40">
            💡 Examples: "Make all buttons #FF5C00", "Dark theme for the whole wallet", "Font: Sora"
            <br />
            ⌨️ Tip: Press Shift+Enter for new line, Enter to send, type "help" for more commands
            <br />
            🖼️ Upload images (max 8MB) and apply them as backgrounds to different wallet layers
          </div>
        </div>
      </CardContent>
    </div>
  );
}
