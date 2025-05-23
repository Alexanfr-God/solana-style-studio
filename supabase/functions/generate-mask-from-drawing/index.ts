
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    
    console.log(`Received drawing for AI cat mask generation`);
    
    if (!drawingImageBase64) {
      throw new Error("No drawing image provided");
    }
    
    // Analyze the user's drawing to understand cat placement
    const catAnalysis = await analyzeCatDrawing(drawingImageBase64);
    console.log("Cat drawing analysis:", catAnalysis);
    
    // Generate minimalist cat mask using DALL-E 3
    const generatedImageUrl = await generateMinimalistCatMask(catAnalysis, useStyleTransfer);
    console.log("Generated cat mask URL:", generatedImageUrl);
    
    const responseData = {
      mask_image_url: generatedImageUrl,
      layout_json: {
        layout: {
          top: catAnalysis.hasHeadArea ? "Minimalist cat head with ears" : null,
          bottom: catAnalysis.hasBodyArea ? "Simple cat paws and tail" : null,
          left: catAnalysis.hasLeftArea ? "Cat tail or paw" : null,
          right: catAnalysis.hasRightArea ? "Cat tail or paw" : null,
          core: "transparent wallet area"
        },
        style: useStyleTransfer ? "stylized-minimalist-cat" : "clean-minimalist-cat",
        color_palette: catAnalysis.suggestedColors || ["#000000", "#ffffff"],
        cat_type: catAnalysis.catType
      }
    };

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
    console.error("Error:", error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback_mask: '/external-masks/cats-mask.png'
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
            content: `🐱 CAT DRAWING ANALYSIS FOR MINIMALIST MASK:

You are analyzing a user's rough drawing to create a minimalist cat mask around a wallet interface.

CANVAS LAYOUT:
- Canvas: 800x800 pixels
- Wallet safe zone: 320x569 pixels (centered)
- Drawing areas: Around the wallet where cat elements should appear

ANALYZE FOR:
1. Where user drew in TOP area (above wallet) → cat head/ears
2. Where user drew in BOTTOM area (below wallet) → cat paws/body
3. Where user drew in LEFT/RIGHT areas → cat tail/side elements
4. Drawing style intensity (light sketches vs bold strokes)

CAT VARIATIONS TO DETECT:
- "sitting": head on top, paws at bottom
- "sleeping": curled around wallet
- "playful": dynamic pose with tail
- "simple": just head and minimal elements

Return JSON: {
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
                text: "Analyze this rough cat drawing and determine where cat elements should be placed around the wallet area."
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

    const analysisData = await analysisResponse.json();
    
    if (!analysisData.choices || analysisData.choices.length === 0) {
      throw new Error("Failed to analyze cat drawing");
    }
    
    return JSON.parse(analysisData.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing cat drawing:", error);
    // Fallback analysis
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
    const catPrompt = createCatMaskPrompt(catAnalysis, useStyleTransfer);
    
    console.log("Using cat prompt for DALL-E:", catPrompt);
    
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

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("DALL-E response:", data);
      throw new Error("Failed to generate cat mask");
    }
    
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating cat mask:", error);
    throw error;
  }
}

/**
 * Creates optimized prompt for minimalist cat mask generation
 */
function createCatMaskPrompt(catAnalysis: any, useStyleTransfer: boolean): string {
  const baseStyle = useStyleTransfer ? "artistic stylized" : "clean minimalist";
  
  let catElements = [];
  
  if (catAnalysis.hasHeadArea) {
    catElements.push("simple cat head with pointed ears at the top");
  }
  
  if (catAnalysis.hasBodyArea) {
    catElements.push("minimal cat paws at the bottom");
  }
  
  if (catAnalysis.hasLeftArea || catAnalysis.hasRightArea) {
    catElements.push("graceful cat tail on the side");
  }
  
  const catDescription = catElements.length > 0 
    ? catElements.join(", ")
    : "simple cat head with ears at top, minimal paws at bottom";

  return `🎯 MINIMALIST CAT WALLET MASK:

Create a ${baseStyle} line art drawing of a cat around a wallet interface.

CAT ELEMENTS: ${catDescription}
CAT TYPE: ${catAnalysis.catType} cat pose
STYLE: Simple black line art on transparent background

📐 CRITICAL LAYOUT:
- Canvas: 1024x1024 pixels
- CENTER RECTANGLE (320x569px): COMPLETELY TRANSPARENT/EMPTY
- Cat elements ONLY around the edges, never inside center
- Minimal, clean lines - no complex details
- ${catAnalysis.intensity} stroke weight

🎨 VISUAL STYLE:
- Black line art on transparent background
- Minimalist cartoon style
- Clean, simple shapes
- No shading, just outlines
- Cute and friendly cat expression

⚠️ ABSOLUTE REQUIREMENTS:
- Central 320x569px area MUST be empty (wallet will show here)
- Cat decorations ONLY around the edges
- Simple, minimalist design
- Transparent background`;
}
