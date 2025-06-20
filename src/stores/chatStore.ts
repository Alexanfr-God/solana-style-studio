
import { create } from 'zustand';
import { ChatMessage } from '@/components/chat/ChatInterface';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (message: {
    content: string;
    imageUrl?: string | null;
    walletElement?: string;
  }) => Promise<void>;
  clearHistory: () => void;
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
      // Simulate AI response for now - will be replaced with actual GPT integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiResponse = generateMockResponse(messageData);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      set(state => ({
        messages: [...state.messages, {
          id: `error-${Date.now()}`,
          type: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        }],
        isLoading: false
      }));
    }
  },

  clearHistory: () => set({ messages: [] }),
}));

// Mock response generator - will be replaced with actual GPT integration
function generateMockResponse(messageData: {
  content: string;
  imageUrl?: string | null;
  walletElement?: string;
}): string {
  if (messageData.imageUrl) {
    return "I can see the image you've uploaded! I'll analyze the style and colors to customize your wallet. Based on the visual elements, I suggest updating the color scheme and applying a modern gradient background. Would you like me to proceed with these changes?";
  }
  
  if (messageData.walletElement) {
    return `I understand you want to modify the ${messageData.walletElement}. I can help you customize this element. What specific changes would you like to make? For example, I can change colors, fonts, layout, or add visual effects.`;
  }
  
  if (messageData.content.toLowerCase().includes('color')) {
    return "I can help you change the wallet colors! I can modify the primary color scheme, accent colors, background gradients, and text colors. What kind of color palette are you looking for? Modern, dark, vibrant, or something else?";
  }
  
  return "I'm ready to help customize your wallet! I can modify any element including colors, fonts, layout, backgrounds, and visual effects. What would you like to change first?";
}
