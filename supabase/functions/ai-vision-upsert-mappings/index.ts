import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MappingInput {
  id: string;
  json_path: string;
  confidence: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mappings } = await req.json() as { mappings: MappingInput[] };

    if (!Array.isArray(mappings)) {
      throw new Error('mappings must be an array');
    }

    console.log(`[ai-vision-upsert] Received ${mappings.length} mappings`);

    // Filter: only slash-based paths with confidence > 0.5
    const validMappings = mappings.filter(m => 
      m.id && 
      m.json_path?.startsWith('/') && 
      m.confidence > 0.5
    );

    console.log(`[ai-vision-upsert] Valid mappings: ${validMappings.length}`);

    if (validMappings.length === 0) {
      return new Response(
        JSON.stringify({ updated: 0, skipped: mappings.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prepare arrays for SQL
    const ids = validMappings.map(m => m.id);
    const paths = validMappings.map(m => m.json_path);

    // Update only empty json_path entries
    const { data, error } = await supabase.rpc('upsert_ai_vision_mappings', {
      element_ids: ids,
      json_paths: paths
    });

    if (error) {
      console.error('[ai-vision-upsert] DB error:', error);
      throw error;
    }

    const updated = data || 0;
    const skipped = mappings.length - updated;

    console.log(`[ai-vision-upsert] ✅ Updated ${updated}, skipped ${skipped}`);

    return new Response(
      JSON.stringify({ updated, skipped }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ai-vision-upsert] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
