
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawingImageBase64, useStyleTransfer } = await req.json();
    
    console.log(`🎨 STARTING CAT MASK GENERATION`);
    console.log(`Style transfer: ${useStyleTransfer}`);
    
    if (!drawingImageBase64) {
      throw new Error("No drawing image provided");
    }

    if (!openAIApiKey) {
      console.error("OpenAI API key not found");
      throw new Error("OpenAI API key not configured");
    }
    
    // Analyze the user's drawing to understand cat placement
    console.log("📋 Step 1: Analyzing cat drawing...");
    const catAnalysis = await analyzeCatDrawing(drawingImageBase64);
    console.log("Cat analysis result:", catAnalysis);
    
    // Generate minimalist cat mask using DALL-E 3
    console.log("🎨 Step 2: Generating cat mask with DALL-E...");
    const generatedImageUrl = await generateMinimalistCatMask(catAnalysis, useStyleTransfer);
    console.log("Generated mask URL:", generatedImageUrl);
    
    const responseData = {
      mask_image_url: generatedImageUrl,
      layout_json: {
        layout: {
          top: catAnalysis.hasHeadArea ? "Minimalist cat head with ears" : null,
          bottom: catAnalysis.hasBodyArea ? "Simple cat paws and body" : null,
          left: catAnalysis.hasLeftArea ? "Cat tail or side element" : null,
          right: catAnalysis.hasRightArea ? "Cat tail or side element" : null,
          core: "transparent wallet area"
        },
        style: useStyleTransfer ? "stylized-minimalist-cat" : "clean-minimalist-cat",
        color_palette: catAnalysis.suggestedColors || ["#000000", "#ffffff"],
        cat_type: catAnalysis.catType,
        generation_method: "dall-e-3"
      }
    };

    console.log("✅ SUCCESS: Cat mask generated successfully");
    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ ERROR in cat mask generation:", error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback_mask: '/external-masks/cats-mask.png',
        details: "AI generation failed, using fallback"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/**
 * Analyzes user drawing to determine cat element placement
 */
async function analyzeCatDrawing(drawingImageBase64: string): Promise<any> {
  try {
    const base64Content = drawingImageBase64.split(',')[1] || drawingImageBase64;
    
    console.log("🔍 Analyzing drawing with GPT-4o...");
    
    const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `🐱 CAT DRAWING ANALYZER FOR WALLET MASK GENERATION

Analyze this rough drawing to create a minimalist cat mask around a wallet.

CANVAS LAYOUT (800x800px):
- Wallet safe zone: Center 320x569px (must stay transparent)
- Drawing areas: Top, bottom, left, right around the wallet

ANALYZE FOR CAT ELEMENTS:
1. TOP area (above wallet) → cat head, ears, eyes
2. BOTTOM area (below wallet) → cat paws, body, tail
3. LEFT/RIGHT areas → cat tail, side elements
4. Drawing intensity and style

CAT POSE TYPES TO DETECT:
- "sitting": head on top, paws at bottom
- "sleeping": curled around wallet 
- "playful": dynamic with tail movement
- "simple": just head and basic elements

Return JSON format:
{
  "hasHeadArea": boolean,
  "hasBodyArea": boolean,
  "hasLeftArea": boolean, 
  "hasRightArea": boolean,
  "catType": "sitting|sleeping|playful|simple",
  "intensity": "light|medium|bold",
  "suggestedColors": ["#color1", "#color2"]
}`
          },
          {
            role: "user", 
            content: [
              {
                type: "text", 
                text: "Analyze this cat drawing and determine where cat elements should be placed around the wallet area for mask generation."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Content}`
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        response_format: { type: "json_object" }
      })
    });

    if (!analysisResponse.ok) {
      throw new Error(`GPT-4o analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    
    if (!analysisData.choices || analysisData.choices.length === 0) {
      throw new Error("Failed to analyze cat drawing - no response");
    }
    
    const result = JSON.parse(analysisData.choices[0].message.content);
    console.log("📊 Analysis complete:", result);
    return result;
    
  } catch (error) {
    console.error("Error in drawing analysis:", error);
    // Fallback analysis for sitting cat
    return {
      hasHeadArea: true,
      hasBodyArea: true,
      hasLeftArea: false,
      hasRightArea: false,
      catType: "sitting",
      intensity: "medium",
      suggestedColors: ["#000000", "#ffffff"]
    };
  }
}

/**
 * Generates minimalist cat mask using DALL-E 3
 */
async function generateMinimalistCatMask(catAnalysis: any, useStyleTransfer: boolean): Promise<string> {
  try {
    const catPrompt = createOptimizedCatPrompt(catAnalysis, useStyleTransfer);
    
    console.log("🎨 Using DALL-E prompt:", catPrompt);
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: catPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      throw new Error(`DALL-E failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("DALL-E response:", data);
      throw new Error("No image generated by DALL-E");
    }
    
    console.log("✅ DALL-E generation successful");
    return data.data[0].url;
    
  } catch (error) {
    console.error("Error in DALL-E generation:", error);
    throw error;
  }
}

/**
 * Creates optimized prompt for DALL-E cat mask generation
 */
function createOptimizedCatPrompt(catAnalysis: any, useStyleTransfer: boolean): string {
  const styleType = useStyleTransfer ? "artistic stylized" : "clean minimalist";
  
  // Build cat elements description
  let catElements = [];
  
  if (catAnalysis.hasHeadArea) {
    catElements.push("simple cat head with pointed ears at the top");
  }
  
  if (catAnalysis.hasBodyArea) {
    catElements.push("minimal cat paws and body at the bottom");
  }
  
  if (catAnalysis.hasLeftArea || catAnalysis.hasRightArea) {
    catElements.push("graceful cat tail on the side");
  }
  
  const catDescription = catElements.length > 0 
    ? catElements.join(", ")
    : "simple cat head with ears at top, minimal paws at bottom";

  // Create the optimized prompt
  return `Create a ${styleType} minimalist cat wallet decoration.

🎯 DESIGN REQUIREMENTS:
- Canvas: 1024x1024 pixels, transparent background
- CENTER AREA (320x569px): COMPLETELY TRANSPARENT/EMPTY
- Cat elements: ${catDescription}
- Cat pose: ${catAnalysis.catType} cat
- Style: Simple black line art, no fill colors

📐 LAYOUT RULES:
- Cat decorations ONLY around the edges
- Central rectangle MUST be empty (wallet interface area)
- Minimalist cartoon style with clean lines
- ${catAnalysis.intensity} stroke weight
- No shading, just simple outlines

⚠️ CRITICAL: The center 320x569px area is FORBIDDEN - keep completely transparent for wallet interface.`;
}
