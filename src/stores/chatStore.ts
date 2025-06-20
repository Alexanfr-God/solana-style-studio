import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useWalletCustomizationStore } from './walletCustomizationStore';

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

      // Get current wallet context from WalletCustomizationStore
      const walletStore = useWalletCustomizationStore.getState();
      const walletContext = {
        walletType: 'Phantom',
        activeLayer: walletStore.currentLayer,
        currentStyle: {
          backgroundColor: walletStore.walletStyle.backgroundColor,
          primaryColor: walletStore.walletStyle.primaryColor,
          font: walletStore.walletStyle.font,
          // Include more current style properties
        },
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
        console.error('❌ Supabase function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ GPT API error:', data?.error);
        throw new Error(data?.error || 'Failed to get AI response');
      }

      // Parse GPT response for style changes
      const responseContent = data.response;
      
      // Check if GPT suggested any style changes and apply them
      if (data.styleChanges) {
        console.log('🎨 Applying style changes from GPT:', data.styleChanges);
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

      console.log('✅ GPT response received and style changes applied');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Determine error message based on error type
      let errorMessage = 'Извините, произошла ошибка при подключении к ИИ. Проверьте настройки API или попробуйте позже.';
      
      if (error.message.includes('OpenAI API key not configured')) {
        errorMessage = 'OpenAI API ключ не настроен. Пожалуйста, установите его в настройках проекта.';
      } else if (error.message.includes('OpenAI API error')) {
        errorMessage = 'Ошибка OpenAI API. Попробуйте позже.';
      } else if (error.message.includes('Edge function error')) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.';
      }
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  applyStyleChanges: (changes) => {
    const walletStore = useWalletCustomizationStore.getState();
    
    console.log('🎨 Applying style changes:', changes);
    
    if (!changes || !changes.changes) {
      console.log('⚠️ No changes object found');
      return;
    }

    // Determine which store method to use based on target and layer
    const { layer, target, changes: styleChanges, reasoning } = changes;

    try {
      // Get current styles to merge with new changes
      const currentWalletStyle = walletStore.walletStyle;
      const currentLoginStyle = walletStore.loginStyle;

      // Apply changes based on target
      if (target === 'header') {
        // Update wallet style with header-related changes
        const updatedStyle = {
          ...currentWalletStyle,
          accentColor: styleChanges.accentColor || currentWalletStyle.accentColor,
          textColor: styleChanges.textColor || currentWalletStyle.textColor,
          backgroundColor: styleChanges.backgroundColor || currentWalletStyle.backgroundColor,
          fontFamily: styleChanges.fontFamily || currentWalletStyle.fontFamily,
          boxShadow: styleChanges.boxShadow || currentWalletStyle.boxShadow,
        };
        
        walletStore.setWalletStyle(updatedStyle);
        console.log('✅ Applied header styles');
      } else if (target === 'navigation') {
        // Update wallet style with navigation-related changes
        const updatedStyle = {
          ...currentWalletStyle,
          buttonColor: styleChanges.backgroundColor || currentWalletStyle.buttonColor,
          buttonTextColor: styleChanges.textColor || currentWalletStyle.buttonTextColor,
          borderRadius: styleChanges.borderRadius || currentWalletStyle.borderRadius,
          accentColor: styleChanges.accentColor || currentWalletStyle.accentColor,
        };
        
        walletStore.setWalletStyle(updatedStyle);
        console.log('✅ Applied navigation styles');
      } else if (target === 'background' || target === 'global') {
        // Apply global/background styles
        const updatedStyle = {
          ...currentWalletStyle,
          backgroundColor: styleChanges.backgroundColor || currentWalletStyle.backgroundColor,
          accentColor: styleChanges.accentColor || styleChanges.buttonColor || currentWalletStyle.accentColor,
          textColor: styleChanges.textColor || currentWalletStyle.textColor,
          buttonColor: styleChanges.buttonColor || currentWalletStyle.buttonColor,
          buttonTextColor: styleChanges.buttonTextColor || currentWalletStyle.buttonTextColor,
          borderRadius: styleChanges.borderRadius || currentWalletStyle.borderRadius,
          fontFamily: styleChanges.fontFamily || currentWalletStyle.fontFamily,
          boxShadow: styleChanges.boxShadow || currentWalletStyle.boxShadow,
          primaryColor: styleChanges.accentColor || styleChanges.buttonColor || currentWalletStyle.primaryColor,
          font: styleChanges.fontFamily || currentWalletStyle.font,
        };

        if (layer === 'login') {
          walletStore.setLoginStyle(updatedStyle);
        } else {
          walletStore.setWalletStyle(updatedStyle);
        }
        console.log('✅ Applied global/background styles');
      }

      // Trigger customization animation using existing method
      walletStore.onCustomizationStart();
      setTimeout(() => {
        walletStore.resetCustomizationState();
      }, 2000);

      console.log('🎨 Style changes applied successfully:', reasoning);
      
    } catch (error) {
      console.error('❌ Error applying style changes:', error);
    }
  },

  clearHistory: () => set({ messages: [] }),
}));
