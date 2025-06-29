import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useWalletCustomizationStore } from './walletCustomizationStore';
import { WALLET_ELEMENTS_REGISTRY, getAllCategories } from '@/components/wallet/WalletElementsRegistry';
import { walletStructureService } from '@/services/walletStructureService';

function detectLanguage(text: string): 'ru' | 'en' {
  return /[\u0400-\u04FF]/.test(text) ? 'ru' : 'en';
}

export type ChatMode = 'analysis' | 'leonardo' | 'replicate' | 'structure' | 'chat' | 'style-analysis' | 'save' | 'load';
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
  
  // Message sending methods for different modes
  sendMessage: (message: {
    content: string;
    imageUrl?: string | null;
    walletElement?: string;
  }) => Promise<void>;
  
  sendImageGenerationMessage: (message: {
    content: string;
    mode: 'leonardo' | 'replicate';
  }) => Promise<void>;
  
  sendStructureRequest: (message: {
    content: string;
    analysisType?: 'basic' | 'detailed';
  }) => Promise<void>;
  
  sendChatMessage: (message: {
    content: string;
    contextual?: boolean;
  }) => Promise<void>;
  
  sendStyleAnalysis: (message: {
    content: string;
    imageUrl?: string;
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
  }) => Promise<void>;
  
  saveCommunityCustomization: (customization: {
    name: string;
    description: string;
    styles: any;
    tags?: string[];
  }) => Promise<void>;
  
  loadCustomization: (customizationId: string) => Promise<void>;
  
  // Utility methods
  clearHistory: () => void;
  applyStyleChanges: (changes: any) => void;
  applyGeneratedImage: (imageUrl: string) => void;
  
  // Chat history management
  saveChatHistory: () => void;
  loadChatHistory: (sessionId: string) => void;
  clearChatHistory: (sessionId: string) => void;
}

// Function to create enhanced wallet context
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

// Extract image URL from different response formats
function extractImageUrl(response: any, mode: string): string | null {
  console.log('🔍 Extracting image URL from response:', response);
  
  if (response?.data?.imageUrl) {
    console.log('✅ Found imageUrl in data:', response.data.imageUrl);
    return response.data.imageUrl;
  }
  
  if (response?.data?.output && Array.isArray(response.data.output)) {
    const imageUrl = response.data.output[0];
    console.log('✅ Found imageUrl in output array:', imageUrl);
    return imageUrl;
  }
  
  if (typeof response === 'string' && response.startsWith('http')) {
    console.log('✅ Found direct URL:', response);
    return response;
  }
  
  console.warn('⚠️ No image URL found in response structure');
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
        console.log('🎨 Processing style changes from GPT with ANIMATION:', data.styleChanges);
        
        const convertedChanges = convertGPTResponseToStyleChanges(data);
        
        if (convertedChanges) {
          console.log('✅ Successfully converted style changes, applying with animation:', convertedChanges);
          
          const walletStore = useWalletCustomizationStore.getState();
          walletStore.applyUniversalStyle(convertedChanges);
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

      const response = await supabase.functions.invoke('wallet-chat-gpt', {
        body: { 
          content: messageData.content, 
          mode: messageData.mode,
          sessionId
        }
      });

      if (response?.error) {
        console.error('❌ Edge Function error:', response.error);
        throw new Error(`Image generation error: ${response.error.message}`);
      }

      const generatedImageUrl = extractImageUrl(response, messageData.mode);
      
      if (generatedImageUrl) {
        console.log('✅ Successfully generated image:', generatedImageUrl);
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `Я создал кастомное фоновое изображение на основе вашего описания: "${messageData.content}". Изображение готово для применения.`,
          timestamp: new Date(),
          imageUrl: generatedImageUrl,
          isGenerated: true,
        };

        set(state => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false
        }));
      } else {
        throw new Error('No image returned from generation service');
      }

    } catch (error) {
      console.error('💥 Image generation error:', error);
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Sorry, there was an error generating the image: ${error.message}`,
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  sendStructureRequest: async (messageData) => {
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
      console.log('🏗️ Sending structure request to Edge Function');

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: messageData.content,
          mode: 'structure',
          sessionId,
          analysisType: messageData.analysisType || 'basic'
        }
      });

      if (error) {
        throw new Error(`Structure request failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to analyze structure');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.analysis || 'Structure analysis completed',
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      console.log('✅ Structure request completed');

    } catch (error) {
      console.error('❌ Structure request error:', error);
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Structure analysis failed: ${error.message}`,
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  sendChatMessage: async (messageData) => {
    const { messages, sessionId, chatHistory } = get();
    
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
      console.log('💬 Sending chat message to Edge Function');

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: messageData.content,
          mode: 'chat',
          sessionId,
          chatHistory: chatHistory[sessionId] || [],
          contextual: messageData.contextual || false
        }
      });

      if (error) {
        throw new Error(`Chat message failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to send chat message');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.response || 'Message received',
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      console.log('✅ Chat message sent successfully');

    } catch (error) {
      console.error('❌ Chat message error:', error);
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Chat failed: ${error.message}`,
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

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: messageData.content,
          mode: 'style-analysis',
          sessionId,
          imageUrl: messageData.imageUrl,
          analysisDepth: messageData.analysisDepth || 'detailed'
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
          const walletStore = useWalletCustomizationStore.getState();
          walletStore.applyUniversalStyle(convertedChanges);
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: data.analysis || 'Style analysis completed',
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

  saveCommunityCustomization: async (customization) => {
    const { sessionId } = get();

    try {
      console.log('💾 Saving community customization');

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          mode: 'save',
          sessionId,
          customization
        }
      });

      if (error) {
        throw new Error(`Save failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to save customization');
      }

      console.log('✅ Customization saved successfully');

    } catch (error) {
      console.error('❌ Save customization error:', error);
      throw error;
    }
  },

  loadCustomization: async (customizationId) => {
    const { sessionId } = get();

    try {
      console.log('📥 Loading customization:', customizationId);

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          mode: 'load',
          sessionId,
          customizationId
        }
      });

      if (error) {
        throw new Error(`Load failed: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to load customization');
      }

      if (data.styles) {
        const walletStore = useWalletCustomizationStore.getState();
        walletStore.applyUniversalStyle(data.styles);
      }

      console.log('✅ Customization loaded successfully');

    } catch (error) {
      console.error('❌ Load customization error:', error);
      throw error;
    }
  },

  applyGeneratedImage: (imageUrl: string) => {
    console.log('🖼️ Applying generated image as background:', imageUrl);
    
    const walletStore = useWalletCustomizationStore.getState();
    walletStore.applyUniversalStyle({
      backgroundImage: `url(${imageUrl})`,
      styleNotes: 'Generated background image applied'
    });
  },

  applyStyleChanges: (changes) => {
    console.log('🎨 Applying style changes');
    
    if (changes && changes.changes) {
      const walletStore = useWalletCustomizationStore.getState();
      walletStore.applyUniversalStyle(changes.changes);
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
