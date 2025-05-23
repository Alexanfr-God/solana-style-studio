// Import required modules
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Constants
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface MaskLayout {
  top: string | null;
  bottom: string | null;
  left: string | null;
  right: string | null;
  core: string;
}

interface SafeZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MaskRequest {
  image_url?: string;
  prompt?: string;
  layer: "login" | "wallet";
  user_id?: string;
  hd_quality?: boolean;
  selected_style?: string;
  debug_mode?: boolean;
}

interface MaskResponse {
  mask_image_url: string;
  layout_json: {
    layout: MaskLayout;
    style: string;
    color_palette: string[];
    safe_zone: SafeZone;
  };
  prompt_used: string;
  input_type: "image" | "prompt" | "image+prompt";
  debug_info?: any;
}

interface LayoutAnalysis {
  layout: MaskLayout;
  style: string;
  color_palette: string[];
}

// Enhanced safe zone coordinates for 1024x1024 canvas
const WALLET_SAFE_ZONE: SafeZone = {
  x: 352, // (1024 - 320) / 2
  y: 227, // (1024 - 569) / 2
  width: 320,
  height: 569
};

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Parse request body
    const { 
      image_url, 
      prompt, 
      layer, 
      user_id, 
      hd_quality,
      selected_style = '',
      debug_mode = false
    } = await req.json() as MaskRequest;
    
    // Log input parameters for debugging
    console.log(`Request received for ${layer} mask`);
    console.log(`Selected style: ${selected_style}`);
    console.log(`Debug mode: ${debug_mode}`);
    
    // Validate input parameters
    validateInputParameters(image_url, prompt, layer);

    // Determine input type
    const inputType = determineInputType(image_url, prompt);
    console.log(`Processing ${inputType} request`);

    // Process the request with enhanced prompt building
    const response = await processEnhancedRequest(
      inputType, 
      image_url, 
      prompt, 
      openAiKey, 
      layer, 
      selected_style,
      user_id, 
      hd_quality,
      debug_mode
    );

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in generate-wallet-mask function:", error);
    
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

// Helper functions
function validateInputParameters(image_url?: string, prompt?: string, layer?: string): void {
  if (!image_url && !prompt) {
    throw new Error("Either image_url or prompt must be provided");
  }

  if (!layer || (layer !== "login" && layer !== "wallet")) {
    throw new Error("Valid layer (login or wallet) must be specified");
  }
}

function determineInputType(image_url?: string, prompt?: string): "image" | "prompt" | "image+prompt" {
  if (image_url && prompt) return "image+prompt";
  if (image_url) return "image";
  return "prompt";
}

async function processEnhancedRequest(
  inputType: "image" | "prompt" | "image+prompt",
  image_url: string | undefined,
  prompt: string | undefined,
  openAiKey: string,
  layer: string,
  selectedStyle: string,
  user_id?: string,
  hd_quality: boolean = false,
  debug_mode: boolean = false
): Promise<MaskResponse> {
  console.log(`Processing enhanced ${inputType} request for ${layer} layer`);
  
  // Step 1: Enhanced analysis with style context
  let layoutAnalysis: LayoutAnalysis;
  
  try {
    if (inputType === "image" || inputType === "image+prompt") {
      console.log("Analyzing image with GPT-4o and style context...");
      layoutAnalysis = await analyzeImageWithEnhancedGPT(image_url!, prompt, selectedStyle, openAiKey);
    } else {
      console.log("Interpreting prompt with GPT-4o and style context...");
      layoutAnalysis = await interpretPromptWithEnhancedGPT(prompt!, selectedStyle, openAiKey);
    }
  
    console.log("Enhanced layout analysis complete:", layoutAnalysis);

    // Step 2: Build comprehensive prompt using modular system
    const finalPrompt = buildEnhancedPrompt(prompt || "", layoutAnalysis, selectedStyle, debug_mode);
    console.log("Enhanced prompt built:", debug_mode ? finalPrompt : finalPrompt.substring(0, 200) + "...");

    // Step 3: Generate with DALL-E using enhanced prompt
    let maskImageUrl: string;
    let generationSucceeded = false;

    try {
      console.log("Generating with enhanced DALL-E prompt...");
      
      maskImageUrl = await generateImageWithEnhancedDallE(
        finalPrompt, 
        openAiKey,
        hd_quality
      );
      
      console.log("Enhanced image generated successfully");
      generationSucceeded = true;
    } catch (dalleError) {
      console.error("Error with enhanced DALL-E approach:", dalleError);
      console.log("Falling back to predefined mask...");
      
      maskImageUrl = selectFallbackMask(prompt || "", layoutAnalysis.style, selectedStyle);
    }

    // Prepare enhanced response
    const response: MaskResponse = {
      mask_image_url: maskImageUrl,
      layout_json: {
        layout: layoutAnalysis.layout,
        style: layoutAnalysis.style,
        color_palette: layoutAnalysis.color_palette,
        safe_zone: WALLET_SAFE_ZONE
      },
      prompt_used: finalPrompt,
      input_type: inputType,
      debug_info: debug_mode ? {
        selected_style: selectedStyle,
        analysis: layoutAnalysis,
        generation_succeeded: generationSucceeded
      } : undefined
    };

    // Store result in database if user_id is provided
    if (user_id) {
      await storeMaskResult(user_id, response, image_url, prompt || "", layer);
    }

    return response;
  } catch (error) {
    console.error("Error in processEnhancedRequest:", error);
    throw error;
  }
}

