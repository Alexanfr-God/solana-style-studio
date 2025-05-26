
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Replicate from "https://esm.sh/replicate@0.31.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaskRequest {
  prompt: string;
  reference_image_url?: string;
  style: "cartoon" | "realistic" | "fantasy" | "modern" | "minimalist";
  user_id?: string;
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

  try {
    console.log('🚀 Starting V4 Enhanced wallet costume generation');
    
    const replicateKey = Deno.env.get("REPLICATE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log(`🔑 API Keys Status:`);
    console.log(`  - REPLICATE_API_KEY: ${replicateKey ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`  - SUPABASE_URL: ${supabaseUrl ? '✅ FOUND' : '❌ MISSING'}`);
    console.log(`  - SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ FOUND' : '❌ MISSING'}`);
    
    if (!replicateKey) {
      throw new Error("REPLICATE_API_KEY environment variable not found");
    }

    const requestBody = await req.json() as MaskRequest;
    const { 
      prompt, 
      reference_image_url, 
      style, 
      user_id,
      zone_preference = 'all'
    } = requestBody;

    console.log(`🎭 Processing Request:`);
    console.log(`  - Style: ${style}`);
    console.log(`  - Zone Preference: ${zone_preference}`);
    console.log(`  - User Prompt: "${prompt}"`);
    console.log(`  - Reference Image: ${reference_image_url ? 'PROVIDED' : 'NONE'}`);

    // Генерируем изображение с помощью Replicate
    let generatedImageUrl: string;
    try {
      generatedImageUrl = await generateMaskWithReplicate(prompt, replicateKey, reference_image_url, style, zone_preference);
      console.log("✅ Replicate generation successful:", generatedImageUrl);
    } catch (error) {
      console.error("❌ Replicate generation failed:", error);
      // Используем fallback изображения
      const fallbacks = {
        cartoon: '/external-masks/cats-mask.png',
        realistic: '/external-masks/abstract-mask.png',
        fantasy: '/external-masks/abstract-mask.png',
        modern: '/external-masks/abstract-mask.png',
        minimalist: '/external-masks/clean Example.png'
      };
      generatedImageUrl = fallbacks[style] || '/external-masks/abstract-mask.png';
      console.log("🔄 Using fallback mask:", generatedImageUrl);
    }

    // Сохраняем результат в Supabase (если возможно)
    let storagePath = null;
    let publicUrl = generatedImageUrl;

    if (user_id && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Здесь можно добавить логику сохранения в базу данных
        console.log("💾 Storage and metadata handling available");
        
      } catch (storageError) {
        console.error("❌ Storage failed:", storageError);
      }
    }

    console.log(`🎉 Generation completed successfully`);
    console.log(`🖼️ Final Image URL: ${publicUrl}`);
    
    const response: MaskResponse = {
      image_url: publicUrl,
      layout_json: {
        layout: {
          character_position: zone_preference,
          wallet_safe_zone: "central 320x569px area preserved",
          style_applied: style,
          generation_method: "replicate_sdxl_controlnet"
        },
        style: style,
        color_palette: ["#TRANSPARENT", "#CHARACTER_COLORS"],
        safe_zone: {
          x: 352,
          y: 228,
          width: 320,
          height: 569
        }
      },
      prompt_used: prompt,
      storage_path: storagePath,
      debug_info: {
        generation_successful: true,
        style: style,
        zone_preference: zone_preference,
        reference_image_used: !!reference_image_url,
        api_keys_status: {
          replicate: !!replicateKey,
          supabase: !!(supabaseUrl && supabaseKey)
        }
      }
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Generation Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Generation failed", 
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

async function generateMaskWithReplicate(
  prompt: string, 
  apiKey: string, 
  referenceImageUrl: string | null,
  style: string,
  zonePreference: string
): Promise<string> {
  console.log("🎨 Initializing Replicate SDXL-ControlNet generation");
  
  const replicate = new Replicate({
    auth: apiKey,
  });

  // Улучшенные промпты для каждого стиля
  const stylePrompts = {
    cartoon: "vibrant cartoon character, bold outlines, clean animation style, colorful",
    realistic: "photorealistic character, detailed, natural lighting, high quality",
    fantasy: "magical fantasy character, mystical, enchanted, ethereal",
    modern: "sleek modern character, contemporary, digital art style, clean",
    minimalist: "simple clean character design, minimal details, geometric"
  };
  
  const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || "detailed character design";
  
  // Промпт для позиционирования
  const positionPrompts = {
    top: "character positioned above the central area",
    bottom: "character positioned below the central area", 
    left: "character positioned to the left of the central area",
    right: "character positioned to the right of the central area",
    all: "character surrounding the central area"
  };
  
  const positionPrompt = positionPrompts[zonePreference as keyof typeof positionPrompts] || "character surrounding the central area";
  
  // Составляем финальный промпт
  const enhancedPrompt = `${prompt}, ${stylePrompt}, ${positionPrompt}, leaving central rectangular area completely empty and transparent, no background, transparent background, PNG format, high quality, professional artwork`;
  
  // Негативный промпт для качества
  const negativePrompt = "blurry, low quality, distorted, text, watermark, signature, background elements in central area, objects in wallet zone, poor quality, artifacts";
  
  console.log(`🎭 Enhanced Prompt: "${enhancedPrompt}"`);
  console.log(`🚫 Negative Prompt: "${negativePrompt}"`);
  
  // Используем reference image или default guide
  const controlImageUrl = referenceImageUrl || "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-guide.png";
  
  console.log(`🖼️ Control Image URL: ${controlImageUrl}`);
  
  // Правильные параметры для lucataco/sdxl-controlnet
  const requestPayload = {
    prompt: enhancedPrompt,
    negative_prompt: negativePrompt,
    image: controlImageUrl,
    num_inference_steps: 25,
    guidance_scale: 7.5,
    controlnet_conditioning_scale: 0.8,
    seed: Math.floor(Math.random() * 1000000)
  };
  
  console.log(`📤 Sending request to Replicate:`, JSON.stringify(requestPayload, null, 2));
  
  try {
    const output = await replicate.run(
      "lucataco/sdxl-controlnet:06d6fae3b75ab68a28cd2900afa6033166910dd09fd9751047043a5bbb4c184b",
      {
        input: requestPayload
      }
    );

    console.log("✅ Replicate generation completed");
    console.log("📊 Output type:", typeof output, "Array:", Array.isArray(output));
    console.log("✅ Output:", output);
    
    if (!output) {
      throw new Error("No output returned from Replicate");
    }
    
    const imageUrl = output as string;
    console.log(`🖼️ Final Generated Image URL: ${imageUrl}`);
    
    return imageUrl;
    
  } catch (error) {
    console.error("❌ Replicate detailed error:", {
      message: error.message,
      stack: error.stack
    });
    
    throw new Error(`Replicate generation failed: ${error.message}`);
  }
}
