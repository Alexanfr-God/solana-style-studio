import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useWalletCustomizationStore } from './walletCustomizationStore';
import { WALLET_ELEMENTS_REGISTRY, getAllCategories } from '@/components/wallet/WalletElementsRegistry';
import { walletStructureService } from '@/services/walletStructureService';
import { toast } from 'sonner';

function detectLanguage(text: string): 'ru' | 'en' {
  return /[\u0400-\u04FF]/.test(text) ? 'ru' : 'en';
}

export type ChatMode = 'analysis' | 'leonardo' | 'replicate';
export type ImageGenerationMode = 'analysis' | 'leonardo' | 'replicate';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  chatMode: ChatMode;
  sessionId: string;
  userId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
  
  // Image generation mode
  imageGenerationMode: ImageGenerationMode;
  setImageGenerationMode: (mode: ImageGenerationMode) => void;
  
  // Mode setters
  setChatMode: (mode: ChatMode) => void;
  setSessionId: (sessionId: string) => void;
  setUserId: (userId: string | null) => void;
  
  // Core message sending methods
  sendMessage: (message: {
    content: string;
    imageUrl?: string | null;
    walletElement?: string;
  }) => Promise<void>;
  
  sendImageGenerationMessage: (message: {
    content: string;
    mode: 'leonardo' | 'replicate';
  }) => Promise<void>;
  
  sendStyleAnalysis: (message: {
    content: string;
    imageUrl?: string;
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  }) => Promise<void>;
  
  // Utility methods
  clearHistory: () => void;
  applyStyleChanges: (changes: any) => void;
  applyGeneratedImage: (imageUrl: string) => void;
  preserveAndMergeStyles: (newChanges: any) => any;
  
  // Chat history management
  saveChatHistory: () => void;
  loadChatHistory: (sessionId: string) => void;
  clearChatHistory: (sessionId: string) => void;
}

// Function to create enhanced wallet context with current state analysis
function createEnhancedWalletContext() {
  const walletStore = useWalletCustomizationStore.getState();
  
  return {
    walletType: 'Phantom Wallet (WalletAlivePlayground)',
    activeLayer: walletStore.currentLayer || 'wallet',
    currentStyle: {
      backgroundColor: walletStore.walletStyle.backgroundColor,
      primaryColor: walletStore.walletStyle.primaryColor,
      font: walletStore.walletStyle.font,
      textColor: walletStore.walletStyle.textColor,
      accentColor: walletStore.walletStyle.accentColor,
      buttonColor: walletStore.walletStyle.buttonColor,
      borderRadius: walletStore.walletStyle.borderRadius,
      backgroundImage: walletStore.walletStyle.backgroundImage,
    },
    availableElements: WALLET_ELEMENTS_REGISTRY.map(element => ({
      id: element.id,
      name: element.name,
      category: element.category,
      description: element.description,
      customizable: element.customizable
    })),
    elementCategories: getAllCategories(),
    totalElements: WALLET_ELEMENTS_REGISTRY.length,
    walletFeatures: {
      hasBottomNavigation: true,
      hasBalanceDisplay: true,
      hasActionButtons: true,
      hasTransactionHistory: true,
      hasAssetsList: true,
      supportsDarkMode: true,
      supportsCustomBackgrounds: true
    },
    uiStructure: {
      layout: 'mobile-first',
      sections: ['header', 'balance', 'actions', 'content', 'navigation'],
      interactiveElements: ['buttons', 'tabs', 'dropdowns', 'modals'],
      customizableAreas: ['backgrounds', 'colors', 'typography', 'effects']
    }
  };
}