// Enhanced GPT-4o analysis with style integration
async function analyzeImageWithEnhancedGPT(
  imageUrl: string, 
  additionalPrompt: string | undefined, 
  selectedStyle: string,
  apiKey: string
): Promise<LayoutAnalysis> {
  
  const styleContext = selectedStyle ? `User has selected "${selectedStyle}" style preference. ` : '';
  const safeZoneInstructions = `
🎯 WALLET MASK DESIGN ANALYSIS

${styleContext}Your task: Analyze this image for creating a decorative wallet frame.

SAFE ZONE REQUIREMENTS:
- Central rectangle: ${WALLET_SAFE_ZONE.width}×${WALLET_SAFE_ZONE.height}px at position (${WALLET_SAFE_ZONE.x}, ${WALLET_SAFE_ZONE.y})
- This area MUST remain completely transparent
- All decorative elements must surround this forbidden zone

ANALYSIS NEEDED:
1. Layout Strategy: How should elements be positioned around the safe zone?
   - Top area: What decorative elements work above the wallet?
   - Bottom area: What elements work below the wallet?
   - Left/Right sides: What side decorations complement the design?

2. Style Classification: What visual style best describes this image?
   ${selectedStyle ? `(Consider user preference: ${selectedStyle})` : ''}

3. Color Palette: Extract 3-5 dominant colors in hex format

${additionalPrompt ? `Additional context: ${additionalPrompt}` : ''}

Respond with JSON containing: layout (top, bottom, left, right, core), style, color_palette.
The "core" must always be "untouched" to ensure transparency.`;

  return await callOpenAIVisionAPI(apiKey, safeZoneInstructions, imageUrl);
}

async function interpretPromptWithEnhancedGPT(
  prompt: string, 
  selectedStyle: string,
  apiKey: string
): Promise<LayoutAnalysis> {
  
  const styleContext = selectedStyle ? `User has selected "${selectedStyle}" style preference. ` : '';
  const safeZoneInstructions = `
🎯 WALLET MASK DESIGN INTERPRETATION

${styleContext}Your task: Design a decorative wallet frame based on: "${prompt}"

SAFE ZONE REQUIREMENTS:
- Central rectangle: ${WALLET_SAFE_ZONE.width}×${WALLET_SAFE_ZONE.height}px at position (${WALLET_SAFE_ZONE.x}, ${WALLET_SAFE_ZONE.y})
- This area MUST remain completely transparent
- All decorative elements must surround this forbidden zone

DESIGN STRATEGY:
1. Layout Planning: How to arrange elements around the wallet?
   - Top area: What decorative elements above the wallet?
   - Bottom area: What elements below the wallet?
   - Left/Right sides: What side decorations?

2. Style Integration: 
   ${selectedStyle ? `Apply "${selectedStyle}" style characteristics` : 'Determine appropriate visual style'}
   - Consider rendering techniques, color approaches, detail levels

3. Color Harmony: Suggest 3-5 colors that work well together

Respond with JSON containing: layout (top, bottom, left, right, core), style, color_palette.
The "core" must always be "untouched" to ensure transparency.`;

  return await callOpenAITextAPI(apiKey, safeZoneInstructions);
}

// Enhanced prompt building function
function buildEnhancedPrompt(
  userPrompt: string,
  analysis: LayoutAnalysis,
  selectedStyle: string,
  debugMode: boolean = false
): string {
  // Build layout description
  const layoutParts: string[] = [];
  if (analysis.layout.top) layoutParts.push(`Top: ${analysis.layout.top}`);
  if (analysis.layout.bottom) layoutParts.push(`Bottom: ${analysis.layout.bottom}`);
  if (analysis.layout.left) layoutParts.push(`Left: ${analysis.layout.left}`);
  if (analysis.layout.right) layoutParts.push(`Right: ${analysis.layout.right}`);
  
  const layoutDescription = layoutParts.join('. ');
  
  // Build style instruction
  const styleMap: Record<string, string> = {
    'modern': 'sleek modern digital art with clean lines and gradients',
    'cartoon': 'cartoon style with bold outlines, flat colors, and playful design',
    'realistic': 'photorealistic with detailed textures and natural lighting',
    'fantasy': 'fantasy art with magical elements and ethereal atmosphere',
    'minimalist': 'minimalist design with simple shapes and limited colors'
  };
  
  const styleInstruction = selectedStyle && styleMap[selectedStyle] 
    ? `Render in ${styleMap[selectedStyle]}` 
    : `Apply ${analysis.style} visual style`;
  
  // Build color instruction
  const colorInstruction = analysis.color_palette.length > 0 
    ? `Use colors: ${analysis.color_palette.slice(0, 5).join(', ')}.` 
    : '';
  
  // Build safe zone instruction
  const safeZoneInstruction = `CRITICAL: Keep central area (${WALLET_SAFE_ZONE.x}, ${WALLET_SAFE_ZONE.y}) to (${WALLET_SAFE_ZONE.x + WALLET_SAFE_ZONE.width}, ${WALLET_SAFE_ZONE.y + WALLET_SAFE_ZONE.height}) completely transparent (alpha=0).`;
  
  // Assemble final prompt
  const finalPrompt = [
    `Create decorative wallet frame: ${userPrompt}.`,
    layoutDescription,
    styleInstruction,
    colorInstruction,
    safeZoneInstruction,
    'Output: 1024×1024px PNG with transparency.'
  ].filter(Boolean).join(' ');
  
  if (debugMode) {
    console.log('=== ENHANCED PROMPT COMPONENTS ===');
    console.log('User input:', userPrompt);
    console.log('Layout:', layoutDescription);
    console.log('Style:', styleInstruction);
    console.log('Colors:', colorInstruction);
    console.log('=== FINAL ENHANCED PROMPT ===');
    console.log(finalPrompt);
  }
  
  return finalPrompt;
}

