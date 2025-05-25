
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { buildSimplePrompt } from './promptBuilder.ts';
import { removeBackground } from './backgroundRemover.ts';
import { fetchDalleImage } from './utils/fetchDalleImage.ts';
import { SAFE_ZONE, GUIDE_IMAGE_URL, STYLES } from './utils/constants.ts';
import { storeInSupabaseStorage } from './storage.ts';
import { logDebug } from './debugLogger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaskRequestV4 {
  prompt: string;
  reference_image_url: string;
  style: "cartoon" | "meme" | "luxury" | "modern" | "realistic" | "fantasy" | "minimalist";
  user_id?: string;
  enable_background_removal?: boolean;
}

interface MaskResponseV4 {
  image_url: string;
  original_image_url?: string;
  background_removed: boolean;
  layout_json: {
    safe_zone: any;
    style: string;
    generation_method: "v4-simple";
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
    logDebug('🚀 V4 Simple mask generation started');
    
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const huggingFaceKey = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!openAiKey) {
      throw new Error("OpenAI API key not found");
    }

    const { 
      prompt, 
      reference_image_url, 
      style, 
      user_id,
      enable_background_removal = true
    } = await req.json() as MaskRequestV4;

    logDebug(`📝 Request: prompt="${prompt}", style="${style}", bg_removal=${enable_background_removal}`);

    // Step 1: Build ultra-simple prompt (no coordinates, no technical details)
    const simplePrompt = buildSimplePrompt(prompt, style);
    logDebug(`🎯 Simple prompt built: ${simplePrompt}`);

    // Step 2: Generate image with DALL-E using guide image approach
    let originalImageUrl: string;
    try {
      originalImageUrl = await fetchDalleImage(simplePrompt, openAiKey);
      logDebug(`✅ DALL-E generation successful`);
    } catch (error) {
      logDebug(`❌ DALL-E generation failed: ${error.message}`);
      throw new Error(`Image generation failed: ${error.message}`);
    }

    // Step 3: Background removal (optional)
    let finalImageUrl = originalImageUrl;
    let backgroundRemoved = false;

    if (enable_background_removal && huggingFaceKey) {
      try {
        logDebug(`🧼 Starting background removal...`);
        finalImageUrl = await removeBackground(originalImageUrl, huggingFaceKey);
        backgroundRemoved = true;
        logDebug(`✅ Background removal successful`);
      } catch (bgError) {
        logDebug(`⚠️ Background removal failed, using original: ${bgError.message}`);
        finalImageUrl = originalImageUrl;
        backgroundRemoved = false;
      }
    } else {
      logDebug(`⏭️ Background removal skipped (disabled or no HF key)`);
    }

    // Step 4: Store in Supabase Storage
    let storagePath = null;
    if (user_id && supabaseUrl && supabaseKey) {
      try {
        logDebug(`💾 Storing in Supabase...`);
        const result = await storeInSupabaseStorage(
          finalImageUrl,
          user_id,
          `v4-${style}-mask`,
          supabaseUrl,
          supabaseKey
        );
        storagePath = result.path;
        finalImageUrl = result.publicUrl;
        logDebug(`✅ Storage successful: ${storagePath}`);
      } catch (storageError) {
        logDebug(`❌ Storage failed: ${storageError.message}`);
      }
    }

    // Step 5: Prepare response
    const response: MaskResponseV4 = {
      image_url: finalImageUrl,
      original_image_url: backgroundRemoved ? originalImageUrl : undefined,
      background_removed: backgroundRemoved,
      layout_json: {
        safe_zone: SAFE_ZONE,
        style: style,
        generation_method: "v4-simple"
      },
      prompt_used: simplePrompt,
      storage_path: storagePath,
      debug_info: {
        originalPrompt: prompt,
        processedPrompt: simplePrompt,
        backgroundRemovalEnabled: enable_background_removal,
        backgroundRemovalSuccess: backgroundRemoved,
        huggingFaceAvailable: !!huggingFaceKey,
        guideImageUsed: GUIDE_IMAGE_URL
      }
    };

    logDebug(`🎉 V4 mask generation completed successfully`);
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    logDebug(`💥 V4 Error: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: "V4 mask generation failed", 
        details: error.message,
        fallback_available: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
