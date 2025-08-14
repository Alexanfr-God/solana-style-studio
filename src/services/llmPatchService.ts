
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
}

export class LlmPatchService {
  static async applyPatch(request: PatchRequest): Promise<PatchResponse> {
    console.log('🎨 Sending patch request:', request);

    const { data, error } = await supabase.functions.invoke('llm-patch', {
      body: request
    });

    if (error) {
      console.error('❌ LLM Patch Service Error:', error);
      throw new Error(`Patch service error: ${error.message}`);
    }

    if (!data) {
      throw new Error('No response from patch service');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ Patch applied successfully:', data);
    return data as PatchResponse;
  }

  static async getTheme(themeId: string) {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();

    if (error) {
      throw new Error(`Failed to get theme: ${error.message}`);
    }

    return data;
  }

  static async getUserThemes() {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        projects!inner(name, user_id)
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get themes: ${error.message}`);
    }

    return data;
  }

  static async createProject(name: string) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  static async createTheme(projectId: string, name: string, baseTheme: any) {
    const { data, error } = await supabase
      .from('themes')
      .insert({
        project_id: projectId,
        name,
        base_theme: baseTheme,
        current_theme: baseTheme,
        schema_version: '1.0.0'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create theme: ${error.message}`);
    }

    return data;
  }
}
