import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';
import { useWalletCustomizationStore } from './walletCustomizationStore';
import { WALLET_ELEMENTS_REGISTRY, getAllCategories } from '@/components/wallet/WalletElementsRegistry';
import { walletStructureService } from '@/services/walletStructureService';
import { toast } from 'sonner';
import { callPatch, type PatchRequest } from '@/lib/api/client';
import { applyPatch, type Operation } from 'fast-json-patch';
import type { ChatMode } from '@/config/api';

function detectLanguage(text: string): 'ru' | 'en' {
  return /[\u0400-\u04FF]/.test(text) ? 'ru' : 'en';
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  chatMode: ChatMode;
  sessionId: string;
  userId: string | null;
  chatHistory: Record<string, ChatMessage[]>;
  
  styleHistory: Array<{
    timestamp: string;
    changes: any;
    description: string;
  }>;

  // Theme patch states
  lastPatch: Operation[] | null;
  isPreviewMode: boolean;
  previewTheme: any;
  originalTheme: any;
  
  setChatMode: (mode: ChatMode) => void;
  setSessionId: (sessionId: string) => void;
  setUserId: (userId: string | null) => void;
  
  // Unified send message method - now routes everything through callPatch
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

  sendThemePatchMessage: (message: {
    content: string;
    themeId: string;
    pageId: string;
    presetId?: string;
  }) => Promise<void>;
  
  applyPatchPreview: (patch: Operation[], theme: any) => void;
  commitPatch: (themeId: string) => Promise<boolean>;
  undoLastPatch: () => void;
  getChangedPaths: () => string[];
  
  clearHistory: () => void;
  applyStyleChanges: (changes: any) => void;
  applyGeneratedImage: (imageUrl: string) => void;
  preserveAndMergeStyles: (newChanges: any) => any;
  
  addToStyleHistory: (changes: any, description: string) => void;
  getStyleHistory: () => Array<{timestamp: string; changes: any; description: string;}>;
  
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

// Convert legacy response formats to style changes
function convertResponseToStyleChanges(response: any): any {
  console.log('🔄 Converting response to style changes:', response);
  
  if (response.styleChanges) {
    const styleChanges = response.styleChanges;
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
      styleNotes: styleChanges.styleNotes || response.userText || 'AI style analysis applied'
    };
  }

  if (response.elements && response.elements.colors) {
    const colors = response.elements.colors;
    const typography = response.elements.typography || {};
    const effects = response.elements.effects || {};
    
    console.log('✅ Found enhanced format with elements.colors');
    
    return {
      backgroundColor: colors.background || colors.primary,
      textColor: colors.text || colors.secondary,
      accentColor: colors.accent || colors.primary,
      buttonColor: colors.primary,
      buttonTextColor: colors.secondary || colors.text,
      borderRadius: response.elements.spacing?.borderRadius || '12px',
      fontFamily: typography.fontFamily || 'Inter, sans-serif',
      boxShadow: effects.boxShadow,
      gradient: effects.gradient,
      styleNotes: response.metadata?.style_reasoning || 'AI style analysis applied'
    };
  }
  
  console.warn('⚠️ Unknown response format, using fallback');
  return null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  chatMode: 'analysis',
  sessionId: `session_${Date.now()}`,
  userId: null,
  chatHistory: {},
  styleHistory: [],

  // Theme patch states
  lastPatch: null,
  isPreviewMode: false,
  previewTheme: null,
  originalTheme: null,
  
  setChatMode: (mode) => {
    console.log('🔄 [UNIFIED] Switching chat mode to:', mode);
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

  // Unified send message - now routes through callPatch for all modes
  sendMessage: async (messageData) => {
    const { messages, sessionId, chatMode } = get();
    
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
      console.log('🚀 [UNIFIED] Sending message via callPatch:', {
        content: messageData.content,
        hasImage: !!messageData.imageUrl,
        element: messageData.walletElement,
        mode: chatMode,
        sessionId
      });

      const enhancedWalletContext = createEnhancedWalletContext();
      
      const patchRequest: PatchRequest = {
        themeId: 'demo-theme', // Default theme ID for analysis
        pageId: 'global',
        userPrompt: messageData.content,
        mode: chatMode,
        imageUrl: messageData.imageUrl || undefined,
        walletContext: enhancedWalletContext,
        sessionId
      };

      const response = await callPatch(patchRequest);

      if (!response.success) {
        console.error('❌ LLM service error:', response.error);
        throw new Error(response.error || 'Failed to get AI response');
      }

      console.log('📊 [UNIFIED] Full LLM response:', response);

      const lang = detectLanguage(messageData.content);
      const fallback = lang === 'ru'
        ? 'Я проанализировал ваш кошелек и применил запрошенные изменения.'
        : 'I analyzed your wallet and applied the requested changes.';
      
      const friendlyResponse = response.userText || response.response || fallback;
      
      // Handle style changes for analysis mode
      if (chatMode === 'analysis' && response.styleChanges) {
        console.log('🎨 Processing style changes from unified LLM:', response.styleChanges);
        
        const convertedChanges = convertResponseToStyleChanges(response);
        
        if (convertedChanges) {
          const preservedChanges = get().preserveAndMergeStyles(convertedChanges);
          console.log('✅ Successfully converted and preserved style changes:', preservedChanges);
          
          const walletStore = useWalletCustomizationStore.getState();
          walletStore.applyUniversalStyle(preservedChanges);
        }
      }

      // Handle image generation response
      if ((chatMode === 'leonardo' || chatMode === 'replicate') && response.imageUrl) {
        console.log('🖼️ [UNIFIED] Processing generated image:', response.imageUrl);
        get().applyGeneratedImage(response.imageUrl);
        
        toast.success(`🎨 Generated image automatically applied as wallet background!`, {
          description: `Mode: ${chatMode} | Time: ${new Date().toLocaleTimeString()}`,
          duration: 4000
        });
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: friendlyResponse,
        timestamp: new Date(),
        imageUrl: response.imageUrl,
        isGenerated: !!(chatMode === 'leonardo' || chatMode === 'replicate'),
        autoApplied: !!(response.imageUrl || response.styleChanges),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      console.log('✅ [UNIFIED] Message processed successfully');

    } catch (error) {
      console.error('❌ [UNIFIED] Error sending message:', error);
      
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

  // Legacy image generation method - now routes through unified sendMessage
  sendImageGenerationMessage: async (messageData) => {
    const { setChatMode, sendMessage } = get();
    
    console.log('🖼️ [LEGACY] Image generation request - routing through unified method');
    
    // Temporarily switch mode and send through unified method
    const currentMode = get().chatMode;
    setChatMode(messageData.mode);
    
    try {
      await sendMessage({
        content: messageData.content
      });
    } finally {
      // Restore previous mode if needed
      if (currentMode !== messageData.mode) {
        setChatMode(currentMode);
      }
    }
  },

  // Legacy style analysis method - now routes through unified sendMessage  
  sendStyleAnalysis: async (messageData) => {
    const { setChatMode, sendMessage } = get();
    
    console.log('🎨 [LEGACY] Style analysis request - routing through unified method');
    
    // Temporarily switch to analysis mode
    const currentMode = get().chatMode;
    setChatMode('analysis');
    
    try {
      await sendMessage({
        content: messageData.content,
        imageUrl: messageData.imageUrl
      });
    } finally {
      // Restore previous mode if needed
      if (currentMode !== 'analysis') {
        setChatMode(currentMode);
      }
    }
  },

  // Theme patch method - unchanged, already using callPatch correctly
  sendThemePatchMessage: async (messageData) => {
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
      console.log('🎨 [THEME-PATCH] Sending theme patch request:', messageData);

      const patchRequest: PatchRequest = {
        themeId: messageData.themeId,
        pageId: messageData.pageId,
        presetId: messageData.presetId,
        userPrompt: messageData.content,
        mode: 'theme-patch'
      };

      const response = await callPatch(patchRequest);

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate patch');
      }

      if (!response.patch || response.patch.length === 0) {
        toast.warning('No changes generated for this request');
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: 'No changes were needed for your request. The theme is already optimized!',
          timestamp: new Date(),
        };

        set(state => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false
        }));
        return;
      }

      // Apply patch locally for preview
      get().applyPatchPreview(response.patch, response.theme);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `✨ Preview applied! I've made the requested changes to your theme. Use the Apply button to save these changes or Undo to revert.`,
        timestamp: new Date(),
        isPatchPreview: true,
        patchOperations: response.patch,
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

      toast.success('🎨 Theme preview updated! Click Apply to save changes.');

    } catch (error) {
      console.error('❌ Theme patch error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: `Sorry, there was an error generating the theme changes: ${errorMessage}`,
          timestamp: new Date(),
        }],
        isLoading: false
      }));

      toast.error(`❌ Theme patch failed: ${errorMessage}`);
    }
  },

  applyPatchPreview: (patch, theme) => {
    console.log('🎨 Applying patch preview:', patch);
    
    const walletStore = useWalletCustomizationStore.getState();
    const currentTheme = walletStore.walletStyle;
    
    // Store original theme for undo
    if (!get().originalTheme) {
      set({ originalTheme: JSON.parse(JSON.stringify(currentTheme)) });
    }
    
    set({ 
      lastPatch: patch,
      isPreviewMode: true,
      previewTheme: theme
    });

    // Apply to wallet store for immediate preview
    if (theme) {
      walletStore.applyUniversalStyle(theme);
    }
  },

  commitPatch: async (themeId) => {
    const { lastPatch, previewTheme } = get();
    
    if (!lastPatch || !previewTheme) {
      toast.error('No changes to commit');
      return false;
    }

    try {
      console.log('💾 Committing patch to database:', themeId);
      
      const response = await callPatch({
        themeId,
        pageId: 'global',
        userPrompt: 'Commit current changes',
        mode: 'theme-patch'
      });

      if (response.success) {
        set({ 
          isPreviewMode: false,
          originalTheme: null
        });
        
        toast.success('✅ Changes saved successfully!');
        return true;
      } else {
        throw new Error(response.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('❌ Failed to commit patch:', error);
      toast.error(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  },

  undoLastPatch: () => {
    const { originalTheme, isPreviewMode } = get();
    
    if (!isPreviewMode || !originalTheme) {
      toast.warning('Nothing to undo');
      return;
    }

    console.log('↶ Undoing last patch');
    
    const walletStore = useWalletCustomizationStore.getState();
    walletStore.applyUniversalStyle(originalTheme);
    
    set({
      lastPatch: null,
      isPreviewMode: false,
      previewTheme: null,
      originalTheme: null
    });

    toast.success('↶ Changes reverted');
  },

  getChangedPaths: () => {
    const { lastPatch } = get();
    
    if (!lastPatch) return [];
    
    return lastPatch.map(op => op.path).filter((path, index, self) => 
      self.indexOf(path) === index
    );
  },

  preserveAndMergeStyles: (newChanges) => {
    const walletStore = useWalletCustomizationStore.getState();
    const currentStyle = walletStore.walletStyle;
    
    console.log('🔄 Preserving current styles and merging:', currentStyle);
    console.log('🔄 New changes to merge:', newChanges);
    
    const mergedChanges = {
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
      ...newChanges
    };
    
    console.log('✅ Merged style result:', mergedChanges);
    return mergedChanges;
  },

  addToStyleHistory: (changes, description) => {
    const historyEntry = {
      timestamp: new Date().toISOString(),
      changes,
      description
    };
    
    console.log('📝 Adding to style history:', historyEntry);
    
    set(state => ({
      styleHistory: [...state.styleHistory, historyEntry].slice(-50)
    }));
  },

  getStyleHistory: () => {
    return get().styleHistory;
  },

  applyGeneratedImage: (imageUrl: string) => {
    console.log('🖼️ [UNIFIED] Applying generated image with style preservation:', imageUrl);
    
    const walletStore = useWalletCustomizationStore.getState();
    
    const preservedChanges = get().preserveAndMergeStyles({
      backgroundImage: `url(${imageUrl})`,
    });
    
    console.log('🎨 [UNIFIED] Applying preserved changes:', preservedChanges);
    
    get().addToStyleHistory(
      { backgroundImage: `url(${imageUrl})` },
      `Generated background image applied at ${new Date().toLocaleTimeString()}`
    );
    
    walletStore.applyUniversalStyle(preservedChanges);
    
    console.log('✅ [UNIFIED] Image applied with full style preservation');
  },

  applyStyleChanges: (changes) => {
    console.log('🎨 Applying style changes with preservation');
    
    if (changes && changes.changes) {
      const preservedChanges = get().preserveAndMergeStyles(changes.changes);
      const walletStore = useWalletCustomizationStore.getState();
      walletStore.applyUniversalStyle(preservedChanges);
      
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
