import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { element } = await req.json();
    
    if (!element) {
      throw new Error('Element data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('[AI Commentary] Analyzing element:', element.id);

    // Build context about the element
    const elementContext = `
Element ID: ${element.id}
Type: ${element.type}
Role: ${element.role}
Status: ${element.status}
${element.metrics ? `
Dimensions: ${element.metrics.width}×${element.metrics.height}px
Border Radius: ${element.metrics.radius}
Background: ${element.metrics.bg}
Font: ${element.metrics.font}
` : ''}
${element.style ? `
Text Content: ${element.style.text || 'N/A'}
Border: ${element.style.border || 'none'}
` : ''}
`.trim();

    const systemPrompt = `You are a UI/UX design expert analyzing wallet interface elements. Provide concise, insightful commentary about design patterns, accessibility, and user experience. Keep responses under 2 sentences and focus on actionable insights.`;

    const userPrompt = `Analyze this wallet UI element and provide expert commentary:\n\n${elementContext}\n\nProvide brief commentary on design quality, user experience implications, or interesting patterns you notice.`;

    // Call Lovable AI
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
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Commentary] API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const commentary = data.choices[0].message.content;

    console.log('[AI Commentary] Generated commentary:', commentary.substring(0, 100));

    return new Response(
      JSON.stringify({ commentary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI Commentary] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        commentary: 'AI commentary temporarily unavailable. Please try again.' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
