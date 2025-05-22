
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
    const { image_url, prompt, layer, user_id } = await req.json() as MaskRequest;
    
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
    const response = await processRequest(inputType, image_url, prompt, openAiKey, layer, user_id);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in generate-wallet-mask function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate wallet mask", 
        details: error.message 
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
  user_id?: string
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

    // Step 2: Generate mask image - SIMPLIFIED VERSION TO AVOID DALL-E ERRORS
    // Instead of using DALL-E, we'll use a predefined mask as a fallback for now
    let maskImageUrl;

    // Try the simpler DALL-E approach first
    try {
      const simplifiedPrompt = createSimplifiedPrompt(prompt || "", layoutAnalysis);
      console.log("Trying simplified prompt for DALL-E:", simplifiedPrompt);
      
      maskImageUrl = await generateImageWithSimplifiedDallE(simplifiedPrompt, openAiKey);
      console.log("Image generated successfully with simplified prompt");
    } catch (dalleError) {
      console.error("Error with simplified DALL-E approach:", dalleError);
      console.log("Falling back to predefined mask...");
      
      // Use a predefined mask based on the style
      const styleLower = layoutAnalysis.style.toLowerCase();
      let fallbackMask = '/external-masks/abstract-mask.png';
      
      if (styleLower.includes('cat')) {
        fallbackMask = '/external-masks/cats-mask.png';
      } else if (styleLower.includes('crypto') || styleLower.includes('bitcoin')) {
        fallbackMask = '/external-masks/crypto-mask.png';
      } else if (styleLower.includes('cyber')) {
        fallbackMask = '/external-masks/cyber-mask.png';
      } else if (prompt && prompt.toLowerCase().includes('pepe')) {
        fallbackMask = '/external-masks/pepe-mask.png';
      }
      
      maskImageUrl = fallbackMask;
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

// Creates a simplified prompt for DALL-E to reduce complexity
function createSimplifiedPrompt(userPrompt: string, layoutAnalysis: LayoutAnalysis): string {
  return `Create a decorative frame for a wallet app with these specifications:
- Canvas size: 1024x1024 pixels
- Style: ${layoutAnalysis.style}
- Important: The center area must be completely transparent (no elements)
- The transparent zone dimensions: 320px wide by 569px tall in the center
- Draw decorative elements ONLY around the edges (top, bottom, left, right)
- Main theme from user request: ${userPrompt}
- Color suggestions: ${layoutAnalysis.color_palette.join(", ")}

Do not include any UI components or text. This is a decorative frame only.`;
}

async function analyzeImageWithGPT(
  imageUrl: string, 
  additionalPrompt: string | undefined, 
  apiKey: string
): Promise<LayoutAnalysis> {
  
  const safeZoneInstructions = `
🧠 DESIGN CONTEXT: 
You are generating a decorative mask (UI frame) for a wallet login screen.

⚠️ DO NOT DRAW in the center:
- Forbidden area size: ${WALLET_SAFE_ZONE.width}px wide, ${WALLET_SAFE_ZONE.height}px tall
- Located at: x=${WALLET_SAFE_ZONE.x}, y=${WALLET_SAFE_ZONE.y} (top-left corner of the forbidden rectangle)

✅ Draw ONLY decorative elements around the edges:
- Top, bottom, left, right
- No characters or visuals in the center zone

❌ The central rectangle (${WALLET_SAFE_ZONE.width}px × ${WALLET_SAFE_ZONE.height}px at position x=${WALLET_SAFE_ZONE.x}, y=${WALLET_SAFE_ZONE.y}) must remain completely empty and transparent. This area is reserved for the login interface.

🎨 Use transparency for everything inside the forbidden zone.
📐 Output size: 1024×1024 PNG with clear framing and transparent center.

Inside the center of the image (rectangle: ${WALLET_SAFE_ZONE.width}px × ${WALLET_SAFE_ZONE.height}px, starting at x=${WALLET_SAFE_ZONE.x}, y=${WALLET_SAFE_ZONE.y}), imagine a glowing transparent rectangle labeled "DO NOT DRAW". All artwork must surround this area without overlapping it. This is a forbidden zone.`;

  const promptBase = `Analyze this image and describe how it could be used as a decorative frame or character around a crypto wallet UI.

${safeZoneInstructions}

I need these specific details:
1. Subject - What is the main subject/character in the image?
2. Style - What visual style is used (cartoon, photorealistic, anime, etc)?
3. Color palette - List 3-5 main colors (in hex codes)
4. Layout suggestion - How would you position elements around a wallet? (Consider top/bottom/left/right placement ONLY, keeping the center completely empty)

${additionalPrompt ? `Additional context: ${additionalPrompt}` : ''}

Format your response as a JSON object with these keys: layout (with top, bottom, left, right, core properties), style, color_palette.
The "core" property in layout must ALWAYS be "untouched" to indicate the center remains completely empty and transparent.`;

  return await callOpenAIVisionAPI(apiKey, promptBase, imageUrl);
}

async function interpretPromptWithGPT(
  prompt: string, 
  apiKey: string
): Promise<LayoutAnalysis> {
  
  const safeZoneInstructions = `
🧠 DESIGN CONTEXT: 
You are generating a decorative mask (UI frame) for a wallet login screen.

⚠️ DO NOT DRAW in the center:
- Forbidden area size: ${WALLET_SAFE_ZONE.width}px wide, ${WALLET_SAFE_ZONE.height}px tall
- Located at: x=${WALLET_SAFE_ZONE.x}, y=${WALLET_SAFE_ZONE.y} (top-left corner of the forbidden rectangle)

✅ Draw ONLY decorative elements around the edges:
- Top, bottom, left, right
- No characters or visuals in the center zone

❌ The central rectangle (${WALLET_SAFE_ZONE.width}px × ${WALLET_SAFE_ZONE.height}px at position x=${WALLET_SAFE_ZONE.x}, y=${WALLET_SAFE_ZONE.y}) must remain completely empty and transparent. This area is reserved for the login interface.

🎨 Use transparency for everything inside the forbidden zone.
📐 Output size: 1024×1024 PNG with clear framing and transparent center.

Inside the center of the image (rectangle: ${WALLET_SAFE_ZONE.width}px × ${WALLET_SAFE_ZONE.height}px, starting at x=${WALLET_SAFE_ZONE.x}, y=${WALLET_SAFE_ZONE.y}), imagine a glowing transparent rectangle labeled "DO NOT DRAW". All artwork must surround this area without overlapping it. This is a forbidden zone.`;

  const promptBase = `Based on this description: "${prompt}", design a decorative frame or character that could surround a crypto wallet UI.

${safeZoneInstructions}

I need these specific details:
1. Subject - What would be the main subject/character?
2. Style - What visual style would work best (cartoon, photorealistic, anime, etc)?
3. Color palette - Suggest 3-5 main colors (in hex codes)
4. Layout suggestion - How would you position elements around a wallet? (Consider top/bottom/left/right placement ONLY, keeping the center completely empty)

Format your response as a JSON object with these keys: layout (with top, bottom, left, right, core properties), style, color_palette.
The "core" property in layout must ALWAYS be "untouched" to indicate the center remains completely empty and transparent.`;

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

// Simplified DALL-E function to generate images with minimal instructions
async function generateImageWithSimplifiedDallE(
  prompt: string,
  apiKey: string
): Promise<string> {
  console.log("Generating image with simplified DALL-E prompt...");
  
  // Log the exact payload for debugging
  const requestPayload = {
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
    quality: "standard" // Using standard quality to reduce potential errors
  };
  
  console.log("DALL-E request payload:", JSON.stringify(requestPayload));
  
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

    console.log("DALL-E image generated successfully");
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image with simplified DALL-E:", error);
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
