import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useWalletCustomizationStore } from './walletCustomizationStore';

export type ImageGenerationMode = 'analysis' | 'dalle' | 'replicate';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  imageGenerationMode: ImageGenerationMode;
  setImageGenerationMode: (mode: ImageGenerationMode) => void;
  sendMessage: (message: {
    content: string;
    imageUrl?: string | null;
    walletElement?: string;
  }) => Promise<void>;
  sendImageGenerationMessage: (message: {
    content: string;
    mode: ImageGenerationMode;
  }) => Promise<void>;
  clearHistory: () => void;
  applyStyleChanges: (changes: any) => void;
  applyGeneratedImage: (imageUrl: string) => void;
}

// Debug function for image generation
async function debugImageGeneration(mode: ImageGenerationMode, content: string) {
  console.log(`🔍 Debug ${mode} generation:`, { content, mode });
  
  try {
    const response = await supabase.functions.invoke(
      mode === 'dalle' ? 'generate-style' : 'generate-wallet-mask-v3',
      { body: { prompt: content, mode: mode === 'dalle' ? 'image_generation' : undefined } }
    );
    
    console.log(`📤 ${mode} full response structure:`, {
      data: response.data,
      error: response.error
    });
    return response;
  } catch (error) {
    console.error(`❌ ${mode} error:`, error);
    throw error;
  }
}

// Extract image URL from different response formats
function extractImageUrl(response: any, mode: ImageGenerationMode): string | null {
  console.log('🔍 Extracting image URL from response:', response);
  
  // Strategy 1: Direct imageUrl in data
  if (response?.data?.imageUrl) {
    console.log('✅ Found imageUrl in data:', response.data.imageUrl);
    return response.data.imageUrl;
  }
  
  // Strategy 2: Replicate format - output array
  if (response?.data?.output && Array.isArray(response.data.output)) {
    const imageUrl = response.data.output[0];
    console.log('✅ Found imageUrl in output array:', imageUrl);
    return imageUrl;
  }
  
  // Strategy 3: Direct in response
  if (typeof response === 'string' && response.startsWith('http')) {
    console.log('✅ Found direct URL:', response);
    return response;
  }
  
  console.warn('⚠️ No image URL found in response structure');
  return null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  imageGenerationMode: 'analysis',

  setImageGenerationMode: (mode) => set({ imageGenerationMode: mode }),

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
          walletContext,
          mode: 'analysis'
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

      const responseContent = data.response;
      
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

  sendImageGenerationMessage: async (messageData) => {
    const { messages } = get();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageData.content,
      timestamp: new Date(),
    };

    set({ 
      messages: [...messages, userMessage],
      isLoading: true 
    });

    try {
      console.log('🖼️ Starting image generation with mode:', messageData.mode);

      // Use debug function for detailed logging
      const response = await debugImageGeneration(messageData.mode, messageData.content);

      // Check for Edge Function errors first
      if (response?.error) {
        console.error('❌ Edge Function error:', response.error);
        throw new Error(`Image generation error: ${response.error.message || JSON.stringify(response.error)}`);
      }

      // Log the full response structure for debugging
      console.log('📋 Full response structure:', JSON.stringify(response, null, 2));

      // Extract image URL using improved logic
      const generatedImageUrl = extractImageUrl(response, messageData.mode);
      
      if (generatedImageUrl) {
        console.log('✅ Successfully extracted image URL:', generatedImageUrl);
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `Here's your generated image! It's been saved to your gallery and you can apply it as a background to your wallet.`,
          timestamp: new Date(),
          imageUrl: generatedImageUrl,
          isGenerated: true,
        };

        set(state => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false
        }));

        console.log('🎉 Image generation completed successfully');
      } else {
        // More detailed error for debugging
        const errorDetails = {
          mode: messageData.mode,
          hasData: !!response?.data,
          dataKeys: response?.data ? Object.keys(response.data) : [],
          responseStructure: JSON.stringify(response, null, 2).substring(0, 500) + '...'
        };
        
        console.error('❌ Failed to extract image URL:', errorDetails);
        throw new Error(`No image returned from generation service. Response structure: ${JSON.stringify(errorDetails)}`);
      }

    } catch (error) {
      console.error('💥 Image generation error:', error);
      
      let errorMessage = `Sorry, there was an error generating the image: ${error.message}`;
      
      // More specific error messages
      if (error.message.includes('403')) {
        errorMessage = 'Image generation failed: API access denied. Please check your API key permissions.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Image generation failed: Server error. Please try again in a moment.';
      } else if (error.message.includes('non-2xx status')) {
        errorMessage = 'Image generation failed: Service temporarily unavailable. Please try again.';
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

  applyGeneratedImage: (imageUrl: string) => {
    const walletStore = useWalletCustomizationStore.getState();
    
    console.log('🖼️ Applying generated image as background:', imageUrl);
    
    // Apply image as background to current wallet style
    const updatedStyle = {
      ...walletStore.walletStyle,
      backgroundImage: `url(${imageUrl})`,
      styleNotes: 'Generated background image applied from gallery'
    };
    
    walletStore.setWalletStyle(updatedStyle);
    
    // Trigger customization animation
    walletStore.onCustomizationStart();
    setTimeout(() => {
      walletStore.resetCustomizationState();
    }, 2000);
    
    console.log('✅ Generated image applied as background');
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
});