// Enhanced image URL extraction for Leonardo and Replicate
function extractImageUrl(response: any, mode: string): string | null {
  console.log('🔍 Extracting image URL from response for mode:', mode);
  console.log('🔍 Full response structure:', JSON.stringify(response, null, 2));
  
  // Check for direct imageUrl in data
  if (response?.data?.imageUrl) {
    console.log('✅ Found imageUrl in data:', response.data.imageUrl);
    return response.data.imageUrl;
  }
  
  // Leonardo specific formats
  if (mode === 'leonardo') {
    // Leonardo nested data structure
    if (response?.data?.data?.imageUrl) {
      console.log('✅ Found Leonardo imageUrl in data.data:', response.data.data.imageUrl);
      return response.data.data.imageUrl;
    }
    
    // Leonardo success response
    if (response?.data?.success && response?.data?.imageUrl) {
      console.log('✅ Found Leonardo imageUrl in success response:', response.data.imageUrl);
      return response.data.imageUrl;
    }
    
    // Leonardo generations format (real API response)
    if (response?.data?.generations_by_pk?.generated_images?.[0]?.url) {
      console.log('✅ Found Leonardo real API format:', response.data.generations_by_pk.generated_images[0].url);
      return response.data.generations_by_pk.generated_images[0].url;
    }
  }
  
  // Replicate specific formats
  if (mode === 'replicate') {
    // Replicate output array format (real API response)
    if (response?.data?.output && Array.isArray(response.data.output) && response.data.output.length > 0) {
      const imageUrl = response.data.output[0];
      console.log('✅ Found Replicate imageUrl in output array:', imageUrl);
      return imageUrl;
    }
    
    // Replicate direct output
    if (response?.data?.output && typeof response.data.output === 'string') {
      console.log('✅ Found Replicate direct output:', response.data.output);
      return response.data.output;
    }
    
    // Replicate nested structure
    if (response?.output && Array.isArray(response.output) && response.output.length > 0) {
      const imageUrl = response.output[0];
      console.log('✅ Found Replicate imageUrl in nested output:', imageUrl);
      return imageUrl;
    }
  }
  
  // Generic fallback formats
  if (response?.data?.image && response.data.image.startsWith('data:image')) {
    console.log('✅ Found base64 image:', response.data.image.substring(0, 50) + '...');
    return response.data.image;
  }
  
  if (typeof response === 'string' && response.startsWith('http')) {
    console.log('✅ Found direct URL:', response);
    return response;
  }
  
  if (response?.imageUrl) {
    console.log('✅ Found top-level imageUrl:', response.imageUrl);
    return response.imageUrl;
  }
  
  console.warn('⚠️ No image URL found in response structure for mode:', mode);
  console.warn('⚠️ Available keys in response:', Object.keys(response || {}));
  if (response?.data) {
    console.warn('⚠️ Available keys in response.data:', Object.keys(response.data || {}));
  }
  return null;
}

