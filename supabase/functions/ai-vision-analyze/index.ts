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
    const { screenshotDataUrl, walletType } = await req.json();
    
    if (!screenshotDataUrl) {
      throw new Error('Screenshot data URL is required');
    }

    console.log('[ai-vision-analyze] 🔍 Analyzing wallet UI:', walletType);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Call Lovable AI Gateway with Vision
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
            role: 'system',
            content: `You are a wallet UI analyzer. Analyze cryptocurrency wallet interfaces and identify interactive elements.
Return a JSON array with:
- type: "button" | "input" | "icon" | "background"
- role: descriptive role (e.g., "button.send", "input.password", "icon.settings")
- description: brief visual description
- confidence: 0-1 score`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${walletType} wallet UI. Identify all interactive elements (buttons, inputs, icons). Focus on:
1. Primary action buttons (Send, Receive, Buy)
2. Input fields (password, amount, address)
3. Navigation icons
4. Background/container elements

Return JSON array format:
[
  {
    "type": "button",
    "role": "button.send",
    "description": "Primary send button with blue background",
    "confidence": 0.95
  }
]`
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshotDataUrl
                }
              }
            ]
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ai-vision-analyze] ❌ AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('[ai-vision-analyze] 📝 AI Response:', content);

    // Parse JSON from response
    let elements = [];
    let summary = content;

    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        elements = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('[ai-vision-analyze] ⚠️ Could not parse JSON, using raw content');
    }

    console.log('[ai-vision-analyze] ✅ Analyzed', elements.length, 'elements');

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        elements,
        metadata: {
          walletType,
          timestamp: new Date().toISOString(),
          elementsCount: elements.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[ai-vision-analyze] ❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
