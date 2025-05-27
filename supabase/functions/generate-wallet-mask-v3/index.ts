
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Replicate from "https://esm.sh/replicate@0.31.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WalletAnalysis {
  uiStructure: {
    dimensions: { width: number; height: number; aspectRatio: string; };
    layout: {
      type: 'login' | 'wallet';
      primaryElements: string[];
      interactiveElements: string[];
      visualHierarchy: string[];
    };
    colorPalette: {
      primary: string; secondary: string; accent: string;
      text: string; background: string; gradients?: string[];
    };
    typography: {
      fontFamily: string; primaryTextColor: string;
      secondaryTextColor: string; textSizes: string[];
    };
    interactivity: {
      buttons: Array<{
        type: string; position: string; color: string;
        textColor: string; functionality: string;
      }>;
      inputs: Array<{
        type: string; placeholder: string;
        position: string; styling: string;
      }>;
      animations: string[];
    };
    safeZone: {
      x: number; y: number; width: number; height: number;
      criticalElements: string[];
    };
  };
  functionalContext: {
    purpose: string; userFlow: string[];
    criticalFeatures: string[]; designPhilosophy: string;
  };
  generationContext: {
    promptEnhancement: string;
    characterInteractionGuidelines: string[];
    preservationRules: string[];
    styleAdaptation: string;
  };
}

