import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { screenshotUrl, domStructure, screen } = await req.json();
    console.log('🔍 AI DOM Scanner analyzing:', { screen, hasScreenshot: !!screenshotUrl });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get unmapped elements for this screen
    const { data: unmappedElements, error: elementsError } = await supabase
      .from('wallet_elements')
      .select('*')
      .eq('screen', screen)
      .is('json_path', null);

    if (elementsError) throw elementsError;

    console.log(`📊 Found ${unmappedElements?.length || 0} unmapped elements for screen: ${screen}`);

    // Prepare AI prompt
    const prompt = `Analyze this wallet screen and create JSON path mappings for UI elements.

Screen: ${screen}
DOM Structure: ${JSON.stringify(domStructure, null, 2)}

Unmapped Elements:
${unmappedElements?.map(el => `- ${el.name} (${el.type}): selector="${el.selector}"`).join('\n')}

Task: For each unmapped element, determine its JSON path in the theme structure.

JSON Theme Structure:
{
  "assetCard": {
    "title": { "color": "...", "fontSize": "..." },
    "description": { "color": "...", "fontSize": "..." },
    "value": { "color": "...", "fontSize": "..." },
    "icon": { "size": "...", "color": "..." }
  },
  "button": {
    "primary": { "backgroundColor": "...", "color": "..." },
    "secondary": { "backgroundColor": "...", "color": "..." }
  },
  "navigation": {
    "item": { "color": "...", "activeColor": "..." }
  },
  "input": {
    "field": { "backgroundColor": "...", "color": "..." }
  }
}

Return ONLY a JSON array of mappings:
[
  { "element_id": "home-asset-name", "json_path": "/assetCard/title", "confidence": 0.95 },
  { "element_id": "search-input", "json_path": "/input/field", "confidence": 0.90 }
]`;

    // Call Lovable AI with Nano Banana for visual analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: screenshotUrl 
          ? [
              { 
                role: 'user', 
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: screenshotUrl } }
                ]
              }
            ]
          : [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const mappingsText = aiData.choices[0].message.content;
    
    let mappings;
    try {
      const parsed = JSON.parse(mappingsText);
      mappings = Array.isArray(parsed) ? parsed : parsed.mappings || [];
    } catch (e) {
      console.error('❌ Failed to parse AI response:', mappingsText);
      throw new Error('Invalid AI response format');
    }

    console.log(`✅ AI generated ${mappings.length} mappings`);

    // Update database with new mappings
    const updates = [];
    for (const mapping of mappings) {
      if (mapping.confidence >= 0.7) {
        const { error: updateError } = await supabase
          .from('wallet_elements')
          .update({ json_path: mapping.json_path })
          .eq('id', mapping.element_id);

        if (!updateError) {
          updates.push(mapping);
          console.log(`✅ Mapped ${mapping.element_id} → ${mapping.json_path}`);
        } else {
          console.error(`❌ Failed to update ${mapping.element_id}:`, updateError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mappings: updates,
        totalProcessed: unmappedElements?.length || 0,
        totalMapped: updates.length
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in ai-dom-scanner:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
