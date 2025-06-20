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

      console.log('📊 Full GPT response data:', data);

      // Parse GPT response for style changes
      const responseContent = data.response;
      
      // FIXED: Check for style changes in the correct path
      if (data.styleChanges) {
        console.log('🎨 Applying style changes from GPT:', data.styleChanges);
        get().applyStyleChanges(data.styleChanges);
      } else {
        console.log('⚠️ No style changes found in response');
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
      let errorMessage = 'Sorry, there was an error connecting to AI. Please check API settings or try again later.';
      
      if (error.message.includes('OpenAI API key not configured')) {
        errorMessage = 'OpenAI API key is not configured. Please set it in the project settings.';
      } else if (error.message.includes('OpenAI API error')) {
        errorMessage = 'OpenAI API error. Please try again later.';
      } else if (error.message.includes('Edge function error')) {
        errorMessage = 'Server error. Please try again later.';
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

      console.log('🔧 Processing style changes:', {
        layer,
        target,
        styleChanges,
        reasoning
      });

      // UNIFIED STYLE APPLICATION - Apply to both walletStyle and components
      const createUnifiedStyle = (baseStyle: any) => ({
        ...baseStyle,
        backgroundColor: styleChanges.backgroundColor || baseStyle.backgroundColor,
        backgroundImage: styleChanges.backgroundImage || baseStyle.backgroundImage,
        accentColor: styleChanges.accentColor || styleChanges.buttonColor || baseStyle.accentColor,
        textColor: styleChanges.textColor || baseStyle.textColor,
        buttonColor: styleChanges.buttonColor || styleChanges.accentColor || baseStyle.buttonColor,
        buttonTextColor: styleChanges.buttonTextColor || baseStyle.buttonTextColor,
        borderRadius: styleChanges.borderRadius || baseStyle.borderRadius,
        fontFamily: styleChanges.fontFamily || baseStyle.fontFamily,
        boxShadow: styleChanges.boxShadow || baseStyle.boxShadow,
        primaryColor: styleChanges.accentColor || styleChanges.buttonColor || baseStyle.primaryColor,
        font: styleChanges.fontFamily || baseStyle.font,
        gradient: styleChanges.gradient || baseStyle.gradient
      });

      // Apply changes based on target and layer
      if (target === 'header') {
        const updatedStyle = createUnifiedStyle(currentWalletStyle);
        walletStore.setWalletStyle(updatedStyle);
        console.log('✅ Applied header styles');
      } else if (target === 'navigation') {
        const updatedStyle = createUnifiedStyle(currentWalletStyle);
        walletStore.setWalletStyle(updatedStyle);
        console.log('✅ Applied navigation styles');
      } else if (target === 'background' || target === 'global') {
        // Apply global/background styles to the appropriate layer
        if (layer === 'login') {
          const updatedStyle = createUnifiedStyle(currentLoginStyle);
          walletStore.setLoginStyle(updatedStyle);
          console.log('✅ Applied login background styles');
        } else {
          const updatedStyle = createUnifiedStyle(currentWalletStyle);
          walletStore.setWalletStyle(updatedStyle);
          console.log('✅ Applied wallet background styles');
        }
      } else {
        // Default: apply to wallet style
        const updatedStyle = createUnifiedStyle(currentWalletStyle);
        walletStore.setWalletStyle(updatedStyle);
        console.log('✅ Applied default wallet styles');
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
