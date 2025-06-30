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
  
  // ✅ ЭТАП 4: История изменений для накопительного сохранения
  styleHistory: Array<{
    timestamp: string;
    changes: any;
    description: string;
  }>;
  
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
  
  // ✅ ЭТАП 4: Новые методы для истории
  addToStyleHistory: (changes: any, description: string) => void;
  getStyleHistory: () => Array<{timestamp: string; changes: any; description: string;}>;
  
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

// ✅ ЭТАП 2: Улучшенная функция извлечения imageUrl
function extractImageUrl(response: any, mode: string): string | null {
  console.log('🔍 [ЭТАП 2] Извлечение imageUrl для режима:', mode);
  console.log('🔍 [ЭТАП 2] Структура ответа:', JSON.stringify(response, null, 2));
  
  // ✅ Проверяем data.imageUrl (основной путь после исправления Edge Function)
  if (response?.data?.imageUrl) {
    console.log('✅ [ЭТАП 2] Найден imageUrl в data:', response.data.imageUrl);
    return response.data.imageUrl;
  }
  
  // ✅ Проверяем прямой imageUrl на верхнем уровне
  if (response?.imageUrl) {
    console.log('✅ [ЭТАП 2] Найден imageUrl на верхнем уровне:', response.imageUrl);
    return response.imageUrl;
  }
  
  // Дополнительные пути для надежности
  if (mode === 'leonardo') {
    if (response?.data?.data?.imageUrl) {
      console.log('✅ [ЭТАП 2] Leonardo nested format:', response.data.data.imageUrl);
      return response.data.data.imageUrl;
    }
  }
  
  if (mode === 'replicate') {
    if (response?.data?.output && Array.isArray(response.data.output) && response.data.output.length > 0) {
      console.log('✅ [ЭТАП 2] Replicate output array:', response.data.output[0]);
      return response.data.output[0];
    }
  }
  
  console.warn('⚠️ [ЭТАП 2] imageUrl НЕ НАЙДЕН в ответе для режима:', mode);
  console.warn('⚠️ [ЭТАП 2] Доступные ключи:', Object.keys(response || {}));
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
  
  // ✅ ЭТАП 4: Инициализация истории стилей
  styleHistory: [],
  
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

  // ✅ ЭТАП 4: Накопительное сохранение - НЕ СТИРАЕТ предыдущие стили
  preserveAndMergeStyles: (newChanges) => {
    const walletStore = useWalletCustomizationStore.getState();
    const currentStyle = walletStore.walletStyle;
    
    console.log('🔄 [ЭТАП 4] Текущий стиль перед слиянием:', currentStyle);
    console.log('🔄 [ЭТАП 4] Новые изменения:', newChanges);
    
    // ✅ Сохраняем ВСЕ существующие стили + добавляем новые
    const mergedChanges = {
      // Сначала берем все текущие стили
      backgroundColor: currentStyle.backgroundColor,
      primaryColor: currentStyle.primaryColor,
      font: currentStyle.font,
      textColor: currentStyle.textColor,
      accentColor: currentStyle.accentColor,
      buttonColor: currentStyle.buttonColor,
      borderRadius: currentStyle.borderRadius,
      backgroundImage: currentStyle.backgroundImage,
      boxShadow: currentStyle.boxShadow,
      fontFamily: currentStyle.fontFamily,
      
      // Затем применяем новые изменения (перезаписывают только те поля, которые указаны)
      ...newChanges
    };
    
    console.log('✅ [ЭТАП 4] Накопительный результат слияния:', mergedChanges);
    return mergedChanges;
  },

  // ✅ ЭТАП 4: Новые методы для истории изменений
  addToStyleHistory: (changes, description) => {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      changes,
      description
    };
    
    console.log('📝 [ЭТАП 4] Добавляем в историю стилей:', historyEntry);
    
    set(state => ({
      styleHistory: [...state.styleHistory, historyEntry].slice(-50) // Сохраняем последние 50 изменений
    }));
  },

  getStyleHistory: () => {
    return get().styleHistory;
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
    
    // ✅ ИСПРАВЛЕНИЕ: Детальное логирование режима на входе
    console.log('🖼️ [ОТЛАДКА] sendImageGenerationMessage вызван:');
    console.log('🔍 [ОТЛАДКА] Входной режим:', messageData.mode);
    console.log('🔍 [ОТЛАДКА] Текущий imageGenerationMode:', get().imageGenerationMode);
    console.log('🔍 [ОТЛАДКА] Промпт:', messageData.content);
    
    // ✅ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Убедимся что режим точно соответствует выбранному
    const actualMode = get().imageGenerationMode;
    if (actualMode === 'analysis') {
      console.error('❌ [КРИТИЧЕСКАЯ ОШИБКА] Попытка генерации в режиме analysis!');
      console.error('❌ [КРИТИЧЕСКАЯ ОШИБКА] Это недопустимо - перенаправляем в Leonardo');
      // Принудительно переключаем на Leonardo если находимся в analysis
      set({ imageGenerationMode: 'leonardo' });
      messageData.mode = 'leonardo';
    } else {
      messageData.mode = actualMode as 'leonardo' | 'replicate';
    }
    
    console.log('✅ [ИСПРАВЛЕНИЕ] Финальный режим для отправки:', messageData.mode);
    
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
      console.log('🚀 [ИСПРАВЛЕНИЕ] Отправляем запрос генерации изображения');
      console.log('📋 [ИСПРАВЛЕНИЕ] Параметры запроса:', {
        content: messageData.content,
        mode: messageData.mode,
        sessionId,
        isImageGeneration: true
      });

      // ✅ ИСПРАВЛЕНИЕ: Убедимся что режим точно передается в Edge Function
      const response = await supabase.functions.invoke('wallet-chat-gpt', {
        body: { 
          content: messageData.content, 
          mode: messageData.mode, // ✅ Четко передаем проверенный режим
          sessionId,
          isImageGeneration: true, // ✅ Явный флаг генерации
          debugMode: true // ✅ Включаем отладку
        }
      });

      console.log('📥 [ИСПРАВЛЕНИЕ] Полный ответ Edge Function:', JSON.stringify(response, null, 2));

      if (response?.error) {
        console.error('❌ [ИСПРАВЛЕНИЕ] Ошибка Edge Function:', response.error);
        throw new Error(`Image generation error: ${response.error.message}`);
      }

      // ✅ ИСПРАВЛЕНИЕ: Упрощенное извлечение imageUrl
      let generatedImageUrl = null;
      
      if (response?.data?.imageUrl) {
        generatedImageUrl = response.data.imageUrl;
        console.log('✅ [ИСПРАВЛЕНИЕ] Найден imageUrl в data:', generatedImageUrl);
      } else if (response?.data?.data?.imageUrl) {
        generatedImageUrl = response.data.data.imageUrl;
        console.log('✅ [ИСПРАВЛЕНИЕ] Найден imageUrl в data.data:', generatedImageUrl);
      } else if (response?.data?.output && Array.isArray(response.data.output)) {
        generatedImageUrl = response.data.output[0];
        console.log('✅ [ИСПРАВЛЕНИЕ] Найден imageUrl в output:', generatedImageUrl);
      }
      
      if (generatedImageUrl && (generatedImageUrl.startsWith('http') || generatedImageUrl.startsWith('data:image'))) {
        console.log('🎨 [ИСПРАВЛЕНИЕ] Применяем сгенерированное изображение:', generatedImageUrl);
        
        get().applyGeneratedImage(generatedImageUrl);
        
        toast.success(`🎨 Generated image automatically applied as wallet background!`, {
          description: `Mode: ${messageData.mode} | Time: ${new Date().toLocaleTimeString()}`,
          duration: 4000
        });
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: `✨ I've generated and automatically applied a custom background image based on your description: "${messageData.content}". The new background is now active on your wallet while preserving your existing styling!`,
          timestamp: new Date(),
          imageUrl: generatedImageUrl,
          isGenerated: true,
          autoApplied: true,
        };

        set(state => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false
        }));
        
        console.log('✅ [ИСПРАВЛЕНИЕ] Генерация изображения и авто-применение завершены успешно');
      } else {
        console.error('❌ [ИСПРАВЛЕНИЕ] Не удалось извлечь действительный imageUrl');
        throw new Error('No valid image returned from generation service');
      }

    } catch (error) {
      console.error('💥 [ИСПРАВЛЕНИЕ] Ошибка генерации изображения:', error);
      
      toast.error(`❌ Image generation failed: ${error.message}`, {
        description: `Mode: ${messageData.mode} | Check console for details`,
        duration: 6000
      });
      
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

  // ✅ ЭТАП 4: Обновленный applyGeneratedImage с накопительным сохранением
  applyGeneratedImage: (imageUrl: string) => {
    console.log('🖼️ [ЭТАП 4] Применяем сгенерированное изображение с накопительным сохранением:', imageUrl);
    
    const walletStore = useWalletCustomizationStore.getState();
    
    // ✅ ЭТАП 4: Накопительное слияние - сохраняем ВСЕ текущие стили
    const preservedChanges = get().preserveAndMergeStyles({
      backgroundImage: `url(${imageUrl})`,
    });
    
    console.log('🎨 [ЭТАП 4] Накопительное применение стилей:', preservedChanges);
    
    // ✅ ЭТАП 4: Сохраняем в историю изменений
    get().addToStyleHistory(
      { backgroundImage: `url(${imageUrl})` },
      `Generated background image applied at ${new Date().toLocaleTimeString()}`
    );
    
    walletStore.applyUniversalStyle(preservedChanges);
    
    console.log('✅ [ЭТАП 4] Изображение применено с сохранением всех предыдущих стилей');
  },

  applyStyleChanges: (changes) => {
    console.log('🎨 Applying style changes with preservation');
    
    if (changes && changes.changes) {
      const preservedChanges = get().preserveAndMergeStyles(changes.changes);
      const walletStore = useWalletCustomizationStore.getState();
      walletStore.applyUniversalStyle(preservedChanges);
      
      // ✅ ЭТАП 4: Добавляем в историю
      get().addToStyleHistory(changes.changes, 'Style changes applied via chat');
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