// Enhanced fallback mask selection with style preference
function selectFallbackMask(prompt: string, analyzedStyle: string, selectedStyle: string): string {
  const promptLower = prompt.toLowerCase();
  const combinedStyle = `${selectedStyle} ${analyzedStyle}`.toLowerCase();
  
  if (promptLower.includes('cat') || combinedStyle.includes('cat')) {
    return '/external-masks/cats-mask.png';
  } else if (promptLower.includes('crypto') || combinedStyle.includes('crypto')) {
    return '/external-masks/crypto-mask.png';
  } else if (promptLower.includes('cyber') || combinedStyle.includes('cyber')) {
    return '/external-masks/cyber-mask.png';
  } else if (promptLower.includes('pepe') || combinedStyle.includes('pepe')) {
    return '/external-masks/pepe-mask.png';
  } else if (selectedStyle === 'minimalist') {
    return '/external-masks/abstract-mask.png';
  } else {
    return '/external-masks/abstract-mask.png';
  }
}

// Enhanced DALL-E generation
async function generateImageWithEnhancedDallE(
  prompt: string,
  apiKey: string,
  hdQuality: boolean = false
): Promise<string> {
  console.log("Generating image with enhanced DALL-E prompt...");
  
  const requestPayload = {
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024" as const,
    response_format: "url" as const,
    quality: hdQuality ? "hd" as const : "standard" as const
  };
  
  console.log("Enhanced DALL-E request payload:", JSON.stringify(requestPayload));
  
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Enhanced DALL-E API error:", data);
      throw new Error(`DALL-E API error: ${data.error?.message || "Unknown error"}`);
    }

    console.log("Enhanced DALL-E image generated successfully");
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image with enhanced DALL-E:", error);
    throw error;
  }
}

// Keep existing helper functions
async function callOpenAIVisionAPI(
  apiKey: string,
  promptText: string,
  imageUrl: string
): Promise<LayoutAnalysis> {
  console.log("Calling OpenAI Vision API...");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    return await processOpenAIResponse(response);
  } catch (error) {
    console.error("Error calling OpenAI Vision API:", error);
    throw new Error(`OpenAI Vision API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function callOpenAITextAPI(
  apiKey: string,
  promptText: string
): Promise<LayoutAnalysis> {
  console.log("Calling OpenAI Text API...");
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: promptText
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    return await processOpenAIResponse(response);
  } catch (error) {
    console.error("Error calling OpenAI Text API:", error);
    throw new Error(`OpenAI Text API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processOpenAIResponse(response: Response): Promise<LayoutAnalysis> {
  const data = await response.json();
  if (!response.ok) {
    console.error("OpenAI API error:", data);
    throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
  }

  try {
    const result = JSON.parse(data.choices[0].message.content);
    return {
      layout: {
        top: result.layout.top || null,
        bottom: result.layout.bottom || null,
        left: result.layout.left || null,
        right: result.layout.right || null,
        core: "untouched"
      },
      style: result.style || "undefined style",
      color_palette: Array.isArray(result.color_palette) ? result.color_palette : ["#000000", "#FFFFFF"]
    };
  } catch (e) {
    console.error("Error parsing GPT response:", e);
    return {
      layout: {
        top: "character element",
        bottom: "supporting elements",
        left: null,
        right: null,
        core: "untouched"
      },
      style: "general",
      color_palette: ["#000000", "#FFFFFF", "#888888"]
    };
  }
}

async function storeMaskResult(
  userId: string,
  response: MaskResponse,
  originalImageUrl: string | undefined,
  originalPrompt: string,
  layer: string
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    await supabase.from('ai_requests').insert({
      user_id: userId,
      prompt: originalPrompt,
      image_url: originalImageUrl,
      layer_type: layer,
      status: 'completed',
      style_result: {
        mask_image_url: response.mask_image_url,
        layout_json: response.layout_json,
        prompt_used: response.prompt_used,
        input_type: response.input_type
      }
    });

    console.log("Enhanced mask result stored successfully");
  } catch (error) {
    console.error("Error storing mask result:", error);
  }
}
