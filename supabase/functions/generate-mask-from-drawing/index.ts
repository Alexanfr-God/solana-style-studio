
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawingImage, safeZone } = await req.json();
    
    console.log(`Received request to generate mask from drawing`);
    
    if (!drawingImage) {
      throw new Error("No drawing image provided");
    }
    
    // 1. First use GPT-4o to analyze the drawing and create a description
    const drawingDescription = await analyzeDrawingWithGPT(drawingImage);
    console.log("Drawing description:", drawingDescription);
    
    // 2. Generate the mask image based on the description using DALL-E with strict transparency rules
    const generatedImageUrl = await generateMaskWithDALLE(drawingDescription);
    console.log("Generated mask URL:", generatedImageUrl);
    
    // 3. Return the generated image and metadata
    const responseData = {
      mask_image_url: generatedImageUrl,
      layout_json: {
        layout: {
          top: drawingDescription.includes("top") ? "Decorative elements on top" : null,
          bottom: drawingDescription.includes("bottom") ? "Decorative elements on bottom" : null,
          left: drawingDescription.includes("left") ? "Decorative elements on left" : null,
          right: drawingDescription.includes("right") ? "Decorative elements on right" : null,
          core: "untouched"
        },
        style: drawingDescription.includes("abstract") ? "abstract" : "character-based",
        color_palette: ["#f4d03f", "#222222", "#ffffff"],
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
      JSON.stringify({ error: error.message }),
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
 * Analyzes the user's drawing with GPT-4o Vision to create a descriptive prompt
 */
async function analyzeDrawingWithGPT(drawingImageBase64: string): Promise<string> {
  try {
    // Extract the base64 content from data URL if needed
    const base64Content = drawingImageBase64.split(',')[1] || drawingImageBase64;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: `STRICT MASK GENERATION RULES:

🎯 CRITICAL: The mask MUST have a completely transparent rectangular area in the center (320x569 pixels) for a wallet interface.

📐 Layout Requirements:
- Image size: 1024x1024 pixels
- Transparent center zone: 320x569 pixels (positioned at center)
- Decorative elements ONLY around the edges: top, bottom, left, right sides
- NO CONTENT in the center rectangle - it must be 100% transparent

🎨 Style Guidelines:
- Create decorative frame/costume elements
- Use meme, cartoon, or impressive style
- Think of it as a wallet "costume" or "frame"
- Elements should look like they're surrounding/framing the wallet

⚠️ TRANSPARENCY RULES:
- Center must be completely empty/transparent
- Use PNG format with alpha channel
- If transparency isn't working, describe it as "black void in center that will be made transparent"

Your task: Analyze this drawing and describe how to turn it into a wallet mask following these strict rules.`
          },
          {
            role: "user", 
            content: [
              {
                type: "text", 
                text: "Analyze this drawing I made for a wallet costume. Describe it for DALL-E generation while ensuring the central wallet area (320x569px) remains completely transparent/empty."
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
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Unexpected response from OpenAI:", data);
      throw new Error("Failed to analyze drawing");
    }
    
    // Extract the description from GPT's response
    const description = data.choices[0].message.content;
    return description;
  } catch (error) {
    console.error("Error analyzing drawing with GPT:", error);
    throw new Error("Failed to analyze drawing: " + error.message);
  }
}

/**
 * Generates a polished mask image using DALL-E with strict transparency requirements
 */
async function generateMaskWithDALLE(description: string): Promise<string> {
  try {
    // Create a very specific prompt that enforces transparency rules
    const prompt = `🎯 WALLET MASK GENERATION - STRICT REQUIREMENTS:

Create a decorative wallet frame/costume based on: "${description}"

📐 MANDATORY SPECIFICATIONS:
- Image size: 1024x1024 PNG with transparency
- Central transparent rectangle: 320x569 pixels (exactly in the center)
- The center MUST be completely empty/transparent - NO colors, patterns, or designs
- Place ALL decorative elements around the edges only

🎨 DESIGN STYLE:
- Decorative frame/costume style
- Cartoon/meme aesthetic
- Vibrant and impressive
- Think "wallet costume" or "phone case design"

⚠️ CRITICAL: The central rectangular area (320x569px) must be 100% transparent. This is for a wallet interface that will show through. Draw only decorative elements around the edges: top, bottom, left side, right side.

Generate as PNG with proper alpha transparency.`;
    
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
        quality: "hd",
        response_format: "url"
      })
    });

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("Unexpected response from DALL-E:", data);
      throw new Error("Failed to generate image");
    }
    
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw new Error("Failed to generate image: " + error.message);
  }
}
