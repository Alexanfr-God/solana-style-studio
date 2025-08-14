
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
  patch: Operation[];
  theme: any;
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
  console.log(`🚀 LLM Patch Request received: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return jsonResponse({ error: 'Invalid authorization' }, 401);
    }

    const requestBody: PatchRequest = await req.json();
    const { themeId, pageId, presetId, userPrompt } = requestBody;

    if (!themeId || !pageId || !userPrompt) {
      return jsonResponse({ error: 'Missing required fields: themeId, pageId, userPrompt' }, 400);
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
      return jsonResponse({ error: 'Theme not found or access denied' }, 404);
    }

    // 2. Get schema for validation
    const { data: schemaData, error: schemaError } = await supabase
      .from('schema_versions')
      .select('schema')
      .eq('version', themeData.schema_version)
      .single();

    if (schemaError || !schemaData) {
      console.error('❌ Schema not found:', schemaError);
      return jsonResponse({ error: 'Schema version not found' }, 500);
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
        
        // Build style context from preset
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

        // Add reference patch as example
        if (presetData.sample_patch && presetData.sample_patch.length > 0) {
          referencePatch = `
REFERENCE PATCH (for style inspiration only):
${JSON.stringify(presetData.sample_patch, null, 2)}
`;
        }
      }
    }

    // 4. Get some example presets for context (limit 2)
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
      return jsonResponse({ error: `Page '${pageId}' not found in theme` }, 400);
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
    const patchOperations = await callOpenAI(systemPrompt, userContext);

    // 7. Validate patch by applying to copy
    const themeCopy = JSON.parse(JSON.stringify(currentTheme));
    let updatedTheme;
    
    try {
      updatedTheme = applyPatch(themeCopy, patchOperations, false, false).newDocument;
    } catch (patchError) {
      console.error('❌ Invalid patch operations:', patchError);
      return jsonResponse({ error: 'Generated patch is invalid', details: patchError.message }, 400);
    }

    // 8. Validate updated theme against schema
    const ajv = new Ajv({ strict: false });
    addFormats(ajv);
    
    const validate = ajv.compile(schemaData.schema);
    const isValid = validate(updatedTheme);
    
    if (!isValid) {
      console.error('❌ Theme validation failed:', validate.errors);
      return jsonResponse({ 
        error: 'Updated theme fails schema validation', 
        details: validate.errors 
      }, 400);
    }

    // 9. Save patch and update theme
    const { error: patchError } = await supabase
      .from('patches')
      .insert({
        theme_id: themeId,
        ops: patchOperations,
        applied_by: user.id
      });

    if (patchError) {
      console.error('❌ Failed to save patch:', patchError);
      return jsonResponse({ error: 'Failed to save patch' }, 500);
    }

    const { error: updateError } = await supabase
      .from('themes')
      .update({ current_theme: updatedTheme })
      .eq('id', themeId);

    if (updateError) {
      console.error('❌ Failed to update theme:', updateError);
      return jsonResponse({ error: 'Failed to update theme' }, 500);
    }

    console.log('✅ Patch applied successfully');

    // 10. Return response
    const response: PatchResponse = {
      patch: patchOperations,
      theme: updatedTheme
    };

    return jsonResponse(response);

  } catch (error: any) {
    console.error('💥 LLM Patch Error:', error);
    return jsonResponse({
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
});
