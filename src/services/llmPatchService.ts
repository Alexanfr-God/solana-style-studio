

import { supabase } from '@/integrations/supabase/client';
import { applyPatch, type Operation } from 'fast-json-patch';

export interface PatchRequest {
  userId: string;
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

  static async getUserTheme(userId: string) {
    const { data, error } = await supabase
      .from('user_themes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get theme: ${error.message}`);
    }

    return data;
  }

  static async updateUserTheme(userId: string, themeData: any) {
    const { data, error } = await supabase
      .from('user_themes')
      .update({
        theme_data: themeData,
        version: 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update theme: ${error.message}`);
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

