import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { applyPatch, Operation } from 'https://esm.sh/fast-json-patch@3.1.1';
import Ajv from 'https://esm.sh/ajv@8.12.0';
import addFormats from 'https://esm.sh/ajv-formats@2.1.1';
import { FileUploadModule } from './fileUploadModule.ts';
import { processVisionStyle, VisionStyleRequest } from './modules/visionStyle.ts';
import { extractPaletteFromImage, Palette } from './lib/extractPalette.ts';
import { generatePatchFromPalette, DEFAULT_SAFE_PREFIXES } from './lib/generatePatchFromPalette.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatchRequest {
  userId: string;
  pageId: string;
  presetId?: string;
  userPrompt: string;
}

interface FileUploadRequest {
  mode: 'upload';
  file_data: string;
  file_name: string;
  user_id: string;
  folder?: string;
}

interface VisionPaletteRequest {
  mode: 'vision-palette';
  userId: string;
  imageUrl?: string;
  palette?: Palette;
  safePrefixes?: string[];
  allowFontChange?: boolean;
}

interface PatchResponse {
  valid: boolean;
  patch?: Operation[];
  theme?: any;
  errors?: ValidationError[];
  executionTime?: number;
}

interface ValidationError {
  path: string;
  message: string;
  expected?: any;
  actual?: any;
}

// Cache for compiled schema
let compiledSchema: any = null;

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

