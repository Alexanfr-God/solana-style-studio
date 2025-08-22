
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wand2, Send } from 'lucide-react';
import { handleUserMessage } from '@/ai/agent';
import { useThemeStore, THEME_STORE_INSTANCE_ID } from '@/state/themeStore';
import type { ThemePatch } from '@/state/themeStore';
import { v4 as uuidv4 } from 'uuid';

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

// Localization dictionary
const DICT = {
  en: {
    placeholder: 'Describe your change (e.g., "Make swap button #FF5C00")',
    help: `I can change colors, backgrounds (images), and font. Try:
• "Make swap button #FF5C00"
• "Home background: https://.../bg.jpg"  
• "Font: Sora"
• Available layers: home, lock, swap, send, receive, buy, search, dropdown`,
    processing: 'Processing command...',
    error: 'An error occurred while processing the command. Please try again.',
    examples: '💡 Examples: "home background #0A0C10", "swap button orange #FF5C00", "header text #FFFFFF"'
  },
  ru: {
    placeholder: 'Например: кнопка swap #FF5C00',
    help: `Я могу менять цвета, фон (картинки) и шрифт. Примеры:
• "Сделай кнопку swap #FF5C00"
• "Фон home: https://.../bg.jpg"
• "Шрифт: Sora"
• Доступные слои: home, lock, swap, send, receive, buy, search, dropdown`,
    processing: 'Обрабатываю команду...',
    error: 'Произошла ошибка при обработке команды. Попробуйте ещё раз.',
    examples: '💡 Примеры: "фон home #0A0C10", "кнопка swap оранжевая #FF5C00", "текст заголовка #FFFFFF"'
  }
};

export default function ThemeChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ru'>('en');
  const applyPatch = useThemeStore(s => s.applyPatch);
  const theme = useThemeStore(s => s.theme);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Диагностика store instance
  console.log('[AI] theme store id', THEME_STORE_INSTANCE_ID);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = viewportRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isProcessing) return;

    // Detect language from user input
    const detectedLang = detectLang(message);
    setCurrentLang(detectedLang);

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
      const result = await handleUserMessage(message);
      console.log('[AI] patch result:', result.patch);

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

      // Localize response message
      const humanText = (() => {
        if (!result.patch.length) return DICT[detectedLang].help;
        if (detectedLang === 'ru') return `Готово: ${result.message}`;
        return `Done: ${result.message}`;
      })();

      // Добавляем ответ AI
      const aiMessage: Message = {
        role: 'ai',
        text: humanText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('[AI] processing error:', error);
      const errorMessage: Message = {
        role: 'ai',
        text: DICT[detectedLang].error,
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
      handleSend();
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
          {currentLang === 'ru' ? 'Изменяйте тему кошелька простыми командами' : 'Modify wallet theme with simple commands'}
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
              {currentLang === 'ru' ? 'Напишите команду для изменения темы...' : 'Write a command to change the theme...'}
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
              {DICT[currentLang].processing}
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={DICT[currentLang].placeholder}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              disabled={isProcessing}
            />
            <Button
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-white/40">
            {DICT[currentLang].examples}
          </div>
        </div>
      </CardContent>
    </div>
  );
}
