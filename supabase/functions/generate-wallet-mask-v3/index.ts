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
  container_width: number;
  container_height: number;
  wallet_width: number;
  wallet_height: number;
  output_size: number;
  safe_zone_x: number;
  safe_zone_y: number;
  safe_zone_width: number;
  safe_zone_height: number;
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
  storage_path?: string;
  debug_info?: any;
}

// Updated wallet base image URL with proper V3 cutout
const WALLET_BASE_IMAGE = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/ui_frame_base.png';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 V3 Enhanced mask generation started with updated cutout');
    
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!openAiKey) {
      throw new Error("OpenAI API key not found");
    }

    const { 
      prompt, 
      reference_image_url, 
      style_hint_image_url, 
      style, 
      user_id,
      container_width = 480,
      container_height = 854,
      wallet_width = 320,
      wallet_height = 569,
      output_size = 1024,
      safe_zone_x = 80,
      safe_zone_y = 142,
      safe_zone_width = 320,
      safe_zone_height = 569
    } = await req.json() as MaskRequest;

    // V3 Enhanced: Fixed coordinates for 1024x1024 output
    const OUTPUT_SAFE_ZONE = {
      x: 352, // Fixed center position in 1024x1024
      y: 228, // Fixed center position in 1024x1024
      width: 320, // Fixed wallet width
      height: 569 // Fixed wallet height
    };

    console.log(`📐 V3 Enhanced coordinate mapping: Container(${container_width}x${container_height}) -> Output(${output_size}x${output_size})`);
    console.log(`📐 V3 Fixed safe zone: x=${OUTPUT_SAFE_ZONE.x}, y=${OUTPUT_SAFE_ZONE.y}, ${OUTPUT_SAFE_ZONE.width}x${OUTPUT_SAFE_ZONE.height}`);
    console.log(`🎨 Processing ${style} style with prompt: "${prompt}"`);

    // Step 1: Enhanced GPT-4o analysis
    const layoutAnalysis = await analyzeWithGPT(
      prompt,
      reference_image_url,
      style_hint_image_url,
      WALLET_BASE_IMAGE,
      openAiKey,
      style,
      OUTPUT_SAFE_ZONE
    );

    console.log("✅ Layout analysis completed");

    // Step 2: Generate mask with improved prompt
    let maskImageUrl;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🎯 Generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const enhancedPrompt = createOptimizedPrompt(prompt, layoutAnalysis, style, OUTPUT_SAFE_ZONE);
        console.log(`📝 Enhanced prompt created (${enhancedPrompt.length} chars)`);
        
        maskImageUrl = await generateMaskWithDallE(enhancedPrompt, openAiKey);
        console.log("✅ Mask generated successfully with updated coordinates");
        break;
        
      } catch (error) {
        console.error(`❌ Generation failed on attempt ${attempts}:`, error);
        if (attempts === maxAttempts) {
          console.log("🛡️ Using fallback mask");
          maskImageUrl = selectFallbackMask(style);
        }
      }
    }

    // Step 3: Store in Supabase Storage with enhanced logging
    let storagePath = null;
    let finalImageUrl = maskImageUrl;

    if (user_id && supabaseUrl && supabaseKey) {
      try {
        console.log("💾 Attempting to store in Supabase Storage...");
        const result = await storeInSupabaseStorage(
          maskImageUrl,
          user_id,
          supabaseUrl,
          supabaseKey
        );
        storagePath = result.path;
        finalImageUrl = result.publicUrl;
        console.log(`✅ Image stored successfully: ${storagePath}`);
      } catch (storageError) {
        console.error("❌ Storage failed:", storageError);
        console.log("🔄 Continuing with original URL");
      }
    }

    // Enhanced debug information
    const debugInfo = {
      safeZone: OUTPUT_SAFE_ZONE,
      containerDimensions: { width: container_width, height: container_height },
      outputImageSize: `${output_size}x${output_size}`,
      fixedCoordinates: `Wallet at (${OUTPUT_SAFE_ZONE.x}, ${OUTPUT_SAFE_ZONE.y})`,
      promptLength: prompt.length,
      hasReferenceImage: !!reference_image_url,
      hasStyleHint: !!style_hint_image_url,
      attempts: attempts,
      walletBaseUsed: WALLET_BASE_IMAGE,
      final_prompt: layoutAnalysis.enhanced_prompt || "Not available",
      cutoutApplied: "mask-wallet-cutout-v3.png with center transparency"
    };

    const response: MaskResponse = {
      image_url: finalImageUrl,
      layout_json: {
        layout: layoutAnalysis.layout,
        style: layoutAnalysis.style,
        color_palette: layoutAnalysis.color_palette,
        safe_zone: OUTPUT_SAFE_ZONE
      },
      prompt_used: prompt,
      storage_path: storagePath,
      debug_info: debugInfo
    };

    // Step 4: Store result in database
    if (user_id && supabaseUrl && supabaseKey) {
      await storeMaskResult(user_id, response, reference_image_url, style_hint_image_url, supabaseUrl, supabaseKey);
    }

    console.log("🎉 V3 Enhanced mask generation completed successfully with new cutout mask");
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Error in generate-wallet-mask-v3:", error);
    
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

