
import { supabase } from '@/integrations/supabase/client';
import type { Operation } from 'fast-json-patch';

export interface PatchRequest {
  themeId: string;
  pageId: string;
  presetId?: string;
  userPrompt: string;
}

export interface PatchResponse {
  patch: Operation[];
  theme: any;
  success: boolean;
  error?: string;
}

/**
 * Call the LLM patch service to generate theme modifications
 */
export async function callPatch(request: PatchRequest): Promise<PatchResponse> {
  console.log('🚀 Calling patch service:', request);
  
  try {
    const { data, error } = await supabase.functions.invoke('llm-patch', {
      body: request
    });

    if (error) {
      console.error('❌ Patch service error:', error);
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
        error: 'No response from patch service'
      };
    }

    if (data.error) {
      return {
        patch: [],
        theme: null,
        success: false,
        error: data.error
      };
    }

    console.log('✅ Patch service response:', data);
    
    return {
      patch: data.patch || [],
      theme: data.theme,
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Patch call failed:', error);
    
    return {
      patch: [],
      theme: null,
      success: false,
      error: errorMessage
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
