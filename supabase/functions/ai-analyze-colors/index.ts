import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ANALYZE_COLORS_PROMPT } from "./prompts.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error('imageBase64 is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[ai-analyze-colors] Starting color analysis with Gemini Vision...');

    // Call Gemini 2.5 Flash with vision
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: ANALYZE_COLORS_PROMPT
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ai-analyze-colors] Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from Gemini');
    }

    console.log('[ai-analyze-colors] Raw AI response:', aiResponse);

    // Parse the JSON response
    let schemes;
    try {
      const parsed = JSON.parse(aiResponse);
      schemes = parsed.schemes;
    } catch (parseError) {
      console.error('[ai-analyze-colors] Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(schemes) || schemes.length === 0) {
      throw new Error('Invalid schemes format from AI');
    }

    console.log('[ai-analyze-colors] Successfully generated', schemes.length, 'color schemes');

    return new Response(
      JSON.stringify({ schemes }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[ai-analyze-colors] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        schemes: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
