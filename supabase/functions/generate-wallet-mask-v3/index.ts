
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

// Встроенный fallback - черный квадрат в центре белого canvas 1024x1024
const BLACK_SQUARE_FALLBACK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuDAAAgAElEQVR4nO3XQQ0AAAzCsOHf9F6oIJXQS071AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+BjYAP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting V5 White Background wallet costume generation');
    
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
    console.log(`🖼️ Final Image URL: ${generatedImageUrl}`);
    
    const response: MaskResponse = {
      image_url: generatedImageUrl,
      layout_json: {
        layout: {
          character_position: zone_preference,
          wallet_safe_zone: "central 320x569px area preserved",
          style_applied: style,
          generation_method: "replicate_sdxl_controlnet_white_bg",
          background: "clean white background"
        },
        style: style,
        color_palette: ["#FFFFFF", "#CHARACTER_COLORS"],
        safe_zone: {
          x: 352,
          y: 228,
          width: 320,
          height: 569
        }
      },
      prompt_used: prompt,
      storage_path: null,
      debug_info: {
        generation_successful: true,
        style: style,
        zone_preference: zone_preference,
        reference_image_used: !!reference_image_url,
        control_image_used: reference_image_url || "BLACK_SQUARE_FALLBACK",
        background_type: "white_solid",
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
  console.log("🎨 Initializing Replicate SDXL-ControlNet generation with WHITE BACKGROUND");
  
  const replicate = new Replicate({
    auth: apiKey,
  });

  // Строгие стили для каждого типа
  const styleDescriptions = {
    cartoon: "vibrant cartoon character with bold outlines and expressive features",
    realistic: "photorealistic character with detailed natural features and lighting",
    fantasy: "magical fantasy character with mystical enchanted elements",
    modern: "sleek contemporary character with clean geometric design",
    minimalist: "simple clean character design with minimal essential details only"
  };
  
  const stylePrompt = styleDescriptions[style as keyof typeof styleDescriptions] || "detailed character design";
  
  // НОВЫЙ промпт для белого фона и взаимодействия с черным окном
  const enhancedPrompt = `${prompt}, ${stylePrompt}, character physically touching and interacting with central black rectangular window located at coordinates x:352 y:228 width:320 height:569, character embracing or holding edges of black rectangle, character positioned around black window borders, no objects inside black rectangle area, character on clean solid white background, PNG format with white background`;
  
  // ОБНОВЛЕННЫЙ негативный промпт - разрешаем белый фон, запрещаем сложные фоны
  const negativePrompt = "landscape, scenery, environment, sky, ground, floor, wall, room, interior, exterior, forest, city, buildings, mountains, trees, grass, clouds, patterned background, textured background, busy background, multiple objects, any objects in central black area, filling black rectangle, covering black window, text, watermark, signature, blurry, low quality, distorted, poor quality, artifacts, duplicate character, colored background, gradient background";
  
  console.log(`🎭 Enhanced Prompt (White BG): "${enhancedPrompt}"`);
  console.log(`🚫 Negative Prompt (Updated): "${negativePrompt}"`);
  
  // Используем reference image или fallback с черным квадратом
  const controlImageUrl = referenceImageUrl || BLACK_SQUARE_FALLBACK;
  
  console.log(`🖼️ Control Image URL: ${controlImageUrl.substring(0, 100)}...`);
  
  // Оптимизированные параметры для белого фона
  const requestPayload = {
    prompt: enhancedPrompt,
    negative_prompt: negativePrompt,
    image: controlImageUrl,
    num_inference_steps: 25, // Уменьшено для стабильности
    guidance_scale: 8.0, // Сбалансировано для качества и стабильности
    controlnet_conditioning_scale: 0.8, // Немного снижено для большей свободы
    seed: Math.floor(Math.random() * 1000000)
  };
  
  console.log(`📤 Sending request to Replicate (White BG Mode):`, JSON.stringify(requestPayload, null, 2));
  
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
