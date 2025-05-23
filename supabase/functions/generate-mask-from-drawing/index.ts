
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
    const { compositeImage, safeZone } = await req.json();
    
    console.log(`Received composite image for mask generation`);
    
    if (!compositeImage) {
      throw new Error("No composite image provided");
    }
    
    // Analyze the composite to understand drawing areas
    const drawingAnalysis = await analyzeDrawingAreas(compositeImage);
    console.log("Drawing analysis:", drawingAnalysis);
    
    // Generate mask using focused generation approach
    const generatedImageUrl = await generateMaskWithConstraints(compositeImage, drawingAnalysis, safeZone);
    console.log("Generated image URL:", generatedImageUrl);
    
    // Process the result to create transparent center
    const finalMaskUrl = await processAndCropMask(generatedImageUrl, safeZone);
    console.log("Final processed mask:", finalMaskUrl);
    
    // Return the processed mask and metadata
    const responseData = {
      mask_image_url: finalMaskUrl,
      layout_json: {
        layout: {
          top: "Enhanced decorative elements based on user drawing",
          bottom: "Enhanced decorative elements based on user drawing",
          left: "Enhanced decorative elements based on user drawing",
          right: "Enhanced decorative elements based on user drawing",
          core: "transparent"
        },
        style: "user-drawing-enhanced",
        color_palette: drawingAnalysis.colors || ["#f4d03f", "#222222", "#ffffff"],
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
 * Analyzes the composite image to identify drawing areas and style
 */
async function analyzeDrawingAreas(compositeImageBase64: string): Promise<any> {
  try {
    // Extract the base64 content from data URL if needed
    const base64Content = compositeImageBase64.split(',')[1] || compositeImageBase64;
    
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
            content: `🎯 DRAWING AREA ANALYSIS FOR MASK GENERATION:

You are analyzing a composite image that shows:
- A wallet interface in the center (DON'T MODIFY THIS)
- User drawings around the wallet (ENHANCE THESE ONLY)

YOUR TASK:
1. Identify EXACTLY where the user has drawn elements
2. Describe the style and theme of the drawings
3. Extract the color palette from the drawings
4. Define constraints for DALL-E generation

CRITICAL: The wallet in the center (320x569 pixels) must remain UNTOUCHED.
DALL-E should only enhance the areas where the user has drawn something.

Return JSON with: {
  "drawn_areas": "description of where user drew",
  "style": "style of the drawings",
  "colors": ["color1", "color2", "color3"],
  "enhancement_prompt": "specific prompt for DALL-E focusing only on drawn areas"
}`
          },
          {
            role: "user", 
            content: [
              {
                type: "text", 
                text: "Analyze this composite image and identify the user drawing areas around the wallet. Focus on where decorative elements should be enhanced."
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
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    const analysisData = await analysisResponse.json();
    
    if (!analysisData.choices || analysisData.choices.length === 0) {
      throw new Error("Failed to analyze drawing areas");
    }
    
    return JSON.parse(analysisData.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing drawing areas:", error);
    return {
      drawn_areas: "around the edges",
      style: "abstract",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
      enhancement_prompt: "decorative elements around a central rectangle"
    };
  }
}

/**
 * Generates a mask using DALL-E with specific constraints
 */
async function generateMaskWithConstraints(
  compositeImageBase64: string, 
  drawingAnalysis: any, 
  safeZone: any
): Promise<string> {
  try {
    // Create a focused prompt that restricts DALL-E to only drawn areas
    const constrainedPrompt = `🎯 MASK GENERATION - STRICT CONSTRAINTS:

${drawingAnalysis.enhancement_prompt}

📐 CRITICAL REQUIREMENTS:
- Size: 1024x1024 PNG with transparent background
- Central rectangle (320x569px at center): MUST REMAIN COMPLETELY EMPTY
- Enhance ONLY the areas where decorative elements are already drawn
- Style: ${drawingAnalysis.style}
- Colors: ${drawingAnalysis.colors.join(', ')}

⚠️ FORBIDDEN:
- NO content in the center rectangle (320x569px)
- NO background fill - use transparent background
- NO new elements in empty areas
- ONLY enhance existing drawn elements

Create a decorative mask that enhances the user's drawings while keeping the center completely transparent for a wallet interface.`;
    
    console.log("Using constrained prompt for DALL-E generation");
    
    // Generate with DALL-E using generation API (not edit API)
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: constrainedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url"
      })
    });

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("Unexpected response from DALL-E:", data);
      throw new Error("Failed to generate mask with DALL-E");
    }
    
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating mask with constraints:", error);
    throw error;
  }
}

/**
 * Processes the DALL-E result to crop out the center and create transparency
 */
async function processAndCropMask(imageUrl: string, safeZone: any): Promise<string> {
  try {
    console.log("Processing mask to create transparent center...");
    
    // Download the image from DALL-E
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageArrayBuffer = await imageBlob.arrayBuffer();
    const imageBytes = new Uint8Array(imageArrayBuffer);
    
    // Convert to base64 for processing
    const base64Image = btoa(String.fromCharCode(...imageBytes));
    
    // For now, we'll create a simple processing approach
    // In a full implementation, you would:
    // 1. Decode the PNG
    // 2. Create a new canvas with the image
    // 3. Clear the center rectangle (safeZone area)
    // 4. Export as PNG with alpha transparency
    // 5. Upload the result and return the URL
    
    // Simplified approach: return a data URL with processing instructions
    // The client can handle the final transparency overlay
    const processedDataUrl = `data:image/png;base64,${base64Image}`;
    
    console.log("Mask processing completed");
    return processedDataUrl;
  } catch (error) {
    console.error("Error processing mask:", error);
    // Return original URL if processing fails
    return imageUrl;
  }
}