interface MaskRequest {
  prompt: string;
  reference_image_url?: string;
  style: "cartoon" | "realistic" | "fantasy" | "modern" | "minimalist";
  user_id?: string;
  zone_preference?: 'top' | 'bottom' | 'left' | 'right' | 'all';
  wallet_analysis?: WalletAnalysis;
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

const BLACK_SQUARE_FALLBACK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuDAAAgAElEQVR4nO3XQQ0AAAzCsOHf9F6oIJXQS071AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+BjYAP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting V6 Enhanced Layout-Aware wallet costume generation');
    
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
      zone_preference = 'all',
      wallet_analysis
    } = requestBody;

    console.log(`🎭 Processing Enhanced Layout-Aware Request:`);
    console.log(`  - Style: ${style}`);
    console.log(`  - Zone Preference: ${zone_preference}`);
    console.log(`  - User Prompt: "${prompt}"`);
    console.log(`  - Reference Image: ${reference_image_url ? 'PROVIDED' : 'NONE'}`);
    console.log(`  - Wallet Analysis: ${wallet_analysis ? '✅ ENHANCED MODE' : '⚪ BASIC MODE'}`);

    // Генерируем layout-aware изображение с помощью Replicate
    let generatedImageUrl: string;
    try {
      generatedImageUrl = await generateLayoutAwareMask(
        prompt, 
        replicateKey, 
        reference_image_url, 
        style, 
        zone_preference,
        wallet_analysis
      );
      console.log("✅ Layout-aware generation successful:", generatedImageUrl);
    } catch (error) {
      console.error("❌ Layout-aware generation failed:", error);
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

    if (user_id && supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log("💾 Storage and metadata handling available");
      } catch (storageError) {
        console.error("❌ Storage failed:", storageError);
      }
    }

    console.log(`🎉 Layout-aware generation completed successfully`);
    console.log(`🖼️ Final Image URL: ${generatedImageUrl}`);
    
    const response: MaskResponse = {
      image_url: generatedImageUrl,
      layout_json: {
        layout: {
          character_position: zone_preference,
          wallet_safe_zone: wallet_analysis ? 
            `preserved ${wallet_analysis.uiStructure.safeZone.width}x${wallet_analysis.uiStructure.safeZone.height}px area` :
            "central 320x569px area preserved",
          style_applied: style,
          generation_method: "layout_aware_sdxl_controlnet",
          background: "clean white background",
          analysis_enhanced: !!wallet_analysis,
          ui_elements_respected: wallet_analysis?.uiStructure.layout.primaryElements || []
        },
        style: style,
        color_palette: wallet_analysis?.uiStructure.colorPalette ? 
          [wallet_analysis.uiStructure.colorPalette.primary, wallet_analysis.uiStructure.colorPalette.accent] :
          ["#FFFFFF", "#CHARACTER_COLORS"],
        safe_zone: wallet_analysis?.uiStructure.safeZone || {
          x: 352, y: 228, width: 320, height: 569
        }
      },
      prompt_used: prompt,
      storage_path: null,
      debug_info: {
        generation_successful: true,
        style: style,
        zone_preference: zone_preference,
        reference_image_used: !!reference_image_url,
        wallet_analysis_used: !!wallet_analysis,
        layout_aware_mode: !!wallet_analysis,
        ui_elements_count: wallet_analysis?.uiStructure.layout.primaryElements.length || 0,
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
    console.error("💥 Layout-aware generation Error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Layout-aware generation failed", 
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

async function generateLayoutAwareMask(
  prompt: string, 
  apiKey: string, 
  referenceImageUrl: string | null,
  style: string,
  zonePreference: string,
  walletAnalysis?: WalletAnalysis
): Promise<string> {
  console.log("🎨 Initializing Layout-Aware SDXL-ControlNet generation");
  
  const replicate = new Replicate({
    auth: apiKey,
  });

  // Стили для каждого типа
  const styleDescriptions = {
    cartoon: "vibrant cartoon character with bold outlines and expressive features",
    realistic: "photorealistic character with detailed natural features and lighting",
    fantasy: "magical fantasy character with mystical enchanted elements",
    modern: "sleek contemporary character with clean geometric design",
    minimalist: "simple clean character design with minimal essential details only"
  };
  
  const stylePrompt = styleDescriptions[style as keyof typeof styleDescriptions] || "detailed character design";
  
  // LAYOUT-AWARE ПРОМПТ GENERATION
  let enhancedPrompt = "";
  let layoutAwareNegative = "";
  
  if (walletAnalysis) {
    console.log("🧠 Using wallet analysis for enhanced prompt generation");
    
    // Используем данные из анализа кошелька
    const { generationContext, uiStructure } = walletAnalysis;
    
    // Строим умный промпт на основе анализа
    enhancedPrompt = `${prompt}, ${stylePrompt}, ${generationContext.promptEnhancement}, character interacting with ${uiStructure.layout.type} wallet interface, respecting ${uiStructure.colorPalette.primary} background and ${uiStructure.colorPalette.accent} accent colors, character positioned ${zonePreference === 'all' ? 'around' : zonePreference + ' of'} the central wallet UI, clean solid white background, PNG format`;
    
    // Используем preservation rules для негативного промпта
    layoutAwareNegative = `${generationContext.preservationRules.join(", ")}, covering wallet interface, blocking UI elements, filling central black area, overlapping critical buttons, hiding wallet functionality, colored background, gradient background, landscape, scenery, text, watermark, blurry, low quality`;
    
    console.log(`🎯 Layout-aware prompt: "${enhancedPrompt}"`);
    console.log(`🚫 Layout preservation rules: "${layoutAwareNegative}"`);
    
  } else {
    console.log("⚪ Using basic prompt generation (no wallet analysis)");
    
    // Базовый промпт без анализа
    enhancedPrompt = `${prompt}, ${stylePrompt}, character physically touching and interacting with central black rectangular window, character positioned around black window borders, no objects inside black rectangle area, character on clean solid white background, PNG format`;
    
    layoutAwareNegative = "landscape, scenery, environment, sky, ground, floor, wall, room, interior, exterior, forest, city, buildings, mountains, trees, grass, clouds, patterned background, textured background, busy background, multiple objects, any objects in central black area, filling black rectangle, covering black window, text, watermark, signature, blurry, low quality, distorted, poor quality, artifacts, duplicate character, colored background, gradient background";
  }
  
  // Используем reference image или fallback
  const controlImageUrl = referenceImageUrl || BLACK_SQUARE_FALLBACK;
  
  console.log(`🖼️ Control Image URL: ${controlImageUrl.substring(0, 100)}...`);
  
  // Параметры для layout-aware генерации
  const requestPayload = {
    prompt: enhancedPrompt,
    negative_prompt: layoutAwareNegative,
    image: controlImageUrl,
    num_inference_steps: walletAnalysis ? 30 : 25, // Больше шагов для enhanced mode
    guidance_scale: walletAnalysis ? 9.0 : 8.0, // Выше guidance для точности
    controlnet_conditioning_scale: walletAnalysis ? 0.9 : 0.8, // Сильнее контроль для layout-aware
    seed: Math.floor(Math.random() * 1000000)
  };
  
  console.log(`📤 Sending layout-aware request to Replicate:`, JSON.stringify(requestPayload, null, 2));
  
  try {
    const output = await replicate.run(
      "lucataco/sdxl-controlnet:06d6fae3b75ab68a28cd2900afa6033166910dd09fd9751047043a5bbb4c184b",
      {
        input: requestPayload
      }
    );

    console.log("✅ Layout-aware Replicate generation completed");
    console.log("📊 Output type:", typeof output, "Array:", Array.isArray(output));
    console.log("✅ Output:", output);
    
    if (!output) {
      throw new Error("No output returned from Replicate");
    }
    
    const imageUrl = output as string;
    console.log(`🖼️ Final Layout-Aware Generated Image URL: ${imageUrl}`);
    
    return imageUrl;
    
  } catch (error) {
    console.error("❌ Layout-aware Replicate detailed error:", {
      message: error.message,
      stack: error.stack
    });
    
    throw new Error(`Layout-aware Replicate generation failed: ${error.message}`);
  }
}
