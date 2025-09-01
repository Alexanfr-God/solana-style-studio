
import { supabase } from '@/integrations/supabase/client';

export interface WalletStyle {
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  boxShadow?: string;
  styleNotes?: string;
}

export const generateStyle = async (
  prompt: string, 
  imageUrl: string | null, 
  layerType: 'login' | 'wallet',
  additionalContext?: {
    layerContext?: string;
    isLoginScreen?: boolean;
    isWalletScreen?: boolean;
  }
): Promise<WalletStyle> => {
  try {
    console.log('🎯 API Service - Generating style for:', {
      layerType,
      prompt,
      hasImage: !!imageUrl,
      context: additionalContext
    });

    // Enhanced prompt based on layer type
    let enhancedPrompt = prompt;
    if (layerType === 'login') {
      enhancedPrompt = `Login screen style: ${prompt}. Focus on welcome/authentication interface with clean, trustworthy design.`;
    } else if (layerType === 'wallet') {
      enhancedPrompt = `Wallet interface style: ${prompt}. Focus on financial dashboard with balance display, transaction history, and action buttons.`;
    }

    const { data, error } = await supabase.functions.invoke('generate-style', {
      body: {
        prompt: enhancedPrompt,
        image_url: imageUrl,
        layer_type: layerType,
        user_id: 'demo-user',
        mode: 'style_generation',
        additional_context: additionalContext
      }
    });

    if (error) {
      console.error('💥 Supabase function error:', error);
      throw new Error(`Style generation failed: ${error.message}`);
    }

    if (!data?.success) {
      console.error('💥 Generation failed:', data);
      throw new Error(data?.error || 'Style generation failed');
    }

    console.log('✅ Style generated successfully:', data.style);

    // Ensure we have required properties
    const style: WalletStyle = {
      backgroundColor: data.style.backgroundColor || '#1a1a2e',
      backgroundImage: data.style.backgroundImage || data.imageUrl || undefined,
      accentColor: data.style.accentColor || '#8b5cf6',
      textColor: data.style.textColor || '#ffffff',
      buttonColor: data.style.buttonColor || '#8b5cf6',
      buttonTextColor: data.style.buttonTextColor || '#ffffff',
      borderRadius: data.style.borderRadius || '8px',
      fontFamily: data.style.fontFamily || 'Inter, sans-serif',
      boxShadow: data.style.boxShadow,
      styleNotes: data.style.styleNotes || `Generated ${layerType} theme`
    };

    return style;
  } catch (error) {
    console.error('💥 Error in generateStyle:', error);
    throw error;
  }
};

// Chat function for AI assistant - using llm-patch instead of legacy wallet-chat-gpt
export const chatWithAI = async (
  message: string,
  imageUrl?: string,
  walletContext?: any
): Promise<{ response: string; styleChanges?: any }> => {
  try {
    console.log('💬 Starting AI chat via llm-patch:', {
      message,
      hasImage: !!imageUrl,
      hasContext: !!walletContext
    });

    const { data, error } = await supabase.functions.invoke('llm-patch', {
      body: {
        prompt: message,
        imageUrl: imageUrl,
        contextData: walletContext || {
          walletType: 'phantom',
          activeLayer: 'wallet'
        },
        mode: 'chat'
      }
    });

    if (error) {
      console.error('💥 Chat function error:', error);
      throw new Error(`AI chat failed: ${error.message}`);
    }

    console.log('✅ AI response received via llm-patch:', data);

    return {
      response: data.explanation || data.response || 'Sorry, I could not process your request.',
      styleChanges: data.patch || data.styleChanges
    };
  } catch (error) {
    console.error('💥 Error in chatWithAI:', error);
    throw error;
  }
};
