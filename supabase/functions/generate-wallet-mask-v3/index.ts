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

// V3 Enhanced: Guide image for consistent positioning
const GUIDE_IMAGE_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-guide.png';
const WALLET_BASE_IMAGE = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/ui_frame_base.png';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 V3 Enhanced mask generation with Reference Image Guide');
    
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

    console.log(`📐 V3 Enhanced with Reference Image Guide: Container(${container_width}x${container_height}) -> Output(${output_size}x${output_size})`);
    console.log(`📐 V3 Fixed safe zone: x=${OUTPUT_SAFE_ZONE.x}, y=${OUTPUT_SAFE_ZONE.y}, ${OUTPUT_SAFE_ZONE.width}x${OUTPUT_SAFE_ZONE.height}`);
    console.log(`🎨 Processing ${style} style with reference guide approach`);

    // Step 1: Enhanced GPT-4o analysis with guide image
    const layoutAnalysis = await analyzeWithGPT(
      prompt,
      reference_image_url,
      style_hint_image_url,
      GUIDE_IMAGE_URL,
      WALLET_BASE_IMAGE,
      openAiKey,
      style,
      OUTPUT_SAFE_ZONE
    );

    console.log("✅ Layout analysis completed with reference guide");

    // Step 2: Generate mask with reference image approach
    let maskImageUrl;
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🎯 Reference-guided generation attempt ${attempts}/${maxAttempts}`);
      
      try {
        const enhancedPrompt = createReferenceGuidedPrompt(prompt, layoutAnalysis, style);
        console.log(`📝 Reference-guided prompt created (${enhancedPrompt.length} chars)`);
        
        maskImageUrl = await generateMaskWithDallE(enhancedPrompt, openAiKey);
        console.log("✅ Mask generated successfully with reference guide approach");
        break;
        
      } catch (error) {
        console.error(`❌ Reference-guided generation failed on attempt ${attempts}:`, error);
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
        console.log("💾 Attempting to store reference-guided result in Supabase Storage...");
        const result = await storeInSupabaseStorage(
          maskImageUrl,
          user_id,
          supabaseUrl,
          supabaseKey
        );
        storagePath = result.path;
        finalImageUrl = result.publicUrl;
        console.log(`✅ Reference-guided image stored successfully: ${storagePath}`);
      } catch (storageError) {
        console.error("❌ Storage failed:", storageError);
        console.log("🔄 Continuing with original URL");
      }
    }

    // Enhanced debug information with reference guide details
    const debugInfo = {
      safeZone: OUTPUT_SAFE_ZONE,
      containerDimensions: { width: container_width, height: container_height },
      outputImageSize: `${output_size}x${output_size}`,
      referenceGuideUsed: GUIDE_IMAGE_URL,
      promptLength: prompt.length,
      hasReferenceImage: !!reference_image_url,
      hasStyleHint: !!style_hint_image_url,
      attempts: attempts,
      walletBaseUsed: WALLET_BASE_IMAGE,
      final_prompt: layoutAnalysis.enhanced_prompt || "Not available",
      referenceGuidedApproach: true,
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

    console.log("🎉 V3 Enhanced mask generation completed successfully with Reference Image Guide");
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Error in generate-wallet-mask-v3 with reference guide:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate wallet mask with reference guide", 
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
  guideImageUrl: string,
  walletBaseImageUrl: string,
  apiKey: string,
  style: string,
  safeZone: any
) {
  console.log("🧠 Starting V3 Enhanced GPT-4o analysis with Reference Image Guide");
  
  const analysisPrompt = `Analyze the images and create a design plan for a wallet mask decoration using the reference guide.

MAIN CREATIVE TASK: "${prompt}" - This is the primary creative direction!

REFERENCE GUIDE: The guide image shows the exact positioning - a black rectangle in the center that must remain unchanged in size and position.

STYLE: ${style}

Your task is to design decorative elements around the black rectangle, following the reference guide positioning exactly.

Please analyze the provided images and respond with a structured JSON containing:

{
  "layout": {
    "interaction": "how the character/elements interact with the central black rectangle",
    "composition": "overall composition and visual balance around the rectangle",
    "background": "background treatment (should be minimal or transparent-friendly)"
  },
  "style": "${style}",
  "color_palette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "enhanced_prompt": "optimized creative prompt for DALL-E generation that references the guide image positioning"
}

Focus on creative interaction with the central black rectangle, not technical specifications.`;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: analysisPrompt },
        { type: "image_url", image_url: { url: guideImageUrl } },
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
  
  console.log("🎯 GPT-4o analysis result with reference guide:", JSON.stringify(result, null, 2));
  
  return {
    layout: result.layout || getDefaultLayout(),
    style: result.style || style,
    color_palette: result.color_palette || getDefaultColors(style),
    enhanced_prompt: result.enhanced_prompt || ""
  };
}

function createReferenceGuidedPrompt(prompt: string, analysis: any, style: string): string {
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
  
  return `${enhancedPrompt}

Style: ${styleModifiers[style]}
Color palette: ${colors}

IMPORTANT COMPOSITION RULES:
- Follow the reference guide image exactly for positioning
- The black rectangle in the center must remain the same size and position
- Create decorative elements around it, not inside it
- Character or elements should interact with (hug, hold, present) the black rectangle
- Minimal or transparent-friendly background
- Do not add text or letters
- High quality detailed artwork
- PNG style with clean edges

The black rectangle will be made transparent later, so focus on the character/decorative elements around it.`;
}

async function generateMaskWithDallE(prompt: string, apiKey: string): Promise<string> {
  console.log("🎨 Calling DALL-E 3 API with reference-guided prompt");
  
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
  const fileName = `v3-reference-guided-mask-${timestamp}.png`;
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
    console.log("💾 Storing reference-guided mask result in database");
    
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
      console.log("✅ Reference-guided mask result stored in database");
    }
  } catch (error) {
    console.error("❌ Error storing reference-guided mask result:", error);
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

function getDefaultLayout() {
  return {
    interaction: "character interacting with central black rectangle",
    composition: "balanced decorative elements around the rectangle",
    background: "minimal or transparent-friendly background"
  };
}
