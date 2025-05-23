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
}

interface LayoutAnalysis {
  layout: MaskLayout;
  style: string;
  color_palette: string[];
}

// Define safe zone - precise coordinates based on wallet UI dimensions
// Updated to use the centerpoint-relative coordinates for 1024x1024 DALL-E canvas
const WALLET_SAFE_ZONE: SafeZone = {
  x: 432, // center X - width/2
  y: 344, // center Y - height/2
  width: 160,
  height: 336
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
    const { image_url, prompt, layer, user_id, hd_quality } = await req.json() as MaskRequest;
    
    // Log input parameters for debugging
    console.log(`Request received for ${layer} mask`);
    console.log(`Input type: ${image_url ? "image_url" : ""}${prompt ? (image_url ? "+prompt" : "prompt") : ""}`);
    if (image_url) {
      console.log(`Image URL provided: ${image_url.substring(0, 50)}...`);
      
      // Validate the image URL - make sure it's not a blob URL
      if (image_url.startsWith('blob:')) {
        throw new Error("Invalid image URL format. Blob URLs are not accessible by the API. Please use a publicly accessible URL.");
      }
      
      // Check if URL is accessible
      try {
        const imageResponse = await fetch(image_url, { method: 'HEAD' });
        if (!imageResponse.ok) {
          throw new Error(`Image URL is not accessible (status: ${imageResponse.status})`);
        }
      } catch (error) {
        console.error("Error checking image URL:", error);
        throw new Error("Unable to access the provided image URL. Please ensure it's publicly accessible.");
      }
    }
    
    // Validate input parameters
    validateInputParameters(image_url, prompt, layer);

    console.log(`Processing mask request for layer: ${layer}`);
    console.log(`Input: ${image_url ? "image_url: ✓" : "image_url: ✗"}, ${prompt ? "prompt: ✓" : "prompt: ✗"}`);

    // Determine input type
    const inputType = determineInputType(image_url, prompt);

    // Process the request
    const response = await processRequest(inputType, image_url, prompt, openAiKey, layer, user_id, hd_quality);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in generate-wallet-mask function:", error);
    
    // Return a more informative error response
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate wallet mask", 
        details: error.message,
        fallback_mask: '/external-masks/abstract-mask.png',
        fallback_layout: {
          layout: {
            top: "Fallback decorative elements",
            bottom: "Fallback decorative elements",
            left: null,
            right: null,
            core: "untouched"
          },
          style: "abstract fallback",
          color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
        }
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

async function processRequest(
  inputType: "image" | "prompt" | "image+prompt",
  image_url: string | undefined,
  prompt: string | undefined,
  openAiKey: string,
  layer: string,
  user_id?: string,
  hd_quality: boolean = false
): Promise<MaskResponse> {
  console.log(`Processing ${inputType} request for ${layer} layer`);
  
  // Step 1: Analyze image or interpret prompt with GPT-4o
  let layoutAnalysis;
  
  try {
    if (inputType === "image" || inputType === "image+prompt") {
      console.log("Analyzing image with GPT-4o...");
      layoutAnalysis = await analyzeImageWithGPT(image_url!, prompt, openAiKey);
    } else {
      console.log("Interpreting prompt with GPT-4o...");
      layoutAnalysis = await interpretPromptWithGPT(prompt!, openAiKey);
    }
  
    console.log("Layout analysis complete:", layoutAnalysis);

    // Step 2: Try generating mask image with DALL-E
    let maskImageUrl;
    let generationSucceeded = false;

    try {
      // Use simplified approach with minimal prompt complexity
      const simplifiedPrompt = createUltraSimplifiedPrompt(prompt || "", layoutAnalysis);
      console.log("Using ultra simplified prompt for DALL-E:", simplifiedPrompt);
      
      // Try with controller & timeout to prevent hanging
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        maskImageUrl = await generateImageWithSimplifiedDallE(
          simplifiedPrompt, 
          openAiKey,
          hd_quality
        );
        clearTimeout(timeout);
        
        console.log("Image generated successfully with simplified prompt");
        generationSucceeded = true;
      } catch (abortError) {
        clearTimeout(timeout);
        throw new Error("DALL-E request timed out or was aborted");
      }
    } catch (dalleError) {
      console.error("Error with simplified DALL-E approach:", dalleError);
      console.log("Falling back to predefined mask...");
      
      // Use a predefined mask based on the style or prompt content
      maskImageUrl = selectFallbackMask(prompt || "", layoutAnalysis.style);
    }

    // Prepare response
    const response: MaskResponse = {
      mask_image_url: maskImageUrl,
      layout_json: {
        layout: layoutAnalysis.layout,
        style: layoutAnalysis.style,
        color_palette: layoutAnalysis.color_palette,
        safe_zone: WALLET_SAFE_ZONE
      },
      prompt_used: prompt || "Using fallback mask",
      input_type: inputType
    };

    // Store result in database if user_id is provided
    if (user_id) {
      await storeMaskResult(user_id, response, image_url, prompt || "", layer);
    }

    return response;
  } catch (error) {
    console.error("Error in processRequest:", error);
    throw error; // Re-throw to be handled by the main handler
  }
}

