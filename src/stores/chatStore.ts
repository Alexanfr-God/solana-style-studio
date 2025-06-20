
import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useCustomizationStore } from './customizationStore';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: {
    content: string;
    imageUrl?: string | null;
    walletElement?: string;
  }) => Promise<void>;
  clearHistory: () => void;
  applyStyleChanges: (changes: any) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (messageData) => {
    const { messages } = get();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageData.content,
      timestamp: new Date(),
      imageUrl: messageData.imageUrl || undefined,
      walletElement: messageData.walletElement || undefined,
    };

    set({ 
      messages: [...messages, userMessage],
      isLoading: true 
    });

    try {
      console.log('🚀 Sending message to GPT API:', {
        content: messageData.content,
        hasImage: !!messageData.imageUrl,
        element: messageData.walletElement
      });

      // Get current wallet context
      const customizationState = useCustomizationStore.getState();
      const walletContext = {
        walletType: 'Phantom',
        activeLayer: customizationState.activeLayer,
        currentStyle: customizationState.activeLayer === 'login' 
          ? customizationState.loginStyle 
          : customizationState.walletStyle,
        availableElements: [
          'Header Bar', 'Balance Display', 'Login Screen', 'Action Buttons',
          'Asset List', 'Bottom Navigation', 'Background', 'Color Scheme',
          'Typography', 'Icons'
        ]
      };

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: messageData.content,
          imageUrl: messageData.imageUrl,
          walletElement: messageData.walletElement,
          walletContext
        }
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to get AI response');
      }

      // Parse GPT response for style changes
      const responseContent = data.response;
      
      // Check if GPT suggested any style changes
      if (data.styleChanges) {
        get().applyStyleChanges(data.styleChanges);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      console.log('✅ GPT response received and added to chat');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: 'Извините, произошла ошибка при обращении к AI. Проверьте настройки API или попробуйте позже.',
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  applyStyleChanges: (changes) => {
    const customizationStore = useCustomizationStore.getState();
    
    if (changes.layer && changes.styles) {
      if (changes.layer === 'login') {
        customizationStore.setStyleForLayer('login', changes.styles);
      } else if (changes.layer === 'wallet') {
        customizationStore.setStyleForLayer('wallet', changes.styles);
      }
      
      console.log('🎨 Applied style changes:', changes);
    }
  },

  clearHistory: () => set({ messages: [] }),
}));
