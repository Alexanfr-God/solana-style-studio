
import { supabase } from '@/integrations/supabase/client';
import { getLLMFunctionName } from '@/config/api';
import type { Operation } from 'fast-json-patch';

export interface PatchRequest {
  themeId: string;
  pageId: string;
  presetId?: string;
  userPrompt: string;
  mode?: string; // Added to support different chat modes
  content?: string; // Alias for userPrompt for backward compatibility
  imageUrl?: string; // Support for image-based requests
  uploadedImageUrl?: string; // Support for uploaded images
  walletContext?: any; // Support for wallet context
  sessionId?: string; // Support for session tracking
}

export interface PatchResponse {
  patch: Operation[];
  theme: any;
  success: boolean;
  error?: string;
  // Legacy response fields for backward compatibility
  response?: string;
  styleChanges?: any;
  imageUrl?: string;
  userText?: string;
  analysis?: string;
}

/**
 * Prepare theme for minting by exporting it to storage
 */
export async function prepareMint(themeId: string): Promise<{
  url: string;
  themeId: string;
  walletTarget: 'phantom' | 'metamask' | 'demo';
}> {
  console.log('🚀 Preparing theme for mint:', themeId);
  
  try {
    const { data, error } = await supabase.functions.invoke('export_theme', {
      body: { themeId }
    });

    if (error) {
      console.error('❌ Export service error:', error);
      throw new Error(`Export failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response from export service');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ Theme export prepared:', data);
    
    return {
      url: data.url,
      themeId: data.themeId,
      walletTarget: data.walletTarget
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Prepare mint failed:', error);
    throw new Error(`Export failed: ${errorMessage}`);
  }
}

/**
 * Unified LLM patch service - now handles all chat modes
 * Enhanced with better error handling and success/failure responses
 */
export async function callPatch(request: PatchRequest): Promise<PatchResponse> {
  const functionName = getLLMFunctionName();
  console.log('🎨 Calling unified LLM service:', functionName, request);
  
  try {
    // Prepare request body with backward compatibility
    const requestBody = {
      themeId: request.themeId,
      pageId: request.pageId,
      presetId: request.presetId,
      userPrompt: request.userPrompt || request.content,
      mode: request.mode || 'theme-patch',
      content: request.content || request.userPrompt,
      imageUrl: request.imageUrl,
      walletContext: request.walletContext,
      sessionId: request.sessionId,
      // Add debugging flag
      debugMode: true
    };

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody
    });

    if (error) {
      console.error('❌ LLM service error:', error);
      return {
        patch: [],
        theme: null,
        success: false,
        error: `Service error: ${error.message}`
      };
    }

    if (!data) {
      return {
        patch: [],
        theme: null,
        success: false,
        error: 'No response from LLM service'
      };
    }

    if (data.error) {
      console.error('❌ LLM data error:', data.error);
      return {
        patch: [],
        theme: null,
        success: false,
        error: data.error
      };
    }

    // Handle different response formats for backward compatibility
    let patch = data.patch || [];
    let theme = data.theme;
    let success = data.success !== false;

    // Legacy wallet-chat-gpt response format support
    if (data.styleChanges && !patch.length) {
      // Convert styleChanges to patch format if needed
      console.log('🔄 Converting legacy styleChanges to patch format');
      // For now, just mark as successful without patch
      success = true;
    }

    // Validate that we have a proper patch response for patch modes
    if (request.mode === 'theme-patch' && !Array.isArray(patch)) {
      console.warn('⚠️ Invalid patch format received:', data);
      return {
        patch: [],
        theme: data.theme || null,
        success: false,
        error: 'Invalid patch format received from service'
      };
    }

    console.log('✅ LLM service success:', {
      patchOperations: patch.length,
      hasTheme: !!theme,
      mode: request.mode
    });
    
    return {
      patch,
      theme,
      success,
      // Include legacy fields for backward compatibility
      response: data.response || data.userText,
      styleChanges: data.styleChanges,
      imageUrl: data.imageUrl,
      userText: data.userText,
      analysis: data.analysis
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ LLM call failed:', error);
    
    return {
      patch: [],
      theme: null,
      success: false,
      error: `Call failed: ${errorMessage}`
    };
  }
}

/**
 * Get available presets for theme customization
 */
export async function getPresets(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch presets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Presets fetch error:', error);
    return [];
  }
}

/**
 * Get theme by ID
 */
export async function getTheme(themeId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();

    if (error) {
      console.error('❌ Failed to fetch theme:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Theme fetch error:', error);
    return null;
  }
}

/**
 * Save theme to database
 */
export async function saveTheme(themeId: string, themeData: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('themes')
      .update({ 
        current_theme: themeData,
        updated_at: new Date().toISOString()
      })
      .eq('id', themeId);

    if (error) {
      console.error('❌ Failed to save theme:', error);
      return false;
    }

    console.log('💾 Theme saved:', themeId);
    return true;
  } catch (error) {
    console.error('❌ Theme save error:', error);
    return false;
  }
}