// Select the most appropriate fallback mask based on style or prompt keywords
function selectFallbackMask(prompt: string, style: string): string {
  const promptLower = prompt.toLowerCase();
  const styleLower = style.toLowerCase();
  
  if (promptLower.includes('cat') || styleLower.includes('cat')) {
    return '/external-masks/cats-mask.png';
  } else if (promptLower.includes('crypto') || promptLower.includes('bitcoin') || styleLower.includes('crypto')) {
    return '/external-masks/crypto-mask.png';
  } else if (promptLower.includes('cyber') || styleLower.includes('cyber')) {
    return '/external-masks/cyber-mask.png';
  } else if (promptLower.includes('pepe') || styleLower.includes('pepe')) {
    return '/external-masks/pepe-mask.png';
  } else {
    return '/external-masks/abstract-mask.png';
  }
}

// Ultra simplified prompt with strict transparency rules
function createUltraSimplifiedPrompt(userPrompt: string, layoutAnalysis: LayoutAnalysis): string {
  // Extract key themes from the user prompt
  const themes = userPrompt.split(/\s+/).filter(word => word.length > 3).slice(0, 3).join(" ");
  
  return `🎯 WALLET MASK - STRICT FORMAT:

Create a decorative wallet frame with ${themes} style.

📐 MANDATORY REQUIREMENTS:
- Size: 1024x1024 PNG
- Central transparent area: 320x569 pixels (exact center)
- NO CONTENT in center - must be 100% transparent
- Decorative elements ONLY around edges

⚠️ CRITICAL: The center rectangle (320x569px) is FORBIDDEN - place all design elements around the edges only. This area will show a wallet interface.`;
}

async function analyzeImageWithGPT(
  imageUrl: string, 
  additionalPrompt: string | undefined, 
  apiKey: string
): Promise<LayoutAnalysis> {
  
  const safeZoneInstructions = `
🎯 WALLET MASK GENERATION RULES:

📐 MANDATORY LAYOUT:
- Image size: 1024x1024 pixels
- Transparent center: 320x569 pixels (positioned at exact center)
- Center coordinates: x=352, y=227.5 (top-left of transparent area)
- ZERO content in the transparent zone

🎨 DESIGN PLACEMENT:
- Decorative elements ONLY around edges
- Top area: above the transparent zone
- Bottom area: below the transparent zone  
- Left/Right sides: alongside the transparent zone
- NO overlap with center rectangle

⚠️ TRANSPARENCY REQUIREMENT:
The central 320x569 pixel rectangle must be completely empty/transparent. This is a wallet interface area that cannot be covered.

Think of this as creating a decorative "frame" or "costume" that surrounds a wallet interface.`;

  const promptBase = `Analyze this image and design a wallet mask following strict transparency rules.

${safeZoneInstructions}

Image analysis needed:
1. Main subject/character identification
2. Visual style (cartoon, realistic, meme, etc.)
3. Color palette (3-5 hex colors)
4. Layout positioning (keeping center 320x569px transparent)

${additionalPrompt ? `Additional context: ${additionalPrompt}` : ''}

Format as JSON: {layout: {top, bottom, left, right, core: "untouched"}, style, color_palette}`;

  return await callOpenAIVisionAPI(apiKey, promptBase, imageUrl);
}

