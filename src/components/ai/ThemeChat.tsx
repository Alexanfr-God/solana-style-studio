
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Wand2, Send } from 'lucide-react';
import { handleUserMessage } from '@/ai/agent';
import { useThemeStore, THEME_STORE_INSTANCE_ID } from '@/state/themeStore';

interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ThemeChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const applyPatch = useThemeStore(s => s.applyPatch);

  // Диагностика store instance
  console.log('[AI] theme store id', THEME_STORE_INSTANCE_ID);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isProcessing) return;

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
        applyPatch(result.patch);
        
        // Отправляем на backend (fire-and-forget)
        fetch('/api/theme/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patch: result.patch })
        }).catch(error => {
          console.warn('[AI] backend save failed:', error);
        });
      }

      // Добавляем ответ AI
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
        text: 'Произошла ошибка при обработке команды. Попробуйте ещё раз.',
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
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-purple-400" />
          AI Theme Chat
        </CardTitle>
        <p className="text-sm text-white/70">
          Изменяйте тему кошелька простыми командами
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 flex-1">
        <ScrollArea className="flex-1 h-64 border border-white/10 rounded p-3 bg-black/20">
          {messages.length === 0 ? (
            <div className="text-white/50 text-sm">
              Напишите команду для изменения темы...
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Например: кнопка swap #FF5C00"
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
          💡 Примеры: "фон home #0A0C10", "кнопка swap оранжевая #FF5C00", "текст заголовка #FFFFFF"
        </div>
      </CardContent>
    </Card>
  );
}