// Convert GPT responses to style changes
function convertGPTResponseToStyleChanges(gptResponse: any): any {
  console.log('🔄 Converting GPT response to style changes:', gptResponse);
  
  if (gptResponse.styleChanges) {
    const styleChanges = gptResponse.styleChanges;
    console.log('✅ Found direct styleChanges format');
    
    return {
      backgroundColor: styleChanges.backgroundColor,
      backgroundImage: styleChanges.backgroundImage,
      accentColor: styleChanges.accentColor,
      textColor: styleChanges.textColor,
      buttonColor: styleChanges.buttonColor,
      buttonTextColor: styleChanges.buttonTextColor,
      borderRadius: styleChanges.borderRadius,
      fontFamily: styleChanges.fontFamily,
      boxShadow: styleChanges.boxShadow,
      primaryColor: styleChanges.accentColor || styleChanges.buttonColor,
      font: styleChanges.fontFamily,
      gradient: styleChanges.gradient,
      styleNotes: styleChanges.styleNotes || gptResponse.userText || 'AI style analysis applied'
    };
  }

  if (gptResponse.elements && gptResponse.elements.colors) {
    const colors = gptResponse.elements.colors;
    const typography = gptResponse.elements.typography || {};
    const effects = gptResponse.elements.effects || {};
    
    console.log('✅ Found enhanced format with elements.colors');
    
    return {
      backgroundColor: colors.background || colors.primary,
      textColor: colors.text || colors.secondary,
      accentColor: colors.accent || colors.primary,
      buttonColor: colors.primary,
      buttonTextColor: colors.secondary || colors.text,
      borderRadius: gptResponse.elements.spacing?.borderRadius || '12px',
      fontFamily: typography.fontFamily || 'Inter, sans-serif',
      boxShadow: effects.boxShadow,
      gradient: effects.gradient,
      styleNotes: gptResponse.metadata?.style_reasoning || 'GPT style analysis applied'
    };
  }
  
  console.warn('⚠️ Unknown GPT response format, using fallback');
  return null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  chatMode: 'analysis',
  sessionId: `session_${Date.now()}`,
  userId: null,
  chatHistory: {},
  
  // Image generation mode
  imageGenerationMode: 'analysis',
  setImageGenerationMode: (mode) => {
    console.log('🔄 Switching image generation mode to:', mode);
    set({ imageGenerationMode: mode });
  },

  setChatMode: (mode) => {
    console.log('🔄 Switching chat mode to:', mode);
    set({ chatMode: mode });
  },

  setSessionId: (sessionId) => {
    console.log('🆔 Setting session ID:', sessionId);
    set({ sessionId });
  },

  setUserId: (userId) => {
    console.log('👤 Setting user ID:', userId);
    set({ userId });
  },

  preserveAndMergeStyles: (newChanges) => {
    const walletStore = useWalletCustomizationStore.getState();
    const currentStyle = walletStore.walletStyle;
    
    // Preserve existing backgroundImage unless explicitly changing it
    const mergedChanges = {
      ...newChanges,
      backgroundImage: newChanges.backgroundImage || currentStyle.backgroundImage,
    };
    
    console.log('🔄 Preserving and merging styles:', { current: currentStyle, new: newChanges, merged: mergedChanges });
    return mergedChanges;
  },

  sendMessage: async (messageData) => {
    const { messages, sessionId } = get();
    
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
      console.log('🚀 Sending analysis message to Edge Function:', {
        content: messageData.content,
        hasImage: !!messageData.imageUrl,
        element: messageData.walletElement,
        sessionId
      });

      const enhancedWalletContext = createEnhancedWalletContext();
      
      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: messageData.content,
          imageUrl: messageData.imageUrl,
          walletElement: messageData.walletElement,
          walletContext: enhancedWalletContext,
          mode: 'analysis',
          sessionId
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

      const lang = detectLanguage(messageData.content);
      const fallback = lang === 'ru'
        ? 'Я проанализировал ваш кошелек и применил запрошенные изменения.'
        : 'I analyzed your wallet and applied the requested changes.';
      const friendlyResponse = data.userText || data.response || fallback;
      
      if (data.styleChanges) {
        console.log('🎨 Processing style changes from GPT with PRESERVATION:', data.styleChanges);
        
        const convertedChanges = convertGPTResponseToStyleChanges(data);
        
        if (convertedChanges) {
          const preservedChanges = get().preserveAndMergeStyles(convertedChanges);
          console.log('✅ Successfully converted and preserved style changes:', preservedChanges);
          
          const walletStore = useWalletCustomizationStore.getState();
          walletStore.applyUniversalStyle(preservedChanges);
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: friendlyResponse,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      console.log('✅ Analysis response processed successfully');

    } catch (error) {
      console.error('❌ Error sending analysis message:', error);
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: 'Sorry, there was an error connecting to AI. Please try again later.',
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  sendImageGenerationMessage: async (messageData) => {
    const { messages, sessionId } = get();
    
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
      console.log('🖼️ Prompt:', messageData.content);

      const response = await supabase.functions.invoke('wallet-chat-gpt', {
        body: { 
          content: messageData.content, 
          mode: messageData.mode,
          sessionId
        }
      });

      console.log('🖼️ Raw Edge Function response:', response);

      if (response?.error) {
        console.error('❌ Edge Function error:', response.error);
        throw new Error(`Image generation error: ${response.error.message}`);
      }

      console.log('🖼️ Attempting to extract image URL from response...');
      const generatedImageUrl = extractImageUrl(response, messageData.mode);
      
      if (generatedImageUrl) {
        console.log('✅ Successfully extracted image URL:', generatedImageUrl);
        
        if (generatedImageUrl.startsWith('http') || generatedImageUrl.startsWith('data:image')) {
          console.log('🎨 Auto-applying generated image as wallet background');
          const walletStore = useWalletCustomizationStore.getState();
          
          // Preserve existing styles when applying new background
          const currentStyle = walletStore.walletStyle;
          const preservedStyle = {
            ...currentStyle,
            backgroundImage: `url(${generatedImageUrl})`,
            styleNotes: `Auto-applied ${messageData.mode} generated background: "${messageData.content}"`
          };
          
          walletStore.applyUniversalStyle(preservedStyle);
          
          toast.success(`🎨 Generated image automatically applied as wallet background!`);
          
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            type: 'assistant',
            content: `✨ I've generated and automatically applied a custom background image based on your description: "${messageData.content}". The new background is now active on both your lock and unlock screens while preserving your existing styling!`,
            timestamp: new Date(),
            imageUrl: generatedImageUrl,
            isGenerated: true,
            autoApplied: true,
          };

          set(state => ({
            messages: [...state.messages, assistantMessage],
            isLoading: false
          }));
          
          console.log('✅ Image generation and auto-application completed successfully');
        } else {
          console.error('❌ Invalid image URL format:', generatedImageUrl);
          throw new Error(`Invalid image URL format: ${generatedImageUrl}`);
        }
      } else {
        console.error('❌ Failed to extract image URL from response');
        console.error('❌ Response structure debug:', JSON.stringify(response, null, 2));
        throw new Error('No image returned from generation service - check Edge Function logs');
      }

    } catch (error) {
      console.error('💥 Image generation error:', error);
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Sorry, there was an error generating the image: ${error.message}. Please check the console logs for more details.`,
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  sendStyleAnalysis: async (messageData) => {
    const { messages, sessionId } = get();
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageData.content,
      timestamp: new Date(),
      imageUrl: messageData.imageUrl,
    };

    set({ 
      messages: [...messages, userMessage],
      isLoading: true 
    });

    try {
      console.log('🎨 Sending style analysis to Edge Function');

      const enhancedWalletContext = createEnhancedWalletContext();

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: messageData.content,
          mode: 'analysis',
          sessionId,
          imageUrl: messageData.imageUrl,
          analysisDepth: messageData.analysisDepth || 'detailed',
          walletContext: enhancedWalletContext
        }
      });

      if (error) {
        throw new Error(`Style analysis failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to analyze style');
      }

      if (data.styleChanges) {
        const convertedChanges = convertGPTResponseToStyleChanges(data);
        if (convertedChanges) {
          const preservedChanges = get().preserveAndMergeStyles(convertedChanges);
          const walletStore = useWalletCustomizationStore.getState();
          walletStore.applyUniversalStyle(preservedChanges);
        }
      }

      const lang = detectLanguage(messageData.content);
      const fallback = lang === 'ru'
        ? 'Я проанализировал стиль вашего кошелька и применил улучшения.'
        : 'I analyzed your wallet style and applied improvements.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.userText || data.analysis || fallback,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      console.log('✅ Style analysis completed');

    } catch (error) {
      console.error('❌ Style analysis error:', error);
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Style analysis failed: ${error.message}`,
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  applyGeneratedImage: (imageUrl: string) => {
    console.log('🖼️ Applying generated image as background:', imageUrl);
    
    const walletStore = useWalletCustomizationStore.getState();
    const preservedChanges = get().preserveAndMergeStyles({
      backgroundImage: `url(${imageUrl})`,
      styleNotes: 'Generated background image applied'
    });
    walletStore.applyUniversalStyle(preservedChanges);
  },

  applyStyleChanges: (changes) => {
    console.log('🎨 Applying style changes with preservation');
    
    if (changes && changes.changes) {
      const preservedChanges = get().preserveAndMergeStyles(changes.changes);
      const walletStore = useWalletCustomizationStore.getState();
      walletStore.applyUniversalStyle(preservedChanges);
    }
  },

  saveChatHistory: () => {
    const { sessionId, messages, chatHistory } = get();
    
    set({
      chatHistory: {
        ...chatHistory,
        [sessionId]: [...messages]
      }
    });
    
    console.log('💾 Chat history saved for session:', sessionId);
  },

  loadChatHistory: (sessionId) => {
    const { chatHistory } = get();
    
    const history = chatHistory[sessionId] || [];
    set({ 
      messages: history,
      sessionId 
    });
    
    console.log('📥 Chat history loaded for session:', sessionId);
  },

  clearChatHistory: (sessionId) => {
    const { chatHistory } = get();
    
    const newHistory = { ...chatHistory };
    delete newHistory[sessionId];
    
    set({ chatHistory: newHistory });
    console.log('🗑️ Chat history cleared for session:', sessionId);
  },

  clearHistory: () => {
    set({ messages: [] });
    console.log('🗑️ Current chat messages cleared');
  },
}));
