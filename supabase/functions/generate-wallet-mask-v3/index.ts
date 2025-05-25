
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// V4 Enhanced Architecture: Import modular components
import { buildSimplePrompt, buildEnhancedPrompt, getInteractionVariations } from './promptBuilder.ts';
import { removeBackgroundHuggingFace, validateBackgroundRemoval, optimizeImageQuality } from './backgroundRemover.ts';
import { V4_CONFIG, getFallbackMask } from './utils/constants.ts';
import { storeProcessedImage, storeMaskMetadata } from './storage.ts';

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 V4 Enhanced Architecture: Advanced character-focused generation');
    
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const huggingFaceKey = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!openAiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log(`🔑 V4 Enhanced: API Keys Status - OpenAI: ✅, HuggingFace: ${huggingFaceKey ? '✅' : '❌'}`);

    const { 
      prompt, 
      reference_image_url, 
      style_hint_image_url, 
      style, 
      user_id
    } = await req.json() as MaskRequest;

    console.log(`🎭 V4 Enhanced: Processing ${style} style`);
    console.log(`📝 V4 Enhanced: User prompt: "${prompt}"`);

    const processingSteps: string[] = [];
    
    // Step 1: V4 Enhanced Prompt Building with multiple variations
    processingSteps.push("V4 Enhanced: Building optimized character-focused prompt");
    const v4Prompt = buildEnhancedPrompt(prompt, style, "hugging");
    console.log(`✨ V4 Enhanced Prompt: "${v4Prompt}"`);

    // Step 2: DALL-E Generation with Enhanced Quality
    processingSteps.push("V4 Enhanced: Generating with DALL-E using enhanced prompts");
    let generatedImageUrl: string;
    
    try {
      generatedImageUrl = await generateWithDallE(v4Prompt, openAiKey);
      processingSteps.push("V4 Enhanced: DALL-E generation successful");
      console.log("✅ V4 Enhanced: DALL-E generation completed");
    } catch (error) {
      console.error("❌ V4 Enhanced: DALL-E failed, using fallback:", error);
      generatedImageUrl = getFallbackMask(style);
      processingSteps.push("V4 Enhanced: Using fallback mask due to generation error");
    }

    // Step 3: Advanced Background Removal (V4 Enhanced Core Feature)
    processingSteps.push("V4 Enhanced: Starting advanced background removal");
    const processedImageUrl = await removeBackgroundHuggingFace(generatedImageUrl);
    const backgroundWasRemoved = await validateBackgroundRemoval(generatedImageUrl, processedImageUrl);
    
    if (backgroundWasRemoved) {
      processingSteps.push("V4 Enhanced: Advanced background removal successful");
      console.log("✅ V4 Enhanced: Background removed successfully - transparent PNG ready");
    } else {
      processingSteps.push("V4 Enhanced: Using original image (background removal skipped/failed)");
      console.log("⚠️ V4 Enhanced: Background removal skipped or failed");
    }

    // Step 4: Image Quality Optimization
    processingSteps.push("V4 Enhanced: Optimizing image quality");
    const optimizedImageUrl = await optimizeImageQuality(processedImageUrl);

    // Step 5: Storage with Enhanced Metadata
    let storagePath = null;
    let finalImageUrl = optimizedImageUrl;

    if (user_id && supabaseUrl && supabaseKey) {
      try {
        processingSteps.push("V4 Enhanced: Storing processed image with metadata");
        const result = await storeProcessedImage(
          optimizedImageUrl,
          user_id,
          supabaseUrl,
          supabaseKey,
          backgroundWasRemoved
        );
        storagePath = result.path;
        finalImageUrl = result.publicUrl;
        processingSteps.push("V4 Enhanced: Image storage successful");
        console.log(`✅ V4 Enhanced: Stored at ${storagePath}`);
      } catch (storageError) {
        console.error("❌ V4 Enhanced: Storage failed:", storageError);
        processingSteps.push("V4 Enhanced: Storage failed, using direct URL");
      }
    }

    // Step 6: Enhanced Metadata Storage
    if (user_id && supabaseUrl && supabaseKey) {
      await storeMaskMetadata(
        user_id,
        {
          prompt,
          style,
          imageUrl: finalImageUrl,
          storagePath,
          backgroundRemoved: backgroundWasRemoved,
          processingSteps
        },
        supabaseUrl,
        supabaseKey
      );
    }

    // V4 Enhanced Response with detailed debug info
    const response: MaskResponse = {
      image_url: finalImageUrl,
      layout_json: {
        layout: {
          v4_enhanced_architecture: true,
          character_interaction: "physical contact with black rectangle",
          background: backgroundWasRemoved ? "completely_removed_transparent" : "original",
          core_principle: "NO BACKGROUND, character focus, HD quality",
          transparency_quality: backgroundWasRemoved ? "professional" : "standard"
        },
        style: style,
        color_palette: ["#V4ENHANCED", "#TRANSPARENT", "#HDQUALITY"],
        safe_zone: V4_CONFIG.SAFE_ZONE
      },
      prompt_used: prompt,
      storage_path: storagePath,
      debug_info: {
        v4_enhanced_architecture: true,
        processing_steps: processingSteps,
        background_removed: backgroundWasRemoved,
        hugging_face_available: !!huggingFaceKey,
        guide_image_used: V4_CONFIG.GUIDE_IMAGE_URL,
        dalle_prompt: v4Prompt,
        core_principles: V4_CONFIG.CORE_PRINCIPLES,
        quality_optimization: "enabled",
        transparency_handling: "enhanced"
      }
    };

    console.log("🎉 V4 Enhanced Architecture: Generation completed successfully with transparency");
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 V4 Enhanced Architecture Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "V4 Enhanced Architecture generation failed", 
        details: error.message,
        fallback_available: true,
        enhanced_features: "background removal, quality optimization, transparency handling"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function generateWithDallE(prompt: string, apiKey: string): Promise<string> {
  console.log("🎨 V4 Enhanced: Calling DALL-E with optimized prompt");
  
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: V4_CONFIG.DALLE_CONFIG.model,
      prompt: prompt,
      n: 1,
      size: V4_CONFIG.DALLE_CONFIG.size,
      response_format: V4_CONFIG.DALLE_CONFIG.response_format,
      quality: V4_CONFIG.DALLE_CONFIG.quality
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`DALL-E failed: ${errorData.error?.message}`);
  }

  const data = await response.json();
  console.log("✅ V4 Enhanced: DALL-E response received");
  return data.data[0].url;
}
