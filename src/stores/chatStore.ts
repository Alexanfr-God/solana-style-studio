import { create } from 'zustand';
import { callPatch, type PatchRequest, type PatchResponse } from '@/lib/api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  input: string;
  setInput: (input: string) => void;
  sendMessage: (message: string) => Promise<void>;
  applyPatch: (request: PatchRequest) => Promise<PatchResponse>;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  input: '',
  setInput: (input: string) => set({ input }),
  sendMessage: async (message: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate AI response (replace with actual API call later)
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: `AI Response: ${message}`,
        timestamp: new Date(),
      };
      set(state => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
        input: '' // Clear input after sending message
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: errorMessage, isLoading: false });
    }
  },
  applyPatch: async (request: PatchRequest) => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });

    try {
      console.log('[CHAT STORE] Applying patch:', request);
      
      const response = await callPatch(request);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to apply patch');
      }

      // Update messages with AI response
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: response.explanation || response.response || 'Changes applied successfully',
        timestamp: new Date(),
        // Remove imageUrl references as they don't exist in PatchResponse
      };

      set(state => ({
        messages: [...state.messages, aiMessage],
        isLoading: false
      }));

      // Apply theme changes if provided
      if (response.patch && response.patch.length > 0) {
        // Theme application logic here - removed imageUrl references
        console.log('[CHAT STORE] Applying theme patch:', response.patch);
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, errorMsg],
        isLoading: false,
        error: errorMessage
      }));

      throw error;
    }
  },
  clearChat: () => set({ messages: [] }),
}));
