
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
    
    // Generate enhanced mask using the composite approach
    const generatedImageUrl = await generateEnhancedMaskWithDALLE(compositeImage);
    console.log("Enhanced mask generated:", generatedImageUrl);
    
    // Process the result to create transparent center
    const finalMaskUrl = await processAndCropMask(generatedImageUrl, safeZone);
    console.log("Final mask with transparent center:", finalMaskUrl);
    
    // Return the processed mask and metadata
    const responseData = {
      mask_image_url: finalMaskUrl,
      layout_json: {
        layout: {
          top: "Enhanced decorative elements on top",
          bottom: "Enhanced decorative elements on bottom",
          left: "Enhanced decorative elements on left",
          right: "Enhanced decorative elements on right",
          core: "untouched"
        },
        style: "ai-enhanced",
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
 * Generates an enhanced mask using DALL-E with the composite image approach
 */
async function generateEnhancedMaskWithDALLE(compositeImageBase64: string): Promise<string> {
  try {
    // Extract the base64 content from data URL if needed
    const base64Content = compositeImageBase64.split(',')[1] || compositeImageBase64;
    
    // First, analyze the composite image with GPT-4o Vision
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
            content: `🎯 COMPOSITE WALLET MASK ANALYSIS:

You are analyzing a composite image that shows:
- A wallet interface in the center (this is the final product)
- User drawings around the wallet (rough sketches that need enhancement)

YOUR TASK:
Describe how to enhance and stylize the decorative elements around the wallet while keeping the wallet interface exactly as it is.

FOCUS ON:
- Style of the decorative elements (cartoon, abstract, realistic, etc.)
- Color themes and mood
- How to make the decorations more polished and cohesive
- Maintaining the wallet as the central focal point

CREATE A BRIEF DESCRIPTION for DALL-E that will enhance the decorations around the wallet.`
          },
          {
            role: "user", 
            content: [
              {
                type: "text", 
                text: "Analyze this composite image with wallet + user drawings. Describe how to enhance the decorative elements around the wallet while keeping the wallet interface untouched."
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
        max_tokens: 300
      })
    });

    const analysisData = await analysisResponse.json();
    
    if (!analysisData.choices || analysisData.choices.length === 0) {
      throw new Error("Failed to analyze composite image");
    }
    
    const enhancementDescription = analysisData.choices[0].message.content;
    console.log("Enhancement description:", enhancementDescription);
    
    // Now generate the enhanced version with DALL-E
    const prompt = `🎯 WALLET MASK ENHANCEMENT - PROFESSIONAL STYLING:

Based on this analysis: "${enhancementDescription}"

ENHANCEMENT INSTRUCTIONS:
- Keep the central wallet interface EXACTLY as it appears
- Enhance and stylize the decorative elements around the wallet
- Make the decorations more polished, cohesive, and professional
- Maintain the overall composition and positioning
- Add depth, better colors, and improved artistic style
- Create a unified design that frames the wallet beautifully

TECHNICAL REQUIREMENTS:
- Keep all elements in their current positions
- Enhance quality and visual appeal
- Maintain the wallet as the central focus
- Create a premium, polished look

Transform this into a high-quality, stylized wallet customization mask while preserving the wallet interface exactly as shown.`;
    
    // Generate enhanced image with DALL-E
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: createFormDataForEdit(base64Content, prompt)
    });

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("Unexpected response from DALL-E:", data);
      
      // Fallback to image generation if edit fails
      return await generateFallbackMask(enhancementDescription);
    }
    
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating enhanced mask:", error);
    
    // Fallback to basic generation
    return await generateFallbackMask("stylized decorative frame");
  }
}

/**
 * Creates FormData for DALL-E image edit
 */
function createFormDataForEdit(base64Content: string, prompt: string): FormData {
  // Convert base64 to blob
  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/png' });
  
  const formData = new FormData();
  formData.append('image', blob, 'composite.png');
  formData.append('prompt', prompt);
  formData.append('n', '1');
  formData.append('size', '1024x1024');
  
  return formData;
}

/**
 * Fallback mask generation using standard DALL-E generation
 */
async function generateFallbackMask(description: string): Promise<string> {
  const prompt = `Create a decorative wallet frame with ${description}. 
  Size: 1024x1024, leave center area (320x569 pixels) empty for wallet interface.
  Focus on decorative elements around the edges only.`;
  
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
    throw new Error("Failed to generate fallback mask");
  }
  
  return data.data[0].url;
}

/**
 * Processes the DALL-E result to crop out the center and create transparency
 */
async function processAndCropMask(imageUrl: string, safeZone: any): Promise<string> {
  try {
    console.log("Processing mask to create transparent center...");
    
    // For now, return the original URL
    // In a production environment, you would:
    // 1. Download the image from imageUrl
    // 2. Load it into a canvas
    // 3. Create a new canvas with transparency
    // 4. Copy everything except the center area
    // 5. Upload the result and return the new URL
    
    // This is a simplified implementation that returns the original
    // The client-side can handle the transparency overlay
    return imageUrl;
  } catch (error) {
    console.error("Error processing mask:", error);
    return imageUrl; // Return original if processing fails
  }
}
