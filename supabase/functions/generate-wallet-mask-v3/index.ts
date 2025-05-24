
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaskRequest {
  prompt: string;
  reference_image_url: string;
  style_hint_image_url?: string;
  style: "cartoon" | "meme" | "luxury" | "modern" | "realistic" | "fantasy" | "minimalist";
  user_id?: string;
}

interface MaskResponse {
  image_url: string;
  layout_json: {
    layout: any;
    style: string;
    color_palette: string[];
    safe_zone: any;
  };
  prompt_used: string;
}

const SAFE_ZONE = {
  x: 432,
  y: 344,
  width: 160,
  height: 336
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('V3 Mask generation request received');
    
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      console.error("OpenAI API key not configured");
      throw new Error("OpenAI API key not found");
    }

    const { 
      prompt, 
      reference_image_url, 
      style_hint_image_url, 
      style, 
      user_id 
    } = await req.json() as MaskRequest;

    console.log(`Processing ${style} style mask generation`);
    console.log(`Reference image: ${reference_image_url ? "provided" : "none"}`);
    console.log(`Style hint: ${style_hint_image_url ? "provided" : "none"}`);

    // Step 1: Analyze images with GPT-4o
    const layoutAnalysis = await analyzeImagesWithGPT(
      prompt,
      reference_image_url,
      style_hint_image_url,
      openAiKey,
      style
    );

    console.log("Layout analysis completed successfully");

    // Step 2: Generate mask with DALL-E
    let maskImageUrl;
    try {
      const enhancedPrompt = createEnhancedPrompt(prompt, layoutAnalysis, style);
      console.log("Generating mask with DALL-E 3");
      
      maskImageUrl = await generateMaskWithDallE(enhancedPrompt, openAiKey);
      console.log("Mask generated successfully with DALL-E");
    } catch (error) {
      console.error("DALL-E generation failed, using fallback:", error);
      maskImageUrl = selectFallbackMask(style);
      console.log("Using fallback mask:", maskImageUrl);
    }

    const response: MaskResponse = {
      image_url: maskImageUrl,
      layout_json: {
        layout: layoutAnalysis.layout,
        style: layoutAnalysis.style,
        color_palette: layoutAnalysis.color_palette,
        safe_zone: SAFE_ZONE
      },
      prompt_used: prompt
    };

    // Store result if user_id provided
    if (user_id) {
      await storeMaskResult(user_id, response, reference_image_url, style_hint_image_url, prompt);
    }

    console.log("V3 mask generation completed successfully");
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-wallet-mask-v3:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate wallet mask", 
        details: error.message,
        fallback_mask: '/external-masks/abstract-mask.png'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function analyzeImagesWithGPT(
  prompt: string,
  referenceImageUrl: string,
  styleHintImageUrl: string | undefined,
  apiKey: string,
  style: string
) {
  console.log("Starting GPT-4o image analysis");
  
  const analysisPrompt = `
Analyze the provided images and create a wallet costume design specification.

REFERENCE IMAGE: Main inspiration for the mask design
${styleHintImageUrl ? "STYLE HINT IMAGE: Additional style/pattern reference" : ""}

TEXT PROMPT: "${prompt}"
STYLE: ${style}

Create a decorative mask that:
1. Flows beautifully around the wallet UI creating a WOW effect
2. Keeps the center (320x569px) completely transparent for UI visibility
3. Uses the reference image as main inspiration
${styleHintImageUrl ? "4. Incorporates style elements from the hint image" : ""}
5. Applies ${style} aesthetic principles

CRITICAL SAFE ZONE:
- Center rectangle (320x569px) at position (432, 344) MUST be transparent
- No visual elements should overlap the UI area
- Decorative elements should flow around the edges only

Respond with JSON containing:
{
  "layout": {
    "top": "description of top decoration",
    "bottom": "description of bottom decoration", 
    "left": "description of left decoration",
    "right": "description of right decoration",
    "core": "untouched"
  },
  "style": "${style}",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "wow_elements": "description of eye-catching features"
}`;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: analysisPrompt },
        {
          type: "image_url",
          image_url: { url: referenceImageUrl }
        }
      ]
    }
  ];

  if (styleHintImageUrl) {
    messages[0].content.push({
      type: "image_url",
      image_url: { url: styleHintImageUrl }
    });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GPT-4o analysis failed: ${errorData.error?.message}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  return {
    layout: result.layout || {
      top: "decorative elements",
      bottom: "decorative elements",
      left: null,
      right: null,
      core: "untouched"
    },
    style: result.style || style,
    color_palette: result.color_palette || getDefaultColors(style),
    wow_elements: result.wow_elements || ""
  };
}

