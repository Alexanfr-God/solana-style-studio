

import { supabase } from '@/integrations/supabase/client';
import { applyPatch, type Operation } from 'fast-json-patch';

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

function safeClone<T>(doc: T): T {
  // structuredClone есть в современных рантаймах; добавляем фоллбэк
  return (globalThis as any).structuredClone
    ? (structuredClone as any)(doc)
    : JSON.parse(JSON.stringify(doc));
}

/**
 * Применяет JSON Patch c валидацией.
 * Если есть некорректная операция (включая провал test), applyPatch бросит ошибку.
 */
export function applyJsonPatch<T>(doc: T, ops: Operation[]): T {
  try {
    const res = applyPatch(safeClone(doc) as any, ops, /*validate*/ true, /*mutateDocument*/ false);
    return res.newDocument as T;
  } catch (err) {
    // Пробрасываем дальше с более понятным сообщением
    throw new Error("JSON Patch failed: " + (err instanceof Error ? err.message : String(err)));
  }
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
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, user_id: user.id })
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

  // Utility method to apply and validate JSON patch
  static applyAndValidateJsonPatch(currentTheme: any, patchOps: Operation[], schema?: any): any {
    try {
      // Apply patch to a copy
      const updatedTheme = applyJsonPatch(currentTheme, patchOps);

      // If schema is provided, validate the result
      if (schema) {
        // Note: AJV validation would be added here when schema validation is implemented
        // For now, we just return the updated theme
        // Example:
        // if (!ajvValidate(updatedTheme)) {
        //   throw new Error("Schema validation failed: " + JSON.stringify(ajvValidate.errors));
        // }
      }

      return updatedTheme;
    } catch (error) {
      throw new Error(`Patch validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

