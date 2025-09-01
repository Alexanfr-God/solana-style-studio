
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

export interface PatchRequest {
  themeId: string;
  pageId: string;
  presetId?: string;
  userPrompt: string;
  mode?: string;
  imageUrl?: string;
  walletContext?: any;
  sessionId?: string;
  currentTheme?: any;
}

export interface PatchResponse {
  success: boolean;
  patch?: any[];
  theme?: any;
  response?: string;
  userText?: string;
  error?: string;
  explanation?: string;
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

// Wrapper function for theme patching
export const callPatch = async (request: PatchRequest): Promise<PatchResponse> => {
  try {
    console.log('[API] callPatch request:', request);

    const { data, error } = await supabase.functions.invoke('llm-patch', {
      body: {
        prompt: request.userPrompt,
        themeId: request.themeId,
        pageId: request.pageId,
        presetId: request.presetId,
        imageUrl: request.imageUrl,
        mode: request.mode || 'patch',
        contextData: request.walletContext,
        sessionId: request.sessionId,
        currentTheme: request.currentTheme
      }
    });

    if (error) {
      console.error('[API] callPatch error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('[API] callPatch response:', data);

    return {
      success: true,
      patch: data.patch,
      theme: data.theme,
      response: data.response,
      userText: data.userText,
      explanation: data.explanation,
      styleChanges: data.styleChanges
    };
  } catch (error) {
    console.error('[API] callPatch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to get presets (from public files or API)
export const getPresets = async (): Promise<any[]> => {
  try {
    console.log('[API] Loading presets from manifest...');
    
    const response = await fetch('/themes/manifest.json');
    if (!response.ok) {
      throw new Error('Failed to load presets manifest');
    }
    
    const presets = await response.json();
    console.log('[API] Loaded presets:', presets.length);
    
    return presets;
  } catch (error) {
    console.error('[API] Failed to load presets:', error);
    return [];
  }
};

// Function to prepare theme for NFT minting
export const prepareMint = async (themeId: string): Promise<{ url: string; walletTarget: string }> => {
  try {
    console.log('[API] Preparing theme for mint:', themeId);

    const { data, error } = await supabase.functions.invoke('export_theme', {
      body: {
        themeId,
        format: 'nft'
      }
    });

    if (error) {
      console.error('[API] Mint preparation error:', error);
      throw new Error(error.message);
    }

    console.log('[API] Mint preparation successful:', data);

    return {
      url: data.exportUrl || data.url,
      walletTarget: data.walletTarget || 'phantom'
    };
  } catch (error) {
    console.error('[API] prepareMint failed:', error);
    throw error;
  }
};