function formatValidationErrors(ajvErrors: any[]): ValidationError[] {
  return ajvErrors.map(error => {
    const path = error.instancePath || error.schemaPath || 'root';
    let message = error.message || 'Validation failed';
    
    // Add more context for specific error types
    if (error.keyword === 'pattern') {
      message = `Value should match pattern ${error.schema}`;
    } else if (error.keyword === 'enum') {
      message = `Value should be one of: ${error.schema.join(', ')}`;
    } else if (error.keyword === 'required') {
      message = `Missing required property: ${error.params?.missingProperty}`;
    } else if (error.keyword === 'type') {
      message = `Expected ${error.schema}, got ${typeof error.data}`;
    }

    return {
      path: path.replace(/^\//, ''), // Remove leading slash
      message,
      expected: error.schema,
      actual: error.data
    };
  });
}

async function callLovableAI(systemPrompt: string, userContext: string): Promise<Operation[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext }
      ],
      // Note: Gemini does not support temperature or response_format
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Lovable AI error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded, please try again later');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted, please add funds');
    }
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from Lovable AI');
  }

  // Parse JSON from response (may contain markdown code blocks)
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  
  try {
    const parsed = JSON.parse(jsonStr);
    return parsed.patch || [];
  } catch (parseError) {
    console.error('❌ Failed to parse AI response:', content);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Fire-and-forget telemetry logging for llm-patch requests
 */
function logLlmPatchTelemetry(
  supabase: any,
  userId: string,
  themeId: string,
  pageId: string,
  userPrompt: string,
  patch: Operation[],
  durationMs: number,
  status: 'ok' | 'error',
  errorMessage?: string
) {
  // Only log if AI_LOGS_ENABLED is explicitly set to 'true'
  if (Deno.env.get('AI_LOGS_ENABLED') !== 'true') {
    return;
  }

  // Ensure patch is an array for length calculation
  const patchArray = Array.isArray(patch) ? patch : [];
  
  // Create telemetry payload - NEVER include full prompt text
  const payload = {
    request_type: 'llm-patch',
    user_id: userId,
    theme_id: themeId,
    page_id: pageId || null,
    prompt_len: userPrompt?.length || 0, // String length only, not the actual text
    patch_len: patchArray.length, // Number of operations in patch array
    duration_ms: Math.round(durationMs),
    status,
    error_message: status === 'error' ? (errorMessage || 'Unknown error') : null,
    patch_preview: JSON.stringify(patchArray).slice(0, 2000) // First 2000 chars only
  };

  // Fire-and-forget: don't await, don't block main thread, ignore errors
  queueMicrotask(() => {
    supabase.from('ai_requests').insert(payload).catch(() => {
      // Silently ignore telemetry errors - they should never affect main functionality
    });
  });
}

serve(async (req) => {
  const startTime = performance.now(); // Start telemetry timer
  console.log(`🚀 LLM Patch Request received: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ 
      valid: false,
      errors: [{ path: 'request', message: 'Method not allowed' }]
    }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestBody = await req.json();
    
    // Handle file upload mode
    if (requestBody.mode === 'upload') {
      console.log('📁 Processing file upload request');
      const fileUploadModule = new FileUploadModule(supabase);
      const result = await fileUploadModule.uploadFile(requestBody as FileUploadRequest);
      return jsonResponse(result);
    }

    // Handle vision-style mode
    if (requestBody.mode === 'vision-style') {
      console.log('🎨 Processing vision-style request');
      const result = await processVisionStyle(requestBody as VisionStyleRequest, supabase);
      
      // Log telemetry for vision request
      try {
        await logLlmPatchTelemetry(supabase, {
          user_id: 'anonymous', // Vision может быть без auth
          prompt: `Vision analysis: ${requestBody.imageUrl}`,
          page_id: 'vision',
          has_preset: false,
          preset_id: null,
          response_valid: result.ops.length > 0,
          operation_count: result.ops.length,
          execution_time_ms: performance.now() - startTime,
          error_message: result.ops.length === 0 ? result.message : null,
          theme_id: 'vision-analysis'
        });
      } catch (telemetryError) {
        console.error('📊 Telemetry logging failed:', telemetryError);
      }
      
      return jsonResponse(result);
    }

    // ============================================================================
    // Mode: vision-palette
    // ============================================================================
    if (requestBody.mode === 'vision-palette') {
      const visionReq = requestBody as VisionPaletteRequest;
      const paletteStartTime = Date.now();
      
      try {
        // 1. Get current user theme
        const { data: themeData, error: themeError } = await supabase
          .from('user_themes')
          .select('theme_data')
          .eq('user_id', visionReq.userId)
          .single();
        
        if (themeError || !themeData?.theme_data) {
          console.error('[VISION-PALETTE] ❌ Theme not found for user:', visionReq.userId);
          return jsonResponse({ error: 'Theme not found' }, 404);
        }
        
        const currentTheme = themeData.theme_data;
        console.log('[VISION-PALETTE] ✅ Loaded theme for user:', visionReq.userId);
        
        // 2. Get palette (either from imageUrl or pre-defined)
        let palette: Palette;
        if (visionReq.palette) {
          // Use pre-defined palette from AI Color Schemes
          console.log('[VISION-PALETTE] 🎨 Using pre-defined palette:', visionReq.palette);
          palette = visionReq.palette;
        } else if (visionReq.imageUrl) {
          // Extract palette from image
          console.log('[VISION-PALETTE] 🎨 Extracting palette from image:', visionReq.imageUrl);
          palette = await extractPaletteFromImage(visionReq.imageUrl);
          console.log('[VISION-PALETTE] 🎨 Extracted palette:', palette);
        } else {
          console.error('[VISION-PALETTE] ❌ Neither imageUrl nor palette provided');
          return jsonResponse({ error: 'Either imageUrl or palette is required' }, 400);
        }
        
        // 3. Generate patch operations
        const safePrefixes = visionReq.safePrefixes || DEFAULT_SAFE_PREFIXES;
        const ops = generatePatchFromPalette(
          palette, 
          currentTheme, 
          safePrefixes,
          visionReq.allowFontChange || false
        );
        
        console.log('[VISION-PALETTE] 📝 Generated operations:', ops.length);
        
        if (ops.length === 0) {
          console.warn('[VISION-PALETTE] ⚠️ No operations generated');
          return jsonResponse({
            success: false,
            message: 'No color changes needed',
            palette,
            patch: [],
            applied: 0
          });
        }
        
        // 4. Apply patch to theme
        const patchResult = applyPatch(currentTheme, ops, false, false);
        const updatedTheme = patchResult.newDocument;
        
        // 5. Save updated theme to database
        const { error: updateError } = await supabase
          .from('user_themes')
          .update({ 
            theme_data: updatedTheme,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', visionReq.userId);
        
        if (updateError) {
          console.error('[VISION-PALETTE] ❌ Failed to save theme:', updateError);
          return jsonResponse({ error: 'Failed to update theme' }, 500);
        }
        
        const executionTime = Date.now() - paletteStartTime;
        console.log('[VISION-PALETTE] ✅ Successfully applied palette in', executionTime, 'ms');
        
        // 6. Log telemetry
        try {
          await logLlmPatchTelemetry(supabase, {
            user_id: visionReq.userId,
            prompt: `Vision palette from image: ${visionReq.imageUrl}`,
            page_id: 'all-layers',
            has_preset: false,
            preset_id: null,
            response_valid: true,
            operation_count: ops.length,
            execution_time_ms: executionTime,
            error_message: null,
            theme_id: 'vision-palette'
          });
        } catch (telemetryError) {
          console.error('[VISION-PALETTE] 📊 Telemetry logging failed:', telemetryError);
        }
        
        // 7. Return response
        return jsonResponse({
          success: true,
          palette,
          patch: ops,
          applied: ops.length,
          theme: updatedTheme,
          message: `Applied ${ops.length} color changes from palette`,
          executionTime
        });
        
      } catch (error) {
        const executionTime = Date.now() - paletteStartTime;
        console.error('[VISION-PALETTE] ❌ Fatal error:', error);
        
        try {
          await logLlmPatchTelemetry(supabase, {
            user_id: visionReq.userId,
            prompt: `Vision palette from image: ${visionReq.imageUrl}`,
            page_id: 'all-layers',
            has_preset: false,
            preset_id: null,
            response_valid: false,
            operation_count: 0,
            execution_time_ms: executionTime,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            theme_id: 'vision-palette'
          });
        } catch (telemetryError) {
          console.error('[VISION-PALETTE] 📊 Telemetry logging failed:', telemetryError);
        }
        
        return jsonResponse({
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
      }
    }

    // Handle patch mode (existing functionality)
    const { userId, pageId, presetId, userPrompt } = requestBody as PatchRequest;

    if (!userId || !pageId || !userPrompt) {
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'request', message: 'Missing required fields: userId, pageId, userPrompt' }]
      }, 400);
    }

    console.log(`📋 Processing patch request for user: ${userId}, page: ${pageId}`);

    // 1. Get theme data from user_themes
    const { data: themeData, error: themeError } = await supabase
      .from('user_themes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (themeError || !themeData) {
      console.error('❌ Theme not found:', themeError);
      const durationMs = performance.now() - startTime;
      
      // Log error telemetry
      await logLlmPatchTelemetry(
        supabase, userId, userId, pageId, userPrompt, 
        [], durationMs, 'error', 'Theme not found - please initialize theme first'
      );
      
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'theme', message: 'Theme not found - please initialize theme first' }]
      }, 404);
    }

    // 2. Get or compile schema for validation
    if (!compiledSchema) {
      const { data: schemaData, error: schemaError } = await supabase
        .from('schema_versions')
        .select('schema')
        .eq('version', '1.0.0')
        .single();

      if (schemaError || !schemaData) {
        console.error('❌ Schema not found:', schemaError);
        const durationMs = performance.now() - startTime;
        
        // Log error telemetry
        await logLlmPatchTelemetry(
          supabase, userId, userId, pageId, userPrompt, 
          [], durationMs, 'error', 'Schema version not found'
        );
        
        return jsonResponse({ 
          valid: false,
          errors: [{ path: 'schema', message: 'Schema version not found' }]
        }, 500);
      }

      const ajv = new Ajv({ strict: false });
      addFormats(ajv);
      compiledSchema = ajv.compile(schemaData.schema);
      console.log('🔧 Schema compiled and cached');
    }

    // 3. Get preset data if presetId provided
    let presetContext = '';
    let referencePatch = '';
    
    if (presetId) {
      const { data: presetData, error: presetError } = await supabase
        .from('presets')
        .select('title, sample_context, sample_patch')
        .eq('id', presetId)
        .single();

      if (presetData && !presetError) {
        console.log(`🎨 Using preset: ${presetData.title}`);
        
        if (presetData.sample_context) {
          const context = presetData.sample_context;
          presetContext = `
STYLE CONTEXT from preset "${presetData.title}":
- Style Summary: ${context.styleSummary || 'Not specified'}
- Color Palette: ${JSON.stringify(context.palette || {})}
- Typography: ${JSON.stringify(context.typography || {})}  
- Components: ${JSON.stringify(context.components || {})}
`;
        }

        if (presetData.sample_patch && presetData.sample_patch.length > 0) {
          referencePatch = `
REFERENCE PATCH (for style inspiration only):
${JSON.stringify(presetData.sample_patch, null, 2)}
`;
        }
      }
    }

    // 4. Get example presets for context (limit 2)
    let examplePresets: any[] = [];
    if (!presetId) {
      const { data: randomPresets } = await supabase
        .from('presets')
        .select('sample_context, sample_patch')
        .not('sample_patch', 'is', null)
        .limit(2);
      
      examplePresets = randomPresets || [];
    }

    // 5. Prepare context for OpenAI
    const currentTheme = themeData.theme_data;

    const systemPrompt = `You are WCC Maestro — a smart theme editor for crypto wallet.

CRITICAL: Read the MODE from user context:

MODE 1: PRECISE (when json_path is provided)
- User gives you a SPECIFIC json_path like "/lockLayer/unlockButton/backgroundColor"
- You MUST generate EXACTLY ONE operation targeting ONLY that path
- DO NOT modify any other paths
- DO NOT search for similar elements
- Example: {"op": "replace", "path": "/lockLayer/unlockButton/backgroundColor", "value": "#9333ea"}

MODE 2: GLOBAL (when NO json_path is provided)
- User wants to change elements globally (e.g., "make all buttons blue")
- Search RECURSIVELY through ALL layers: ${Object.keys(currentTheme).join(', ')}
- Find ALL matching fields and change them
- Apply consistently across entire theme

Available layers in theme:
${Object.keys(currentTheme).map(key => `- ${key}: ${Object.keys(currentTheme[key] || {}).join(', ')}`).join('\n')}

**PRESET INTEGRATION RULES:**
When presetId is provided, use STYLE CONTEXT from preset.sample_context to bias suggestions. Do not copy brand names or celebrity likeness; keep stylistic, generic and safe.
Extract color palettes, typography preferences, and component styling from the context to guide your modifications.

${presetContext}
${referencePatch}

${examplePresets.length > 0 ? `Example patches:
${examplePresets.map(p => JSON.stringify(p.sample_patch, null, 2)).join('\n\n')}` : ''}

TECHNICAL RULES:
- Return ONLY valid JSON with a "patch" array containing RFC6902 operations
- Each patch operation must have: "op", "path", and "value" (if applicable)
- Valid operations: "replace", "add", "remove"
- All color values must be valid hex format (#RRGGBB or #RRGGBBAA) or CSS gradients
- Ensure changes maintain visual accessibility and contrast

Respond with: {"patch": [{"op": "replace", "path": "/layerName/element/property", "value": "#HEXCOLOR"}]}`;

    const userContext = `User request: "${userPrompt}"

${presetContext ? `Apply the style inspiration from the provided preset context.` : ''}

Current theme structure (all layers):
${JSON.stringify(currentTheme, null, 2)}`;

    // 6. Call Lovable AI (Gemini 2.5 Flash)
    console.log('🤖 Calling Lovable AI (Gemini)...');
    const aiStartTime = performance.now();
    
    const patchOperations = await callLovableAI(systemPrompt, userContext);
    
    const aiEndTime = performance.now();
    console.log(`🤖 Lovable AI completed in ${(aiEndTime - aiStartTime).toFixed(2)}ms`);
    console.log(`📏 Generated patch with ${patchOperations.length} operations`);

    // 7. Validate patch by applying to copy
    const validationStartTime = performance.now();
    const themeCopy = JSON.parse(JSON.stringify(currentTheme));
    let updatedTheme;
    
    try {
      updatedTheme = applyPatch(themeCopy, patchOperations, false, false).newDocument;
    } catch (patchError) {
      console.error('❌ Invalid patch operations:', patchError);
      const validationEndTime = performance.now();
      const durationMs = validationEndTime - startTime;
      
      // Log error telemetry
      await logLlmPatchTelemetry(
        supabase, userId, userId, pageId, userPrompt, 
        patchOperations, durationMs, 'error', 'Generated patch is invalid'
      );
      
      return jsonResponse({ 
        valid: false,
        errors: [{ 
          path: 'patch', 
          message: 'Generated patch is invalid', 
          actual: patchError.message 
        }],
        executionTime: durationMs
      }, 400);
    }

    // 8. Validate updated theme against schema
    const isValid = compiledSchema(updatedTheme);
    const validationEndTime = performance.now();
    console.log(`🔍 Schema validation completed in ${(validationEndTime - validationStartTime).toFixed(2)}ms`);
    
    if (!isValid) {
      const validationErrors = formatValidationErrors(compiledSchema.errors || []);
      console.error('❌ Theme validation failed:', validationErrors);
      
      const durationMs = validationEndTime - startTime;
      
      // Log error telemetry
      await logLlmPatchTelemetry(
        supabase, userId, userId, pageId, userPrompt, 
        patchOperations, durationMs, 'error', 'Theme validation failed'
      );
      
      return jsonResponse({ 
        valid: false,
        errors: validationErrors,
        executionTime: durationMs
      }, 400);
    }

    // 9. Update theme in user_themes
    const dbStartTime = performance.now();
    
    const { error: updateError } = await supabase
      .from('user_themes')
      .update({ 
        theme_data: updatedTheme,
        version: themeData.version + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Failed to update theme:', updateError);
      const durationMs = performance.now() - startTime;
      
      // Log error telemetry
      await logLlmPatchTelemetry(
        supabase, userId, userId, pageId, userPrompt, 
        patchOperations, durationMs, 'error', 'Failed to update theme'
      );
      
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'database', message: 'Failed to update theme' }],
        executionTime: durationMs
      }, 500);
    }

    const dbEndTime = performance.now();
    console.log(`💾 Database operations completed in ${(dbEndTime - dbStartTime).toFixed(2)}ms`);

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log(`✅ Patch applied successfully in ${totalTime.toFixed(2)}ms`);
    console.log(`📊 Performance: AI=${(aiEndTime - aiStartTime).toFixed(2)}ms, Validation=${(validationEndTime - validationStartTime).toFixed(2)}ms, DB=${(dbEndTime - dbStartTime).toFixed(2)}ms`);

    // 10. Log successful telemetry
    await logLlmPatchTelemetry(
      supabase, userId, userId, pageId, userPrompt, 
      patchOperations, totalTime, 'ok'
    );

    // 11. Return success response
    const response: PatchResponse = {
      valid: true,
      patch: patchOperations,
      theme: updatedTheme,
      executionTime: totalTime
    };

    return jsonResponse(response);

  } catch (error: any) {
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.error('💥 LLM Patch Error:', error);
    
    // Try to log error telemetry if we have basic info
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        
        if (user) {
          // Try to get request info for telemetry
          const requestBody = await req.json().catch(() => ({}));
          const userId = requestBody.userId || user.id || 'unknown';
          await logLlmPatchTelemetry(
            supabase, userId, userId, 
            requestBody.pageId || 'unknown', requestBody.userPrompt || '', 
            [], totalTime, 'error', error.message
          );
        }
      }
    } catch {
      // Ignore telemetry errors in error handling
    }
    
    return jsonResponse({
      valid: false,
      errors: [{ 
        path: 'system', 
        message: 'Internal server error',
        actual: error.message 
      }],
      executionTime: totalTime
    }, 500);
  }
});
