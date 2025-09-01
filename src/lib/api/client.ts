
import { supabase } from '@/integrations/supabase/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChatRequest {
  message: string;
  imageUrl?: string;
  context?: any;
}

export interface ChatResponse {
  response: string;
  styleChanges?: any;
}

export class ApiClient {
  /**
   * Chat with AI assistant via llm-patch
   */
  static async chat(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    try {
      console.log('[API] Starting chat request via llm-patch:', {
        hasMessage: !!request.message,
        hasImage: !!request.imageUrl,
        hasContext: !!request.context
      });

      const { data, error } = await supabase.functions.invoke('llm-patch', {
        body: {
          prompt: request.message,
          imageUrl: request.imageUrl,
          contextData: request.context || {
            walletType: 'phantom',
            activeLayer: 'wallet'
          },
          mode: 'chat'
        }
      });

      if (error) {
        console.error('[API] Chat error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      console.log('[API] Chat response received:', data);

      return {
        success: true,
        data: {
          response: data.explanation || data.response || 'No response received',
          styleChanges: data.patch || data.styleChanges
        }
      };
    } catch (error) {
      console.error('[API] Chat request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate style via generate-style function
   */
  static async generateStyle(params: {
    prompt: string;
    imageUrl?: string;
    layerType: 'login' | 'wallet';
    context?: any;
  }): Promise<ApiResponse<any>> {
    try {
      console.log('[API] Generating style:', params);

      const { data, error } = await supabase.functions.invoke('generate-style', {
        body: {
          prompt: params.prompt,
          image_url: params.imageUrl,
          layer_type: params.layerType,
          user_id: 'demo-user',
          mode: 'style_generation',
          additional_context: params.context
        }
      });

      if (error) {
        console.error('[API] Style generation error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data.style
      };
    } catch (error) {
      console.error('[API] Style generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Apply patch via llm-patch function
   */
  static async applyPatch(params: {
    prompt: string;
    imageUrl?: string;
    currentTheme?: any;
  }): Promise<ApiResponse<any>> {
    try {
      console.log('[API] Applying patch via llm-patch:', params);

      const { data, error } = await supabase.functions.invoke('llm-patch', {
        body: {
          prompt: params.prompt,
          imageUrl: params.imageUrl,
          currentTheme: params.currentTheme,
          mode: 'patch'
        }
      });

      if (error) {
        console.error('[API] Patch application error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: {
          patch: data.patch,
          explanation: data.explanation
        }
      };
    } catch (error) {
      console.error('[API] Patch application failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
