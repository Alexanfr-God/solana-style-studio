
// Import necessary modules, but avoid the problematic arbundles import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration for wallet layout zones - helps with creating better backgrounds
const walletCanvasConfig = {
  "login": {
    topLogoZone: "10%",     // For "phantom" logo
    titleZone: "15%",       // For title text
    inputZone: "30%",       // For password field(s)
    supportTextZone: "15%", // For "forgot password" text
    actionButtonZone: "15%" // For "Unlock" button
  },
  "wallet": {
    headerZone: "15%",      // For wallet header
    balanceZone: "20%",     // For balance display
    actionsZone: "25%",     // For buttons
    assetsZone: "30%",      // For asset list
    navigationZone: "10%"   // For bottom navigation
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image_url, layer_type, user_id } = await req.json();

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log(`Starting style generation for ${layer_type} layer`);
    console.log(`Prompt: ${prompt}`);
    
    // Create layout-aware background prompt based on layer type
    const layoutConfig = walletCanvasConfig[layer_type as keyof typeof walletCanvasConfig];
    
    // Enhanced prompt for better background generation with layout awareness
    const enhancedPrompt = createLayoutAwarePrompt(prompt, layer_type, layoutConfig);

    // Generate background image if no image was uploaded
    let backgroundImage = null;
    if (!image_url) {
      console.log("No image provided, generating one with OpenAI");
      try {
        backgroundImage = await generateBackgroundImage(enhancedPrompt, openAiApiKey);
        console.log("Image generated successfully:", backgroundImage.substring(0, 50) + "...");
      } catch (error) {
        console.error("Image generation error:", error);
        throw new Error(`Failed to generate image: ${error.message}`);
      }
    } else {
      backgroundImage = image_url;
      console.log("Using uploaded image:", image_url.substring(0, 50) + "...");
    }

    // Generate colors based on the image or prompt using OpenAI
    console.log("Generating style attributes based on theme");
    
    const stylePrompt = `
      Generate a cohesive style profile for a ${layer_type === "login" ? "login screen" : "wallet interface"} 
      with theme: "${prompt}".
      
      Return ONLY valid JSON with these properties:
      {
        "backgroundColor": "hex color code for background", 
        "backgroundImage": "URL of generated image or gradient",
        "accentColor": "hex color for accent elements",
        "textColor": "hex color for text that ensures readability",
        "buttonColor": "hex color for buttons",
        "buttonTextColor": "hex color for button text",
        "borderRadius": "radius value (e.g., '12px', '0px', etc.)",
        "fontFamily": "appropriate font family",
        "boxShadow": "appropriate shadow value",
        "styleNotes": "brief description of the style"
      }
    `;

    const styleResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a design system generator that creates wallet UI styles. Return only valid JSON that matches the requested format." },
          { role: "user", content: stylePrompt }
        ]
      })
    });

    if (!styleResponse.ok) {
      const errorData = await styleResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const styleData = await styleResponse.json();
    let styleContent = styleData.choices[0].message.content;
    
    // Clean the response to ensure it's valid JSON
    styleContent = styleContent.replace(/```json|```/g, "").trim();
    console.log("Style content generated:", styleContent.substring(0, 100) + "...");
    
    let styleJson;
    try {
      styleJson = JSON.parse(styleContent);
    } catch (error) {
      console.error("Error parsing style JSON:", error);
      throw new Error("Failed to parse style data");
    }

    // Add the generated background image
    if (backgroundImage) {
      styleJson.backgroundImage = `url(${backgroundImage})`;
    }

    // Update the record in Supabase
    const { data: requestData, error: updateError } = await supabase
      .from("ai_requests")
      .update({ 
        style_result: styleJson,
        status: 'completed'
      })
      .eq("user_id", user_id)
      .eq("prompt", prompt)
      .select();

    if (updateError) {
      console.error("Error updating style in database:", updateError);
    } else {
      console.log("Style saved successfully:", requestData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        style: styleJson,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-style function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Function to create layout-aware prompts for better background generation
function createLayoutAwarePrompt(
  prompt: string, 
  layerType: string, 
  layoutConfig: Record<string, string>
): string {
  
  // Base background generation instructions
  let enhancedPrompt = `
    Design a collectible vertical background for a crypto wallet ${layerType === "login" ? "login screen" : "interface"}.
    
    Prompt theme: ${prompt}
    
    Instructions:
    - Create a vertical collectible background for a wallet ${layerType === "login" ? "login screen" : "interface"}.
    - DO NOT draw buttons, inputs, "Password", "Forgot password", "Unlock", or any other UI elements.
    - DO NOT add any text, labels, or words of any kind to the image.
    - DO NOT add any shadows, overlays, gradients, or lighting effects that would interfere with UI readability.
    - Use a clean, professional cartoon or comic-inspired art style.
    - Avoid oversaturated or harsh neon colors unless specifically requested.
    - Create a smooth visual flow that respects these layout zones:
  `;

  // Add layout-specific instructions based on layer type
  if (layerType === "login") {
    enhancedPrompt += `
      * Top ${layoutConfig.topLogoZone}: leave empty space for the "phantom" logo
      * Next ${layoutConfig.titleZone}: visually interesting but not distracting area
      * Middle ${layoutConfig.inputZone}: calm, clean area for password input field
      * Next ${layoutConfig.supportTextZone}: subtle visual elements
      * Bottom ${layoutConfig.actionButtonZone}: area that will contain the unlock button
    `;
  } else {
    enhancedPrompt += `
      * Top ${layoutConfig.headerZone}: header area with subtle decoration
      * Next ${layoutConfig.balanceZone}: area for displaying wallet balance  
      * Middle ${layoutConfig.actionsZone}: clean space for action buttons
      * Next ${layoutConfig.assetsZone}: visual area for assets list
      * Bottom ${layoutConfig.navigationZone}: footer area for navigation
    `;
  }

  // Additional style guidance
  enhancedPrompt += `
    - If a character (like a cat or meme) is involved, it should be positioned elegantly around the layout zones, not directly in input areas.
    - If the prompt includes a fashion brand (e.g., Gucci), apply color themes and abstract patterns only — do NOT add logos unless stylized as part of the visual texture.
    - The background should feel collectible, stylish, and premium — not childish.
    - Ensure the final image will be suitable as a professional wallet background.
    - Create something visually similar to high-quality collectible NFT art.
  `;

  return enhancedPrompt;
}

// Function to generate a background image using DALL-E
async function generateBackgroundImage(prompt: string, apiKey: string): Promise<string> {
  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      model: "dall-e-3",
      quality: "hd",
    }),
  });

  if (!imageResponse.ok) {
    const errorData = await imageResponse.json();
    throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
  }

  const imageData = await imageResponse.json();
  return imageData.data[0].url;
}
