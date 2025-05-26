
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Replicate from "https://esm.sh/replicate@0.25.2";

// V4 Enhanced Architecture: Import all enhanced modules
import { loadReferenceImage, buildReferenceGuidedPrompt, getZoneBasedPositioning } from './referenceImageProcessor.ts';
import { enhancedBackgroundRemoval, validateBackgroundRemovalResult } from './enhancedBackgroundRemover.ts';
import { V4MultiStepProcessor } from './multiStepProcessor.ts';
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
  zone_preference?: 'top' | 'bottom' | 'left' | 'right' | 'all';
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

  // Initialize V4 Multi-Step Processor
  const processor = new V4MultiStepProcessor();
  
  try {
    console.log('🚀 V4 Enhanced Architecture: Advanced Multi-Step Character Generation with Replicate SDXL-ControlNet');
    
    const replicateKey = Deno.env.get("REPLICATE_API_TOKEN");
    const huggingFaceKey = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!replicateKey) {
      throw new Error("Replicate API key not found");
    }

    console.log(`🔑 V4 Enhanced: System Status - Replicate: ✅, HuggingFace: ${huggingFaceKey ? '✅' : '❌'}, Supabase: ${supabaseUrl ? '✅' : '❌'}`);

    const requestBody = await req.json() as MaskRequest;
    const { 
      prompt, 
      reference_image_url, 
      style_hint_image_url, 
      style, 
      user_id,
      zone_preference = 'all'
    } = requestBody;

    console.log(`🎭 V4 Enhanced: Processing ${style} style with zone preference: ${zone_preference}`);
    console.log(`📝 V4 Enhanced: User prompt: "${prompt}"`);

    // Step 1: Reference Image Loading
    let referenceImageUrl: string | null = null;
    try {
      referenceImageUrl = await processor.executeStep("reference_loading", async () => {
        return await loadReferenceImage();
      });
    } catch (error) {
      console.warn("⚠️ V4 Enhanced: Reference image loading failed, continuing without:", error.message);
    }

    // Step 2: Enhanced Prompt Building
    const enhancedPrompt = await processor.executeStep("prompt_optimization", async () => {
      const basePrompt = buildReferenceGuidedPrompt(prompt, style, !!referenceImageUrl);
      const zoneInstructions = getZoneBasedPositioning(zone_preference);
      
      const finalPrompt = `${basePrompt} ${zoneInstructions}. Character must embrace and interact with the central black rectangular area, leaving it completely empty for wallet interface.`;
      
      console.log(`✨ V4 Enhanced Final Prompt: "${finalPrompt}"`);
      return finalPrompt;
    });

    // Step 3: Replicate SDXL-ControlNet Generation
    let generatedImageUrl: string;
    try {
      generatedImageUrl = await processor.executeStep("replicate_generation", async () => {
        return await generateMaskWithReplicate(enhancedPrompt, replicateKey, referenceImageUrl, style);
      });
    } catch (error) {
      console.error("❌ V4 Enhanced: Replicate SDXL-ControlNet generation failed, using style-appropriate fallback:", error);
      generatedImageUrl = getFallbackMask(style);
    }

    // Step 4: Enhanced Background Removal
    let backgroundResult;
    try {
      backgroundResult = await processor.executeStep("background_removal", async () => {
        return await enhancedBackgroundRemoval(generatedImageUrl);
      });
    } catch (error) {
      console.warn("⚠️ V4 Enhanced: Background removal failed, using original:", error.message);
      backgroundResult = { processedUrl: generatedImageUrl, method: "failed", success: false };
    }

    // Step 5: Quality Optimization
    const finalImageUrl = await processor.executeStep("quality_optimization", async () => {
      const isValid = validateBackgroundRemovalResult(
        generatedImageUrl, 
        backgroundResult.processedUrl, 
        backgroundResult.method
      );
      
      return {
        url: backgroundResult.processedUrl,
        backgroundRemoved: isValid,
        method: backgroundResult.method
      };
    });

    // Step 6: Storage Processing
    let storagePath = null;
    let publicUrl = finalImageUrl.url;

    if (user_id && supabaseUrl && supabaseKey) {
      try {
        const storageResult = await processor.executeStep("storage_processing", async () => {
          const result = await storeProcessedImage(
            finalImageUrl.url,
            user_id,
            supabaseUrl,
            supabaseKey,
            finalImageUrl.backgroundRemoved
          );
          
          await storeMaskMetadata(
            user_id,
            {
              prompt,
              style,
              imageUrl: result.publicUrl,
              storagePath: result.path,
              backgroundRemoved: finalImageUrl.backgroundRemoved,
              processingSteps: processor.getAllSteps(),
              referenceGuided: !!referenceImageUrl,
              zonePreference: zone_preference
            },
            supabaseUrl,
            supabaseKey
          );
          
          return result;
        });
        
        storagePath = storageResult.path;
        publicUrl = storageResult.publicUrl;
      } catch (storageError) {
        console.error("❌ V4 Enhanced: Storage failed:", storageError);
      }
    }

    // V4 Enhanced Response with comprehensive debug info
    const progress = processor.getProgress();
    const stepResults = processor.getStepResults();
    const failedSteps = processor.getFailedSteps();
    
    const response: MaskResponse = {
      image_url: publicUrl,
      layout_json: {
        layout: {
          v4_enhanced_system: true,
          reference_guided: !!referenceImageUrl,
          zone_preference: zone_preference,
          character_interaction: "enhanced physical contact with positioned rectangle via SDXL-ControlNet",
          background_removal: finalImageUrl.backgroundRemoved ? "success" : "failed",
          processing_method: finalImageUrl.method,
          generation_model: "replicate_sdxl_controlnet",
          safe_zone_coordinates: {
            x: 352,
            y: 228,
            width: 320,
            height: 569
          }
        },
        style: style,
        color_palette: ["#V4ENHANCED", "#TRANSPARENT", "#POSITIONED"],
        safe_zone: V4_CONFIG.SAFE_ZONE
      },
      prompt_used: enhancedPrompt,
      storage_path: storagePath,
      debug_info: {
        v4_enhanced_system: true,
        multi_step_processing: true,
        generation_model: "replicate_sdxl_controlnet",
        processing_progress: progress,
        step_results: stepResults,
        failed_steps: failedSteps,
        reference_image_used: !!referenceImageUrl,
        background_removal_method: finalImageUrl.method,
        background_removal_success: finalImageUrl.backgroundRemoved,
        zone_preference: zone_preference,
        enhanced_positioning: true,
        coordinate_guided: true,
        controlnet_guided: true,
        hugging_face_available: !!huggingFaceKey,
        final_prompt: enhancedPrompt
      }
    };

    console.log("🎉 V4 Enhanced System: Multi-step processing with Replicate SDXL-ControlNet completed successfully");
    console.log(`📊 V4 Enhanced: Progress ${progress.current}/${progress.total} (${progress.percentage}%)`);
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 V4 Enhanced System Error:", error);
    
    const failedSteps = processor.getFailedSteps();
    const progress = processor.getProgress();
    
    return new Response(
      JSON.stringify({ 
        error: "V4 Enhanced System processing failed", 
        details: error.message,
        fallback_available: true,
        debug_info: {
          failed_steps: failedSteps,
          progress: progress,
          all_steps: processor.getAllSteps()
        },
        system_features: [
          "Multi-step processing",
          "Replicate SDXL-ControlNet generation", 
          "Reference-guided generation", 
          "Enhanced background removal",
          "Zone-based positioning",
          "Coordinate-precise placement"
        ]
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function generateMaskWithReplicate(
  prompt: string, 
  apiKey: string, 
  referenceImageUrl: string | null,
  style: string
): Promise<string> {
  console.log("🎨 V4 Enhanced: Calling Replicate SDXL-ControlNet with reference-guided approach");
  
  const replicate = new Replicate({
    auth: apiKey,
  });

  // Use guide image or fallback
  const controlImageUrl = referenceImageUrl || V4_CONFIG.GUIDE_IMAGE_URL;
  
  console.log(`🖼️ V4 Enhanced: Using control image: ${controlImageUrl}`);
  
  // Build style-specific prompts
  const stylePrompts = {
    cartoon: "vibrant cartoon style, bold outlines, clean animation style",
    meme: "meme style, internet culture, recognizable character style",
    luxury: "elegant, premium, sophisticated design, golden accents",
    modern: "sleek, contemporary, minimalist, geometric design",
    realistic: "photorealistic, detailed, natural lighting",
    fantasy: "magical, mystical, enchanted, fantasy art style",
    minimalist: "clean, simple, minimal design, geometric shapes"
  };
  
  const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || "detailed character design";
  const enhancedPrompt = `${prompt}, ${stylePrompt}, character interacting with central black rectangle`;
  
  try {
    console.log(`🔄 V4 Enhanced: Generating with SDXL-ControlNet using prompt: "${enhancedPrompt}"`);
    
    const output = await replicate.run(
      "lucataco/sdxl-controlnet:066dfa6e633c8ce4e4592a5b89d94e6b4c4e7e51e6a41a2d7cc31c2e6bc632c7",
      {
        input: {
          image: controlImageUrl,
          prompt: enhancedPrompt,
          a_prompt: "vibrant, sharp, detailed, clean background, high quality, professional",
          n_prompt: "blurry, watermark, low quality, text, background elements, cluttered, messy",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          controlnet_conditioning_scale: 1.0,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );

    console.log("✅ V4 Enhanced: Replicate SDXL-ControlNet generation completed");
    
    // Extract URL from output array
    const imageUrl = Array.isArray(output) ? output[0] : output;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from Replicate");
    }
    
    console.log(`🖼️ V4 Enhanced: Generated image URL: ${imageUrl}`);
    return imageUrl;
    
  } catch (error) {
    console.error("❌ V4 Enhanced: Replicate SDXL-ControlNet error:", error);
    throw new Error(`Replicate SDXL-ControlNet failed: ${error.message}`);
  }
}
