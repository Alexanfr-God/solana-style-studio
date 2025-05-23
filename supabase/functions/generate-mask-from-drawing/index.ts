
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
            content: `🎯 WALLET MASK DRAWING ANALYSIS CONTEXT:

YOU ARE ANALYZING: A user's drawing on a canvas with a demo wallet interface in the center.

📐 WHAT YOU SEE:
- Square canvas 1024x1024 pixels
- IN THE CENTER: Demo wallet interface (320x569 pixels) - THIS IS NOT PART OF THE MASK!
- AROUND THE WALLET: Red lines/drawings by user - THESE BECOME THE MASK!

🎨 YOUR TASK:
Describe ONLY the red elements around the wallet as the basis for a decorative mask.
Ignore the wallet interface in the center - it must remain visible.

📋 DESCRIPTION RULES:
- Describe element positions: "top", "bottom", "left", "right"
- Specify style: cartoon, meme, abstract
- Describe shapes: ears, paws, horns, patterns, frames
- DO NOT MENTION the wallet or interface - only decorative elements

🎯 EXAMPLE GOOD DESCRIPTION:
"Two triangular ears at the top in cartoon style, two round paws at the bottom, wavy patterns on the sides. Style: playful meme cat."

ANALYZE THE DRAWING AND CREATE A DESCRIPTION FOR DALL-E:`
          },
          {
            role: "user", 
            content: [
              {
                type: "text", 
                text: "Analyze this drawing. In the center you see a wallet interface (DON'T touch it!), and around it are red lines - this is my mask. Describe ONLY the red elements for creating a decorative mask."
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
    const prompt = `🎯 WALLET MASK CREATION - STRICT REQUIREMENTS:

📝 USER DESCRIPTION: "${description}"

📐 MANDATORY TECHNICAL SPECS:
- Size: 1024x1024 pixels, PNG with transparency
- CENTRAL TRANSPARENT ZONE: 320x569 pixels (EXACTLY IN CENTER)
- Transparent zone coordinates: X=352, Y=227.5 (from top-left corner)
- CENTER MUST BE EMPTY - complete transparency

🎨 DESIGN RULES:
- Create decorative mask based on description
- Place ALL elements ONLY around the central transparent zone
- Top: elements above transparent zone
- Bottom: elements below transparent zone  
- Sides: elements left and right of transparent zone
- Style: bright, meme-like, cartoon, impressive

⚠️ CRITICALLY IMPORTANT:
Central rectangle 320x569px MUST be completely transparent (alpha=0).
This is a "window" for the wallet interface that must remain visible.

🎭 THINK OF THE MASK AS:
- Decorative frame around the wallet
- Costume for the wallet
- Cover with a cutout in the center

Create PNG with alpha channel and strict transparency in center!`;
    
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