async function interpretPromptWithGPT(
  prompt: string, 
  apiKey: string
): Promise<LayoutAnalysis> {
  
  const safeZoneInstructions = `
🎯 WALLET MASK GENERATION RULES:

📐 MANDATORY LAYOUT:
- Image size: 1024x1024 pixels
- Transparent center: 320x569 pixels (positioned at exact center)
- Center coordinates: x=352, y=227.5 (top-left of transparent area)
- ZERO content in the transparent zone

🎨 DESIGN PLACEMENT:
- Decorative elements ONLY around edges
- Top area: above the transparent zone
- Bottom area: below the transparent zone  
- Left/Right sides: alongside the transparent zone
- NO overlap with center rectangle

⚠️ TRANSPARENCY REQUIREMENT:
The central 320x569 pixel rectangle must be completely empty/transparent. This is a wallet interface area that cannot be covered.

Think of this as creating a decorative "frame" or "costume" that surrounds a wallet interface.`;

  const promptBase = `Design a wallet mask based on: "${prompt}"

${safeZoneInstructions}

Design requirements:
1. Main subject/character concept
2. Visual style recommendation
3. Color palette (3-5 hex colors)  
4. Layout positioning (keeping center 320x569px transparent)

Format as JSON: {layout: {top, bottom, left, right, core: "untouched"}, style, color_palette}`;

  return await callOpenAITextAPI(apiKey, promptBase);
}

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
    // Fallback layout if parsing fails
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

// Simplified DALL-E function with enhanced transparency instructions
async function generateImageWithSimplifiedDallE(
  prompt: string,
  apiKey: string,
  hdQuality: boolean = false
): Promise<string> {
  console.log("Generating wallet mask with strict transparency rules...");
  
  // Enhanced prompt with very specific transparency requirements
  const enhancedPrompt = `${prompt}

🎯 CRITICAL MASK REQUIREMENTS:
- PNG format with alpha transparency
- Size: 1024x1024 pixels
- Central rectangle 320x569px: MUST BE COMPLETELY TRANSPARENT
- Center position: x=352, y=227.5 (exact coordinates)
- Place decorative elements ONLY around the edges
- NO content, colors, or patterns in the center rectangle

⚠️ MANDATORY: The center area (320x569px) is a "hole" where a wallet interface will show through. Draw decorative frame elements around this hole only.`;
  
  const requestPayload = {
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
    quality: hdQuality ? "hd" : "standard"
  };
  
  console.log("DALL-E request with enhanced transparency rules");
  
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
      console.error("DALL-E API error:", data);
      throw new Error(`DALL-E API error: ${data.error?.message || "Unknown error"}`);
    }

    console.log("DALL-E mask generated with transparency rules");
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating mask with transparency rules:", error);
    throw error;
  }
}

async function storeMaskResult(
  userId: string,
  response: MaskResponse,
  originalImageUrl: string | undefined,
  originalPrompt: string,
  layer: string
): Promise<void> {
  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Store the result in the ai_requests table
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

    console.log("Mask result stored successfully");
  } catch (error) {
    console.error("Error storing mask result:", error);
    // Don't throw here, just log the error to avoid breaking the main flow
  }
}
