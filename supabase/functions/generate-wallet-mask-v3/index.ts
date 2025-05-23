
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaskGenerationRequest {
  prompt: string;
  layer?: string;
  image_url?: string | null;
  selected_style?: string;
  debug_mode?: boolean;
  hd_quality?: boolean;
}

interface MaskGenerationResponse {
  mask_image_url: string;
  metadata: {
    prompt: string;
    style: string;
    layout: {
      top: string | null;
      bottom: string | null;
      left: string | null;
      right: string | null;
      core: string;
    };
    color_palette: string[];
  };
  prompt_used?: string;
  input_type?: string;
  debug_info?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const body: MaskGenerationRequest = await req.json();
    const { prompt, selected_style = 'modern', debug_mode = false } = body;

    console.log('V3 Mask generation request:', { prompt, selected_style, debug_mode });

    // Step 1: Generate layout and enhanced prompt with GPT-4o
    const layoutPrompt = `You are a decorative wallet mask designer. The user wants: "${prompt}"

Style context: ${selected_style}

Create a JSON response with:
1. "layout" object with decorative elements for "top", "bottom", "left", "right" (can be null if not needed), and "core" always as "untouched"
2. "enhanced_prompt" for DALL-E that creates a decorative frame around a wallet
3. "color_palette" array of 3-5 hex colors matching the style
4. "style_notes" describing the visual approach

CRITICAL RULES:
- The center area (320x569px) MUST remain fully transparent for wallet UI
- Focus on decorative border/frame elements only
- Use PNG format with transparency
- Canvas size: 1024x1024px

Example response:
{
  "layout": {
    "top": "playful cat ears",
    "bottom": "cozy clouds",
    "left": null,
    "right": null,
    "core": "untouched"
  },
  "enhanced_prompt": "Create decorative wallet frame. Top: playful cat ears. Bottom: cozy clouds. Style: cartoon with pastel colors. CRITICAL: Center area (320x569px) must remain fully transparent. Canvas: 1024x1024 PNG.",
  "color_palette": ["#EADFF7", "#FFD6E0", "#B8E6B8"],
  "style_notes": "Cartoon style with soft pastel colors"
}`;

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a creative AI that generates decorative wallet mask designs. Always respond with valid JSON.' },
          { role: 'user', content: layoutPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!gptResponse.ok) {
      throw new Error(`GPT-4o API error: ${gptResponse.status}`);
    }

    const gptData = await gptResponse.json();
    let layoutData;
    
    try {
      layoutData = JSON.parse(gptData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse GPT response:', gptData.choices[0].message.content);
      // Fallback layout
      layoutData = {
        layout: {
          top: "decorative elements",
          bottom: "decorative border",
          left: null,
          right: null,
          core: "untouched"
        },
        enhanced_prompt: `Create a decorative wallet frame based on: ${prompt}. Style: ${selected_style}. CRITICAL: Center area (320x569px) must remain fully transparent. Canvas: 1024x1024 PNG.`,
        color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"],
        style_notes: `${selected_style} style decoration`
      };
    }

    console.log('Generated layout:', layoutData);

    // Step 2: Generate image with DALL-E using enhanced prompt
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: layoutData.enhanced_prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      }),
    });

    if (!dalleResponse.ok) {
      throw new Error(`DALL-E API error: ${dalleResponse.status}`);
    }

    const dalleData = await dalleResponse.json();
    const imageUrl = dalleData.data[0].url;

    console.log('V3 Mask generated successfully:', imageUrl);

    // Prepare response
    const response: MaskGenerationResponse = {
      mask_image_url: imageUrl,
      metadata: {
        prompt,
        style: selected_style,
        layout: layoutData.layout,
        color_palette: layoutData.color_palette
      }
    };

    if (debug_mode) {
      response.prompt_used = layoutData.enhanced_prompt;
      response.input_type = 'text_prompt';
      response.debug_info = {
        gpt_response: layoutData,
        style_notes: layoutData.style_notes
      };
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in V3 mask generation:', error);
    
    // Return fallback response
    const fallbackResponse: MaskGenerationResponse = {
      mask_image_url: '/external-masks/abstract-mask.png',
      metadata: {
        prompt: body.prompt || 'fallback',
        style: body.selected_style || 'modern',
        layout: {
          top: "fallback decorative elements",
          bottom: "fallback border",
          left: null,
          right: null,
          core: "untouched"
        },
        color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
      }
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 with fallback instead of error
    });
  }
});