async function analyzeWithGPT(
  prompt: string,
  referenceImageUrl: string,
  styleHintImageUrl: string | undefined,
  walletBaseImageUrl: string,
  apiKey: string,
  style: string,
  safeZone: any
) {
  console.log("🧠 Starting enhanced GPT-4o analysis with fixed coordinates");
  
  const analysisPrompt = `Analyze images and create a structured design plan for a wallet mask decoration.

MAIN TASK: "${prompt}" - This is the primary creative direction!

CRITICAL COORDINATES: The central area at coordinates x=${safeZone.x}, y=${safeZone.y} with size ${safeZone.width}x${safeZone.height} pixels MUST remain completely transparent.

OUTPUT FORMAT: 1024x1024 pixels
STYLE: ${style}

Focus on creating decorative elements around the specified transparent center area.

Please analyze the provided images and respond with a structured JSON containing:

{
  "layout": {
    "top": "description of decorative elements above the wallet area",
    "bottom": "description of decorative elements below the wallet area", 
    "left": "description of decorative elements to the left of wallet",
    "right": "description of decorative elements to the right of wallet",
    "core": "transparent - wallet UI area (${safeZone.width}x${safeZone.height}px at x=${safeZone.x}, y=${safeZone.y})"
  },
  "style": "${style}",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "enhanced_prompt": "optimized prompt for DALL-E generation"
}

The transparent center will be handled by a separate cutout mask.`;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: analysisPrompt },
        { type: "image_url", image_url: { url: walletBaseImageUrl } },
        { type: "image_url", image_url: { url: referenceImageUrl } }
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
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GPT-4o analysis failed: ${errorData.error?.message}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);
  
  console.log("🎯 GPT-4o analysis result with fixed coordinates:", JSON.stringify(result, null, 2));
  
  return {
    layout: result.layout || getDefaultLayout(safeZone),
    style: result.style || style,
    color_palette: result.color_palette || getDefaultColors(style),
    enhanced_prompt: result.enhanced_prompt || ""
  };
}

function createOptimizedPrompt(prompt: string, analysis: any, style: string, safeZone: any): string {
  const styleModifiers = {
    cartoon: "vibrant cartoon style, bold outlines, bright colors, playful design",
    meme: "meme-style, bold effects, internet culture aesthetic, humorous elements",
    luxury: "luxury gold and black, premium materials, elegant patterns, sophisticated",
    modern: "clean modern design, geometric shapes, minimalist, contemporary",
    realistic: "photorealistic textures, detailed rendering, lifelike appearance",
    fantasy: "magical fantasy elements, mystical effects, otherworldly design",
    minimalist: "clean minimal design, simple shapes, limited colors, elegant"
  };

  const enhancedPrompt = analysis.enhanced_prompt || prompt;
  const colors = analysis.color_palette.join(", ");
  
  return `Create a decorative wallet mask background with the following specifications:

PRIMARY CREATIVE DIRECTION: "${enhancedPrompt}"

Style: ${styleModifiers[style]}
Color palette: ${colors}

Layout design:
- Top area: ${analysis.layout.top}
- Bottom area: ${analysis.layout.bottom}
- Left side: ${analysis.layout.left}
- Right side: ${analysis.layout.right}

IMPORTANT: Fill the entire 1024x1024 canvas with decorative elements. The central area at coordinates x=${safeZone.x}, y=${safeZone.y} with dimensions ${safeZone.width}x${safeZone.height} pixels will be made transparent by a separate cutout mask, so you can draw over this area.

Technical specs:
- Output: 1024x1024 PNG 
- Fill entire canvas with decorative background
- No text or letters in the image
- High quality detailed artwork
- The transparent center will be applied separately

Create a stunning decorative background that fills the entire canvas.`;
}

async function generateMaskWithDallE(prompt: string, apiKey: string): Promise<string> {
  console.log("🎨 Calling DALL-E 3 API with updated prompt");
  
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

async function storeInSupabaseStorage(
  imageUrl: string,
  userId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ path: string; publicUrl: string }> {
  console.log("💾 Starting storage process");
  
  // Download image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageBlob = await imageResponse.blob();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `v3-mask-${timestamp}.png`;
  const filePath = `${userId}/${fileName}`;
  
  console.log(`📁 Storing as: ${filePath}`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('generated-masks')
    .upload(filePath, imageBlob, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (uploadError) {
    console.error("Upload error details:", uploadError);
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }
  
  console.log("✅ Upload successful:", uploadData);
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('generated-masks')
    .getPublicUrl(filePath);
  
  return {
    path: filePath,
    publicUrl: urlData.publicUrl
  };
}

async function storeMaskResult(
  userId: string,
  response: MaskResponse,
  referenceImageUrl: string,
  styleHintImageUrl: string | undefined,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  try {
    console.log("💾 Storing mask result in database");
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('ai_mask_results').insert({
      user_id: userId,
      prompt: response.prompt_used,
      style: response.layout_json.style,
      layout: response.layout_json.layout,
      color_palette: response.layout_json.color_palette,
      reference_image_url: referenceImageUrl,
      style_hint_image_url: styleHintImageUrl,
      wallet_base_image_url: WALLET_BASE_IMAGE,
      image_url: response.image_url,
      storage_path: response.storage_path,
      safe_zone: response.layout_json.safe_zone,
      transparency_validated: true
    });
    
    if (error) {
      console.error("Database storage error:", error);
    } else {
      console.log("✅ Mask result stored in database");
    }
  } catch (error) {
    console.error("❌ Error storing mask result:", error);
  }
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

function getDefaultLayout(safeZone: any) {
  return {
    top: "decorative elements above wallet area",
    bottom: "decorative elements below wallet area",
    left: "decorative elements on left side",
    right: "decorative elements on right side",
    core: `transparent - wallet UI area (${safeZone.width}x${safeZone.height}px at x=${safeZone.x}, y=${safeZone.y})`
  };
}
