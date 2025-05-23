
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
    
    console.log(`🎨 === STARTING AI CAT MASK GENERATION ===`);
    console.log(`Drawing data received: ${drawingImageBase64 ? 'YES' : 'NO'}`);
    console.log(`Drawing data length: ${drawingImageBase64?.length || 0}`);
    console.log(`Style transfer: ${useStyleTransfer}`);
    console.log(`OpenAI API Key available: ${openAIApiKey ? 'YES' : 'NO'}`);
    
    if (!drawingImageBase64) {
      throw new Error("No drawing image provided");
    }

    if (!openAIApiKey) {
      console.error("❌ OpenAI API key not found");
      throw new Error("OpenAI API key not configured");
    }
    
    // Step 1: Analyze the drawing with GPT-4o
    console.log("📋 Step 1: Analyzing cat drawing...");
    const catAnalysis = await analyzeCatDrawing(drawingImageBase64);
    console.log("✅ Cat analysis complete:", catAnalysis);
    
    // Step 2: Generate cat mask with DALL-E 3
    console.log("🎨 Step 2: Generating cat mask with DALL-E...");
    const generatedImageUrl = await generateCatMask(catAnalysis, useStyleTransfer);
    console.log("✅ Generated mask URL:", generatedImageUrl);
    
    // Step 3: Verify the generated URL is accessible
    console.log("🔍 Step 3: Verifying mask URL accessibility...");
    try {
      const testResponse = await fetch(generatedImageUrl, { method: 'HEAD' });
      console.log(`URL test status: ${testResponse.status}`);
      if (!testResponse.ok) {
        throw new Error(`Generated URL not accessible: ${testResponse.status}`);
      }
    } catch (urlError) {
      console.error("❌ URL verification failed:", urlError);
      throw new Error("Generated mask URL is not accessible");
    }
    
    const responseData = {
      mask_image_url: generatedImageUrl,
      layout_json: {
        layout: {
          top: catAnalysis.hasHeadArea ? "AI-generated cat head with ears" : null,
          bottom: catAnalysis.hasBodyArea ? "AI-generated cat paws and body" : null,
          left: catAnalysis.hasLeftArea ? "Cat tail or side element" : null,
          right: catAnalysis.hasRightArea ? "Cat tail or side element" : null,
          core: "transparent wallet area"
        },
        style: useStyleTransfer ? "stylized-cat" : "minimalist-cat",
        color_palette: catAnalysis.suggestedColors || ["#000000", "#ffffff"],
        cat_type: catAnalysis.catType || "sitting",
        generation_method: "dall-e-3-verified"
      }
    };

    console.log("✅ === SUCCESS: Cat mask generated and verified ===");
    console.log("Response data:", JSON.stringify(responseData, null, 2));
    
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
    console.error("❌ === CAT MASK GENERATION FAILURE ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);

    // Enhanced fallback with better debugging
    const fallbackMask = '/external-masks/cats-mask.png';
    console.log(`🚨 Using fallback mask: ${fallbackMask}`);
    
    const fallbackResponse = {
      mask_image_url: fallbackMask,
      layout_json: {
        layout: {
          top: "Fallback cat head design",
          bottom: "Fallback cat paws and body",
          left: null,
          right: null,
          core: "transparent wallet area"
        },
        style: "fallback-demo",
        color_palette: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
        generation_method: "fallback-local",
        cat_type: "demo",
        error_details: error.message
      }
    };

    return new Response(
      JSON.stringify(fallbackResponse),
      {
        status: 200, // Return 200 to avoid frontend errors
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

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
            content: `Analyze this cat drawing for wallet mask generation. 

CANVAS LAYOUT (800x800px):
- Wallet safe zone: Center 320x569px (must stay transparent)
- Drawing areas: Top, bottom, left, right around the wallet

Determine cat element placement and return JSON:
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
                text: "Analyze this cat drawing for mask generation around a wallet interface."
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
      const errorText = await analysisResponse.text();
      console.error("GPT-4o analysis error:", errorText);
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

async function generateCatMask(catAnalysis: any, useStyleTransfer: boolean): Promise<string> {
  try {
    const styleType = useStyleTransfer ? "artistic stylized" : "clean minimalist";
    
    const prompt = `Create a ${styleType} cat wallet frame decoration.

🎯 REQUIREMENTS:
- Canvas: 1024x1024 pixels
- Center area (320x569px) MUST be completely transparent
- Cat elements around edges only: ${catAnalysis.catType} cat pose
- Style: Simple line art, ${catAnalysis.intensity} strokes
- Colors: black outlines on transparent background

⚠️ CRITICAL: Keep center rectangle transparent for wallet interface.`;
    
    console.log("🎨 DALL-E prompt:", prompt);
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DALL-E error:", errorText);
      throw new Error(`DALL-E failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("DALL-E response:", data);
      throw new Error("No image generated by DALL-E");
    }
    
    const imageUrl = data.data[0].url;
    console.log("✅ DALL-E generation successful:", imageUrl);
    return imageUrl;
    
  } catch (error) {
    console.error("Error in DALL-E generation:", error);
    throw error;
  }
}