function createEnhancedPrompt(prompt: string, analysis: any, style: string): string {
  const styleModifiers = {
    cartoon: "vibrant cartoon style, bold outlines, bright colors, playful design",
    meme: "meme-style, bold text effects, internet culture aesthetic, humorous elements",
    luxury: "luxury gold and black, premium materials, elegant patterns, sophisticated design",
    modern: "clean modern design, geometric shapes, minimalist approach, contemporary style",
    realistic: "photorealistic textures, detailed rendering, lifelike appearance",
    fantasy: "magical fantasy elements, mystical effects, otherworldly design",
    minimalist: "clean minimal design, simple shapes, limited colors, elegant simplicity"
  };

  const colors = analysis.color_palette.join(", ");
  
  return `Create a decorative frame/mask in ${styleModifiers[style]} style. 
${prompt}. 
Use colors: ${colors}.
Layout: ${analysis.layout.top} at top, ${analysis.layout.bottom} at bottom.
CRITICAL: Central rectangle (320x569px at coordinates 432,344) must be COMPLETELY TRANSPARENT.
The design should flow beautifully around the edges creating a stunning visual effect.
Output: 1024x1024 PNG with transparent center for UI visibility.
No text, letters, or words in the image.`;
}

async function generateMaskWithDallE(prompt: string, apiKey: string): Promise<string> {
  console.log("Calling DALL-E 3 API");
  
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
      quality: "hd"
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`DALL-E generation failed: ${errorData.error?.message}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

function selectFallbackMask(style: string): string {
  const fallbacks = {
    cartoon: '/external-masks/cats-mask.png',
    meme: '/external-masks/pepe-mask.png',
    luxury: '/external-masks/crypto-mask.png',
    modern: '/external-masks/cyber-mask.png',
    realistic: '/external-masks/abstract-mask.png',
    fantasy: '/external-masks/abstract-mask.png',
    minimalist: '/external-masks/clean Example.png'
  };
  
  return fallbacks[style] || '/external-masks/abstract-mask.png';
}

function getDefaultColors(style: string): string[] {
  const palettes = {
    cartoon: ["#FFD700", "#FF69B4", "#00BFFF", "#32CD32"],
    meme: ["#00FF00", "#FF0000", "#FFFF00", "#FF00FF"],
    luxury: ["#FFD700", "#000000", "#FFFFFF", "#C0C0C0"],
    modern: ["#2563EB", "#1F2937", "#F3F4F6", "#6B7280"],
    realistic: ["#8B4513", "#228B22", "#4682B4", "#DC143C"],
    fantasy: ["#9932CC", "#FF1493", "#00CED1", "#FFD700"],
    minimalist: ["#000000", "#FFFFFF", "#808080", "#D3D3D3"]
  };
  
  return palettes[style] || ["#6c5ce7", "#fd79a8", "#00cec9", "#fdcb6e"];
}

async function storeMaskResult(
  userId: string,
  response: MaskResponse,
  referenceImageUrl: string,
  styleHintImageUrl: string | undefined,
  prompt: string
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase credentials not available, skipping storage");
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('ai_requests').insert({
      user_id: userId,
      prompt: prompt,
      image_url: referenceImageUrl,
      layer_type: 'mask_v3',
      status: 'completed',
      style_result: {
        image_url: response.image_url,
        layout_json: response.layout_json,
        prompt_used: response.prompt_used,
        reference_image: referenceImageUrl,
        style_hint_image: styleHintImageUrl
      }
    });
    
    console.log("V3 mask result stored successfully");
  } catch (error) {
    console.error("Error storing V3 mask result:", error);
  }
}
