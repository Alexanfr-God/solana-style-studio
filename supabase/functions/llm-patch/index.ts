
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { applyPatch, Operation } from 'https://esm.sh/fast-json-patch@3.1.1';
import Ajv from 'https://esm.sh/ajv@8.12.0';
import addFormats from 'https://esm.sh/ajv-formats@2.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PatchRequest {
  themeId: string;
  pageId: string;
  presetId?: string;
  userPrompt: string;
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

async function callOpenAI(systemPrompt: string, userContext: string): Promise<Operation[]> {
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(content);
  return parsed.patch || [];
}

serve(async (req) => {
  const startTime = performance.now();
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

    // Get user from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'auth', message: 'Authorization required' }]
      }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'auth', message: 'Invalid authorization' }]
      }, 401);
    }

    const requestBody: PatchRequest = await req.json();
    const { themeId, pageId, presetId, userPrompt } = requestBody;

    if (!themeId || !pageId || !userPrompt) {
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'request', message: 'Missing required fields: themeId, pageId, userPrompt' }]
      }, 400);
    }

    console.log(`📋 Processing patch request for theme: ${themeId}, page: ${pageId}`);

    // 1. Check theme ownership and get theme data
    const { data: themeData, error: themeError } = await supabase
      .from('themes')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', themeId)
      .single();

    if (themeError || !themeData) {
      console.error('❌ Theme not found:', themeError);
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'theme', message: 'Theme not found or access denied' }]
      }, 404);
    }

    // 2. Get or compile schema for validation
    if (!compiledSchema) {
      const { data: schemaData, error: schemaError } = await supabase
        .from('schema_versions')
        .select('schema')
        .eq('version', themeData.schema_version)
        .single();

      if (schemaError || !schemaData) {
        console.error('❌ Schema not found:', schemaError);
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
    const currentTheme = themeData.current_theme;
    const pageData = currentTheme.pages?.[pageId];
    
    if (!pageData) {
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'page', message: `Page '${pageId}' not found in theme` }]
      }, 400);
    }

    const systemPrompt = `You are WCC Maestro — a page‑aware theme editor for a crypto wallet.
Return **JSON Patch only**. Modify **values only**; never rename keys or add unknown fields.
Default scope is the provided pageId. Apply global changes only if the user explicitly requests it.
Respect the provided JSON Schema (version from theme). If changes violate the schema, propose the closest valid alternative.
Use only whitelisted icon sets and fonts. For any images, return placeholders and ask the asset tool; insert only approved CDN URLs.
Maintain WCAG AA contrast for text vs background where possible.
Follow safety policy RUG. Keep responses minimal and deterministic.

**PRESET INTEGRATION RULES:**
When presetId is provided, use STYLE CONTEXT from preset.sample_context to bias suggestions. Do not copy brand names or celebrity likeness; keep stylistic, generic and safe.
REFERENCE PATCH is an example only; infer the aesthetic and produce a minimal valid JSON Patch scoped to pageId unless a global change is explicitly requested.
Extract color palettes, typography preferences, and component styling from the context to guide your modifications.

IMPORTANT RULES:
1. Return ONLY valid JSON with a "patch" array containing RFC6902 operations
2. Only modify paths starting with "/pages/${pageId}/"
3. Never modify global theme properties unless explicitly requested
4. Each patch operation must have: "op", "path", and "value" (if applicable)
5. Valid operations: "replace", "add", "remove"
6. All color values must be valid hex format (#RRGGBB or #RRGGBBAA)
7. Ensure changes maintain visual accessibility and contrast

Current page structure:
${JSON.stringify(pageData, null, 2)}

${presetContext}
${referencePatch}

${examplePresets.length > 0 ? `Example patches:
${examplePresets.map(p => JSON.stringify(p.sample_patch, null, 2)).join('\n\n')}` : ''}

Respond with: {"patch": [{"op": "replace", "path": "/pages/${pageId}/components/someComponent/backgroundColor", "value": "#RRGGBB"}]}`;

    const userContext = `User request: "${userPrompt}"
    
Target page: ${pageId}
Current page data: ${JSON.stringify(pageData, null, 2)}

${presetContext ? `Apply the style inspiration from the provided preset context.` : ''}

Generate a JSON Patch to fulfill this request while maintaining the existing structure and only modifying the specified page.`;

    // 6. Call OpenAI
    console.log('🤖 Calling OpenAI...');
    const aiStartTime = performance.now();
    
    const patchOperations = await callOpenAI(systemPrompt, userContext);
    
    const aiEndTime = performance.now();
    console.log(`🤖 OpenAI completed in ${(aiEndTime - aiStartTime).toFixed(2)}ms`);
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
      return jsonResponse({ 
        valid: false,
        errors: [{ 
          path: 'patch', 
          message: 'Generated patch is invalid', 
          actual: patchError.message 
        }],
        executionTime: validationEndTime - startTime
      }, 400);
    }

    // 8. Validate updated theme against schema
    const isValid = compiledSchema(updatedTheme);
    const validationEndTime = performance.now();
    console.log(`🔍 Schema validation completed in ${(validationEndTime - validationStartTime).toFixed(2)}ms`);
    
    if (!isValid) {
      const validationErrors = formatValidationErrors(compiledSchema.errors || []);
      console.error('❌ Theme validation failed:', validationErrors);
      
      const endTime = performance.now();
      return jsonResponse({ 
        valid: false,
        errors: validationErrors,
        executionTime: endTime - startTime
      }, 400);
    }

    // 9. Save patch and update theme
    const dbStartTime = performance.now();
    
    const { error: patchError } = await supabase
      .from('patches')
      .insert({
        theme_id: themeId,
        ops: patchOperations,
        applied_by: user.id
      });

    if (patchError) {
      console.error('❌ Failed to save patch:', patchError);
      const endTime = performance.now();
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'database', message: 'Failed to save patch' }],
        executionTime: endTime - startTime
      }, 500);
    }

    const { error: updateError } = await supabase
      .from('themes')
      .update({ current_theme: updatedTheme })
      .eq('id', themeId);

    if (updateError) {
      console.error('❌ Failed to update theme:', updateError);
      const endTime = performance.now();
      return jsonResponse({ 
        valid: false,
        errors: [{ path: 'database', message: 'Failed to update theme' }],
        executionTime: endTime - startTime
      }, 500);
    }

    const dbEndTime = performance.now();
    console.log(`💾 Database operations completed in ${(dbEndTime - dbStartTime).toFixed(2)}ms`);

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    console.log(`✅ Patch applied successfully in ${totalTime.toFixed(2)}ms`);
    console.log(`📊 Performance: AI=${(aiEndTime - aiStartTime).toFixed(2)}ms, Validation=${(validationEndTime - validationStartTime).toFixed(2)}ms, DB=${(dbEndTime - dbStartTime).toFixed(2)}ms`);

    // 10. Return success response
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
